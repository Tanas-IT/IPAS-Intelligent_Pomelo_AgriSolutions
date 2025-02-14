using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Numerics;
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

        public async Task<bool> CheckUserConflictByStartDateAndEndDate(int userId, TimeSpan startTime, TimeSpan endTime, DateTime startDate, DateTime endDate)
        {
            return await _context.UserWorkLogs
                                .Include(uwl => uwl.WorkLog)
                                .ThenInclude(wl => wl.Schedule)
                                .AnyAsync(uwl =>
                                    uwl.UserId == userId &&
                                    _context.Plans.Any(p =>
                                        p.StartDate <= endDate &&  // Kế hoạch bắt đầu trước hoặc trong khoảng thời gian kiểm tra
                                        p.EndDate >= startDate     // Kế hoạch kết thúc sau hoặc trong khoảng thời gian kiểm tra
                                    ) &&
                                    (
                                        // TH1: Công việc trong cùng một ngày
                                        (uwl.WorkLog.Schedule.StarTime < uwl.WorkLog.Schedule.EndTime &&
                                         startTime < uwl.WorkLog.Schedule.EndTime &&
                                         endTime > uwl.WorkLog.Schedule.StarTime)

                                        // TH2: Công việc kéo dài qua ngày mới
                                        || (uwl.WorkLog.Schedule.StarTime > uwl.WorkLog.Schedule.EndTime &&
                                            (startTime < uwl.WorkLog.Schedule.EndTime || endTime > uwl.WorkLog.Schedule.StarTime))
                                    )
                                );
        }

        public async Task<bool> CheckUserConflictByStartTimeSchedule(int userId, TimeSpan startTime, TimeSpan endTime, DateTime dateCheck)
        {

            bool isConflicted = await _context.UserWorkLogs
                                        .Include(uwl => uwl.WorkLog)
                                        .ThenInclude(wl => wl.Schedule)
                                        .AnyAsync(uwl =>
                                            uwl.UserId == userId &&
                                            uwl.WorkLog.Date.Value.Date == dateCheck.Date && // Chỉ kiểm tra trong ngày
                                            (
                                                uwl.WorkLog.Schedule.StarTime < uwl.WorkLog.Schedule.EndTime &&
                                                startTime < uwl.WorkLog.Schedule.EndTime &&
                                                endTime > uwl.WorkLog.Schedule.StarTime
                                                ||
                                           (uwl.WorkLog.Schedule.StarTime > uwl.WorkLog.Schedule.EndTime &&
                                            (startTime < uwl.WorkLog.Schedule.EndTime || endTime > uwl.WorkLog.Schedule.StarTime))
                                            )
                                        );
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
