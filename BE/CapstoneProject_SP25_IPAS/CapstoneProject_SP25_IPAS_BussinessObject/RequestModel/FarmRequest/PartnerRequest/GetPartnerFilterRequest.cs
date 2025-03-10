using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PartnerRequest
{
    public class GetPartnerFilterRequest
    {
        public int? FarmId { get; set; }
        public string? Status { get; set; }
        public string? Major { get; set; }

    }
}
