using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AIRequest
{
    public class ProcessRecomendRequest
    {
        public string processName { get; set; }
        public bool? isSample { get; set; } = false;
        public int? MasterTypeId { get; set; }
        public int? PlanTargetInProcess { get; set; }

    }
}
