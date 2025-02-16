using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class Type_Type
    {
        public int MasterTypeID_1 { get; set; }
        public int MasterTypeID_2 { get; set; }
        public bool? IsActive { get; set; }
        public virtual MasterType? MasterType_1 { get; set; }
        public virtual MasterType? MasterType_2 { get; set; }
    }
}
