using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest
{
    public class LandPlotUpdateRequest
    {
        [Required(ErrorMessage = "LandPlot id is required")]
        public int LandPlotId { get; set; }
        [Required(ErrorMessage = "Landplot name is required")]
        public string LandPlotName { get; set; }

        public double? Area { get; set; }
        [Required(ErrorMessage = "Landplot name is required")]
        public double Length { get; set; }

        [Required(ErrorMessage = "Landplot name is required")]
        public double Width { get; set; }

        public string? SoilType { get; set; }

        [Required(ErrorMessage = "Landplot name is required")]
        public string Status { get; set; }
        public string? Description { get; set; }
        public string? TargetMarket { get; set; }
        public bool? IsRowHorizontal { get; set; }
    }
}
