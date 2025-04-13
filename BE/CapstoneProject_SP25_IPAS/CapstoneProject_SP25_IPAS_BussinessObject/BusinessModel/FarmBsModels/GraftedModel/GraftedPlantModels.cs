using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
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
        [CsvExport("GraftedPlantCode")]
        public string? GraftedPlantCode { get; set; }

        [CsvExport("GraftedPlantName")]
        public string? GraftedPlantName { get; set; }

        //public string? GrowthStage { get; set; }

        [CsvExport("SeparatedDate")]
        public DateTime? SeparatedDate { get; set; }

        [CsvExport("Status")]
        public string? Status { get; set; }

        [CsvExport("GraftedDate")]
        public DateTime? GraftedDate { get; set; }

        [CsvExport("Note")]
        public string? Note { get; set; }
        [CsvExport("IsCompleted")]
        public bool? IsCompleted { get; set; }
        [CsvExport("IsDead")]
        public bool? IsDead { get; set; }

        public int? PlantLotId { get; set; }

        public int? PlantId { get; set; }
        [CsvExport("MotherPlantCode")]
        public string? PlantCode { get; set; }
        [CsvExport("PlantName")]
        public string? PlantName { get; set; }
        public string? CultivarId { get; set; }
        [CsvExport("CultivarName")]
        public string? CultivarName { get; set; }
        [CsvExport("PlantLotName")]
        public string? PlantLotName { get; set; }
        [CsvExport("PlantLotCode")]
        public string? PlantLotCode { get; set; }
        public string? MasterTypeName { get; set; }

        //public virtual ICollection<GraftedPlantNote> GraftedPlantNotes { get; set; } = new List<GraftedPlantNote>();

        public virtual PlantModel? MortherPlant { get; set; }

        //public virtual PlantLot? PlantLot { get; set; }

        //public virtual ICollection<Resource> Resources { get; set; } = new List<Resource>();
        //public virtual ICollection<PlanTarget> PlanTargets { get; set; } = new List<PlanTarget>();
        //public virtual ICollection<CriteriaTarget> CriteriaTargets { get; set; } = new List<CriteriaTarget>();
    }
}
