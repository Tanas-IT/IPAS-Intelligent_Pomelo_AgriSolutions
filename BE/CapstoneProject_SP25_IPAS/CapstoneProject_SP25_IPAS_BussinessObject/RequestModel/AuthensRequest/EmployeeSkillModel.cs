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
        public List<SkillScoreModel> SkillWithScore { get; set; }

    }

    public class SkillScoreModel
    {
        public string SkillName { get; set; }
        public double Score { get; set; }
    }
}
