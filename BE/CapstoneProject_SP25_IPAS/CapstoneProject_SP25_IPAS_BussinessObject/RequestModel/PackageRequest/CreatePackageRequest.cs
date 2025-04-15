using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest
{
    public class CreatePackageRequest
    {
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Package name must from 1-100 digit")]
        public string PackageName { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "PackagePrice must be >= 0")]
        public double PackagePrice { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Duration must be > 0")]
        public double Duration { get; set; }

        public List<CreatePackageDetailDto> PackageDetails { get; set; } = new();
    }

    public class CreatePackageDetailDto
    {
        [MinLength(5, ErrorMessage = "Future name must from 1-100 digit")]
        public string FeatureName { get; set; }

        [MinLength(10, ErrorMessage = "Description must from 1-100 digit")]
        public string FeatureDescription { get; set; }
    }
}
