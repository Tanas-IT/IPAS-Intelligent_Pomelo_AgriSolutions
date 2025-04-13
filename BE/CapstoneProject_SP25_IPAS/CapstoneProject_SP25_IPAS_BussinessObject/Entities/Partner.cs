using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Partner
{
    public int PartnerId { get; set; }
    [CsvExport("PartnerCode")]
    public string? PartnerCode { get; set; }
    [CsvExport("Partner Name")]

    public string? PartnerName { get; set; }
    [CsvExport("Province")]
    public string? Province { get; set; }
    [CsvExport("District")]
    public string? District { get; set; }
    [CsvExport("Ward")]
    public string? Ward { get; set; }
    //public string? Avatar { get; set; }
    [CsvExport("Description")]
    public string? Description { get; set; }
    [CsvExport("Major")]
    public string? Major { get; set; }
    [CsvExport("Status")]
    public string? Status { get; set; }
    [CsvExport("ContractName")]
    public string? ContactName { get; set; }
    [CsvExport("Note")]
    public string? Note { get; set; }
    [CsvExport("Bisiness Field")]
    public string? BusinessField { get; set; }

    [CsvExport("Phone number")]
    public string? PhoneNumber { get; set; }

    [CsvExport("Email")]
    public string? Email { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    [CsvExport("National")]
    public string? National { get; set; }

    public int? FarmId { get; set; }

    public bool? IsDeleted { get; set; }
    public virtual ICollection<PlantLot> PlantLots { get; set; } = new List<PlantLot>();
    public virtual Farm Farm { get; set; }
}
