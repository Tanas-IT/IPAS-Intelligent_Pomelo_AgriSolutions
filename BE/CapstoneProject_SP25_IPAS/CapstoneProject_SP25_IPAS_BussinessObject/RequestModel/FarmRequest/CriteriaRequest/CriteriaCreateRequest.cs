using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest
{
    public class CriteriaCreateRequest
    {
        public int? CriteriaId { get; set; }

        public string? CriteriaName { get; set; }

        public string? CriteriaDescription { get; set; }

        public int? Priority { get; set; }

        public bool? IsActive { get; set; }

        //public int? MasterTypeId { get; set; }

    }
}
