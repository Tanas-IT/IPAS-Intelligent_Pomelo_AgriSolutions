using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest
{
    public class LandPlotUpdateCoordinationRequest
    {
        //[Required(ErrorMessage = "Farm Id is required")]
        //public int? FarmId { get; set; }
        //[Required(ErrorMessage = "Farm Id is required")]
        public int LandPlotId { get; set; }
        public List<CoordinationCreateRequest> CoordinationsUpdateModel { get; set; }
    }
}
