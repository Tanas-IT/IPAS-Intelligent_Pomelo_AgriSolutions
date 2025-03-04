using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.HarvestModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class CropModel
    {
        public int CropId { get; set; }

        public string? CropCode { get; set; }

        public string? CropName { get; set; }

        public int? Year { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public DateTime? CropExpectedTime { get; set; }

        public DateTime? CropActualTime { get; set; }

        public string? HarvestSeason { get; set; }

        public double? EstimateYield { get; set; }

        public double? ActualYield { get; set; }

        public string? Status { get; set; }

        public string? Notes { get; set; }

        public double? MarketPrice { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public ICollection<HarvestHistoryModel> HarvestHistories { get; set; } = new List<HarvestHistoryModel>();

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual ICollection<LandPlotCropModel> LandPlotCrops { get; set; } = new List<LandPlotCropModel>();
        //public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();
    }
}
