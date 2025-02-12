using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class GraftedPlant
{
    public int GraftedPlantId { get; set; }

    public string? GraftedPlantCode { get; set; }

    public string? GraftedPlantName { get; set; }

    public string? GrowthStage { get; set; }

    public DateTime? SeparatedDate { get; set; }

    public string? Status { get; set; }

    public DateTime? GraftedDate { get; set; }

    public string? Note { get; set; }

    public int? PlantId { get; set; }

    public int? PlantLotId { get; set; }

    public virtual ICollection<CriteriaGraftedPlant> CriteriaGraftedPlants { get; set; } = new List<CriteriaGraftedPlant>();

    public virtual ICollection<GraftedPlantNote> GraftedPlantNotes { get; set; } = new List<GraftedPlantNote>();

    public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();

    public virtual Plant? Plant { get; set; }

    public virtual PlantLot? PlantLot { get; set; }

    public virtual ICollection<Resource> Resources { get; set; } = new List<Resource>();
}
