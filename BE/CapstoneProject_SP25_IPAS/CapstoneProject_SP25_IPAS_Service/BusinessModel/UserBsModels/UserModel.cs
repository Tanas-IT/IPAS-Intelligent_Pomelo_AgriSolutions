﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels
{
    public class UserModel
    {
        public int UserId { get; set; }

        public string? Email { get; set; }

        public string? Password { get; set; }

        public string? FullName { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Gender { get; set; }

        public DateTime? Dob { get; set; }

        public string? UserCode { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public bool? IsDelete { get; set; }

        public DateTime? DeleteDate { get; set; }

        public string? Status { get; set; }

        public int? IsDependency { get; set; }

        public string? Role { get; set; }
    }
}
