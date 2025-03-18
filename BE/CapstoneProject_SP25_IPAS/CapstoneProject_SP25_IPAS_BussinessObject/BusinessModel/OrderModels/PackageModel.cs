using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.OrderModels
{
    public class PackageModel
    {
        public int PackageId { get; set; }

        public string? PackageCode { get; set; }

        public string? PackageName { get; set; }

        public double? PackagePrice { get; set; }

        public double? Duration { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public string? Status { get; set; }

        public bool? IsActive { get; set; }

        //public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

        public ICollection<PackageDetailModel> PackageDetails { get; set; } = new List<PackageDetailModel>();
    }
}
