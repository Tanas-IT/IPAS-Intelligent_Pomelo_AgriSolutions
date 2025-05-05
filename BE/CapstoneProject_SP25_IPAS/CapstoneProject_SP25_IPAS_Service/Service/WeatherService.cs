using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WeatherModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class WeatherService : IWeatherService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        public WeatherService(IUnitOfWork unitOfWork, HttpClient httpClient, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<BusinessResult> GetWeatherAsync(int farmId)
        {
            // Kiểm tra xem trang trại có tồn tại không
            var farmExist = await _unitOfWork.FarmRepository.GetByID(farmId);
            if (farmExist == null)
                return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

            var lat = farmExist.Latitude;
            var lon = farmExist.Longitude;

            // Tạo URL API từ cấu hình
            var weatherUrl = $"{_configuration["WeatherConfig:WeatherUrl"]}?lat={lat}&lon={lon}&units=metric&appid={_configuration["WeatherConfig:ApiKey"]}";
            var forecastUrl = $"{_configuration["WeatherConfig:ForecastUrl"]}?lat={lat}&lon={lon}&appid={_configuration["WeatherConfig:ApiKey"]}";
            var airUrl = $"{_configuration["WeatherConfig:AirPollutionUrl"]}?lat={lat}&lon={lon}&appid={_configuration["WeatherConfig:ApiKey"]}";

            try
            {
                // Gọi API và đảm bảo dữ liệu không bị null
                var weatherRes = await _httpClient.GetFromJsonAsync<WeatherResponse>(weatherUrl) ?? throw new Exception("Weather API response is null.");
                var forecastRes = await _httpClient.GetFromJsonAsync<ForecastResponse>(forecastUrl) ?? throw new Exception("Forecast API response is null.");
                var airRes = await _httpClient.GetFromJsonAsync<AirPollutionResponse>(airUrl) ?? throw new Exception("Air Pollution API response is null.");
                // Ép kiểu danh sách dự báo trước khi sử dụng LINQ
                var forecastList = forecastRes.list as IEnumerable<dynamic> ?? throw new Exception("Forecast list is null or invalid.");

                var result = new WeatherDashBoardResponse
                {
                    Location = new LocationInfo
                    {
                        Name = weatherRes.name,
                        Lat = weatherRes.coord.lat,
                        Lon = weatherRes.coord.lon,
                        Timezone = TimeSpan.FromSeconds(weatherRes.timezone).ToString(@"hh\:mm"),
                        UpdatedAt = DateTime.UtcNow
                    },
                    Current = new CurrentWeather
                    {
                        Temperature = weatherRes.main.temp,
                        Weather = weatherRes.weather[0].main,
                        Description = weatherRes.weather[0].description,
                        Icon = weatherRes.weather[0].icon,
                        Humidity = weatherRes.main.humidity,
                        Pressure = weatherRes.main.pressure,
                        WindSpeed = weatherRes.wind.speed,
                        WindDeg = weatherRes.wind.deg,
                        WindDirection = DegreeToCardinal(weatherRes.wind.deg),
                        Visibility = weatherRes.visibility,
                        Sunrise = DateTimeOffset.FromUnixTimeSeconds(weatherRes.sys.sunrise).ToLocalTime().DateTime,
                        Sunset = DateTimeOffset.FromUnixTimeSeconds(weatherRes.sys.sunset).ToLocalTime().DateTime
                    },
                    Today = new TodayInfo
                    {
                        Hourly = forecastRes.list.Select(f => new HourInfo
                        {
                            Time = DateTime.Parse(f.dt_txt).ToString("HH:mm"),
                            Temperature = f.main.temp,
                            Weather = f.weather[0].main,
                            Icon = f.weather[0].icon
                        }).Take(24).ToList()
                    },
                    Week = new WeekInfo
                    {
                        Daily = forecastRes.list.GroupBy(f => DateTime.Parse(f.dt_txt).Date)
                        .Select(g => new DayInfo
                        {
                            Date = g.Key,
                            Min = g.Min(f => f.main.temp_min),
                            Max = g.Max(f => f.main.temp_max),
                            Weather = g.First().weather[0].main,
                            Icon = g.First().weather[0].icon
                        }).Take(7).ToList()
                    },
                    AirQuality = new AirQualityInfo
                    {
                        MainPollution = "PM2.5",
                        Value = airRes.list[0].components.pm2_5,
                        AQI = airRes.list[0].main.aqi
                    },
                    Charts = new ChartInfo
                    {
                        Temperature = forecastList.Select(f => new ChartPoint
                        {
                            Time = DateTime.Parse((string)f.dt_txt).ToString("HH:mm"),
                            Value = f.main.temp
                        }).Take(24).ToList(),

                        WindSpeed = forecastList.Select(f => new ChartPoint
                        {
                            Time = DateTime.Parse((string)f.dt_txt).ToString("HH:mm"),
                            Value = f.wind.speed
                        }).Take(24).ToList(),

                        Rainfall = forecastList.Select(f => new ChartPoint
                        {
                            Time = DateTime.Parse(f.dt_txt).ToString("HH:mm"),
                            Value = f.rain != null ? f.rain._3h : 0 // Nếu không có rain, đặt là 0
                        }).Take(24).ToList()
                    },

                };

                return new BusinessResult(200, "Success", result);
            }
            catch (Exception ex)
            {
                // Xử lý lỗi và trả về thông báo lỗi phù hợp
                return new BusinessResult(500, $"Error fetching weather data: {ex.Message}");
            }
        }

        private static string DegreeToCardinal(int degrees)
        {
            string[] dirs = { "N", "NE", "E", "SE", "S", "SW", "W", "NW" };
            return dirs[(int)Math.Round(((double)degrees % 360) / 45) % 8];
        }

        private static string UnixToHour(long unix)
        {
            return DateTimeOffset.FromUnixTimeSeconds(unix).ToLocalTime().ToString("HH:mm");
        }

        private static DateTime UnixToDateTime(long unix)
        {
            return DateTimeOffset.FromUnixTimeSeconds(unix).ToLocalTime().DateTime;
        }
    }
}
