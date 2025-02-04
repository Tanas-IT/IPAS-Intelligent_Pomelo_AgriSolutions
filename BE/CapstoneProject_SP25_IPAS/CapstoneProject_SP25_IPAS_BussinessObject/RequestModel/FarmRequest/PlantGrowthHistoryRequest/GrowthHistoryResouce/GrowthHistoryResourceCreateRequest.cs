using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest.GrowthHistoryResouce
{
    public class GrowthHistoryResourceCreateRequest
    {
        public string? ResourceType { get; set; }

        public IFormFile? ResourceUrl { get; set; }

        public string? Description { get; set; }
    }
}
