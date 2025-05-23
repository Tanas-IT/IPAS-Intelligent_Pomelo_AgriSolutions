﻿using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class HarvestHistory
{
    public int HarvestHistoryId { get; set; }

    public string? HarvestHistoryCode { get; set; }

    public DateTime? DateHarvest { get; set; }

    public string? HarvestHistoryNote { get; set; }

    public double? TotalPrice { get; set; }

    public string? HarvestStatus { get; set; }
    public bool? IsDeleted { get; set; }

    public int? CropId { get; set; }
    public int? AssignorId { get; set; }

    public virtual Crop? Crop { get; set; }
    public virtual User? User { get; set; }

    public virtual ICollection<ProductHarvestHistory> ProductHarvestHistories { get; set; } = new List<ProductHarvestHistory>();

    public virtual ICollection<CarePlanSchedule> CarePlanSchedules { get; set; } = new List<CarePlanSchedule>();
}
