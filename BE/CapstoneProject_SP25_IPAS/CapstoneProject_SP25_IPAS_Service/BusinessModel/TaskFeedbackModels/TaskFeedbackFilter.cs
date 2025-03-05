using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.TaskFeedbackModels
{
    public class TaskFeedbackFilter
    {
        [FromQuery(Name = "taskFeedbackId")]
        public int TaskFeedbackId { get; set; }

        [FromQuery(Name = "content")]
        public string? Content { get; set; }
        [FromQuery(Name = "createDate")]

        public DateTime? CreateDate { get; set; }
        [FromQuery(Name = "managerName")]

        public string? ManagerName { get; set; }
        [FromQuery(Name = "workLogName")]

        public string? WorkLogName { get; set; }
    }
}
