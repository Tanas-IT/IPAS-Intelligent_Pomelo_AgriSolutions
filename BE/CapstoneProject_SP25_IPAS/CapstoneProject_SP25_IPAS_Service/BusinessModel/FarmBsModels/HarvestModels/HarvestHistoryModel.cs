using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.HarvestModels
{
    public class HarvestHistoryModel
    {
        public int HarvestHistoryId { get; set; }

        public string? HarvestHistoryCode { get; set; }

        public DateTime? DateHarvest { get; set; }

        public string? HarvestHistoryNote { get; set; }

        public double? TotalPrice { get; set; }

        public string? HarvestStatus { get; set; }

        public int? CropId { get; set; }

        public int? FarmId { get; set; }

        public string? CropName { get; set; }


        //public virtual Crop? Crop { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual ICollection<ProductHarvestHistoryModel> ProductHarvestHistory { get; set; } = new List<ProductHarvestHistoryModel>();

        //public virtual ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
    }
}
