using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest
{
    public class CriteriaUpdateRequest
    {
        [Required]
        [JsonProperty("criteriaId")]
        public int CriteriaId { get; set; }

        public string? CriteriaName { get; set; }

        public string? CriteriaDescription { get; set; }

        public int? Priority { get; set; }
        [Required]
        public bool? IsActive { get; set; }
        public int? FrequencyDate { get; set; }


    }
}
