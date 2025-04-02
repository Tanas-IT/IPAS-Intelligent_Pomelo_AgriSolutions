using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.HarvestModels
{
    public class ProductHarvestHistoryModel
    {
        public int ProductHarvestHistoryId { get; set; }

        public int MasterTypeId { get; set; }

        public int? PlantId { get; set; }

        public string? Unit { get; set; }

        public double? SellPrice { get; set; }

        public double? QuantityNeed { get; set; }
        public double? ActualQuantity { get; set; }
        public string? RecordBy { get; set; }
        public string? UpdateBy { get; set; }
        public DateTime? RecordDate { get; set; }
        public int HarvestHistoryId { get; set; }

        public string? ProductName { get; set; }

        public string? HarvestHistoryCode { get; set; }
        public string? PlantName { get; set; }
        public int? PlantIndex { get; set; }
        public int? LandRowIndex { get; set; }
        public string? LantPlotName { get; set; }

        //public string? ProcessName { get; set; }

        //public int? ProcessId { get; set; }

        //public virtual HarvestHistoryModel HarvestHistory { get; set; } = null!;

        //public virtual MasterTypeModel MasterType { get; set; } = null!;

        //public virtual PlantModel? Plant { get; set; }
    }
}
