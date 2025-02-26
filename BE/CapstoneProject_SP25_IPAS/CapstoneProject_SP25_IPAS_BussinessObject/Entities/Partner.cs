using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Partner
{
    public int PartnerId { get; set; }

    public string? PartnerCode { get; set; }

    public string? PartnerName { get; set; }

    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    //public string? Avatar { get; set; }
    public string? Description { get; set; }
    public string? Major { get; set; }
    public string? Status { get; set; }
    public string? ContactName { get; set; }
    public string? Note { get; set; }
    public string? BusinessField { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public string? National { get; set; }

    public int? RoleId { get; set; }
    public int? FarmId { get; set; }

    public virtual ICollection<PlantLot> PlantLots { get; set; } = new List<PlantLot>();
    public virtual Farm Farm { get; set; }
    public virtual Role? Role { get; set; }
}
