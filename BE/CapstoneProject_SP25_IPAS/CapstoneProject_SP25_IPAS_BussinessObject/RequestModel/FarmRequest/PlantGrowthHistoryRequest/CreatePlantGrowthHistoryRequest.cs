using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ResourceRequest;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest
{
    public class CreatePlantGrowthHistoryRequest
    {

        public string? Content { get; set; }

        public string? NoteTaker { get; set; }

        public int? PlantId { get; set; }

        public string? IssueName { get; set; }

        public ICollection<ResourceCrUpRequest> PlantResources { get; set; } = new List<ResourceCrUpRequest>();
    }
}
