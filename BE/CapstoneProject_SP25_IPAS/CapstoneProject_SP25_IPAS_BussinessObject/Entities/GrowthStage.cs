using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class GrowthStage
{
    public int GrowthStageId { get; set; }

    public string? GrowthStageCode { get; set; }

    public string? GrowthStageName { get; set; }

    public DateTime? MonthAgeStart { get; set; }

    public DateTime? MonthAgeEnd { get; set; }

    public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();
    public virtual ICollection<Process> Processes { get; set; } = new List<Process>();
    public virtual ICollection<Plant> Plants { get; set; } = new List<Plant>();
}
