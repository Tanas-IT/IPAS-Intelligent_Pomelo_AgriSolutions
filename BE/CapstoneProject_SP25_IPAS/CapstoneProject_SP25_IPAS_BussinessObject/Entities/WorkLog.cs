using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class WorkLog
{
    public int WorkLogId { get; set; }

    public string? WorkLogCode { get; set; }

    public string? Status { get; set; }
    public string? WorkLogName { get; set; }

    public string? Notes { get; set; }
    public string? ReasonDelay { get; set; }

    public DateTime? Date { get; set; }

    public bool? IsConfirm { get; set; }

    public int? ScheduleId { get; set; }

    public int? HarvestHistoryId { get; set; }

    public int? WarningId { get; set; }

    public virtual HarvestHistory? HarvestHistory { get; set; }

    public virtual CarePlanSchedule? Schedule { get; set; }

    public virtual ICollection<TaskFeedback> TaskFeedbacks { get; set; } = new List<TaskFeedback>();

    public virtual ICollection<UserWorkLog> UserWorkLogs { get; set; } = new List<UserWorkLog>();

    public virtual Warning? Warning { get; set; }

    public virtual ICollection<Resource> Resources { get; set; } = new List<Resource>();
}
