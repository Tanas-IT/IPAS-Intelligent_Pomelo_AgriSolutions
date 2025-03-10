using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest
{
    public class PaymentCallbackRequest
    {
        //[JsonProperty("transaction_id")]
        public string TransactionId { get; set; } = null!;

        //[JsonProperty("order_code")]
        public int OrderId { get; set; }

        //[JsonProperty("status")]
        public string Status { get; set; } = null!;  // "PAID" / "FAILED"

        //[JsonProperty("payment_method")]
        //public string PaymentMethod { get; set; } = null!;

        //[JsonProperty("checksum")]
        //public string Checksum { get; set; } = null!;
    }
}
