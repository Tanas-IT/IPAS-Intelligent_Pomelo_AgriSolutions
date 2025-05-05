using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WeatherModel
{
    public class WeatherDashBoardResponse
    {
        public LocationInfo? Location { get; set; }
        public CurrentWeather? Current { get; set; }
        public AirQualityInfo? AirQuality { get; set; }
        public TodayInfo? Today { get; set; }
        public WeekInfo? Week { get; set; }
        public ChartInfo? Charts { get; set; }
        public HighlightInfo? Highlights { get; set; }
    }

    public class LocationInfo
    {
        public string? Name { get; set; }
        public double? Lat { get; set; }
        public double? Lon { get; set; }
        public string? Timezone { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CurrentWeather
    {
        public double? Temperature { get; set; }
        public string? Weather { get; set; }
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public int? Humidity { get; set; }
        public int? Pressure { get; set; }
        public double? UvIndex { get; set; }
        public int? Cloudiness { get; set; }
        public double? WindSpeed { get; set; }
        public int? WindDeg { get; set; }
        public string? WindDirection { get; set; }
    }

    public class AirQualityInfo
    {
        public string? MainPollution { get; set; }
        public double? Value { get; set; } // PM2.5 hoặc PM10
        public double? AQI { get; set; }  // Chỉ số AQI (1–5)
    }

    public class TodayInfo
    {
        public List<HourInfo>? Hourly { get; set; }
    }

    public class WeekInfo
    {
        public List<DayInfo>? Daily { get; set; }
    }

    public class ChartInfo
    {
        public List<ChartPoint>? Temperature { get; set; }
        public List<ChartPoint>? WindSpeed { get; set; }
        public List<ChartPoint>? Rainfall { get; set; }
    }

    public class HighlightInfo
    {
        public int? Humidity { get; set; }
        public double? UvIndex { get; set; }
        public int? Pressure { get; set; }
        public int? Visibility { get; set; }
        public int? Cloudiness { get; set; }
        public DateTime? Sunrise { get; set; }
        public DateTime? Sunset { get; set; }
    }

    public class HourInfo
    {
        public string? Time { get; set; }
        public double? Temperature { get; set; }
        public string? Weather { get; set; }
        public string? Icon { get; set; }
    }

    public class DayInfo
    {
        public DateTime? Date { get; set; }
        public double? Min { get; set; }
        public double? Max { get; set; }
        public string? Weather { get; set; }
        public string? Icon { get; set; }
    }

    public class ChartPoint
    {
        public string? Time { get; set; }
        public double? Value { get; set; }
    }
}
