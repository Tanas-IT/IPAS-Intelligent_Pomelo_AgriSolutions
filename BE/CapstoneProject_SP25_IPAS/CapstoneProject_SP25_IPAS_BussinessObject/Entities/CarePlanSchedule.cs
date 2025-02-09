using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class CarePlanSchedule
{
    public int ScheduleId { get; set; }

    public string? DayOfWeek { get; set; }
    public string? DayOfMonth { get; set; }
    public string? CustomDates { get; set; }

    public TimeSpan? StarTime { get; set; }

    public TimeSpan? EndTime { get; set; }

    public int? CarePlanId { get; set; }

    public virtual Plan? CarePlan { get; set; }

    public virtual ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
}
