using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserWorkLogModel
{
    public class CheckConflictScheduleModel
    {
        public int UserId { get; set; }
        public DateTime DateCheck { get; set; }

        [FlexibleTime]
        public string StartTime { get; set; }

        [FlexibleTime]

        public string EndTime { get; set; }
    }
}
