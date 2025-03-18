using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest
{
    public class GetTopStatisticByYearRequest
    {
        public int? farmId { get; set; }
        public int productId { get; set; }
        public int? topN {  get; set; }
        public int? yearFrom { get; set; }
        public int? yearTo { get; set; }
    }
}
