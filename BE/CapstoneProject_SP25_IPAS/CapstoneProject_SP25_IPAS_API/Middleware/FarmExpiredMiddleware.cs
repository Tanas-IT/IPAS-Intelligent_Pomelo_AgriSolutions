using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Common.Constants;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_Common.Enum;

namespace CapstoneProject_SP25_IPAS_API.Middleware
{
    public class FarmExpiredAttribute : TypeFilterAttribute
    {
        public FarmExpiredAttribute() : base(typeof(FarmExpiredFilter)) { }
    }

    public class FarmExpiredFilter : IAsyncActionFilter
    {
        private readonly IServiceScopeFactory _scopeFactory;
        //private readonly IpasContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FarmExpiredFilter(/*IpasContext context,*/ IHttpContextAccessor httpContextAccessor, IServiceScopeFactory scopeFactory)
        {
            //_context = context;
            _httpContextAccessor = httpContextAccessor;
            _scopeFactory = scopeFactory;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            using var scope = _scopeFactory.CreateScope();
            var _context = scope.ServiceProvider.GetRequiredService<IpasContext>();
            var httpContext = _httpContextAccessor.HttpContext;
            var jwtToken = httpContext!.User;

            //  Lấy role & farmId từ token
            var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            var farmIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == TokenClaimKeyConst.FARMID_KEY)?.Value;

            ////  Nếu không có farmId => Bắt buộc chọn farm
            //if (string.IsNullOrEmpty(farmIdClaim))
            //{
            //    context.Result = new ObjectResult(new
            //    {
            //        StatusCode = StatusCodes.Status400BadRequest,
            //        Message = "You need to select a farm before accessing this feature.",
            //        IsSuccess = false
            //    })
            //    {
            //        StatusCode = StatusCodes.Status400BadRequest
            //    };
            //    return;
            //}

            int.TryParse(farmIdClaim, out int farmId);

            // Nếu là ADMIN, bỏ qua kiểm tra farmExpired
            if (string.Equals(roleClaim, RoleEnum.ADMIN.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                await next();
                return;
            }

            // Kiểm tra farm có bị expired không
            var expiredDate = await _context.Orders
                .Where(o => o.FarmId == farmId && o.Farm!.IsDeleted == false)
                .MaxAsync(o => o.ExpiredDate);

            if (expiredDate.HasValue && expiredDate <= DateTime.Now)
            {
                context.Result = new ObjectResult(new
                {
                    StatusCode = StatusCodes.Status402PaymentRequired,
                    Message = "Your farm has expired. Please renew your package to continue.",
                    IsSuccess = false
                })
                {
                    StatusCode = StatusCodes.Status402PaymentRequired
                };
                return;
            } else if (!expiredDate.HasValue )
            {
                context.Result = new ObjectResult(new
                {
                    StatusCode = StatusCodes.Status402PaymentRequired,
                    Message = "Your farm not yet buy a package. Please package to continue.",
                    IsSuccess = false
                })
                {
                    StatusCode = StatusCodes.Status402PaymentRequired
                };
                return;
            }

            //  Nếu farm hợp lệ, tiếp tục xử lý request
            await next();
        }
    }
}
//public class FarmExpiredMiddleware
//{
//    private readonly RequestDelegate _next;
//    private readonly IServiceScopeFactory _serviceScopeFactory;
//    public FarmExpiredMiddleware(RequestDelegate next, IServiceScopeFactory serviceScopeFactory)
//    {
//        _next = next;
//        _serviceScopeFactory = serviceScopeFactory;
//    }
//    public async Task InvokeAsync(HttpContext context)
//    {
//        using (var scope = _serviceScopeFactory.CreateScope())
//        {
//            int farmId = 0;

//            var _context = scope.ServiceProvider.GetRequiredService<IpasContext>();
//            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

//            if (token != null)
//            {
//                var tokenHandler = new JwtSecurityTokenHandler();
//                var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;
//                var farmIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == TokenClaimKeyConst.FARMID_KEY);
//                if(farmIdClaim != null)
//                _ = int.TryParse(jwtToken?.Claims.FirstOrDefault(c => c.Type == TokenClaimKeyConst.FARMID_KEY).Value, out farmId);
//            }
//            if (farmId != 0)
//            {

//                var expiredDate = await _context.Orders.Where(o =>
//                                o.FarmId == farmId && o.Farm.IsDeleted == false)
//                    .MaxAsync(o => o.ExpiredDate);

//                if (expiredDate.HasValue && expiredDate <= DateTime.Now)
//                {
//                    var response = new BaseResponse
//                    {
//                        StatusCode = StatusCodes.Status402PaymentRequired,
//                        Message = "Your farm has been expired. Contact support for further details",
//                        Data = null,
//                        IsSuccess = false
//                    };
//                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
//                    context.Response.ContentType = "application/json";
//                    await context.Response.WriteAsync(JsonSerializer.Serialize(response));
//                    return;
//                }
//            }

//            // Nếu farm hợp lệ, tiếp tục xử lý request
//            await _next(context);
//        }
//    }
//}
