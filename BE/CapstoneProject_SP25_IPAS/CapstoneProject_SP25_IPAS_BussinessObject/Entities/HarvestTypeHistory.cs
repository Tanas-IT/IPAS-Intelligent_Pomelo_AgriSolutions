using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class HarvestTypeHistory
{
    public int HarvestTypeHistoryId { get; set; }

    public int MasterTypeId { get; set; }

    public int? PlantId { get; set; }

    public string? Unit { get; set; }

    public double? SellPrice { get; set; }
    public double? CostPrice { get; set; }

    public int? Quantity { get; set; }

    public int HarvestHistoryId { get; set; }

    public virtual HarvestHistory HarvestHistory { get; set; } = null!;

    public virtual MasterType MasterType { get; set; } = null!;

    public virtual Plant? Plant { get; set; }
}
