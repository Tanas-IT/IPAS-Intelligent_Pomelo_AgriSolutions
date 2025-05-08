using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
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
        [CsvExport("HarvestHistoryCode")]
        public string? HarvestHistoryCode { get; set; }
        public int? PlantId { get; set; }
        [CsvExport("ProductName")]
        public string? ProductName { get; set; }
        [CsvExport("PlantCode")]
        public string? PlantCode { get; set; }
        [CsvExport("PlantName")]
        public string? PlantName { get; set; }
        [CsvExport("Quantity")]
        public double? ActualQuantity { get; set; }
        [CsvExport("Unit")]
        public string? Unit { get; set; }

        //public double? SellPrice { get; set; }

        //public double? QuantityNeed { get; set; }
        [CsvExport("RecordBy")]
        public string? RecordBy { get; set; }
        public string? AvartarRecord { get; set; }
        public int? UserID { get; set; }
        //public string? UpdateBy { get; set; }
        [CsvExport("RecordDate")]
        public DateTime? RecordDate { get; set; }
        public int HarvestHistoryId { get; set; }
        [CsvExport("HarvestDate")]
        public DateTime? HarvestDate { get; set; }
        public int MasterTypeId { get; set; }
        public int? CropId { get; set; }
        [CsvExport("CropName")]
        public string? CropName { get; set;}
        [CsvExport("PlantIndex")]
        public int? PlantIndex { get; set; }
        [CsvExport("LandRowCode")]
        public string? LandRowCode { get; set; }
        [CsvExport("LandPlotIndex")]
        public int? LandRowIndex { get; set; }
        [CsvExport("LandPlotCode")]
        public string? LantPlotCode { get; set; }
        [CsvExport("LandPlotName")]
        public string? LantPlotName { get; set; }
    }
}
