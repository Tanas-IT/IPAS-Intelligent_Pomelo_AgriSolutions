using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.TaskFeedbackModel
{
    public class CreateTaskFeedbackModel
    {
        public string? Content { get; set; }

        public int? WorkLogId { get; set; }

        public int? ManagerId { get; set; }
    }
}
