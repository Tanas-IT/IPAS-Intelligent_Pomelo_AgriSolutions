using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlantLotModel
{
    public class PlantLotModel
    {

        public int PlantLotId { get; set; }

        public string? PlantLotCode { get; set; }

        public string? Unit { get; set; }

        public string? PlantLotName { get; set; }
        public int? InputQuantity { get; set; }
        public int? PreviousQuantity { get; set; }

        public int? LastQuantity { get; set; }

        public int? UsedQuantity { get; set; }

        public string? Status { get; set; }

        public DateTime? ImportedDate { get; set; }

        public string? Note { get; set; }

        public int? PartnerId { get; set; }

        public bool? IsPassed { get; set; }

        public DateTime? PassedDate { get; set; }

        public bool? IsFromGrafted { get; set; }

        public int? PlantLotReferenceId { get; set; }

        public int? MasterTypeId { get; set; }

        //public int? GrowthStageID { get; set; }

        public string? PartnerName { get; set; }

        public string? SeedingName { get; set; }

        public List<PlantLotModel> AdditionalPlantLots { get; set; } = new List<PlantLotModel>();

    }
}
