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
        [CsvExport("CropCode")]
        public string? CropCode { get; set; }
        [CsvExport("CropName")]

        public string? CropName { get; set; }

        //public int? Year { get; set; }

        [CsvExport("StartDate")]
        public DateTime? StartDate { get; set; }

        [CsvExport("EndDate")]
        public DateTime? EndDate { get; set; }

        [CsvExport("CreateDate")]
        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        [CsvExport("CropExpectedTime")]
        public DateTime? CropExpectedTime { get; set; }

        [CsvExport("CropActualTime")]
        public DateTime? CropActualTime { get; set; }

        [CsvExport("HarvestSeason")]
        public string? HarvestSeason { get; set; }

        [CsvExport("EstimateYield")]
        public double? EstimateYield { get; set; }

        [CsvExport("ActualYield")]
        public double? ActualYield { get; set; }

        [CsvExport("YieldHasRecord")]
        public double YieldHasRecord { get; set; }

        [CsvExport("Status")]
        public string? Status { get; set; }

        [CsvExport("Notes")]
        public string? Notes { get; set; }

        [CsvExport("AvaragePrice")]
        public double? MarketPrice { get; set; }
        [CsvExport("NumberHarvest")]
        public int? NumberHarvest { get; set; }
        [CsvExport("NumberPlot")]
        public int? NumberPlot { get; set; }

        //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        //public ICollection<HarvestHistoryModel> HarvestHistories { get; set; } = new List<HarvestHistoryModel>();

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual ICollection<LandPlotCropModel> LandPlotCrops { get; set; } = new List<LandPlotCropModel>();
        //public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();
    }
}
