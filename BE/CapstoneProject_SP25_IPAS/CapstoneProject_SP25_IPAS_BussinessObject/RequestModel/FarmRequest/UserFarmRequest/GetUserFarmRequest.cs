using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.UserFarmRequest
{
    public class GetUserFarmRequest
    {
        public int? farmId { get; set; }
        public string? RoleName { get; set; }
    }
}
