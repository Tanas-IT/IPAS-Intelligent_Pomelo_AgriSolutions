using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest
{
    public class GetFarmFilterRequest
    {
        public double? AreaFrom { get; set; }
        public double? AreaTo { get; set; }
        public string? SoilType { get; set; }
        public string? ClimateZone { get; set; }
        public DateTime? CreateDateFrom { get; set; }
        public DateTime? CreateDateTo { get; set; }
        public string? Status { get; set; }
    }
}
