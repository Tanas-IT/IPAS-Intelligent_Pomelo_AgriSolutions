using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AuthensRequest
{
    public class EmployeeSkillModel
    {
        public int? UserId { get; set; }
        public string? FullName { get; set; }
        public string? AvatarURL { get; set; }
        public string? WorkSkillName { get; set; }
        public double? ScoreOfSkill { get; set; }
      
    }
}
