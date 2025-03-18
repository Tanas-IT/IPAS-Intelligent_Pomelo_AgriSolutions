using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel
{
    public class WorkLogInPlanModel
    {
        public int WorkLogID { get; set; }
        public string WorkLogName { get; set; }
        public DateTime DateWork { get; set; }
        public string Status { get; set; }
        public string Reporter { get; set; }
        public TimeSpan? ActualStartTime { get; set; }

        public TimeSpan? ActualEndTime { get; set; }
        public string AvatarOfReporter { get; set; }
    }
}
