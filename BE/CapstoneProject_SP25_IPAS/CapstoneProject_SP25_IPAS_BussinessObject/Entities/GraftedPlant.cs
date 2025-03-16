using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class GraftedPlant
{
    public int GraftedPlantId { get; set; }

    public string? GraftedPlantCode { get; set; }

    public string? GraftedPlantName { get; set; }

    //public string? GrowthStage { get; set; }

    public DateTime? SeparatedDate { get; set; }

    public string? Status { get; set; }

    public DateTime? GraftedDate { get; set; }

    public string? Note { get; set; }

    public int? MortherPlantId { get; set; }

    public int? PlantLotId { get; set; }

    public bool? IsDeleted { get; set; }
    public string? FinishedPlantCode { get; set; }
    public int? FarmId { get; set; }
    public bool? IsCompleted { get; set; }
    //public int? GrowthStageID { get; set; }
    //public virtual GrowthStage? GrowthStageInclude { get; set; }
    public virtual ICollection<GraftedPlantNote> GraftedPlantNotes { get; set; } = new List<GraftedPlantNote>();
    public virtual Plant? Plant { get; set; }
    public virtual PlantLot? PlantLot { get; set; }
    public virtual ICollection<PlanTarget> PlanTargets { get; set; } = new List<PlanTarget>();
    public virtual ICollection<CriteriaTarget> CriteriaTargets { get; set; } = new List<CriteriaTarget>();
}
