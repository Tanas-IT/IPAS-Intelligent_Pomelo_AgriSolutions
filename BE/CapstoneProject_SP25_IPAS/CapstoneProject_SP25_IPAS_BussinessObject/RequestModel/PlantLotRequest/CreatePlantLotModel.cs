using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantLotRequest
{
    public class CreatePlantLotModel
    {
        public int PartnerId { get; set; }
        public string Name { get; set; }
        public int ImportedQuantity { get; set; }
        public string Unit { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; } = "";
        public int? FarmId { get; set; }
        public int MasterTypeId { get; set; }
        public bool? IsFromGrafted { get; set; }
    }
}
