﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IJwtTokenService
    {
        int? GetUserIdFromToken();
        string GetUserEmailFromToken();
        string GetUserRoleFromToken();
        int? GetFarmIdFromToken();
        string GetStatusFromToken();
    }
}
