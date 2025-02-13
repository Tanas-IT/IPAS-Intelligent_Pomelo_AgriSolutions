using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel
{
    public class ParamCalendarModel
    {
        public int? UserId { get; set; }

        public int? PlanId { get; set; } 
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate {  get; set; }
    }
}
