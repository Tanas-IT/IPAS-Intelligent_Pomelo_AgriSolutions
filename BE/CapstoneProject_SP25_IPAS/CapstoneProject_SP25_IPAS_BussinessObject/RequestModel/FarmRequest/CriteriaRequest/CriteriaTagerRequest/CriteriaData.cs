using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest.CriteriaTagerRequest
{
      public class CriteriaData
    {
        public int? Priority { get; set; }
        public int CriteriaId { get; set; }
        public bool? IsChecked { get; set; } = false;
        public bool? IsPassed { get; set; } = false;
    }
}
