using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel
{
    public class UserScheduleModel
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public bool? IsReporter { get; set; }
        public string? Notes { get; set; }
        public string? AvatarURL { get; set; }
        public string? Issue { get; set; }
    }
}
