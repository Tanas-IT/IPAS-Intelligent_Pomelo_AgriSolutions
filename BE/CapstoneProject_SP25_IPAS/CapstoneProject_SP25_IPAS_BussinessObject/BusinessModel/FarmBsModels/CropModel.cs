using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.HarvestModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels
{
    public class CropModel
    {
        public int CropId { get; set; }
        [CsvExport("MasterTypeCode")]
        public string? CropCode { get; set; }
        [CsvExport("MasterTypeCode")]

        public string? CropName { get; set; }

        //public int? Year { get; set; }

        [CsvExport("MasterTypeCode")]
        public DateTime? StartDate { get; set; }

        [CsvExport("MasterTypeCode")]
        public DateTime? EndDate { get; set; }

        [CsvExport("MasterTypeCode")]
        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        [CsvExport("MasterTypeCode")]
        public DateTime? CropExpectedTime { get; set; }

        [CsvExport("MasterTypeCode")]
        public DateTime? CropActualTime { get; set; }

        [CsvExport("MasterTypeCode")]
        public string? HarvestSeason { get; set; }

        [CsvExport("MasterTypeCode")]
        public double? EstimateYield { get; set; }

        [CsvExport("MasterTypeCode")]
        public double? ActualYield { get; set; }

        [CsvExport("MasterTypeCode")]
        public double YieldHasRecord { get; set; }

        [CsvExport("MasterTypeCode")]
        public string? Status { get; set; }

        [CsvExport("MasterTypeCode")]
        public string? Notes { get; set; }

        [CsvExport("MasterTypeCode")]
        public double? MarketPrice { get; set; }
        [CsvExport("MasterTypeCode")]
        public int? NumberHarvest { get; set; }
        [CsvExport("MasterTypeCode")]
        public int? NumberPlot { get; set; }

        //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        //public ICollection<HarvestHistoryModel> HarvestHistories { get; set; } = new List<HarvestHistoryModel>();

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual ICollection<LandPlotCropModel> LandPlotCrops { get; set; } = new List<LandPlotCropModel>();
        //public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();
    }
}
