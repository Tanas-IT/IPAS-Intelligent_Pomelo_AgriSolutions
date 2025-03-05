using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class UserFarm
{
    public int UserId { get; set; }

    public int FarmId { get; set; }

    public int? RoleId { get; set; }

    public string? Status { get; set; }
    public bool? IsActive { get; set; }

    public virtual Farm Farm { get; set; } = null!;

    public virtual Role? Role { get; set; }

    public virtual User User { get; set; } = null!;
}
