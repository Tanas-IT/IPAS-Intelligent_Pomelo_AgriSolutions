using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Criteria
{
    public int CriteriaId { get; set; }

    public string? CriteriaCode { get; set; }

    public string? CriteriaName { get; set; }

    public string? CriteriaDescription { get; set; }

    public int? Priority { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsChecked { get; set; }

    public int? MasterTypeId { get; set; }

    public virtual ICollection<CriteriaGraftedPlant> CriteriaGraftedPlants { get; set; } = new List<CriteriaGraftedPlant>();

    public virtual ICollection<CriteriaHarvestType> CriteriaHarvestTypes { get; set; } = new List<CriteriaHarvestType>();

    public virtual MasterType? MasterType { get; set; }

    public virtual ICollection<PlantCriteria> PlantCriteria { get; set; } = new List<PlantCriteria>();
}
