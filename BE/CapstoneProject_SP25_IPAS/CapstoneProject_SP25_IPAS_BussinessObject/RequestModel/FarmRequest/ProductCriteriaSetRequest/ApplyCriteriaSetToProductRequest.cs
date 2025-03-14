using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ProductCriteriaSetRequest
{
    public class ApplyCriteriaSetToProductRequest
    {
        public int ProductId { get; set; }
        public List<int> ListCriteriaSet { get; set; } = new List<int>();
    }
}
