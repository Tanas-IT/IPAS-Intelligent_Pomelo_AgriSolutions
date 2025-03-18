using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AuthensModel
{
    public class ReIssueToken
    {
        public string AccessToken { get; set; } = "";
        public string RefreshToken { get; set; } = "";
        public string? FarmName { get; set; } = "";
        public string? FarmLogo { get; set; } = "";
    }
}
