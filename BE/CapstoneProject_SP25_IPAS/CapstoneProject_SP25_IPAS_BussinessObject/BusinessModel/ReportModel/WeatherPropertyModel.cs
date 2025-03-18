using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel
{
    public class WeatherPropertyModel
    {
        public double? CurrentTemp { get; set; }
        public double? TempMax { get; set; }
        public double? TempMin { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public double? Humidity { get; set; }
        public int? Visibility { get; set; }
        public string? WindSpeed { get; set; }
        public double? Clouds { get; set; }
    }
}
