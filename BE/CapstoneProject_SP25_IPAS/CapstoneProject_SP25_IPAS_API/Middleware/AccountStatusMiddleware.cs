﻿using CapstoneProject_SP25_IPAS_Service.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;

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

                    _ = int.TryParse(jwtToken?.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value, out userIdClaim);
                }

                if (userIdClaim > 0)
                {
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userIdClaim);
                    if (user != null && user.Status.ToLower().Equals("banned"))
                    {
                        var response = new BaseResponse
                        {
                            StatusCode = StatusCodes.Status403Forbidden,
                            Message = "Your account is banned. Please contact to admin to know detail.",
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
