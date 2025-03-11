using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.IService;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class WebSocketService : IWebSocketService
    {
        private static readonly object _lock = new object();
        private readonly IUnitOfWork _unitOfWork;
        private static readonly ConcurrentDictionary<string, List<WebSocket>> _clients = new();

        public WebSocketService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void AddClient(string userId, WebSocket webSocket)
        {
            lock (_lock)
            {
                if (!_clients.ContainsKey(userId))
                {
                    _clients[userId] = new List<WebSocket>();
                }

                _clients[userId].Add(webSocket);
                Console.WriteLine($"Client {userId} connected.");
            }
        }

        public void RemoveClient(string userId, WebSocket webSocket)
        {
            lock (_lock)
            {
                if (_clients.ContainsKey(userId))
                {
                    _clients[userId].Remove(webSocket);
                    Console.WriteLine($"Client {userId} disconnected.");

                    if (_clients[userId].Count == 0)
                    {
                        _clients.TryRemove(userId, out _);
                    }
                }
            }
        }

        public async Task SendToUser(int userIntId, object data)
        {
            var settings = new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            };

            var message = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(data, settings));


            string userId = userIntId.ToString();

            if (_clients.ContainsKey(userId))
            {
                var tasks = new List<Task>();

                _clients[userId].RemoveAll(client => client.State != WebSocketState.Open);
                foreach (var client in _clients[userId])
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                            await client.SendAsync(new ArraySegment<byte>(message), WebSocketMessageType.Text, true, CancellationToken.None);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Lỗi gửi WebSocket: {ex.Message}");
                        }
                    }));
                }

                await Task.WhenAll(tasks);
            }
        }


        public async Task BroadcastToEmployees(object data)
        {
            var message = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(data));
            var tasks = new List<Task>();

            lock (_lock)
            {
                foreach (var userId in _clients.Keys)
                {
                    foreach (var client in _clients[userId])
                    {
                        if (client.State == WebSocketState.Open)
                        {
                            tasks.Add(client.SendAsync(new ArraySegment<byte>(message), WebSocketMessageType.Text, true, CancellationToken.None));
                        }
                    }
                }
            }

            await Task.WhenAll(tasks);
        }

        public async Task HandleWebSocketMessages(WebSocket webSocket, List<int> userIds)
        {
            var buffer = new byte[1024 * 4];

            try
            {
                WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                while (!result.CloseStatus.HasValue)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    var receivedMessage = JsonConvert.DeserializeObject<dynamic>(message);

                    if (receivedMessage.action == "join")
                    {
                        // Đăng ký kết nối cho từng User trong danh sách
                        foreach (var userId in userIds)
                        {
                            AddClient(userId.ToString(), webSocket);
                            Console.WriteLine($"User {userId} connected to WebSocket.");
                        }
                    }
                    else if (receivedMessage.action == "update worklog")
                    {
                        int planId = receivedMessage.planId;
                        var workLogs = await _unitOfWork.WorkLogRepository.GetListWorkLogByPlanId(planId);

                        var messageToSend = new
                        {
                            action = "worklog_update",
                            data = workLogs
                        };
                        foreach (var userid in userIds)
                        {
                            await SendToUser(userid, messageToSend);
                        }

                    }
                    else if (receivedMessage.action == "notify")
                    {
                        string messageContent = receivedMessage.message;
                        var notification = new
                        {
                            action = "notification",
                            message = messageContent
                        };
                        foreach (var userid in userIds)
                        {
                            await SendToUser(userid, notification);
                        }
                    }

                    result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            finally
            {
                // Xóa từng User khỏi danh sách khi họ ngắt kết nối
                foreach (var userId in userIds)
                {
                    RemoveClient(userId.ToString(), webSocket);
                }
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Connection closed", CancellationToken.None);
            }
        }
        public async Task HandleWebSocket(WebSocket webSocket, string userId)
        {
            var buffer = new byte[1024 * 4];

            try
            {
                WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                while (!result.CloseStatus.HasValue)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine($"Nhận tin nhắn từ user {userId}: {message}");

                    result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi WebSocket: {ex.Message}");
            }
            finally
            {
                RemoveClient(userId, webSocket);
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Connection closed", CancellationToken.None);
            }
        }
    }
}
