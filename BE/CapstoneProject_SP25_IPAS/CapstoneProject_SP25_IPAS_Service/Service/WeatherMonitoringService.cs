using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject.Weather;
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
                //var forecastService = scope.ServiceProvider.GetRequiredService<WeatherForecastService>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                var farms = await unitOfWork.FarmRepository.GetAllNoPaging(x => x.IsDeleted != true);
                foreach (var farm in farms)
                {
                    if (farm.Latitude == null || farm.Longitude == null) continue;
                    // lay thoi tiet tai vi tri trang trai do
                    var forecastData = await GetWeatherForecastAsync(farm.Latitude.Value, farm.Longitude.Value);
                    if (forecastData == null) continue;

                    if (forecastData == null || forecastData.List.Count == 0) continue;

                    var warnings = new List<string>();

                    // Duyệt qua tất cả dự báo trong vòng 24 giờ tới
                    foreach (var forecast in forecastData.List.Take(8)) // 8 * 3h = 24h
                    {
                        var forecastWarnings = CheckWeatherWarnings(forecast);
                        if (forecastWarnings.Any())
                        {
                            warnings.Add($"{forecast.DateTimeText}: {string.Join(", ", forecastWarnings)}");
                        }
                    }

                    if (warnings.Any())
                    {
                        // gui thong bao neu co bat ki thong bao nao
                        var notificationService = scope.ServiceProvider.GetRequiredService<IWeatherNotificationService>();
                        await notificationService.ProcessWeatherWarningsAsync(farm.FarmId, warnings);
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
    }

}



