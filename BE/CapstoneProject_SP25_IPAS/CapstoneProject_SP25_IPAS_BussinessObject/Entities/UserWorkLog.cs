using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class UserWorkLog
{
    public int UserWorkLogID { get; set; }
    public int WorkLogId { get; set; }
    public int UserId { get; set; }
    public string? Notes { get; set; }
    public string? Issue {  get; set; }

    public bool? IsReporter { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual WorkLog WorkLog { get; set; } = null!;
    public virtual ICollection<Resource> Resources { get; set; } = new List<Resource>();

}
