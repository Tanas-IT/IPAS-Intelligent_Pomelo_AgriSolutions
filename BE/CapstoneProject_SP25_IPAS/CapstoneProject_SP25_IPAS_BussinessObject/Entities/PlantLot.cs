using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class PlantLot
{
    public int PlantLotId { get; set; }

    public string? PlantLotCode { get; set; }

    public string? PlantLotName { get; set; }

    public int? PreviousQuantity { get; set; }

    public string? Unit { get; set; }

    public string? Status { get; set; }

    public int? LastQuantity { get; set; }

    public DateTime? ImportedDate { get; set; }

    public string? Note { get; set; }

    public int? PartnerId { get; set; }

    public int? PlantLotReferenceId { get; set; }

    public virtual ICollection<GraftedPlant> GraftedPlants { get; set; } = new List<GraftedPlant>();

    public virtual ICollection<PlantLot> InversePlantLotReference { get; set; } = new List<PlantLot>();

    public virtual Partner? Partner { get; set; }


    public virtual PlantLot? PlantLotReference { get; set; }
    public virtual ICollection<PlanTarget> PlanTargets { get; set; } = new List<PlanTarget>();
}
