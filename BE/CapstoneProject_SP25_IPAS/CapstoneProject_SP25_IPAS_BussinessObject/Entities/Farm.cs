using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Farm
{
    public int FarmId { get; set; }

    public string? FarmCode { get; set; }

    public string? FarmName { get; set; }

    public string? Address { get; set; }

    public string? LogoUrl { get; set; }

    public double? Area { get; set; }

    public string? SoilType { get; set; }

    public string? ClimateZone { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public bool? IsDeleted { get; set; }

    public string? Status { get; set; }

    public double? Length { get; set; }

    public double? Width { get; set; }

    public string? Description { get; set; }

    public string? District { get; set; }

    public string? Ward { get; set; }

    public string? Province { get; set; }

    public double? Longitude { get; set; }

    public double? Latitude { get; set; }

    //public string? LandOwnershipCertificate { get; set; }

    //public string? OperatingLicense { get; set; }

    //public string? LandLeaseAgreement { get; set; }

    //public string? PesticideUseLicense { get; set; }

    //public virtual ICollection<FarmCoordination> FarmCoordinations { get; set; } = new List<FarmCoordination>();

    public virtual ICollection<LandPlot> LandPlots { get; set; } = new List<LandPlot>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<UserFarm> UserFarms { get; set; } = new List<UserFarm>();
    public virtual ICollection<Process> Processes { get; set; } = new List<Process>();
    public virtual ICollection<LegalDocument> LegalDocuments { get; set; } = new List<LegalDocument>();
    public virtual ICollection<MasterType> MasterTypes { get; set; } = new List<MasterType>();
    public virtual ICollection<GrowthStage> GrowthStages { get; set; } = new List<GrowthStage>();
}
