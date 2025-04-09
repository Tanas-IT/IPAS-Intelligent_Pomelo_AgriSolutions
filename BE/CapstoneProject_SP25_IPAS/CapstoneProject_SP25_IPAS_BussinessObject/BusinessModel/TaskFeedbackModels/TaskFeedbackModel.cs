using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.TaskFeedbackModels
{
    public class TaskFeedbackModel
    {
        public int TaskFeedbackId { get; set; }
        public string? FullName { get; set; }
        public string? AvatarURL { get; set; }

        public string? TaskFeedbackCode { get; set; }
        public string? ReasonDelay { get; set; }

        public string? Content { get; set; }

        public DateTime? CreateDate { get; set; }

        public int? WorkLogId { get; set; }

        public int? ManagerId { get; set; }

        public string? ManagerName { get; set; }

        public string? WorkLogName { get; set; }
    }
}
