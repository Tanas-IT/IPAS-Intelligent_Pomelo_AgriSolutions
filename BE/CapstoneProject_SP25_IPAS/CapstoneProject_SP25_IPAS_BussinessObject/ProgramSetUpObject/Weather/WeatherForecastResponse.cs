using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject.Weather
{

    public class WeatherForecastResponse
    {
        [JsonPropertyName("cod")]
        public string Cod { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public int Message { get; set; }

        [JsonPropertyName("cnt")]
        public int Count { get; set; }

        [JsonPropertyName("list")]
        public List<WeatherForecastItem> List { get; set; } = new();
    }

    public class WeatherForecastItem
    {
        [JsonPropertyName("dt")]
        public long Timestamp { get; set; }

        [JsonPropertyName("dt_txt")]
        public string DateTimeText { get; set; } = string.Empty;

        [JsonPropertyName("main")]
        public WeatherForecastMain Main { get; set; } = new();

        [JsonPropertyName("weather")]
        public List<WeatherForecastCondition> Weather { get; set; } = new();

        [JsonPropertyName("wind")]
        public WeatherForecastWind Wind { get; set; } = new();

        public DateTime ForecastDateTime => DateTime.Parse(DateTimeText);
    }

    public class WeatherForecastMain
    {
        [JsonPropertyName("temp")]
        public double Temperature { get; set; }

        [JsonPropertyName("humidity")]
        public int Humidity { get; set; }
    }

    public class WeatherForecastCondition
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("main")]
        public string Main { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }

    public class WeatherForecastWind
    {
        [JsonPropertyName("speed")]
        public double Speed { get; set; }
    }


}
