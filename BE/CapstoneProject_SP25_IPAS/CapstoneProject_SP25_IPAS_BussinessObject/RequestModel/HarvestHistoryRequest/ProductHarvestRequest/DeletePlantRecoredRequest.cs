using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest.ProductHarvestRequest
{
    public class DeletePlantRecoredRequest
    {
        public List<int> ProductHarvestHistoryId { get; set; }
        public int? UserId { get; set; }
        //public List<PlantRecordData> PlantRecordDatas { get; set; } = new List<PlantRecordData>();
    }

    public class PlantRecordData
    {
        public int ProductId { get; set; }
        public int PlantId { get; set; }
    }
}
