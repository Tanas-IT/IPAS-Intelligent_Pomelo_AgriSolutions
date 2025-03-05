using System;
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
    public bool? isDeleted { get; set; }
    public bool? IsRowHorizontal { get; set; }
    public string? TargetMarket { get; set; }
    public int? RowPerLine { get; set; }
    public double? RowSpacing { get; set; }
    public double? LineSpacing { get; set; }
    public int? NumberOfRows { get; set; }
    public double? MinLength { get; set; }
    public double? MaxLength { get; set; }
    public double? MinWidth { get; set; }
    public double? MaxWidth { get; set; }
    public virtual Farm? Farm { get; set; }

    public virtual ICollection<LandPlotCoordination> LandPlotCoordinations { get; set; } = new List<LandPlotCoordination>();

    public virtual ICollection<LandRow> LandRows { get; set; } = new List<LandRow>();

    public virtual ICollection<LandPlotCrop> LandPlotCrops { get; set; } = new List<LandPlotCrop>();
    public virtual ICollection<PlanTarget> PlanTargets { get; set; } = new List<PlanTarget>();
}
