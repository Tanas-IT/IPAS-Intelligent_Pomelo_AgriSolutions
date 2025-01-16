﻿using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest
{
    public class FarmCreateModel
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

        [Required(ErrorMessage = "Leght of farm is required")]
        public double Length { get; set; }

        [Required(ErrorMessage = "Width of farm is required")]
        public double Width { get; set; }

        public string? Description { get; set; }

        public ICollection<FarmCoordinationCreateModel>? FarmCoordinations { get; set; } = new List<FarmCoordinationCreateModel>();

    }
}
