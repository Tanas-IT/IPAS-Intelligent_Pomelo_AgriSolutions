using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels
{
    public class PlantGrowthHistoryModel
    {
        public int PlantGrowthHistoryId { get; set; }

        public string? PlantGrowthHistoryCode { get; set; }

        public string? Content { get; set; }


        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public int? PlantId { get; set; }

        public string? IssueName { get; set; }
        public string? NoteTakerName { get; set; }
        public string? NoteTakerAvatar { get; set; }

        public int? NumberImage { get; set; }
        public int? NumberVideos { get; set; }
        //public virtual PlantModel? Plant { get; set; }

        public ICollection<ResourceModel> Resources { get; set; } = new List<ResourceModel>();
    }
}
