using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest
{
    public class ListGrowthStageModel
    {
        public List<int?> ListGrowthStage { get; set; }
    }
    public class ListFilterGrowthStageModel
    {
        public List<int?> ListGrowthStage { get; set; }
        public string TypeName { get; set; }
    }
}
