using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.TaskFeedbackModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel
{
    public class WorkLogHarvestModel
    {
        public int WorkLogId { get; set; }

        public string? WorkLogCode { get; set; }

        public string? Status { get; set; }
        public string? WorkLogName { get; set; }

        public string? ReasonDelay { get; set; }

        public DateTime? Date { get; set; }
        public TimeSpan? ActualStartTime { get; set; }

        public TimeSpan? ActualEndTime { get; set; }

        public bool? IsConfirm { get; set; }
        public bool? IsDeleted { get; set; }

        public int? ScheduleId { get; set; }

        //public virtual ICollection<TaskFeedbackModel> TaskFeedbacks { get; set; } = new List<TaskFeedbackModel>();

        public ICollection<NoteOfWorkLogModel> UserWorkLogs { get; set; } = new List<NoteOfWorkLogModel>();

    }
}
