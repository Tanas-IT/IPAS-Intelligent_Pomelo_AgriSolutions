using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class TaskFeedback
{
    public int TaskFeedbackId { get; set; }

    public string? TaskFeedbackCode { get; set; }

    public string? Content { get; set; }

    public DateTime? CreateDate { get; set; }

    public int? WorkLogId { get; set; }

    public int? ManagerId { get; set; }

    public virtual User? Manager { get; set; }

    public virtual WorkLog? WorkLog { get; set; }
}
