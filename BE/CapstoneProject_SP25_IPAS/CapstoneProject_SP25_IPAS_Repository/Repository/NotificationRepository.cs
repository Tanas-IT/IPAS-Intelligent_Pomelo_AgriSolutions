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

        public async Task<List<Notification>> GetListNotificationUnReadByUserId(int userId)
        {
            var result = await _context.Notifications
                .Include(x => x.Sender)
                .Include(x => x.MasterType)
                .Where(x => x.SenderID == userId && x.IsRead == false).ToListAsync();
            return result;
        }
    }
}
