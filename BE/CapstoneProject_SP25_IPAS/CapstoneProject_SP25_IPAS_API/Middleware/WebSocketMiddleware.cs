using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Newtonsoft.Json;
using System.Net.WebSockets;
using System.Text;

namespace CapstoneProject_SP25_IPAS_API.Middleware
{
    public class WebSocketMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public WebSocketMiddleware(RequestDelegate next, IServiceScopeFactory serviceScopeFactory)
        {
            _next = next;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path == "/ws")
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    string? userId = context.Request.Query["userId"];

                    if (string.IsNullOrEmpty(userId))
                    {
                        context.Response.StatusCode = 400;
                        await context.Response.WriteAsync("Missing userId in query.");
                        return;
                    }

                    WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();

                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        var _webSocketService = scope.ServiceProvider.GetRequiredService<IWebSocketService>();

                        _webSocketService.AddClient(userId, webSocket); // Thêm client vào danh sách WebSocket
                        Console.WriteLine($"WebSocket connected! userId: {userId}");

                        await _webSocketService.HandleWebSocket(webSocket, userId);
                    }
                }
                else
                {
                    context.Response.StatusCode = 400;
                    await context.Response.WriteAsync("This endpoint only accepts WebSocket requests.");
                }
            }
            else
            {
                await _next(context); // Chuyển tiếp request nếu không phải WebSocket
            }
        }

    }
}
