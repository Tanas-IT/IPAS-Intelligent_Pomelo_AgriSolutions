using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class GrowthStage
{
    public int GrowthStageID { get; set; }

    public string? GrowthStageCode { get; set; }

    public string? GrowthStageName { get; set; }

    public int? MonthAgeStart { get; set; }

    public int? MonthAgeEnd { get; set; }
    public bool? isDefault { get; set; }
    public DateTime? CreateDate { get; set; }
    public string? Description { get; set; }
    public int? FarmID { get; set; }
    public bool? isDeleted { get; set; }
    public string? ActiveFunction { get; set; }
    public virtual Farm? Farm { get; set; }

    public virtual ICollection<Process> Processes { get; set; } = new List<Process>();
    public virtual ICollection<Plant> Plants { get; set; } = new List<Plant>();
    public virtual ICollection<GrowthStagePlan> GrowthStagePlans { get; set; } = new List<GrowthStagePlan>();
    public virtual ICollection<PlantLot> PlantLots { get; set; } = new List<PlantLot>();
    //public virtual ICollection<GraftedPlant> GraftedPlants { get; set; } = new List<GraftedPlant>();
    public virtual ICollection<GrowthStageMasterType> GrowthStageMasterTypes { get; set; } = new List<GrowthStageMasterType>();
}
