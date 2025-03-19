using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Criteria
{
    public int CriteriaId { get; set; }

    public string? CriteriaCode { get; set; }

    public string? CriteriaName { get; set; }

    public string? CriteriaDescription { get; set; }
    public double? MinValue { get; set; }
    public double? MaxValue { get; set; }
    public string? Unit {  get; set; }
    public int? Priority { get; set; }
    public int? FrequencyDate { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsDeleted { get; set; }
    public bool? IsDefault { get; set; }

    public int? MasterTypeID { get; set; }
   
    public virtual ICollection<CriteriaTarget> CriteriaTargets { get; set; } = new List<CriteriaTarget>();
    public virtual MasterType? MasterType { get; set; }
}
