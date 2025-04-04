using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantRequest
{
    public class PlantCSVImportModel
    {
        public int? NumberOrder { get; set; }

        public string? PlantName { get; set; }

        public int? PlantIndex { get; set; }

        //public string? HealthStatus { get; set; }

        public DateTime? PlantingDate { get; set; }

        public string? PlantReferenceCode { get; set; }

        public string? Description { get; set; }

        public string? LandRowCode { get; set; }

        public string? GrowthStageCode { get; set; }

        public string? MasterTypeCode { get; set; }

        public string? LandPlotCode { get; set; }

    }
}
