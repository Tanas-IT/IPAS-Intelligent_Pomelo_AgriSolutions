using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.OrderModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PackageModels
{
    public class OrderModel
    {
        public int OrderId { get; set; }

        public string? OrderCode { get; set; }

        public string? OrderName { get; set; }

        public double? TotalPrice { get; set; }

        public string? Notes { get; set; }

        public DateTime? OrderDate { get; set; }

        public DateTime? EnrolledDate { get; set; }

        public DateTime? ExpiredDate { get; set; }

        public int? PackageId { get; set; }
        //public string? PackageName { get; set; }
        public int? FarmId { get; set; }
        public string? FarmName { get; set; }

        //public FarmModel? Farm { get; set; }

        //public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public PackageModel? Package { get; set; }

        public PaymentModel Payments { get; set; } = new PaymentModel();
    }
}
