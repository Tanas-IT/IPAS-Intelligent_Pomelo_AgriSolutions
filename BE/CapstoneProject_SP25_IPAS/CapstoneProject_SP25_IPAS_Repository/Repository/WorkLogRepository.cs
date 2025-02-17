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
                        .Include(x => x.Schedule.CarePlan.LandPlot.Farm)
                        .Include(x => x.Schedule.CarePlan.Plant.LandRow.LandPlot.Farm)
                        .ToListAsync();
        }
    }
}
