using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Plant
{
    public int PlantId { get; set; }

    public string? PlantCode { get; set; }

    public string? PlantName { get; set; }

    public int? PlantIndex { get; set; }

    public string? GrowthStage { get; set; }

    public string? HealthStatus { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public DateTime? PlantingDate { get; set; }

    public int? PlantReferenceId { get; set; }

    public string? Description { get; set; }

    public int? MasterTypeId { get; set; }

    public string? ImageUrl { get; set; }
    public bool? IsDeleted { get; set; }

    public int? LandRowId { get; set; }

    public virtual ICollection<GraftedPlant> GraftedPlants { get; set; } = new List<GraftedPlant>();

    public virtual ICollection<HarvestTypeHistory> HarvestTypeHistories { get; set; } = new List<HarvestTypeHistory>();

    public virtual MasterType? MasterType { get; set; }
    public virtual LandRow? LandRow { get; set; }

    public virtual ICollection<PlantCriteria> PlantCriteria { get; set; } = new List<PlantCriteria>();

    public virtual ICollection<PlantGrowthHistory> PlantGrowthHistories { get; set; } = new List<PlantGrowthHistory>();
}
