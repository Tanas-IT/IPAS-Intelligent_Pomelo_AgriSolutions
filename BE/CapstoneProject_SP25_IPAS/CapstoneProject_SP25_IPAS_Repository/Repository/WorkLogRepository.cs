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
    public class WorkLogRepository : GenericRepository<WorkLog>, IWorkLogRepository
    {
        private readonly IpasContext _context;
        public WorkLogRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<WorkLog>> GetListWorkLogByListSchedules(List<CarePlanSchedule> schedules)
        {
            var scheduleIds = schedules.Select(s => s.ScheduleId).ToList(); // Chuyển sang List<int>

            var savedWorkLogs = await _context.WorkLogs
                .Where(wl => scheduleIds.Contains(wl.ScheduleId.GetValueOrDefault())) // Giờ Contains() hoạt động được
                .ToListAsync();
            return savedWorkLogs;
        }

        public async Task<List<WorkLog>> GetListWorkLogByWorkLogDate(WorkLog newWorkLog)
        {
            var WorkLogs = await _context.WorkLogs
                .Where(w => w.Date == newWorkLog.Date ) // Giờ Contains() hoạt động được
                .ToListAsync();
            return WorkLogs;
        }
    }
}
