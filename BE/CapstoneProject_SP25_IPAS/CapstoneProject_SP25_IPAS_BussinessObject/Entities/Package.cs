using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Package
{
    public int PackageId { get; set; }

    public string? PackageCode { get; set; }

    public string? PackageName { get; set; }

    public double? PackagePrice { get; set; }

    public double? Duration { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public string? Status { get; set; }
    public bool? IsActive { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<PackageDetail> PackageDetails { get; set; } = new List<PackageDetail>();
}
