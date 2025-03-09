using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject.Weather
{
    public class WeatherData
    {
        public WeatherMain Main { get; set; } = new();
        public WeatherWind Wind { get; set; } = new();
        public List<WeatherCondition> Weather { get; set; } = new();
    }
    public class WeatherMain
    {
        public double Temp { get; set; }
        public double Humidity { get; set; }
    }

    public class WeatherWind
    {
        public double Speed { get; set; }
    }

    public class WeatherCondition
    {
        public int Id { get; set; }
        public string Main { get; set; } = string.Empty;
    }

}

