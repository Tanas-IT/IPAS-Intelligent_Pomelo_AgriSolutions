using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels
{
    public class PlantModel
    {
        public int PlantId { get; set; }
        [CsvExport("PlantCode")]
        public string? PlantCode { get; set; }
        [CsvExport("PlantName")]
        public string? PlantName { get; set; }
        [CsvExport("PlantIndex")]
        public int? PlantIndex { get; set; }

        //public string? GrowthStage { get; set; }
        [CsvExport("HealthStatus")]
        public string? HealthStatus { get; set; }
        public DateTime? CreateDate { get; set; }
        public DateTime? UpdateDate { get; set; }
        [CsvExport("PlantingDate")]
        public DateTime? PlantingDate { get; set; }

        public int? PlantReferenceId { get; set; }
        [CsvExport("MotherPlantCode")]
        public string? PlantReferenceCode { get; set; }
        [CsvExport("MotherPlantName")]
        public string? PlantReferenceName { get; set; }
        [CsvExport("DIscription")]
        public string? Description { get; set; }
        public int? MasterTypeId { get; set; }
        public string? ImageUrl { get; set; }

        public int? LandRowId { get; set; }
        [CsvExport("RowCode")]
        public string? RowCode { get; set; }
        [CsvExport("RowIndex")]
        public int? RowIndex { get; set; }
        public int? LandPlotId { get; set; }
        [CsvExport("LandPlot")]
        public string? LandPlotName { get; set; }
        [CsvExport("CultivarName")]
        public string? MasterTypeName { get; set; }
        public string? Characteristic { get; set; }
        public int? GrowthStageID { get; set; }
        [CsvExport("GrowthStageName")]
        public string? GrowthStageName { get; set; }
        [CsvExport("IsDead")]
        public bool? IsDead { get; set; }
        [CsvExport("IsPassed")]
        public bool? IsPassed { get; set; }
        [CsvExport("PassedDate")]
        public DateTime? PassedDate { get; set; }
        public int PlantLotId { get; set; }
        [CsvExport("PlantLotCode")]
        public string? PlantLotCode { get; set; }
        [CsvExport("PlantLotName")]
        public string? PlantLotName { get; set; }

        //public virtual ICollection<GraftedPlant> GraftedPlants { get; set; } = new List<GraftedPlant>();

        //public virtual ICollection<HarvestTypeHistory> HarvestTypeHistories { get; set; } = new List<HarvestTypeHistory>();

        //public virtual MasterType? MasterType { get; set; }
        //public virtual LandRow? LandRow { get; set; }

        //public virtual ICollection<PlantCriteria> PlantCriteria { get; set; } = new List<PlantCriteria>();

        //public virtual ICollection<PlantGrowthHistory> PlantGrowthHistories { get; set; } = new List<PlantGrowthHistory>();
        //public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();

        public List<CriteriaSummaryModel> CriteriaSummary { get; set; } = new();
    }

    public class CriteriaSummaryModel
    {
        public string CriteriaType { get; set; }
        public int CheckedCount { get; set; }
        public int TotalCount { get; set; }
    }
}