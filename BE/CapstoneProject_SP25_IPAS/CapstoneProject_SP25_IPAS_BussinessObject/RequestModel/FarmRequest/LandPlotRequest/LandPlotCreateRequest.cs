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
        public double PlotLength { get; set; }
        [Required]
        public double PlotWidth { get; set; }
        public string? SoilType { get; set; }

        public string? Description { get; set; }
        public int? FarmId { get; set; }

        public string? TargetMarket { get; set; }
        [Required]
        public int RowPerLine { get; set; }
        [Required]
        public double RowSpacing { get; set; }
        [Required]
        public bool IsRowHorizontal { get; set; }
        [Required]
        public double LineSpacing { get; set; }
        [Required]
        public int NumberOfRows { get; set; }
        [Required]
        public ICollection<CoordinationCreateRequest> LandPlotCoordinations { get; set; } = new List<CoordinationCreateRequest>();
        public ICollection<CreateLandRowRequest> LandRows { get; set; } = new List<CreateLandRowRequest>();
    }
}

        //public int TreeAmountInRow { get; set; }
        //[Required]
        //public double DistanceInRow { get; set; }
        //[Required]
        //public double RowLength { get; set; }
        //[Required]
        //public double RowWidth { get; set; }
        //public string? RowDirection { get; set; }
        //public double? RowSpace { get; set; }

        //public LandRowCreateRequest LandRow { get; set; } = new LandRowCreateRequest();