using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel
{
    public class ReporterModel
    {
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string? avatarURL { get; set; }
        public string? StatusOfUserWorkLog { get; set; }
    }
}
