using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest.ProductHarvestRequest
{
    public class PlantRecordHarvestImportMdoel
    {
        public int? NumberOrder { get; set; }

        public string? PlantCode { get; set; }

        public string? MasterTypeCode { get; set; }

        public double? Quantity { get; set; }
        
    }
}
