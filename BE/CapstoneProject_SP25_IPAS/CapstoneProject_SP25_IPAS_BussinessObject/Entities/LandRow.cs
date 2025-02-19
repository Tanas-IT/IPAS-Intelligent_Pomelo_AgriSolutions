using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class LandRow
{
    public int LandRowId { get; set; }

    public string? LandRowCode { get; set; }

    public int? RowIndex { get; set; }

    public int? TreeAmount { get; set; }

    public double? Distance { get; set; }

    public double? Length { get; set; }

    public double? Width { get; set; }

    public string? Direction { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public string? Status { get; set; }

    public string? Description { get; set; }

    public int? LandPlotId { get; set; }

    public int? FarmId { get; set; }
    public virtual LandPlot? LandPlot { get; set; }

    public virtual ICollection<Plant> Plants { get; set; } = new List<Plant>();
    public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();
}
