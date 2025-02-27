using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest
{
    public class CreatePaymentLinkRequest
    {
        //public long orderCode { get; set; }
        public decimal amount { get; set; }
        public string description { get; set; }
        //public string buyerName { get; set; }
        public int farmId { get; set; }
        //public string farmId { get; set; }
        //public string farmName { get; set; }
        //public string packageName { get; set; }
        public int packageId { get; set; }
    }
}
