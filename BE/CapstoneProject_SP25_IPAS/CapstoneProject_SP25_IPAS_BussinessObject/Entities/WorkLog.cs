﻿using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class WorkLog
{
    public int WorkLogId { get; set; }

    public string? WorkLogCode { get; set; }

    public string? Status { get; set; }

    public string? Notes { get; set; }

    public DateTime? Date { get; set; }

    public bool? IsConfirm { get; set; }

    public int? ScheduleId { get; set; }

    public int? HarvestHistoryId { get; set; }

    public int? CropId { get; set; }

    public virtual Crop? Crop { get; set; }

    public virtual HarvestHistory? HarvestHistory { get; set; }

    public virtual CarePlanSchedule? Schedule { get; set; }

    public virtual ICollection<TaskFeedback> TaskFeedbacks { get; set; } = new List<TaskFeedback>();

    public virtual ICollection<UserWorkLog> UserWorkLogs { get; set; } = new List<UserWorkLog>();

    public virtual ICollection<WorkLogResource> WorkLogResources { get; set; } = new List<WorkLogResource>();
}
