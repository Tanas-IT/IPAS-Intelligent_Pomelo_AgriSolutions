using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel
{
    public class CreateAdditionalPlantLotModel
    {
        public int MainPlantLotId { get; set; } // ID của lô chính
        public int ImportedQuantity { get; set; } // Số lượng nhập bù
        //public string? Name { get; set; }
        public string? Note { get; set; } = "";
    }
}
