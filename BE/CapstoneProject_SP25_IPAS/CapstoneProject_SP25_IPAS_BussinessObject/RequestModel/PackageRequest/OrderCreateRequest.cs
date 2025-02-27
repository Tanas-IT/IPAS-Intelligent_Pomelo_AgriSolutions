using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest
{
    public class OrderCreateRequest
    {
        public string? OrderName { get; set; }

        public double TotalPrice { get; set; }

        public string? Notes { get; set; }

        //public DateTime? OrderDate { get; set; }

        //public DateTime? EnrolledDate { get; set; }

        //public DateTime? ExpiredDate { get; set; }
        [Required]
        public int PackageId { get; set; }
        [Required]
        public int FarmId { get; set; }
        //payment request
        public string? TransactionId { get; set; }

        public string? PaymentMethod { get; set; }
        public string? PaymentStatus { get; set; }

    }
}
