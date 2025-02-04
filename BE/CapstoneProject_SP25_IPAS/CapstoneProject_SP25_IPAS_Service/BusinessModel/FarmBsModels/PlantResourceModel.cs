using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class PlantResourceModel
    {
        public int PlanResourceId { get; set; }

        public string? PlanResourceCode { get; set; }

        public string? ResourceType { get; set; }

        public string? ResourceUrl { get; set; }

        public string? Description { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public int? PlantGrowthHistoryId { get; set; }

    }
}
