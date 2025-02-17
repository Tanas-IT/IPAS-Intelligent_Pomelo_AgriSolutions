using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest
{
    public class FarmCreateRequest
    {
        [Required(ErrorMessage = "Farm name is required.")]
        public string FarmName { get; set; }

        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; }

        public IFormFile? LogoUrl { get; set; }

        [Required(ErrorMessage = "Area is required")]
        public double Area { get; set; }

        public string? SoilType { get; set; }

        public string? ClimateZone { get; set; }

        [Required(ErrorMessage = "Province is required")]
        public string Province { get; set; }

        [Required(ErrorMessage = "District is required")]
        public string District { get; set; }

        [Required(ErrorMessage = " Ward of farm is required")]
        public string Ward { get; set; }

        public double Length { get; set; }

        public double Width { get; set; }

        public string? Description { get; set; }

        [Required(ErrorMessage = "Longitude of farm is required")]
        public double? Longitude { get; set; }

        [Required(ErrorMessage = "Latitude of farm is required")]
        public double? Latitude { get; set; }

        //public ICollection<CoordinationCreateRequest>? FarmCoordinations { get; set; } = new List<CoordinationCreateRequest>();

    }
}
