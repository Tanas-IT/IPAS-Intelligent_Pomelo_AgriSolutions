using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class UserFarmModel
    {
        public int FarmId { get; set; }

        public int UserId { get; set; }

        public int RoleId { get; set; }
        public string? Status { get; set; }

        public string? RoleName { get; set; }
        public string? FarmName { get; set; }
        public string? FullName { get; set; }
        public virtual FarmModel Farm { get; set; } = null!;
        //public virtual UserModel User { get; set; } = null!;
        //public virtual RoleModel Role { get; set; } = null!;
    }
}
