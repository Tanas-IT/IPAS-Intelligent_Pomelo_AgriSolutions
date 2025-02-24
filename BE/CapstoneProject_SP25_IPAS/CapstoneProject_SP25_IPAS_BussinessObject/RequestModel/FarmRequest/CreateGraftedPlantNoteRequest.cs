using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ResourceRequest;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest
{
    public class CreateGraftedPlantNoteRequest
    {
        public string? Content { get; set; }

        public string? NoteTaker { get; set; }

        public int? GraftedPlantId { get; set; }

        public string? IssueName { get; set; }

        public ICollection<ResourceCrUpRequest> PlantResources { get; set; } = new List<ResourceCrUpRequest>();
    }
}
