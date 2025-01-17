﻿using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class HarvestTypeHistory
{
    public int HarvestTypeId { get; set; }

    public int? PlantId { get; set; }

    public int? Unit { get; set; }

    public double? Price { get; set; }

    public int? Quantity { get; set; }

    public int HarvestHistoryId { get; set; }

    public virtual HarvestHistory HarvestHistory { get; set; } = null!;

    public virtual HarvestType HarvestType { get; set; } = null!;

    public virtual Plant? Plant { get; set; }
}
