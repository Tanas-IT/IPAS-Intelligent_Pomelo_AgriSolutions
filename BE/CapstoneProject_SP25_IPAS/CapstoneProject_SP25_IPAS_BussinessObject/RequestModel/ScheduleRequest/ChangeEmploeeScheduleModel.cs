using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ScheduleRequest
{
    public class ChangeEmploeeScheduleModel
    {
        public int OldUserId { get; set; }
        public int NewUserId { get; set; }
        public bool? IsReporter { get; set; }
    }
}
