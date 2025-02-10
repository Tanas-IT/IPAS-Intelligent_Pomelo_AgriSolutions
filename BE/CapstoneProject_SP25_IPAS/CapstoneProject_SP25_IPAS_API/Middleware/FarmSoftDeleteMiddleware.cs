using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;

namespace CapstoneProject_SP25_IPAS_API.Middleware
{
    public class FarmSoftDeleteMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public FarmSoftDeleteMiddleware(RequestDelegate next, IServiceScopeFactory serviceScopeFactory)
        {
            _next = next;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            int? farmId = null;

            // Lấy farmId từ Route
            if (context.GetRouteValue("farmId") != null)
            {
                farmId = int.Parse(context.GetRouteValue("farmId").ToString());
            }

            // Lấy farmId từ Query String
            if (farmId == null && context.Request.Query.ContainsKey("farmId"))
            {
                farmId = int.Parse(context.Request.Query["farmId"]);
            }

            // Lấy farmId từ Body (nếu request là POST hoặc PUT)
            if (farmId == null && (context.Request.Method == HttpMethods.Post || context.Request.Method == HttpMethods.Put))
            {
                context.Request.EnableBuffering();
                using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
                var body = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0; // Reset để Controller đọc tiếp

                var jsonBody = JsonConvert.DeserializeObject<Dictionary<string, object>>(body);
                if (jsonBody.ContainsKey("farmId"))
                {
                    farmId = int.Parse(jsonBody["farmId"].ToString());
                }
            }

            // Nếu không tìm thấy farmId, bỏ qua Middleware
            if (farmId == null)
            {
                await _next(context);
                return;
            }

            // Kiểm tra farm có bị xóa không
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<IpasContext>();
                var farm = await dbContext.Farms.FirstOrDefaultAsync(f => f.FarmId == farmId);

                if (farm == null || farm.IsDeleted == true)
                {
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    await context.Response.WriteAsync("Farm không tồn tại hoặc đã bị xóa.");
                    return;
                }
            }

            // Nếu farm hợp lệ, tiếp tục xử lý request
            await _next(context);
        }
    }
}
