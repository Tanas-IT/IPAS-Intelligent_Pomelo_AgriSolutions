using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest
{
    public class ListCriteriaUpdateRequest
    {
        [Required]
        public int MasterTypeId { get; set; }
        public List<CriteriaCreateRequest> criteriasCreateRequests { get; set; } = new List<CriteriaCreateRequest>();
    }
}
