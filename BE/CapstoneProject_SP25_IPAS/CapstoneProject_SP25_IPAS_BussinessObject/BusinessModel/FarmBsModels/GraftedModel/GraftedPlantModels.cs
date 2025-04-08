using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.GraftedModel
{
    public class GraftedPlantModels
    {
        public int GraftedPlantId { get; set; }

        public string? GraftedPlantCode { get; set; }

        public string? GraftedPlantName { get; set; }

        //public string? GrowthStage { get; set; }

        public DateTime? SeparatedDate { get; set; }

        public string? Status { get; set; }

        public DateTime? GraftedDate { get; set; }

        public string? Note { get; set; }
        public bool? IsCompleted { get; set; }
        public bool? IsDead { get; set; }

        public int? PlantLotId { get; set; }

        public int? PlantId { get; set; }
        public string? PlantCode { get; set; }
        public string? PlantName { get; set; }
        public string? CultivarId { get; set; }
        public string? CultivarName { get; set; }
        public string? PlantLotName { get; set; }
        public string? PlantLotCode { get; set; }
        public string? MasterTypeName { get; set; }

        //public virtual ICollection<GraftedPlantNote> GraftedPlantNotes { get; set; } = new List<GraftedPlantNote>();

        //public virtual Plant? Plant { get; set; }

        //public virtual PlantLot? PlantLot { get; set; }

        //public virtual ICollection<Resource> Resources { get; set; } = new List<Resource>();
        //public virtual ICollection<PlanTarget> PlanTargets { get; set; } = new List<PlanTarget>();
        //public virtual ICollection<CriteriaTarget> CriteriaTargets { get; set; } = new List<CriteriaTarget>();
    }
}
