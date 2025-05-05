using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WeatherModel
{
    public class ForecastResponse
    {
        public List<ForecastItem> list { get; set; }
    }

    public class ForecastItem
    {
        public MainInfo main { get; set; }
        public List<WeatherInfo> weather { get; set; }
        public WindInfo wind { get; set; }
        public Clouds clouds { get; set; }
        public RainInfo rain { get; set; }
        public string dt_txt { get; set; }
    }
    public class WindInfo
    {
        public double speed { get; set; }
        public int deg { get; set; }
    }

    public class Clouds
    {
        public int all { get; set; }
    }
    public class RainInfo
    {
        public double _3h { get; set; }  
    }

}
