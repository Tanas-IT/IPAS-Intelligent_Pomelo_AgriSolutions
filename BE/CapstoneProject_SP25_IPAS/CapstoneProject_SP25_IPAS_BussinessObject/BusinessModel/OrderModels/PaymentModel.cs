using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.OrderModels
{
    public class PaymentModel
    {
        public int PaymentId { get; set; }

        public string? PaymentCode { get; set; }

        public string? TransactionId { get; set; }

        public DateTime? CreateDate { get; set; }

        public string? PaymentMethod { get; set; }

        public string? Status { get; set; }

        public int? OrderId { get; set; }

        public DateTime? UpdateDate { get; set; }

    }
}
