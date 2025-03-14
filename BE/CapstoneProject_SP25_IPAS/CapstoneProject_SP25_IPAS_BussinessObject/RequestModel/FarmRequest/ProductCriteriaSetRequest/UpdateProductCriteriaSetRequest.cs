using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ProductCriteriaSetRequest
{
    public class UpdateProductCriteriaSetRequest
    {
        public int ProductId { get; set; }
        public int CriteriaSetId { get; set; }
        public bool? IsActive { get; set; } = false;
    }
}
