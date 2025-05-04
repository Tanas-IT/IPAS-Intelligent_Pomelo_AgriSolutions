using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.HarvestModels
{
    public class PlantLogHarvestModel
    {
        public int ProductHarvestHistoryId { get; set; }
        public int? PlantId { get; set; }
        public string? PlantCode { get; set; }
        public string? PlantName { get; set; }
        public string? Unit { get; set; }

        //public double? SellPrice { get; set; }

        //public double? QuantityNeed { get; set; }
        public double? ActualQuantity { get; set; }
        public string? RecordBy { get; set; }
        public string? AvartarRecord { get; set; }
        public int? UserID { get; set; }
        //public string? UpdateBy { get; set; }
        public DateTime? RecordDate { get; set; }
        public int HarvestHistoryId { get; set; }
        public string? HarvestHistoryCode { get; set; }
        public DateTime? HarvestDate { get; set; }
        public int MasterTypeId { get; set; }
        public string? ProductName { get; set; }
        public int? CropId { get; set; }
        public string? CropName { get; set;}
        public int? PlantIndex { get; set; }
        public string? LandRowCode { get; set; }
        public int? LandRowIndex { get; set; }
        public string? LantPlotCode { get; set; }
        public string? LantPlotName { get; set; }
    }
}
