using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest
{
    public class UpdatePackageRequest
    {
        public int PackageId { get; set; }
        //public string? PackageCode { get; set; }
        public string? PackageName { get; set; }
        public double? PackagePrice { get; set; }
        public double? Duration { get; set; }
        public string? Status { get; set; }
        public bool? IsActive { get; set; }

        public List<PackageDetailDto> PackageDetails { get; set; } = new();
    }
    public class PackageDetailDto
    {
        public int? PackageDetailId { get; set; } // null nếu thêm mới
        //public string? PackageDetailCode { get; set; }
        public string? FeatureName { get; set; }
        public string? FeatureDescription { get; set; }
    }
}
