using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Role
{
    public int RoleId { get; set; }

    public string? RoleName { get; set; }

    public bool? IsSystem { get; set; }

    public virtual ICollection<Partner> Partners { get; set; } = new List<Partner>();

    public virtual ICollection<UserFarm> UserFarms { get; set; } = new List<UserFarm>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
