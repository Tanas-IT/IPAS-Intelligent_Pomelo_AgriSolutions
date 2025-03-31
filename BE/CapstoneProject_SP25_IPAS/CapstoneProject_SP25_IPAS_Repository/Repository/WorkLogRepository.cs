using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
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
            var startTime = workLog.Schedule.StartTime;
            var endTime = workLog.Schedule.EndTime;
            var workLogDate = workLog.Date;

            // Kiểm tra xem user này có bị trùng lịch không
            bool isConflicted = await _context.UserWorkLogs
                .Include(uwl => uwl.WorkLog)
                .ThenInclude(wl => wl.Schedule)
                .AnyAsync(uwl => uwl.UserId == employeeId &&
                    uwl.WorkLog.Date == workLogDate && // Cùng ngày
                    (
                        (uwl.WorkLog.Schedule.StartTime < endTime && uwl.WorkLog.Schedule.EndTime > startTime) ||  // TH1: Trùng giờ trong cùng ngày
                        (uwl.WorkLog.Schedule.StartTime > uwl.WorkLog.Schedule.EndTime && // TH2: Công việc kéo dài qua ngày
                            (startTime >= uwl.WorkLog.Schedule.StartTime || endTime <= uwl.WorkLog.Schedule.EndTime))
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

        public async Task<List<WorkLog>> GetCalendarEvents(int? userId = null, int? planId = null, DateTime? startDate = null, DateTime? endDate = null, int farmId = 0)
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
                query = query.Where(wl => wl.Date >= startDate.Value && wl.Date <= endDate.Value && wl.Schedule.CarePlan.FarmID == farmId && wl.Schedule.CarePlan.IsDeleted == false).ToList();
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

                if (schedule != null && schedule.StartTime.HasValue && schedule.EndTime.HasValue)
                {
                    scheduleList.Add(schedule);
                }
            }

            // Kiểm tra xung đột giữa WorkLog mới với các lịch trình hiện có
            foreach (var schedule in scheduleList)
            {
                bool isOverlap = newStartTime < schedule.EndTime &&
                                 newEndTime > schedule.StartTime;

                if (isOverlap)
                    return true; // Có xung đột
            }

            return false; // Không có xung đột, có thể thêm WorkLog mới
        }

        public async Task<List<WorkLog>> GetConflictWorkLogsOnSameLocation(TimeSpan startTime, TimeSpan endTime, DateTime date, List<int>? treeIds, List<int>? rowIds, List<int?> plotIds)
        {
            return await _context.WorkLogs
                           .Include(w => w.Schedule)
                           .ThenInclude(s => s.CarePlan)
                           .ThenInclude(c => c.PlanTargets)
                           .Where(w =>
                               w.Date == date &&
                               ((w.Schedule.StartTime < endTime && w.Schedule.EndTime > startTime) ||
                                (startTime < w.Schedule.EndTime && endTime > w.Schedule.StartTime)) &&
                               w.Schedule.CarePlan.PlanTargets.Any(pt =>
                                  (treeIds != null && treeIds.Contains(pt.PlantID ?? -1)) ||
                                    (rowIds != null && rowIds.Contains(pt.LandRowID ?? -1)) ||
                                    (plotIds != null && plotIds.Contains(pt.LandPlotID ?? -1))
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

        public async Task<WorkLog> GetWorkLogIncludeById(int workLogId)
        {
            var result = await _context.WorkLogs
                        .Include(x => x.Schedule)
                        .Include(x => x.Schedule.HarvestHistory)
                        .Include(x => x.Schedule.CarePlan)
                        .Include(x => x.Schedule.CarePlan.Crop)
                        .Include(x => x.Schedule.CarePlan.MasterType)
                        .Include(x => x.Schedule.CarePlan.Process)
                        .Include(x => x.TaskFeedbacks)
                        .ThenInclude(x => x.Manager)
                        .Include(x => x.Schedule.CarePlan.GrowthStagePlans)
                        .ThenInclude(x => x.GrowthStage)
                        .Include(w => w.UserWorkLogs)
                        .ThenInclude(x => x.Resources)
                        .Include(x => x.UserWorkLogs)
                        .ThenInclude(x => x.User)
                        .Include(x => x.UserWorkLogs)
                        .Include(x => x.Schedule.CarePlan.PlanTargets)
                        .ThenInclude(x => x.LandPlot.Farm)
                        .Include(x => x.Schedule.CarePlan.PlanTargets)
                        .ThenInclude(x => x.Plant)
                        .ThenInclude(x => x.LandRow)
                        .ThenInclude(x => x.LandPlot)
                        .ThenInclude(x => x.Farm)
                        .Include(x => x.UserWorkLogs)
                        .FirstOrDefaultAsync(x => x.WorkLogId == workLogId);
            return result;
        }

        public async Task<bool> CheckWorkLogAvailability([FromQuery] int[] workLogIds)
        {
            var workLogs = await _context.WorkLogs
                         .Where(wl => workLogIds.Contains(wl.WorkLogId))
                         .Include(wl => wl.Schedule)
                         .ThenInclude(s => s.CarePlan)
                         .ThenInclude(p => p.MasterType)
                         .Include(wl => wl.UserWorkLogs)
                         .ToListAsync();

            // Kiểm tra conflict giữa các WorkLog
            foreach (var workLog in workLogs)
            {
                var masterType = workLog.Schedule?.CarePlan?.MasterType;
                if (masterType?.IsConflict == true)
                {
                    var conflictingWorkLogs = workLogs.Where(w =>
                        w.WorkLogId != workLog.WorkLogId &&
                        w.Schedule?.StartTime < workLog.Schedule?.EndTime &&
                        w.Schedule?.EndTime > workLog.Schedule?.StartTime).ToList();

                    if (conflictingWorkLogs.Any())
                    {
                        throw new Exception($"WorkLog {workLog.WorkLogId} conflicts with other work logs.");
                    }
                }
            }

            // Kiểm tra nhân viên chỉ làm một WorkLog trong một khung giờ
            var userWorkLogs = await _context.UserWorkLogs
                .Where(uwl => workLogIds.Contains(uwl.WorkLogId))
                .Include(uwl => uwl.WorkLog)
                .ThenInclude(wl => wl.Schedule)
                .ToListAsync();

            var userWorkLogGroups = userWorkLogs.GroupBy(uwl => uwl.UserId);
            foreach (var group in userWorkLogGroups)
            {
                var userId = group.Key;
                var workLogsForUser = group.Select(uwl => uwl.WorkLog).ToList();

                for (int i = 0; i < workLogsForUser.Count; i++)
                {
                    for (int j = i + 1; j < workLogsForUser.Count; j++)
                    {
                        var wl1 = workLogsForUser[i];
                        var wl2 = workLogsForUser[j];
                        if (wl1.Schedule?.StartTime < wl2.Schedule?.EndTime && wl1.Schedule?.EndTime > wl2.Schedule?.StartTime)
                        {
                            throw new Exception($"User {userId} has overlapping WorkLogs {wl1.WorkLogName} and {wl2.WorkLogName}.");
                        }
                    }
                }

            }
            return true;
        }

        public async Task CheckWorkLogAvailabilityWhenAddPlan(TimeSpan newStartTime, TimeSpan newEndTime, DateTime dayCheck, int? masterTypeId, List<int> listEmployeeIds)
        {
            var existingWorkLogs = await _context.WorkLogs
         .Include(wl => wl.Schedule)
         .ThenInclude(s => s.CarePlan)
         .ThenInclude(p => p.MasterType)
         .Where(wl => wl.IsDeleted == false &&
                      wl.Date == dayCheck &&
                      wl.Schedule.StartTime < newEndTime &&
                      wl.Schedule.EndTime > newStartTime)
         .ToListAsync();

            // Kiểm tra công việc có thể làm chung không
            if (masterTypeId.HasValue)
            {
                var newMasterType = await _context.MasterTypes.FindAsync(masterTypeId);

                if (newMasterType == null)
                    throw new Exception("Invalid MasterTypeId");
                if (newMasterType.IsConflict == true && existingWorkLogs.Any())
                {
                    throw new Exception("This work cannot be scheduled because it conflicts with existing work logs.");
                }
            }


            // Kiểm tra nhân viên có bị trùng lịch không
            var userConflicts = await _context.UserWorkLogs
                .Include(wl => wl.WorkLog)
                .ThenInclude(wl => wl.Schedule)
                .Where(uwl => uwl.WorkLog.IsDeleted == false &&
                                listEmployeeIds.Contains(uwl.UserId) &&
                              uwl.WorkLog.Date == dayCheck &&
                              uwl.WorkLog.Schedule.StartTime < newEndTime &&
                              uwl.WorkLog.Schedule.EndTime > newStartTime)
                .Select(uwl => new
                {
                    uwl.User.FullName,  // Lấy tên nhân viên nếu có
                    uwl.UserId,
                    StartTime = uwl.WorkLog.Schedule.StartTime,
                    EndTime = uwl.WorkLog.Schedule.EndTime
                })
                .ToListAsync();

            if (userConflicts.Any())
            {
                var conflictDetails = string.Join(", ", userConflicts.Select(uwl =>
                    $"{uwl.FullName} - {uwl.StartTime} to {uwl.EndTime}"
                ));
                throw new Exception($"The following employees have scheduling conflicts: {conflictDetails}");
            }
        }

        public async Task CheckConflictTaskOfEmployee(TimeSpan newStartTime, TimeSpan newEndTime, DateTime dayCheck, List<int> listEmployeeIds)
        {
            var userConflicts = await _context.UserWorkLogs
              .Include(wl => wl.WorkLog)
              .ThenInclude(wl => wl.Schedule)
              .Where(uwl => uwl.WorkLog.IsDeleted == false &&
                              listEmployeeIds.Contains(uwl.UserId) &&
                            uwl.WorkLog.Date == dayCheck &&
                            uwl.WorkLog.Schedule.StartTime < newEndTime &&
                            uwl.WorkLog.Schedule.EndTime > newStartTime)
              .Select(uwl => new
              {
                  uwl.User.FullName,  // Lấy tên nhân viên nếu có
                  uwl.UserId,
                  StartTime = uwl.WorkLog.Schedule.StartTime,
                  EndTime = uwl.WorkLog.Schedule.EndTime
              })
              .ToListAsync();

            if (userConflicts.Any())
            {
                var conflictDetails = string.Join(", ", userConflicts.Select(uwl =>
                    $"{uwl.FullName} - {uwl.StartTime} to {uwl.EndTime}"
                ));
                throw new Exception($"The following employees have scheduling conflicts: {conflictDetails}");
            }
        }

        public async Task<List<WorkLog>> GetListWorkLogByPlanId(int planId)
        {
            var result = await _context.WorkLogs.Include(x => x.Schedule.CarePlan)
                .Where(x => x.Schedule.CarePlan.PlanId == planId).ToListAsync();
            return result;
        }

        public async Task<List<WorkLog>> GetWorkLogsByFarm(int farmId)
        {
            var nowTimeSpan = DateTime.Now.TimeOfDay;
            var timeAfter3Hours = DateTime.Now.AddHours(3).TimeOfDay;

            var result = await _context.WorkLogs
                .Include(x => x.UserWorkLogs)
                .Include(x => x.Schedule)
                .ThenInclude(x => x.CarePlan)
                .ThenInclude(x => x.MasterType)
                .Where(x => x.Schedule.FarmID == farmId &&
                            x.ActualStartTime.HasValue &&
                            x.Date.Value.Date == DateTime.Now.Date &&
                            x.ActualStartTime.Value >= nowTimeSpan &&
                            x.ActualStartTime.Value <= timeAfter3Hours)
                .ToListAsync();
            return result;
        }
    }
}
