using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class MasterTypeDetail
{
    public int MasterTypeDetailId { get; set; }

    public string? MasterTypeDetailCode { get; set; }

    public string? MasterTypeDetailName { get; set; }

    public string? Value { get; set; }

    public string? TypeOfValue { get; set; }

    public int? ForeignKeyId { get; set; }

    public string? ForeignKeyTable { get; set; }

    public int? MasterTypeId { get; set; }

   public virtual MasterType? MasterType { get; set; }
}
