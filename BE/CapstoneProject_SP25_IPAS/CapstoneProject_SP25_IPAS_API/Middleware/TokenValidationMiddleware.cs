using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;

namespace CapstoneProject_SP25_IPAS_API.Middleware
{
    public class TokenValidationMiddleware
    {
        private readonly RequestDelegate _next;

        public TokenValidationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (token != null)
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                try
                {
                    var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;
                    if (jwtToken != null)
                    {
                        var expirationDate = jwtToken.ValidTo;
                        if (expirationDate < DateTime.UtcNow)
                        {
                            await RespondWithUnauthorized(context, "Token is expired!");
                            return;
                        }
                    }
                }
                catch (Exception)
                {
                    await RespondWithUnauthorized(context, "Invalid Token!");
                    return;
                }
            }
            await _next(context);
        }

        private async Task RespondWithUnauthorized(HttpContext context, string message)
        {
            var response = new BaseResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message = message,
                Data = null,
                IsSuccess = false
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync(JsonConvert.SerializeObject(response));
        }
    }
}
