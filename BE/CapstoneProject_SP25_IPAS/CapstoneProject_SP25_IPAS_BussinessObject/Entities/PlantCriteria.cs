using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class PlantCriteria
{
    public int PlantId { get; set; }

    public int CriteriaId { get; set; }

    public bool? IsChecked { get; set; }

    public int? Priority { get; set; }

    public virtual Criteria Criteria { get; set; } = null!;

    public virtual Plant Plant { get; set; } = null!;
}
