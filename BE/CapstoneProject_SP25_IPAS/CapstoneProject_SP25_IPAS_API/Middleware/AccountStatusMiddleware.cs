using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;

namespace CapstoneProject_SP25_IPAS_API.Middleware
{
    public class AccountStatusMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public AccountStatusMiddleware(RequestDelegate next, IServiceScopeFactory serviceScopeFactory, ILogger<AccountStatusMiddleware> logger)
        {
            _next = next;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<IpasContext>();
                var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                var userIdClaim = 0;

                if (token != null)
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

                    //_ = int.TryParse(jwtToken?.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value, out userIdClaim);
                    _ = int.TryParse(jwtToken?.Claims.FirstOrDefault(c => c.Type == TokenClaimKeyConst.USERID_KEY)?.Value, out userIdClaim);
                }

                if (userIdClaim > 0)
                {
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userIdClaim && u.IsDeleted != true);
                    //if (user != null && user.Status.ToLower().Equals("banned"))
                    if (user != null && user.Status.ToLower().Equals(UserStatusEnum.Banned.ToString().ToLower()))
                    {
                        var response = new BaseResponse
                        {
                            StatusCode = StatusCodes.Status401Unauthorized,
                            Message = "Your account has been banned. Contact support for further details",
                            Data = null,
                            IsSuccess = false
                        };
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                        return;
                    }
                }
            }

            await _next(context);
        }

    }
}
