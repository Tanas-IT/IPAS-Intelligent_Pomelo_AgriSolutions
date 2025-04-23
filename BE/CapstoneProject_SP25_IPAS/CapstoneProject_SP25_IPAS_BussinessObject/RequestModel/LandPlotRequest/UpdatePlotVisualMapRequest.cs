using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandRowRequest;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandPlotRequest
{
    public class UpdatePlotVisualMapRequest
    {
        [Required]
        public int LandPlotId { get; set; }
        public bool? IsRowHorizontal { get; set; }
        public double? LineSpacing { get; set; }
        public int? NumberOfRows { get; set; }
        public int? RowPerLine { get; set; }
        public double? RowSpacing { get; set; }
        public List<UpdateLandRowRequest> LandRows { get; set; } = new();
    }
}
