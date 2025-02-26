using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ResourceRequest;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.GraftedRequest.GraftedNoteRequest
{
    public class CreateGraftedNoteRequest
    {

        public string? Content { get; set; }
        [Required]
        public string NoteTaker { get; set; }
        [Required]
        public string IssueName { get; set; }
        [Required]
        public int GraftedPlantId { get; set; }

        public ICollection<ResourceCrUpRequest> PlantResources { get; set; } = new List<ResourceCrUpRequest>();

    }
}
