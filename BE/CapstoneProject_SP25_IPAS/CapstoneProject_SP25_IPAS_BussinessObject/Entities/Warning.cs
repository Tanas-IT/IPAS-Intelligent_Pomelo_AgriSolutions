using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Warning
{
    public int WarningId { get; set; }

    public string? WarningCode { get; set; }

    public string? WarningName { get; set; }

    public string? Status { get; set; }

    public string? Level { get; set; }

    public string? Description { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public virtual ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
}
