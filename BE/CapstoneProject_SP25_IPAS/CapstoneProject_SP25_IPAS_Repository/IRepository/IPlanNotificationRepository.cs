using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IPlanNotificationRepository
    {
        public Task<List<PlanNotification>> GetListPlanNotificationByUserId(int userId, bool? isRead);
        public Task<List<PlanNotification>> GetListPlanNotificationByNotificationId(int notificationId);
    }
}
