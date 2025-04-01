using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject.Weather;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.NotificationRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class WeatherMonitoringService : BackgroundService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<WeatherMonitoringService> _logger;
        //private readonly IWeatherNotificationService _notificationService;
        private readonly TimeSpan _interval;
        private readonly IServiceScopeFactory _scopeFactory; // Dùng để tạo scope mới

        public WeatherMonitoringService(HttpClient httpClient, IConfiguration configuration, ILogger<WeatherMonitoringService> logger, IServiceScopeFactory scopeFactory)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            int hours = _configuration.GetValue<int>("WeatherConfig:UpdateIntervalHours", 3);
            _interval = TimeSpan.FromHours(hours);
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await MonitorWeatherForecastAsync();
                await Task.Delay(_interval, stoppingToken);
            }
        }

        private async Task MonitorWeatherForecastAsync()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var farms = await unitOfWork.FarmRepository.GetAllNoPaging(x => x.IsDeleted != true);
                foreach (var farm in farms)
                {
                    if (farm.Latitude == null || farm.Longitude == null) continue;
                    var forecastData = await GetWeatherForecastAsync(farm.Latitude.Value, farm.Longitude.Value);
                    if (forecastData == null || forecastData.List.Count == 0) continue;

                    //var now = DateTime.UtcNow;
                    var workLogs = await unitOfWork.WorkLogRepository.GetWorkLogsByFarm(farm.FarmId);
                    //var workLogsToCheck = workLogs.Where(wl => wl.ActualStartTime.HasValue &&
                    //                                            wl.ActualStartTime.Value >= now &&
                    //                                            wl.ActualStartTime.Value <= now.AddHours(3)).ToList();

                    foreach (var workLog in workLogs)
                    {
                        await CheckAndProcessWeatherWarning(workLog, forecastData);
                    }
                }
            }
        }

        /// <summary>
        /// Lay thoi tiet hien tai
        /// </summary>
        private async Task<WeatherData?> GetWeatherDataAsync(double latitude, double longitude)
        {
            try
            {
                string url = $"{_configuration["WeatherConfig:ForecastUrl"]}?lat={latitude}&lon={longitude}&appid={_configuration["WeatherConfig:ApiKey"]}&units=metric";
                var response = await _httpClient.GetStringAsync(url);
                return JsonSerializer.Deserialize<WeatherData>(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching weather data: {ex.Message}");
                return null;
            }
        }

        private async Task<WeatherForecastResponse?> GetWeatherForecastAsync(double latitude, double longitude)
        {
            try
            {
                string apiKey = _configuration["WeatherConfig:ApiKey"];
                string url = $"https://api.openweathermap.org/data/2.5/forecast?lat={latitude}&lon={longitude}&appid={apiKey}&units=metric";

                var response = await _httpClient.GetStringAsync(url);
                //Console.WriteLine(response);
                var jsonParse = JsonSerializer.Deserialize<WeatherForecastResponse>(response);
                return jsonParse;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching weather forecast: {ex.Message}");
                return null;
            }
        }

        private List<string> CheckWeatherWarnings(WeatherForecastItem weatherData)
        {
            var warnings = new List<string>();
            var rules = _configuration.GetSection("WeatherConfig:WorkRules").Get<Dictionary<string, WeatherRule>>() ?? new();
            var extremeWeather = _configuration.GetSection("WeatherConfig:ExtremeWeatherConditions").Get<Dictionary<string, List<int>>>() ?? new();

            foreach (var (workType, rule) in rules)
            {
                var conditionsViolated = new List<string>();
                // troi qua lanh
                if (rule.MinTemperature.HasValue && weatherData.Main.Temperature < rule.MinTemperature)
                    conditionsViolated.Add($"Temperature too low: {weatherData.Main.Temperature}°C");
                // troi qua nong
                if (rule.MaxTemperature.HasValue && weatherData.Main.Temperature > rule.MaxTemperature)
                    conditionsViolated.Add($"Temperature too high: {weatherData.Main.Temperature}°C");
                // troi qua kho
                if (rule.MinHumidity.HasValue && weatherData.Main.Humidity < rule.MinHumidity)
                    conditionsViolated.Add($"Humidity too low: {weatherData.Main.Humidity}%");
                // qua am
                if (rule.MaxHumidity.HasValue && weatherData.Main.Humidity > rule.MaxHumidity)
                    conditionsViolated.Add($"Humidity too high: {weatherData.Main.Humidity}%");
                // nhieu gio
                if (rule.MaxWindSpeed.HasValue && weatherData.Wind.Speed > rule.MaxWindSpeed)
                    conditionsViolated.Add($"Wind speed too high: {weatherData.Wind.Speed} m/s");

                // cv nay neu ko can lam khi troi mua
                if (rule.RainCondition == "NoRain" && weatherData.Weather.Any(w => w.Main.Contains("Rain")))
                    conditionsViolated.Add("Rain detected, avoid work.");
                if (conditionsViolated.Any())
                    warnings.Add($"{workType} - {string.Join(", ", conditionsViolated)}");
            }

            // Kiểm tra các hiện tượng thời tiết cực đoan
            foreach (var (condition, ids) in extremeWeather)
            {
                if (weatherData.Weather.Any(w => ids.Contains(w.Id)))
                    warnings.Add($"⚠ Extreme Weather Warning: {condition}");
            }

            return warnings;
        }

        private async Task CheckAndProcessWeatherWarning(WorkLog workLog, WeatherForecastResponse forecastData)
        {
            var workType = workLog.Schedule.CarePlan.MasterType?.Target;
            var rules = _configuration.GetSection("WeatherConfig:WorkRules").Get<Dictionary<string, WeatherRule>>() ?? new();
            if (string.IsNullOrEmpty(workType) || !rules.ContainsKey(workType)) return;

            var rule = rules[workType];
            var actualStartDateTime = workLog.Date.Value.Add(workLog.ActualStartTime.Value);
            var closestForecast = forecastData.List
                    .OrderBy(f => Math.Abs((f.ForecastDateTime - actualStartDateTime).TotalMinutes))
                    .FirstOrDefault();

            if (closestForecast == null) return;

            var workWarnings = new List<string>();
            if (rule.MinTemperature.HasValue && closestForecast.Main.Temperature < rule.MinTemperature)
                workWarnings.Add($"Temperature too low: {closestForecast.Main.Temperature}°C");
            if (rule.MaxTemperature.HasValue && closestForecast.Main.Temperature > rule.MaxTemperature)
                workWarnings.Add($"Temperature too high: {closestForecast.Main.Temperature}°C");
            if (rule.RainCondition == "NoRain" && closestForecast.Weather.Any(w => w.Main.Contains("Rain")))
                workWarnings.Add("Rain detected, avoid work.");
            // troi qua kho
            if (rule.MinHumidity.HasValue && closestForecast.Main.Humidity < rule.MinHumidity)
                workWarnings.Add($"Humidity too low: {closestForecast.Main.Humidity}%");
            // qua am
            if (rule.MaxHumidity.HasValue && closestForecast.Main.Humidity > rule.MaxHumidity)
                workWarnings.Add($"Humidity too high: {closestForecast.Main.Humidity}%");
            // nhieu gio
            if (rule.MaxWindSpeed.HasValue && closestForecast.Wind.Speed > rule.MaxWindSpeed)
                workWarnings.Add($"Wind speed too high: {closestForecast.Wind.Speed} m/s");

            if (workWarnings.Any())
            {
                var warningMessage = $"{workLog.WorkLogName} - {string.Join(", ", workWarnings)}";
                await ProcessWeatherWarning(workLog, warningMessage);
            }
        }

        private async Task ProcessWeatherWarning(WorkLog workLog, string warningMessage)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                var _webSocketService = scope.ServiceProvider.GetRequiredService<IWebSocketService>();
                var _unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var users = await _unitOfWork.UserFarmRepository.GetUserOfFarm(workLog.Schedule!.FarmID!.Value);
                users = users.Where(x =>
                x.Role.RoleName!.Equals(RoleEnum.MANAGER.ToString(), StringComparison.OrdinalIgnoreCase) ||
                 x.Role.RoleName.Equals(RoleEnum.OWNER.ToString(), StringComparison.OrdinalIgnoreCase) ||
                 workLog.UserWorkLogs.Select(u => u.UserId).Contains(x.UserId)).ToList();
                List<CreateNotificationRequest> notis = new List<CreateNotificationRequest>();
                foreach (var user in users)
                {
                    var notification = new CreateNotificationRequest
                    {
                        UserId = user.UserId,
                        Title = "Weather Warning",
                        Content = $"Worklog {workLog.WorkLogCode} can be affect: {warningMessage}"
                    };
                    notis.Add(notification);
                    await _webSocketService.SendToUser(user.UserId, $"⚠ {notification.Content}");
                    Console.WriteLine(warningMessage);
                }
                await _notificationService.NotificationWeather(notis);
            }
        }
    }
}





