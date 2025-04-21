using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface INotificationRepository
    {
        public Task<List<Notification>> GetListNotificationByUserId(int userId);
        public Task<List<PlanNotification>> GetListNotificationUnReadByUserId(int userId);
        public Task<bool> PushMessageFirebase(string title, string body, int userId);
        public Task<bool> PushListMessageFirebase(string title, string body, List<string> fcmTokens);
    }
}
