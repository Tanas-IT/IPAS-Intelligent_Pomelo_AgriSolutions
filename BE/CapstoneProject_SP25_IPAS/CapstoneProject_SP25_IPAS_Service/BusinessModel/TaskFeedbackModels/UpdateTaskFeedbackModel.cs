using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.TaskFeedbackModels
{
    public class UpdateTaskFeedbackModel
    {
        public int TaskFeedbackId { get; set; }

        public string? Content { get; set; }
        public string? Status { get; set; }
        public string? Reason { get; set; }

        public DateTime? CreateDate { get; set; }

        public int? WorkLogId { get; set; }

        public int? ManagerId { get; set; }

    }
}
