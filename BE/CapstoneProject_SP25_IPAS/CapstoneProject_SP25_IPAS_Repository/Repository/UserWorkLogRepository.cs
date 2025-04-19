using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using CloudinaryDotNet;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
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

        public async Task<List<UserWorkLog>> GetUserWorkLogByUserId(int userId)
        {
            var result = await _context.UserWorkLogs
                            .Where(x => x.UserId == userId && x.WorkLog.Date != null && x.WorkLog.Date > DateTime.Now)
                            .ToListAsync();
            return result;
        }

        public async Task<List<UserWorkLog>> GetEmployeeToDayTask(int userId)
        {
            var result = await _context.UserWorkLogs
                .Include(x => x.WorkLog)
                .Where(x => x.UserId == userId && x.WorkLog.Date != null && x.WorkLog.Date.Value.Date == DateTime.Now.Date)
                .ToListAsync();
            return result;
        }

        public async Task<int> GetTasksCompletedAsync(int userId, string status, DateTime from, DateTime to)
        {
            return await _context.UserWorkLogs
                .Include(x => x.WorkLog)
                .Where(x => x.UserId == userId && x.WorkLog.Status == status && x.WorkLog.Date != null && x.WorkLog.Date.Value.Date >= from.Date && x.WorkLog.Date <= to.Date)
                .CountAsync();
        }

        public async Task<double> GetHoursWorkedAsync(int userId, DateTime from, DateTime to)
        {
            return await _context.UserWorkLogs
                .Include(x => x.WorkLog)
                .Where(x => x.UserId == userId && x.WorkLog.ActualStartTime != null && x.WorkLog.ActualEndTime != null && x.WorkLog.Date != null && x.WorkLog.Date.Value.Date >= from.Date && x.WorkLog.Date.Value.Date <= to.Date)
                .SumAsync(x => EF.Functions.DateDiffMinute(x.WorkLog.ActualStartTime.Value, x.WorkLog.ActualEndTime.Value) / 60.0);
        }

        public async Task<int> GetSkillScoreAsync(int userId, string status, DateTime from, DateTime to)
        {
            var totalTasks = await _context.UserWorkLogs.Include(x => x.WorkLog)
                                .Where(x => x.UserId == userId && x.WorkLog.Date != null && x.WorkLog.Date.Value.Date >= from.Date && x.WorkLog.Date <= to.Date)
                                .CountAsync();

            if (totalTasks == 0)
                return 0;

            var completedTasks = await _context.UserWorkLogs.Include(x => x.WorkLog)
                .Where(x => x.UserId == userId && x.WorkLog.Status == status && x.WorkLog.Date != null && x.WorkLog.Date.Value.Date >= from.Date && x.WorkLog.Date <= to.Date)
                .CountAsync();

            var score = (double)completedTasks / totalTasks * 100;
            return (int)Math.Round(score);
        }

        public async Task<int> GetAiReportsSubmittedAsync(int userId, DateTime from, DateTime to)
        {
            return await _context.Reports
                .Where(r => r.QuestionerID == userId && r.CreatedDate != null && r.CreatedDate.Value.Date >= from.Date && r.CreatedDate.Value.Date <= to.Date)
                .CountAsync();
        }

        public async Task<int> GetPendingTasksTodayAsync(int userId, string status, DateTime today)
        {
            return await _context.UserWorkLogs
                .Include(x => x.WorkLog)
                .Where(w => w.UserId == userId && w.WorkLog.Date != null && w.WorkLog.Date.Value.Date == today.Date && w.WorkLog.Status != status)
                .CountAsync();
        }

        public async Task<List<ProductivityChartItem>> GetChartDataAsync(int userId, DateTime from, DateTime to, string timeRange)
        {
            if (timeRange == "month")
            {
                var data = await _context.UserWorkLogs.Include(x => x.WorkLog)
                    .Where(x => x.UserId == userId && x.WorkLog.Date != null && x.WorkLog.Date.Value.Date >= from.Date && x.WorkLog.Date.Value.Date <= to.Date)
                    .ToListAsync();

                 var grouped = data
                                  .GroupBy(x =>
                                  {
                                      var day = x.WorkLog.Date.Value.Day;
                                      if (day <= 7) return 1;
                                      else if (day <= 14) return 2;
                                      else if (day <= 21) return 3;
                                      else if (day <= 31) return 4;
                                      else return 5;
                                  })
                                  .Select(g => new
                                  {
                                      WeekNumber = g.Key,
                                      Item = new ProductivityChartItem
                                      {
                                          Label = $"Week {g.Key}",
                                          Count = g.Count()
                                      }
                                  })
                                  .OrderBy(x => x.WeekNumber)
                                  .Select(x => x.Item)
                                  .ToList();

                return grouped;
            }
            else
            {
                var data = await _context.UserWorkLogs.Include(x => x.WorkLog)
                    .Where(x => x.UserId == userId && x.WorkLog.Date != null && x.WorkLog.Date.Value.Date >= from.Date && x.WorkLog.Date.Value.Date <= to.Date)
                    .ToListAsync();

                var grouped = data
                    .GroupBy(x => x.WorkLog.Date.Value.Date)
                     .OrderBy(g => g.Key)
                    .Select(g => new ProductivityChartItem
                    {
                        Label = g.Key.ToString("dd/MM"),
                        Count = g.Count()
                    })
                    .ToList();

                return grouped;
            }
        }
    }
}
