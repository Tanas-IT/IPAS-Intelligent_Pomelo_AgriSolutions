using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class SubProcess
{
    public int SubProcessId { get; set; }

    public string? SubProcessCode { get; set; }

    public string? SubProcessName { get; set; }

    public int? ParentSubProcessId { get; set; }

    public bool? IsDefault { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public bool? IsDeleted { get; set; }

    public int? ProcessId { get; set; }

    public int? MasterTypeId { get; set; }

    public string? ResourceUrl { get; set; }

    public string? Input { get; set; }

    public virtual MasterType? MasterType { get; set; }

    public virtual Process? Process { get; set; }
}
