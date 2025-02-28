using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class PlantModel
    {
        public int PlantId { get; set; }

        public string? PlantCode { get; set; }

        public string? PlantName { get; set; }

        public int? PlantIndex { get; set; }

        public string? GrowthStage { get; set; }

        public string? HealthStatus { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public DateTime? PlantingDate { get; set; }

        public int? PlantReferenceId { get; set; }

        public string? Description { get; set; }

        public int? MasterTypeId { get; set; }

        public string? ImageUrl { get; set; }

        public int? LandRowId { get; set; }

        public int? RowIndex { get; set; }

        public string? LandPlotName { get; set; }

        public string? MasterTypeName { get; set; }
        public string? Characteristic { get; set; }
        public int? GrowthStageID { get; set; }
        public string? GrowthStageName { get; set; }


        //public virtual ICollection<GraftedPlant> GraftedPlants { get; set; } = new List<GraftedPlant>();

        //public virtual ICollection<HarvestTypeHistory> HarvestTypeHistories { get; set; } = new List<HarvestTypeHistory>();

        //public virtual MasterType? MasterType { get; set; }
        //public virtual LandRow? LandRow { get; set; }

        //public virtual ICollection<PlantCriteria> PlantCriteria { get; set; } = new List<PlantCriteria>();

        //public virtual ICollection<PlantGrowthHistory> PlantGrowthHistories { get; set; } = new List<PlantGrowthHistory>();
        //public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();

        public List<CriteriaSummaryModel> CriteriaSummary { get; set; } = new();
    }

    public class CriteriaSummaryModel
    {
        public string CriteriaType { get; set; }
        public int CheckedCount { get; set; }
        public int TotalCount { get; set; }
    }
}