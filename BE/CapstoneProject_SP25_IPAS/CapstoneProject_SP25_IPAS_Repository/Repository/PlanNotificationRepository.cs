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

        public async Task<List<PlanNotification>> GetListPlanNotificationByUserId(int userId, bool isRead)
        {
            var result = await _context.PlanNotifications
                .Include(x => x.User)
                .Include(x => x.Notification)
                .ThenInclude(x => x.MasterType)
                .Include(x => x.Notification)
                .ThenInclude(X => X.Sender)
                .Where(x => x.UserID == userId && x.isRead == isRead).ToListAsync();
            return result;
        }
    }
}
