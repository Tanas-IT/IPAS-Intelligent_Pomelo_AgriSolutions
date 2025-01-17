﻿using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class PlantGrowthHistory
{
    public int PlantGrowthHistoryId { get; set; }

    public string? PlantGrowthHistoryCode { get; set; }

    public string? Content { get; set; }

    public string? NoteTaker { get; set; }

    public string? IssueName { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public int? PlantId { get; set; }

    public virtual Plant? Plant { get; set; }

    public virtual ICollection<PlantResource> PlantResources { get; set; } = new List<PlantResource>();
}
