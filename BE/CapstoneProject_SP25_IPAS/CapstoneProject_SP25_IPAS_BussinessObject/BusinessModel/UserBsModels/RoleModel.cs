using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels
{
    public class RoleModel
    {
        public int RoleId { get; set; }

        public string? RoleName { get; set; }

        public bool? IsSystem { get; set; }
    }
}
