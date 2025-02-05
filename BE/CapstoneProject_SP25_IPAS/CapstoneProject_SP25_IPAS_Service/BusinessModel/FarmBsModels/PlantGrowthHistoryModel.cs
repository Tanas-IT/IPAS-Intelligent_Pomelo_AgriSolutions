using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class PlantGrowthHistoryModel
    {
        public int PlantGrowthHistoryId { get; set; }

        public string? PlantGrowthHistoryCode { get; set; }

        public string? Content { get; set; }

        public string? NoteTaker { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public int? PlantId { get; set; }

        public string? IssueName { get; set; }

        public virtual PlantModel? Plant { get; set; }

        public virtual ICollection<PlantResourceModel> PlantResources { get; set; } = new List<PlantResourceModel>();
    }
}
