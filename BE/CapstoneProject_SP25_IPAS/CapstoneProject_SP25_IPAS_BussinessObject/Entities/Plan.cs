using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Plan
{
    public int PlanId { get; set; }

    public string? Status { get; set; }

    public string? PlanCode { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public bool? IsActive { get; set; }

    public string? Notes { get; set; }

    public string? PlanDetail { get; set; }

    public string? ResponsibleBy { get; set; }

    public string? Frequency { get; set; }
    public string? PlanName { get; set; }

    public int? PlantId { get; set; }

    public int? LandPlotId { get; set; }

    public int? AssignorId { get; set; }

    public string? PesticideName { get; set; }

    public double? MaxVolume { get; set; }

    public double? MinVolume { get; set; }

    public int? ProcessId { get; set; }

    public int? CropId { get; set; }

    public int? GrowthStageId { get; set; }

    public int? PlantLotId { get; set; }

    public bool? IsDelete { get; set; }

    public int? MasterTypeId { get; set; }
    public int? GraftedPlantId { get; set; }

    public virtual ICollection<CarePlanSchedule> CarePlanSchedules { get; set; } = new List<CarePlanSchedule>();

    public virtual GraftedPlant? GraftedPlant { get; set; }

    public virtual LandPlot? LandPlot { get; set; }

    public virtual MasterType? MasterType { get; set; }

    public virtual PlantLot? PlantLot { get; set; }

    public virtual Process? Process { get; set; }
    public virtual GrowthStage? GrowthStage { get; set; }
    public virtual User? User { get; set; }
    public virtual Crop? Crop { get; set; }
    public virtual Plant? Plant { get; set; }
}
