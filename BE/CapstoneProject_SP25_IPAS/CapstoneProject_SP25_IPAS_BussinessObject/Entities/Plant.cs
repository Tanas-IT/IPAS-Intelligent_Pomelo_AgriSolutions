﻿using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Plant
{
    public int PlantId { get; set; }

    public string? PlantCode { get; set; }

    public string? PlantName { get; set; }

    public int? PlantIndex { get; set; }

    public string? HealthStatus { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public DateTime? PlantingDate { get; set; }

    public int? PlantReferenceId { get; set; }

    public string? Description { get; set; }

    public int? MasterTypeId { get; set; }

    public string? ImageUrl { get; set; }
    public bool? IsDeleted { get; set; }
    public bool? IsPassed { get; set; }
    public bool? IsDead { get; set; }
    public DateTime? PassedDate { get; set; }
    public int? LandRowId { get; set; }

    public int? FarmId { get; set; }
    public int? GrowthStageID { get; set; }
    public int? PlantLotID { get; set; }

    public virtual ICollection<GraftedPlant> GraftedPlants { get; set; } = new List<GraftedPlant>();

    public virtual ICollection<ProductHarvestHistory> HarvestTypeHistories { get; set; } = new List<ProductHarvestHistory>();
    public virtual MasterType? MasterType { get; set; }
    public virtual LandRow? LandRow { get; set; }
    public virtual GrowthStage? GrowthStage { get; set; }

    public virtual Plant? PlantReference { get; set; }
    public virtual PlantLot? PlantLot { get; set; }
    public virtual ICollection<Plant> ChildPlants { get; set; } = new List<Plant>();
    public virtual ICollection<PlantGrowthHistory> PlantGrowthHistories { get; set; } = new List<PlantGrowthHistory>();

    public virtual ICollection<PlanTarget> PlanTargets { get; set; } = new List<PlanTarget>();
    public virtual ICollection<CriteriaTarget> CriteriaTargets { get; set; } = new List<CriteriaTarget>();
}
