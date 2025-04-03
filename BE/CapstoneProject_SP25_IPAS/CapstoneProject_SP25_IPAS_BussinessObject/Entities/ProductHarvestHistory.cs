using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class ProductHarvestHistory
{
    public int ProductHarvestHistoryId { get; set; }
    public int HarvestHistoryId { get; set; }

    public int MasterTypeId { get; set; }

    public int? PlantId { get; set; }

    public string? Unit { get; set; }

    public double? SellPrice { get; set; }
    public double? CostPrice { get; set; }

    public double? QuantityNeed { get; set; }
    public double? ActualQuantity { get; set; }

    public int? UserID { get; set; }
    //public string? UpdateBy { get; set; }
    public DateTime? RecordDate { get; set; }
    public virtual HarvestHistory HarvestHistory { get; set; } = null!;

    public virtual MasterType Product { get; set; } = null!;

    public virtual Plant? Plant { get; set; }
    public virtual User? User { get; set; }
}
