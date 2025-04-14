using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.OrderModels
{
    public class GetOrderFilterRequest
    {

        public double? TotalPriceFrom { get; set; }
        public double? TotalPriceTo { get; set; }

        public DateTime? OrderDateFrom { get; set; }
        public DateTime? OrderDateTo { get; set; }

        public DateTime? EnrolledDateFrom { get; set; }
        public DateTime? EnrolledDateTo { get; set; }

        public DateTime? ExpiredDateFrom { get; set; }
        public DateTime? ExpiredDateTo { get; set; }

        public string? Status { get; set; }

        public string? PackageIds { get; set; }
        public string? FarmIds { get; set; }
    }
}
