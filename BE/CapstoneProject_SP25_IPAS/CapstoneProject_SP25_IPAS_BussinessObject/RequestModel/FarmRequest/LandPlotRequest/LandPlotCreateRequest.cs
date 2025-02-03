using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandRowRequest;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest
{
    public class LandPlotCreateRequest
    {
        [Required]
        public string LandPlotName { get; set; }
        [Required]
        public double Area { get; set; }
        [Required]
        public double Length { get; set; }
        [Required]
        public double Width { get; set; }
        public string? SoilType { get; set; }

        public string? Description { get; set; }
        [Required]
        public int FarmId { get; set; }

        public string? TargetMarket { get; set; }

        public ICollection<CoordinationCreateRequest> LandPlotCoordinations { get; set; } = new List<CoordinationCreateRequest>();
        [Required]
        public LandRowCreateRequest LandRow = new LandRowCreateRequest();
    }
}
