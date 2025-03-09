using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.OrderModels
{
    public class PackageDetailModel
    {
        public int PackageDetailId { get; set; }

        public string? PackageDetailCode { get; set; }

        public string? FeatureName { get; set; }

        public string? FeatureDescription { get; set; }

        public int? PackageId { get; set; }

    }
}
