using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Common.Constants
{
    public static class HarvestStatusConst
    {
        public static string NOT_YET = "Not Started";
        public static string IN_PROCESSING = "In Progress";
        public static string IS_COMPLETED = "Completed";
        public static string Is_INCOMPLETED = "Incomplete";
        public static readonly HashSet<string> ValidStatuses = new()
            {
                NOT_YET.ToLower(),
                IN_PROCESSING.ToLower(),
                IS_COMPLETED.ToLower(),
                Is_INCOMPLETED.ToLower()
            };
    }
}
