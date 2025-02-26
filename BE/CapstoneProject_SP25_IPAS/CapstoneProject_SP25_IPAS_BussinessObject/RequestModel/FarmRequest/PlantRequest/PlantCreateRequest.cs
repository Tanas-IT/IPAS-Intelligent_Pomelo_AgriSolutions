using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest
{
    public class PlantCreateRequest
    {
        [Required]
        public string? PlantName { get; set; }
        [Required]
        public int? PlantIndex { get; set; }
        [Required]
        public int? GrowthStageId { get; set; }
        [Required]
        public string? HealthStatus { get; set; }
        [Required]
        public DateTime? PlantingDate { get; set; }
        [Required]
        public int? MotherPlantId { get; set; }
        [Required]
        public string? Description { get; set; }
        [Required]
        public int? MasterTypeId { get; set; }
        [Required]
        public IFormFile? ImageUrl { get; set; }
        [Required]
        public int? LandRowId { get; set; }
        public int? FarmId { get; set; }

    }
}
