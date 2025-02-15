using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel
{
    public class UserScheduleModel
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public bool? IsReporter { get; set; }
    }
}
