using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WeatherModel
{
    public class AirPollutionResponse
    {
        public List<AirPollutionItem> list { get; set; }
    }

    public class AirPollutionItem
    {
        public MainPollution main { get; set; }
        public Components components { get; set; }
    }

    public class MainPollution
    {
        public double aqi { get; set; } 
    }

    public class Components
    {
        public double pm2_5 { get; set; }
        public double pm10 { get; set; }
    }

}
