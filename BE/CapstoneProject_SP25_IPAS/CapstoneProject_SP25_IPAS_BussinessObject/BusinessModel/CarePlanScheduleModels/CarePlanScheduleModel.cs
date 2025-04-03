using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.CarePlanScheduleModels
{
    public class CarePlanScheduleModel
    {
        public int ScheduleId { get; set; }

        public string? DayOfWeek { get; set; }
        public string? DayOfMonth { get; set; }
        public string? CustomDates { get; set; }
        public string? Status { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        //public bool? IsDeleted { get; set; }
        public int? CarePlanId { get; set; }
        public int? FarmID { get; set; }
        public int? HarvestHistoryID { get; set; }

        //public virtual Plan? CarePlan { get; set; }
        //public virtual Farm? Farm { get; set; }
        //public virtual HarvestHistory? HarvestHistory { get; set; }

        public ICollection<WorkLogHarvestModel>? WorkLogs { get; set; } = new List<WorkLogHarvestModel>();
    }
}
