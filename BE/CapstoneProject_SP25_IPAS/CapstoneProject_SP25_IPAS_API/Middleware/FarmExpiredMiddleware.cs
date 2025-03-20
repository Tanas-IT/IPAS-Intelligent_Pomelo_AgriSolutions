using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Common.Constants;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System;
using System.IdentityModel.Tokens.Jwt;

namespace CapstoneProject_SP25_IPAS_API.Middleware
{
    public class FarmExpiredMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public FarmExpiredMiddleware(RequestDelegate next, IServiceScopeFactory serviceScopeFactory)
        {
            _next = next;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                int farmId = 0;

                var _context = scope.ServiceProvider.GetRequiredService<IpasContext>();
                var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

                if (token != null)
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

                    _ = int.TryParse(jwtToken?.Claims.FirstOrDefault(c => c.Type == TokenClaimKeyConst.FARMID_KEY).Value, out farmId);
                }
                if (farmId != 0)
                {

                    var expiredDate = await _context.Orders.Where(o =>
                                    o.FarmId == farmId && o.Farm.IsDeleted == false)
                        .MaxAsync(o => o.ExpiredDate);

                    if (expiredDate.HasValue && expiredDate <= DateTime.Now)
                    {
                        var response = new BaseResponse
                        {
                            StatusCode = StatusCodes.Status402PaymentRequired,
                            Message = "Your farm has been expired. Contact support for further details",
                            Data = null,
                            IsSuccess = false
                        };
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                        return;
                    }
                }

                // Nếu farm hợp lệ, tiếp tục xử lý request
                await _next(context);
            }
        }
    }
}
