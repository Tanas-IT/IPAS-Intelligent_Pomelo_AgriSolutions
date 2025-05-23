﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandRowRequest
{
    public class CreateLandRowRequest
    {
        public int LandPlotId { get; set; }
        [Required]
        public int RowIndex { get; set; }
        [Required]
        public int TreeAmount { get; set; }
        [Required]
        public double Distance { get; set; }
        [Required]
        public double Length { get; set; }
        [Required]
        public double Width { get; set; }
        public string? Direction { get; set; }
        public string? Description { get; set; }

    }
}
