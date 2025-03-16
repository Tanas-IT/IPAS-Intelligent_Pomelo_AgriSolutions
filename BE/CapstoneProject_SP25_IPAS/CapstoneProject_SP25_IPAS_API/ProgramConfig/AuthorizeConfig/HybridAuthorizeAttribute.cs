using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using System.Security.Claims;

namespace CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig
{
    public class HybridAuthorizeAttribute : AuthorizeAttribute, IAsyncAuthorizationFilter
    {
        //private readonly string[] _allowedSystemRoles;
        //private readonly string[] _allowedFarmRoles;
        private readonly static string FARM_KEY = "farmId";
        private readonly string[] _allowedRoles;
        //public HybridAuthorizeAttribute(string systemRoles, string? farmRoles)
        //{
        //    _allowedSystemRoles = systemRoles.Split(',').Select(r => r.Trim()).ToArray();
        //    if (farmRoles != null)
        //    {
        //        _allowedFarmRoles = farmRoles.Split(',').Select(r => r.Trim()).ToArray();
        //    }
        //}
        public HybridAuthorizeAttribute(string roles)
        {
            _allowedRoles = roles.Split(',').Select(r => r.Trim()).ToArray();
        }
        //public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        //{
        //    var user = context.HttpContext.User;
        //    if (!user.Identity.IsAuthenticated)
        //    {
        //        context.Result = new UnauthorizedResult();
        //        return;
        //    }

        //    // Lấy role hệ thống từ token
        //    var systemRoleClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
        //    if (!string.IsNullOrEmpty(systemRoleClaim) && _allowedSystemRoles.Contains("Admin") && systemRoleClaim.ToLower().Equals("admin".ToLower()))
        //    {
        //        return; // Được phép nếu có role hệ thống
        //    }
        //    // kiem tra neu khong co role tu he thong - ko co role trong trang trai thi ko active ham nay vi chi su dung cho admin
        //    if (!string.IsNullOrEmpty(systemRoleClaim) && _allowedSystemRoles.Contains("User") && systemRoleClaim.ToLower().Equals("user".ToLower()))
        //    {

        //        // Nếu không có quyền hệ thống, kiểm tra quyền trong Farm
        //        var userIdClaim = user.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
        //        if (_allowedFarmRoles?.Any() == false)
        //        {
        //            return; // neu khong co yeu cau kiem tra role tu farm thi chi can biet he thong la duoc
        //        }
        //        if (string.IsNullOrEmpty(userIdClaim))
        //        {
        //            context.Result = new UnauthorizedResult();
        //            return;
        //        }
        //        int userId = int.Parse(userIdClaim);

        //        // Lấy farmId từ request
        //        int? farmId = GetFarmIdFromRequest(context.HttpContext);
        //        if (farmId == null)
        //        {
        //            context.Result = new BadRequestObjectResult("FarmId is required.");
        //            return;
        //        }

        //        // Kiểm tra quyền trong Farm
        //        var _farmService = context.HttpContext.RequestServices.GetService<IFarmService>();
        //        var userFarm = await _farmService.GetUserFarmRole(farmId: farmId.Value, userId: userId);

        //        if (userFarm == null || !(_allowedFarmRoles!.Contains(userFarm.RoleName)))
        //        {
        //            context.Result = new ForbidResult();
        //        }
        //        return;
        //    }
        //    context.Result = new ForbidResult();
        //}
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (!user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            //  1️ Lấy role từ token (luôn có giá trị, không cần kiểm tra null)
            var roleClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            // 2️ Kiểm tra role từ token với danh sách role được phép
            if (!_allowedRoles.Contains(roleClaim, StringComparer.OrdinalIgnoreCase))
            {
                context.Result = new ForbidResult();
                return;
            }
        }

        private int? GetFarmIdFromRequest(HttpContext context)
        {
            var user = context.User;

            //  1️ Kiểm tra farmId trong token
            var farmIdClaim = user.Claims.FirstOrDefault(c => c.Type == FARM_KEY)?.Value;
            if (!string.IsNullOrEmpty(farmIdClaim) && int.TryParse(farmIdClaim, out int farmIdFromToken))
            {
                return farmIdFromToken; // Lấy từ token nếu có
            }

            //  2️ Nếu không có trong token, kiểm tra farmId từ route (URL)
            if (context.GetRouteValue(FARM_KEY) is string farmIdStr && int.TryParse(farmIdStr, out int farmIdFromRoute))
            {
                return farmIdFromRoute;
            }

            //  3️ Kiểm tra farmId từ query parameter (URL ?farmId=1)
            if (context.Request.Query.TryGetValue(FARM_KEY, out var queryFarmId) && int.TryParse(queryFarmId, out int farmIdFromQuery))
            {
                return farmIdFromQuery;
            }

            // 4️ Kiểm tra farmId từ request body (JSON)
            context.Request.EnableBuffering();
            using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
            var body = reader.ReadToEndAsync().Result;
            context.Request.Body.Position = 0;

            var jsonBody = JsonConvert.DeserializeObject<Dictionary<string, object>>(body);
            if (jsonBody != null && jsonBody.TryGetValue(FARM_KEY, out var farmIdObj) && int.TryParse(farmIdObj?.ToString(), out int farmIdFromBody))
            {
                return farmIdFromBody;
            }

            return null; // Nếu không tìm thấy farmId ở bất kỳ đâu
        }

    }
}
