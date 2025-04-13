using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.CriteriaModels
{
    public class ExportCriteria
    {
        [CsvExport("MasterTypeCode")]
        public string? MasterTypeCode { get; set; }

        [CsvExport("MasterTypeName")]
        public string? MasterTypeName { get; set; }

        [CsvExport("Target")]
        public string? Target { get; set; }

        [CsvExport("PlantCode")]
        public string? PlantCode { get; set; } 

        [CsvExport("GraftedPlantCode")]
        public string? GraftedPlantCode { get; set; } 

        [CsvExport("PlantLotCode")]
        public string? PlantLotCode { get; set; } 

        [CsvExport("CriteriaCode")]
        public string? CriteriaCode { get; set; }

        [CsvExport("CriteriaName")]
        public string? CriteriaName { get; set; }

        [CsvExport("Description")]
        public string? Description { get; set; } 

        [CsvExport("MinValue")]
        public double? MinValue { get; set; }

        [CsvExport("MaxValue")]
        public double? MaxValue { get; set; } 

        [CsvExport("Unit")]
        public string? Unit { get; set; }

        [CsvExport("ValueChecked")]
        public double? ValueChecked { get; set; } 

        [CsvExport("CreateDate")]
        public DateTime? CreateDate { get; set; } 

        [CsvExport("CheckedDate")]
        public DateTime? CheckedDate { get; set; }  

        [CsvExport("IsPassed")]
        public bool? IsPassed { get; set; } 

        [CsvExport("Note")]
        public string? Note { get; set; }  

        [CsvExport("FrequencyDate")]
        public int? FrequencyDate { get; set; }  
    }

}
