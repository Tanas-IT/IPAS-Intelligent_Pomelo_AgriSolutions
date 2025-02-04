using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class CriteriaHarvestType
{
    public int CriteriaId { get; set; }

    public int MasterTypeId { get; set; }

    public bool? IsChecked { get; set; }

    public virtual Criteria Criteria { get; set; } = null!;

    public virtual MasterType MasterType { get; set; } = null!;
}
