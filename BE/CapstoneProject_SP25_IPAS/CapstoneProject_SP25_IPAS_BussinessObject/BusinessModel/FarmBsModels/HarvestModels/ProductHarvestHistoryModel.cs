using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.HarvestModels
{
    public class ProductHarvestHistoryModel
    {
        public int ProductHarvestHistoryId { get; set; }

        public int MasterTypeId { get; set; }
        [CsvExport("HarvestHistoryCode")]
        public string? HarvestHistoryCode { get; set; }
        [CsvExport("PlantCode")]
        public string? PlantCode { get; set; }
        public int? PlantId { get; set; }
        [CsvExport("ProductName")]
        public string? ProductName { get; set; }
        [CsvExport("Unit")]
        public string? Unit { get; set; }
        public double? SellPrice { get; set; }
        public double? CostPrice { get; set; }
        public double? QuantityNeed { get; set; }
        [CsvExport("Quantity")]
        public double? ActualQuantity { get; set; }
        [CsvExport("RecordBy")]
        public string? RecordBy { get; set; }
        public string? UpdateBy { get; set; }

        [CsvExport("RecordDate")]
        public DateTime? RecordDate { get; set; }
        public int HarvestHistoryId { get; set; }

        [CsvExport("PlantName")]
        public string? PlantName { get; set; }
        [CsvExport("PlantIndex")]
        public int? PlantIndex { get; set; }
        [CsvExport("RowCode")]
        public string? LandRowCode { get; set; }
        [CsvExport("RowIndex")]
        public int? LandRowIndex { get; set; }
        [CsvExport("PlotCode")]
        public string? LantPlotCode { get; set; }
        [CsvExport("PlotName")]
        public string? LantPlotName { get; set; }
        public double? YieldHasRecord { get; set; }

        //public string? ProcessName { get; set; }

        //public int? ProcessId { get; set; }

        //public virtual HarvestHistoryModel HarvestHistory { get; set; } = null!;

        //public virtual MasterTypeModel MasterType { get; set; } = null!;

        //public virtual PlantModel? Plant { get; set; }
        public ICollection<PlantLogHarvestModel> plantLogHarvest { get; set; } = new List<PlantLogHarvestModel>();
    }
}
