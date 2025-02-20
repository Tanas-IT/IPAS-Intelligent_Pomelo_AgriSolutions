using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class GrowthStage
{
    public int GrowthStageId { get; set; }

    public string? GrowthStageCode { get; set; }

    public string? GrowthStageName { get; set; }

    public int? MonthAgeStart { get; set; }

    public int? MonthAgeEnd { get; set; }
    public bool? isDefault { get; set; }
    public int? FarmID { get; set; }
    public virtual Farm? Farm { get; set; }

    public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();
    public virtual ICollection<Process> Processes { get; set; } = new List<Process>();
    public virtual ICollection<Plant> Plants { get; set; } = new List<Plant>();
    public virtual ICollection<MasterType> MasterTypes { get; set; } = new List<MasterType>();
}
