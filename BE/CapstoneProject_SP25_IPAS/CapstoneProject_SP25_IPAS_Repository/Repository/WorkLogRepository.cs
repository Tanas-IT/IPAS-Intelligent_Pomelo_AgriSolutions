using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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

        public async Task<bool> AssignTaskForUser(int employeeId, int workLogId)
        {
            var workLog = await _context.WorkLogs
               .Include(wl => wl.Schedule)
               .FirstOrDefaultAsync(wl => wl.WorkLogId == workLogId);

            if (workLog == null)
            {
                throw new Exception("Work Log does not exist");
            }

            // Lấy thời gian bắt đầu và kết thúc của công việc này
            var startTime = workLog.Schedule.StarTime;
            var endTime = workLog.Schedule.EndTime;
            var workLogDate = workLog.Date;

            // Kiểm tra xem user này có bị trùng lịch không
            bool isConflicted = await _context.UserWorkLogs
                .Include(uwl => uwl.WorkLog)
                .ThenInclude(wl => wl.Schedule)
                .AnyAsync(uwl => uwl.UserId == employeeId &&
                    uwl.WorkLog.Date == workLogDate && // Cùng ngày
                    (
                        (uwl.WorkLog.Schedule.StarTime < endTime && uwl.WorkLog.Schedule.EndTime > startTime) ||  // TH1: Trùng giờ trong cùng ngày
                        (uwl.WorkLog.Schedule.StarTime > uwl.WorkLog.Schedule.EndTime && // TH2: Công việc kéo dài qua ngày
                            (startTime >= uwl.WorkLog.Schedule.StarTime || endTime <= uwl.WorkLog.Schedule.EndTime))
                    ));

            if (isConflicted)
            {
                throw new Exception("User has conflict schedule"); 
            }

            // Nếu không trùng, tiến hành gán công việc cho user
            var newUserWorkLog = new UserWorkLog
            {
                WorkLogId = workLogId,
                UserId = employeeId,
                IsReporter = false // Có thể cập nhật giá trị này nếu cần
            };

            _context.UserWorkLogs.Add(newUserWorkLog);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteWorkLogAndUserWorkLog(WorkLog deleteWorkLog)
        {
            var getListUserWorkLog = await _context.UserWorkLogs.Where(x => x.WorkLogId == deleteWorkLog.WorkLogId).ToListAsync();
            _context.UserWorkLogs.RemoveRange(getListUserWorkLog);
            _context.WorkLogs.Remove(deleteWorkLog);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<WorkLog>> GetCalendarEvents(int? userId = null, int? planId = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = await _context.WorkLogs
                         .Include(wl => wl.Schedule)
                         .ThenInclude(s => s.CarePlan)
                         .Include(wl => wl.UserWorkLogs)
                         .ThenInclude(uwl => uwl.User).ToListAsync();
            // Nếu có truyền userId, lọc theo userId
            if (userId.HasValue)
            {
                query = query.Where(wl => wl.UserWorkLogs.Any(uwl => uwl.UserId == userId)).ToList();
            }

            // Nếu có truyền planId, lọc theo planId
            if (planId.HasValue)
            {
                query = query.Where(wl => wl.Schedule.CarePlan.PlanId == planId).ToList();
            }

            // Nếu có truyền startDate và endDate, lọc theo khoảng ngày
            if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(wl => wl.Date >= startDate.Value && wl.Date <= endDate.Value).ToList();
            }

            return query;

        }

        public async Task<List<WorkLog>> GetListWorkLogByListSchedules(List<CarePlanSchedule> schedules)
        {
            var scheduleIds = schedules.Select(s => s.ScheduleId).ToList(); // Chuyển sang List<int>

            var savedWorkLogs = await _context.WorkLogs
                .Where(wl => scheduleIds.Contains(wl.ScheduleId.GetValueOrDefault())) // Giờ Contains() hoạt động được
                .ToListAsync();
            return savedWorkLogs;
        }

        public async Task<double> CalculatePlanProgress(int planId)
        {
            var listAllWorkLog = await _context.WorkLogs.Where(x => x.Schedule.CarePlan.PlanId == planId).ToListAsync();
            var listWorkLogDone = await _context.WorkLogs.Where(x => x.Schedule.CarePlan.PlanId == planId && x.Status.ToLower().Equals("done")).ToListAsync();
            var result = ((double)listWorkLogDone.Count / (double)listAllWorkLog.Count) * 100;
            return result;
        }

        public async Task<List<WorkLog>> GetListWorkLogByScheduelId(int scheduleId)
        {
            var result = await _context.WorkLogs.Where(x => x.ScheduleId == scheduleId).ToListAsync();
            return result;
        }

        public async Task<List<WorkLog>> GetListWorkLogByWorkLogDate(WorkLog newWorkLog)
        {
            var WorkLogs = await _context.WorkLogs
                .Where(w => w.Date == newWorkLog.Date) // Giờ Contains() hoạt động được
                .ToListAsync();
            return WorkLogs;
        }
        public async Task<List<WorkLog>> GetWorkLog(Expression<Func<WorkLog, bool>> filter = null!,
            Func<IQueryable<WorkLog>, IOrderedQueryable<WorkLog>> orderBy = null!,
            int? pageIndex = null,
            int? pageSize = null)
        {
            IQueryable<WorkLog> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }
            query = query.Include(uwl => uwl.Schedule)
                             .ThenInclude(s => s.CarePlan)
                             .Include(wl => wl.UserWorkLogs)
                             .ThenInclude(s => s.User);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Implementing pagination
            if (pageIndex.HasValue && pageSize.HasValue)
            {
                // Ensure the pageIndex and pageSize are valid
                int validPageIndex = pageIndex.Value > 0 ? pageIndex.Value - 1 : 0;
                int validPageSize = pageSize.Value > 0 ? pageSize.Value : 10; // Assuming a default pageSize of 10 if an invalid value is passed

                query = query.Skip(validPageIndex * validPageSize).Take(validPageSize);
            }

            return await query.AsNoTracking().ToListAsync();

        }

        public async Task<List<WorkLog>> GetWorkLogInclude()
        {
            return await _context.WorkLogs.Include(x => x.Schedule)
                        .Include(x => x.Schedule.CarePlan.PlanTargets)
                        .ThenInclude(x => x.LandPlot.Farm)
                        .Include(x => x.Schedule.CarePlan.PlanTargets)
                        .ThenInclude(x => x.Plant)
                        .ThenInclude(x => x.LandRow)
                        .ThenInclude(x => x.LandPlot)
                        .ThenInclude(x => x.Farm)
                        .ToListAsync();
        }

        public async Task<bool> CheckConflictTimeOfWorkLog(TimeSpan newStartTime, TimeSpan newEndTime, DateTime dayCheck)
        {
            // Lấy danh sách WorkLog trong ngày dayCheck
            var workLogs = await _context.WorkLogs
                .Where(x => x.Date.HasValue && x.Date.Value.Date == dayCheck.Date)
                .ToListAsync();

            // Danh sách chứa lịch trình của từng WorkLog
            var scheduleList = new List<CarePlanSchedule>();

            foreach (var workLog in workLogs)
            {
                if (workLog.ScheduleId == null) continue;

                var schedule = await _context.CarePlanSchedules
                    .FirstOrDefaultAsync(x => x.ScheduleId == workLog.ScheduleId);

                if (schedule != null && schedule.StarTime.HasValue && schedule.EndTime.HasValue)
                {
                    scheduleList.Add(schedule);
                }
            }

            // Kiểm tra xung đột giữa WorkLog mới với các lịch trình hiện có
            foreach (var schedule in scheduleList)
            {
                bool isOverlap = newStartTime < schedule.EndTime &&
                                 newEndTime > schedule.StarTime;

                if (isOverlap)
                    return true; // Có xung đột
            }

            return false; // Không có xung đột, có thể thêm WorkLog mới
        }

        public async Task<List<WorkLog>> GetConflictWorkLogsOnSameLocation(TimeSpan startTime, TimeSpan endTime, DateTime date, int? treeId, int? rowId, int? plotId)
        {
            return await _context.WorkLogs
                           .Include(w => w.Schedule)
                           .ThenInclude(s => s.CarePlan)
                           .ThenInclude(c => c.PlanTargets)
                           .Where(w =>
                               w.Date == date &&
                               ((w.Schedule.StarTime < endTime && w.Schedule.EndTime > startTime) ||
                                (startTime < w.Schedule.EndTime && endTime > w.Schedule.StarTime)) &&
                               w.Schedule.CarePlan.PlanTargets.Any(pt =>
                                   (treeId != null && pt.PlantID == treeId) ||
                                   (rowId != null && pt.LandRowID == rowId) ||
                                   (plotId != null && pt.LandPlotID == plotId)
                               )
                           )
                           .ToListAsync();
        }

        public async Task<List<WorkLog>> GetListWorkLogByYearAndMonth(int year, int month, int? farmId)
        {
            var result = await _context.WorkLogs
                            .Include(x => x.UserWorkLogs)
                            .ThenInclude(x => x.User)
                            .Include(w => w.Schedule)
                            .ThenInclude(x => x.CarePlan)
                            .ThenInclude(x => x.Farm)
                            .Where(x => x.Date.Value.Year == year && x.Date.Value.Month == month && x.Schedule.CarePlan.FarmID == farmId).ToListAsync();
            return result;
        }
    }
}
