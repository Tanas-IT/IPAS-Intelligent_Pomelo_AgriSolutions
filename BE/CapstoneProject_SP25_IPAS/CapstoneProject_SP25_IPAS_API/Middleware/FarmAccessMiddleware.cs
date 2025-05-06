using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace CapstoneProject_SP25_IPAS_API.Middleware
{
    public class CheckUserFarmAccessAttribute : TypeFilterAttribute
    {
        public CheckUserFarmAccessAttribute() : base(typeof(FarmAccessFilter))
        {
        }
    }
    public class FarmAccessFilter : IAsyncActionFilter
    {
        private readonly IServiceScopeFactory _scopeFactory;
        //private readonly IpasContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FarmAccessFilter(IServiceScopeFactory scopeFactory, IHttpContextAccessor httpContextAccessor)
        {
            _scopeFactory = scopeFactory;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<IpasContext>();

            var httpContext = _httpContextAccessor.HttpContext;
            var jwtToken = httpContext!.User;

            //  Lấy role & farmId từ token
            var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            var farmIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == TokenClaimKeyConst.FARMID_KEY)?.Value;

            //  Nếu không có farmId => Bắt buộc chọn farm
            if (string.IsNullOrEmpty(farmIdClaim))
            {
                context.Result = new ObjectResult(new
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "You need to select a farm before accessing this feature.",
                    IsSuccess = false
                })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
                return;
            }

            var userIdcClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == TokenClaimKeyConst.USERID_KEY)?.Value;
            int.TryParse(farmIdClaim, out int farmId);
            int.TryParse(userIdcClaim, out int userId);

            // Nếu là ADMIN, bỏ qua kiểm tra FarmAccess
            if (string.Equals(roleClaim, RoleEnum.ADMIN.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                await next();
                return;
            }

            var farm = await dbContext.Farms.AsNoTracking().FirstOrDefaultAsync(f => f.IsDeleted == false);
            if (farm != null && farm.Status!.Equals(FarmStatusEnum.Inactive.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                context.Result = new ObjectResult(new BaseResponse
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    IsSuccess = false,
                    Message = "Your farm were inactive, please contact to know more info",
                    Data = null
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }
            var userFarm = await dbContext.UserFarms
                .AsNoTracking()
                .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.FarmId == farmId);

            if (userFarm == null || userFarm.IsActive == false || farm.Status!.Equals(FarmStatusEnum.Inactive.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                context.Result = new ObjectResult(new BaseResponse
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    IsSuccess = false,
                    Message = "Your farm access were inactive",
                    Data = null
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }

            await next(); // tiếp tục xử lý
        }
    }
}
