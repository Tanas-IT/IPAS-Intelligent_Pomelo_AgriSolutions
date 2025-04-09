using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.GraftedModel
{
    public class GraftedPlantNoteModel
    {
        [CsvExport("GraftedPlant Code")]
        public string? GraftedPlantCode { get; set; }
        public int GraftedPlantNoteId { get; set; }
        [CsvExport("Grafted Plant Note Name")]
        public string? GraftedPlantNoteName { get; set; }
        [CsvExport("Content")]
        public string? Content { get; set; }
        public string? Image { get; set; }
        [CsvExport("Issue")]
        public string? IssueName { get; set; }

        public int? GraftedPlantId { get; set; }
        [CsvExport("Create Date")]
        public DateTime? CreateDate { get; set; }
        [CsvExport("Update Date")]
        public DateTime? UpdateDate { get; set; }
        [CsvExport("Note Take")]
        public string? NoteTakerName { get; set; }
        public string? NoteTakerAvatar { get; set; }
        [CsvExport("Number Images")]
        public int? NumberImage { get; set; }
        [CsvExport("Number Videos")]
        public int? NumberVideos { get; set; }
        //public virtual GraftedPlantModels? GraftedPlant { get; set; }
        public ICollection<ResourceModel> Resources { get; set; } = new List<ResourceModel>();

    }
}
