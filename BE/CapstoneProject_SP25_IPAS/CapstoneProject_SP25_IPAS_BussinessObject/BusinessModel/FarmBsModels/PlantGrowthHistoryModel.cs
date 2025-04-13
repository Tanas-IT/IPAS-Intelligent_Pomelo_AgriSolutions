using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
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
        [CsvExport("History Code")]
        public string? PlantGrowthHistoryCode { get; set; }
        [CsvExport("Content")]
        public string? Content { get; set; }

        [CsvExport("CreateDate")]
        public DateTime? CreateDate { get; set; }
        [CsvExport("UpdateDate")]
        public DateTime? UpdateDate { get; set; }

        public int? PlantId { get; set; }
        [CsvExport("Issue")]
        public string? IssueName { get; set; }
        [CsvExport("Record By")]
        public string? NoteTakerName { get; set; }
        public string? NoteTakerAvatar { get; set; }
        [CsvExport("Number Image")]
        public int? NumberImage { get; set; }
        [CsvExport("Number Video")]

        public int? NumberVideos { get; set; }
        //public virtual PlantModel? Plant { get; set; }

        public ICollection<ResourceModel> Resources { get; set; } = new List<ResourceModel>();
    }
}
