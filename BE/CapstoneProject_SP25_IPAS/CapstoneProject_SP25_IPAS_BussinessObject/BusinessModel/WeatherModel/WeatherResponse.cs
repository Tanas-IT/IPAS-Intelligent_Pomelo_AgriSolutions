using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WeatherModel
{
    public class WeatherResponse
    {
        public Coord coord { get; set; }
        public List<WeatherInfo> weather { get; set; }
        public MainInfo main { get; set; }
        public Wind wind { get; set; }
        public string name { get; set; }
        public int timezone { get; set; }
        public int visibility { get; set; }
        public SysInfo sys { get; set; }
    }

    public class SysInfo
    {
        public long sunrise { get; set; } 
        public long sunset { get; set; }  
    }
    public class Coord
    {
        public double lon { get; set; }
        public double lat { get; set; }
    }

    public class MainInfo
    {
        public double temp { get; set; }
        public int pressure { get; set; }
        public int humidity { get; set; }
        public double temp_min { get; set; }
        public double temp_max { get; set; }
    }

    public class Wind
    {
        public double speed { get; set; }
        public int deg { get; set; }
    }

    public class WeatherInfo
    {
        public string main { get; set; }
        public string description { get; set; }
        public string icon { get; set; }
    }

}
