using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public JwtTokenService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ClaimsPrincipal CurrentUser => _httpContextAccessor.HttpContext?.User!;

        public int? GetUserIdFromToken()
        {
            var userIdClaim = CurrentUser?.FindFirst("UserId")?.Value;
            return userIdClaim != null && int.TryParse(userIdClaim, out var userId) ? userId : (int?)null;
        }

        public string GetUserEmailFromToken()
        {
            return CurrentUser?.FindFirst("email")?.Value!;
        }

        public string GetUserRoleFromToken()
        {
            return CurrentUser?.FindFirst(ClaimTypes.Role)?.Value!;
        }

        public int? GetFarmIdFromToken()
        {
            var userIdClaim = CurrentUser?.FindFirst("farmId")?.Value;
            return userIdClaim != null && int.TryParse(userIdClaim, out var userId) ? userId : (int?)null;
        }

        public string GetStatusFromToken()
        {
            return CurrentUser?.FindFirst("Status")?.Value!;
        }
    }
}
