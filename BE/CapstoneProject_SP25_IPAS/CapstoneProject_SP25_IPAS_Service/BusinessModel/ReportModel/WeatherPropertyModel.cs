using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportModel
{
    public class WeatherPropertyModel
    {
        public string? TempMax { get; set; }
        public string? TempMin { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public string? Humidity { get; set; }
        public string? Visibility { get; set; }
        public string? WindSpeed { get; set; }
        public string? Clouds { get; set; }
    }
}
