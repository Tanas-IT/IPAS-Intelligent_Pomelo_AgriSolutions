using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest
{
    public class CreateCriteriaMasterTypeRequest
    {
        [Required]
        public CreateMasterTypeModel CreateMasTypeRequest { get; set; } = new CreateMasterTypeModel();
        [Required]
        public List<CriteriaCreateRequest> CriteriaCreateRequest { get; set; } = new List<CriteriaCreateRequest>();
    }
}
