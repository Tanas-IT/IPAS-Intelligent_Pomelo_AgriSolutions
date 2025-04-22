using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        private readonly IpasContext _context;

        public NotificationRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Notification>> GetListNotificationByUserId(int userId)
        {
            var result = await _context.Notifications
                .Include(x => x.Sender)
                .Include(x => x.MasterType)
                .Where(x => x.SenderID == userId).ToListAsync();
            return result;
        }

        public async Task<List<PlanNotification>> GetListNotificationUnReadByUserId(int userId)
        {
            var result = await _context.PlanNotifications
                .Include(x => x.Notification)
                .ThenInclude(x => x.MasterType)
                .Where(x => x.UserID == userId && x.isRead == false).ToListAsync();
            return result;
        }

        public async Task<bool> PushMessageFirebase(string title, string body, int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user != null)
            {
                var fcmToken = user.Fcmtoken;
                if (fcmToken != null)
                {
                    await FirebaseLibrary.SendMessageFireBase(title, body, fcmToken);
                    return true;
                }
            }
            return false;
        }

        public async Task<bool> PushListMessageFirebase(string title, string body, List<string> fcmTokens)
        {
            if (fcmTokens.Any())
            {
                await FirebaseLibrary.SendRangeMessageFireBase(title, body, fcmTokens);
                return true;
            }
            return false;
        }
    }
}
