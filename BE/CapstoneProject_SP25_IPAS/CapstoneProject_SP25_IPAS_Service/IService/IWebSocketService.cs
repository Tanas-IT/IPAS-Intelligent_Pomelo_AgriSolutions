using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IWebSocketService
    {
        public void AddClient(string userId, WebSocket webSocket);
        public void RemoveClient(string userId, WebSocket webSocket);
        public Task SendToUser(int userIntId, object data);
        public Task BroadcastToEmployees(object data);
        public Task HandleWebSocketMessages(WebSocket webSocket, List<int> userIds);
        public Task HandleWebSocket(WebSocket webSocket, string userId);
    }
}
