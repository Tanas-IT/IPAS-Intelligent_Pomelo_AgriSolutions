using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest
{
    public class UpdateFarmCoordinationRequest
    {
        public int? FarmId { get; set; }
        [Required(ErrorMessage = "Farm coordinationis required")]
        public List<CoordinationCreateRequest> FarmUpdateModel { get; set; }
    }
}
