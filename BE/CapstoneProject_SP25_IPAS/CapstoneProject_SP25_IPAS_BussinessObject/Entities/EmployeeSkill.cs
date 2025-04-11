using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class EmployeeSkill
    {
        public int EmployeeSkillID { get; set; }
        public int? EmployeeID { get; set; }
        public int? WorkTypeID { get; set; }
        public int? FarmID { get; set; }
        public double? ScoreOfSkill { get; set; }

        public virtual UserFarm? Employee { get; set; }
        public virtual MasterType? WorkType { get; set; }
    }
}
