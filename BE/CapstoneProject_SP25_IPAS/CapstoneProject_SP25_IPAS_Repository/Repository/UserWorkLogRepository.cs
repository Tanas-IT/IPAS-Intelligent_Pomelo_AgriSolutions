using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using CloudinaryDotNet;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

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
                                        (uwl.WorkLog.Schedule.StartTime < uwl.WorkLog.Schedule.EndTime &&
                                         startTime < uwl.WorkLog.Schedule.EndTime &&
                                         endTime > uwl.WorkLog.Schedule.StartTime)

                                        // TH2: Công việc kéo dài qua ngày mới
                                        || (uwl.WorkLog.Schedule.StartTime > uwl.WorkLog.Schedule.EndTime &&
                                            (startTime < uwl.WorkLog.Schedule.EndTime || endTime > uwl.WorkLog.Schedule.StartTime))
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
                                                uwl.WorkLog.Schedule.StartTime < uwl.WorkLog.Schedule.EndTime &&
                                                startTime < uwl.WorkLog.Schedule.EndTime &&
                                                endTime > uwl.WorkLog.Schedule.StartTime
                                                ||
                                           (uwl.WorkLog.Schedule.StartTime > uwl.WorkLog.Schedule.EndTime &&
                                            (startTime < uwl.WorkLog.Schedule.EndTime || endTime > uwl.WorkLog.Schedule.StartTime))
                                            )
                                        );
            return isConflicted;
        }

        public async Task<List<UserWorkLog>> CheckUserConflictSchedule(int userId, WorkLog workLog)
        {
            var checkTimeSchedule = await _context.CarePlanSchedules.FirstOrDefaultAsync(x => x.ScheduleId == workLog.ScheduleId);
            var conflictedUser = await _context.UserWorkLogs
                        .Include(uwl => uwl.WorkLog)
                        .ThenInclude(uwl => uwl.Schedule)
                        .Include(x => x.User)
                        .Where(uwl => uwl.UserId == userId &&
                                     EF.Functions.DateDiffDay(uwl.WorkLog.Date, workLog.Date) == 0 &&
                                    !(checkTimeSchedule.EndTime < uwl.WorkLog.Schedule.StartTime ||
                                      checkTimeSchedule.StartTime > uwl.WorkLog.Schedule.EndTime)).ToListAsync();
            return conflictedUser;
        }

        public async Task<List<UserWorkLog>> GetListUserWorkLogByWorkLogId(int workLogId)
        {
            var result = await _context.UserWorkLogs
                .Include(x => x.User)
                .Include(x => x.WorkLog).Where(x => x.WorkLogId == workLogId).ToListAsync();
            return result;
        }

        public async Task<List<UserWorkLog>> GetListUserWorkLogToStatistic(int farmId)
        {
            var result = await _context.UserWorkLogs
                .Include(x => x.User)
                .Include(x => x.WorkLog)
                .ThenInclude(x => x.Schedule)
                 .Where(uwl => uwl.IsDeleted == false
                     && uwl.ReplaceUserId == null
                     && uwl.WorkLog.IsDeleted == false
                     && uwl.WorkLog.Schedule.FarmID == farmId
                     && uwl.WorkLog.RedoWorkLogID == null).ToListAsync();
           
            return result;
        }

        public async Task<List<UserFarm>> GetUserWorkLogsByEmployeeIds(int? top, int? farmId, string? search)
        {
            var query = _context.UserFarms
        .Include(uf => uf.User)
            .ThenInclude(u => u.UserWorkLogs.Where(uw => uw.IsDeleted != true))
            .ThenInclude(x => x.WorkLog)
        .Include(uf => uf.Farm)
            .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(uf => uf.User.FullName.Contains(search));
            }

            if (farmId.HasValue)
            {
                query = query.Where(uf =>
                    uf.FarmId == farmId);
            }

            if (top.HasValue)
            {
                query = query.Take(top.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<bool> DeleteUserWorkLogByWorkLogId(int workLogId)
        {
            var getListUserWorkLog = await _context.UserWorkLogs.Where(x => x.WorkLogId == workLogId).AsNoTracking().ToListAsync();
            if (getListUserWorkLog != null)
            {
                foreach (var deleteUserWorkLog in getListUserWorkLog)
                {
                    _context.UserWorkLogs.Attach(deleteUserWorkLog);
                    _context.UserWorkLogs.Remove(deleteUserWorkLog);
                }
            }
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
    }
}
