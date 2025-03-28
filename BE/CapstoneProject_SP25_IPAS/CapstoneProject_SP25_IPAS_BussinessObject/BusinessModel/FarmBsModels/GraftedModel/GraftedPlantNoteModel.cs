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
        public int GraftedPlantNoteId { get; set; }

        public string? GraftedPlantNoteName { get; set; }

        public string? Content { get; set; }

        public string? Image { get; set; }

        public string? IssueName { get; set; }

        public int? GraftedPlantId { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public string? NoteTakerName { get; set; }
        public string? NoteTakerAvatar { get; set; }

        public int? NumberImage { get; set; }
        public int? NumberVideos { get; set; }
        //public virtual GraftedPlantModels? GraftedPlant { get; set; }
        public ICollection<ResourceModel> Resources { get; set; } = new List<ResourceModel>();

    }
}
