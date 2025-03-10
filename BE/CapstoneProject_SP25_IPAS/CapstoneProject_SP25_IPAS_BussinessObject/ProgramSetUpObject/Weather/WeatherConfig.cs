using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject.Weather
{
    public class WeatherConfig
    {
        public Dictionary<string, WeatherRule> WorkRules { get; set; } = new();
        public Dictionary<string, List<int>> ExtremeWeatherConditions { get; set; } = new();
    }

    public class WeatherRule
    {
        public double? MinTemperature { get; set; }
        public double? MaxTemperature { get; set; }
        public double? MinHumidity { get; set; }
        public double? MaxHumidity { get; set; }
        public double? MaxWindSpeed { get; set; }
        public string? RainCondition { get; set; }
    }
}

