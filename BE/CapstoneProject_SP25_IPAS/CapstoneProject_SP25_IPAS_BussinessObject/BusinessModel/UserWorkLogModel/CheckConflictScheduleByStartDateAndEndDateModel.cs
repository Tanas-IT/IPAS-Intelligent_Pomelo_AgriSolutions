using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserWorkLogModel
{
    public class CheckConflictScheduleByStartDateAndEndDateModel
    {
        public int UserId { get; set; }
        [FlexibleTime]
        public string StartTime { get; set; }

        [FlexibleTime]

        public string EndTime { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
