using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest
{
    public class PlantUpdateRequest
    {
        [Required]
        public int PlantId { get; set; }

        public string? PlantName { get; set; }

        public int? PlantIndex { get; set; }

        public int? GrowthStageId { get; set; }

        public string? HealthStatus { get; set; }

        public DateTime? PlantingDate { get; set; }

        public int? PlantReferenceId { get; set; }

        public string? Description { get; set; }

        public int? MasterTypeId { get; set; }

        public int? LandRowId { get; set; }
    }
}
