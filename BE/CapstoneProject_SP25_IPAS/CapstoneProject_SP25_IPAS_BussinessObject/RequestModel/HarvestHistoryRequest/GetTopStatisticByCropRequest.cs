using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest
{
    public class GetTopStatisticByCropRequest
    {
        public int? farmId { get; set; }
        public int productId { get; set; }
        public int? topN { get; set; }
        public List<int> cropId { get; set; }
    }
}
