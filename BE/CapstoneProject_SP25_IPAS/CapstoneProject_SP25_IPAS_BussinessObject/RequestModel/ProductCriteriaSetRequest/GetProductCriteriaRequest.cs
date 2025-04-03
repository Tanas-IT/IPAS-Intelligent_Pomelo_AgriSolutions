using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ProductCriteriaSetRequest
{
    public class GetProductCriteriaRequest
    {
        public int productId { get; set; }
        public string? Targets { get; set; }
    }
}
