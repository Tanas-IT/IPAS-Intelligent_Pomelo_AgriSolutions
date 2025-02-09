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
    public class UserWorkLogRepository : GenericRepository<UserWorkLog>, IUserWorkLogRepository
    {
        private readonly IpasContext _context;

        public UserWorkLogRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> CheckUserConflictByStartTimeSchedule(int userId, TimeSpan startTime, TimeSpan endTime)
        {
            bool isConflicted = await _context.UserWorkLogs
                       .Include(uwl => uwl.WorkLog)
                       .AnyAsync(uwl => uwl.UserId == userId &&
                                   !(endTime < uwl.WorkLog.Schedule.StarTime ||
                                      startTime > uwl.WorkLog.Schedule.EndTime));
            return isConflicted;
        }

        public async Task<bool> CheckUserConflictSchedule(int userId, WorkLog workLog)
        {
            var checkTimeSchedule = await _context.CarePlanSchedules.FirstOrDefaultAsync(x => x.ScheduleId == workLog.ScheduleId);
            bool isConflicted = await _context.UserWorkLogs
                        .Include(uwl => uwl.WorkLog)
                        .ThenInclude(uwl => uwl.Schedule)
                        .AnyAsync(uwl => uwl.UserId == userId &&
                                     EF.Functions.DateDiffDay(uwl.WorkLog.Date, workLog.Date) == 0 &&
                                    !(checkTimeSchedule.EndTime < uwl.WorkLog.Schedule.StarTime || 
                                      checkTimeSchedule.StarTime > uwl.WorkLog.Schedule.EndTime));
            return isConflicted;
        }
    }
}
