﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.TaskFeedbackRequest
{
    public class CreateTaskFeedbackModel
    {
        public string? Content { get; set; }

        public int? WorkLogId { get; set; }

        public int? ManagerId { get; set; }
        public string? Reason { get; set; }
        public string? Status { get; set; }

    }
}
