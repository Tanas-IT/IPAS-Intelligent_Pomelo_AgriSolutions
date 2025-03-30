using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class WorkLogSummaryModel
    {
        public Dictionary<string, int> StatusCounts { get; set; } = new();
    }
}
