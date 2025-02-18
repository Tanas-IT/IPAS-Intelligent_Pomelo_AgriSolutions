using System;
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
    public bool? isDelete { get; set; }

    public int? CropId { get; set; }

    public virtual Crop? Crop { get; set; }

    public virtual ICollection<HarvestTypeHistory> HarvestTypeHistories { get; set; } = new List<HarvestTypeHistory>();

    public virtual ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
}
