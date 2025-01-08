﻿using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class LandPlot
{
    public int LandPlotId { get; set; }

    public string? LandPlotCode { get; set; }

    public string? LandPlotName { get; set; }

    public double? Area { get; set; }

    public double? Length { get; set; }

    public double? Width { get; set; }

    public string? SoilType { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public string? Status { get; set; }

    public string? Description { get; set; }

    public int? FarmId { get; set; }

    public string? TargetMarket { get; set; }

    public virtual ICollection<Crop> Crops { get; set; } = new List<Crop>();

    public virtual Farm? Farm { get; set; }

    public virtual ICollection<LandPlotCoordination> LandPlotCoordinations { get; set; } = new List<LandPlotCoordination>();

    public virtual ICollection<LandRow> LandRows { get; set; } = new List<LandRow>();

    public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();
}
