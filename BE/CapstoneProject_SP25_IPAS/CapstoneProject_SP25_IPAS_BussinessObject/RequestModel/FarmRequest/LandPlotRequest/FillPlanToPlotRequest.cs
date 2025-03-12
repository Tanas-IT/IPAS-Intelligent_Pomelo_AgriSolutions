using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest
{
    public class FillPlanToPlotRequest
    {
        [Required]
        public int landPlotId { get; set; }
        [Required]
        public int plantLotId { get; set; }
        [Required]
        public int growthStageId { get; set; }
        //[Required]
        //public int MasterTypeId { get; set; }
    }
}
