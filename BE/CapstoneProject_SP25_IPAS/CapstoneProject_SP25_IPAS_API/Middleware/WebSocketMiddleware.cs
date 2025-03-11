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
                    WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();

                    // Nhận tin nhắn đầu tiên từ client để lấy userId
                    var buffer = new byte[1024];
                    WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        string message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        var json = JsonConvert.DeserializeObject<dynamic>(message);
                        string userId = json?.userId;

                        if (!string.IsNullOrEmpty(userId))
                        {
                            using (var scope = _serviceScopeFactory.CreateScope())
                            {
                                var _webSocketService = scope.ServiceProvider.GetRequiredService<IWebSocketService>();
                                _webSocketService.AddClient(userId, webSocket); // Thêm client vào danh sách
                                await _webSocketService.HandleWebSocket(webSocket, userId);
                            }
                        }
                        else
                        {
                            await webSocket.CloseAsync(WebSocketCloseStatus.PolicyViolation, "UserId required", CancellationToken.None);
                        }
                    }
                }
                else
                {
                    context.Response.StatusCode = 400;
                }
            }
            else
            {
                await _next(context); // Chuyển tiếp request nếu không phải WebSocket
            }
        }
    }
}
