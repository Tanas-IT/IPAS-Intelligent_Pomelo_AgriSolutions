using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class CriteriaMasterType
    {
        public int CriteriaId { get; set; }
        public int MasterTypeId { get; set; }
        public bool IsActive { get; set; }

        public virtual Criteria Criteria { get; set; } = null!;

        public virtual MasterType MasterType { get; set; } = null!;
    }
}
