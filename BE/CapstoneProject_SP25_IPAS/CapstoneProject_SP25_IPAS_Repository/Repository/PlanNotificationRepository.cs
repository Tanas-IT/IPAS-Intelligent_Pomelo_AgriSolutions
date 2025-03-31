using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class PlanNotificationRepository : GenericRepository<PlanNotification>, IPlanNotificationRepository
    {
        private readonly IpasContext _context;

        public PlanNotificationRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<PlanNotification>> GetListPlanNotificationByNotificationId(int notificationId)
        {
            var result = await _context.PlanNotifications.Where(x => x.NotificationID == notificationId).ToListAsync();
            return result;
        }

        public async Task<List<Notification>> GetListPlanNotificationByUserId(int userId, bool? isRead)
        {
            // Lấy danh sách ID từ PlanNotification
            var notificationIdsFromPlan = _context.PlanNotifications
                .Where(x => x.UserID == userId && x.NotificationID != null)
                .Select(x => x.NotificationID.Value);

            // Lấy danh sách ID từ bảng Notification
            var allNotificationIds = _context.Notifications
                  .Where(n => n.SenderID == userId)
                .Select(n => n.NotificationId);

            // Hợp 2 danh sách ID
            var allNotificationIdsDistinct = notificationIdsFromPlan
                .Union(allNotificationIds);

            // Truy vấn lại Notification với đầy đủ Include
            var result = await _context.Notifications
                .Where(n => allNotificationIdsDistinct.Contains(n.NotificationId))
                .Include(n => n.MasterType)
                .Include(n => n.Sender)
                .ToListAsync();
            if (isRead != null)
            {
                result.Where(x => x.IsRead == isRead);
            }
            else
            {
                return result;
            }
            
            return result;
        }
    }
}
