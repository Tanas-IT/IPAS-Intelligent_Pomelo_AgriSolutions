using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class ReplacementEmployeeModel
    {
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string? Avatar { get; set; }
        public int ReplaceUserId { get; set; }
        public bool? IsRepoter { get; set; }
        public string? ReplaceUserFullName { get; set; }
        public string? ReplaceUserAvatar { get; set; }
    }
}
