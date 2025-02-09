using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest.GrowthHistoryResouce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest
{
    public class PlantGrowthHistoryCreateRequest
    {

        public string? Content { get; set; }

        public string? NoteTaker { get; set; }

        public int? PlantId { get; set; }

        public string? IssueName { get; set; }

        public ICollection<GrowthHistoryResourceCreateRequest> PlantResources { get; set; } = new List<GrowthHistoryResourceCreateRequest>();
    }
}
