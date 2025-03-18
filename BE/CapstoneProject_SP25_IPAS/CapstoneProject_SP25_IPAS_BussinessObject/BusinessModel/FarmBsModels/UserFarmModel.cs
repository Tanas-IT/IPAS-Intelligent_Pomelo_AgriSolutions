using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels
{
    public class UserFarmModel
    {
        public int FarmId { get; set; }

        public int UserId { get; set; }

        public int RoleId { get; set; }
        public bool? IsActive { get; set; }
        public string? Status { get; set; }

        public string? RoleName { get; set; }
        public string? FarmName { get; set; }
        public string? FullName { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public DateTime? FarmExpiredDate { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public FarmModel Farm { get; set; } = null!;
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public UserModel User { get; set; } = null!;
        //public virtual RoleModel Role { get; set; } = null!;
    }
}
