using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class CarePlanScheduleRepository : GenericRepository<CarePlanSchedule>, ICarePlanScheduleRepository
    {
        private readonly IpasContext _context;

        public CarePlanScheduleRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> DeleteDependenciesOfPlan(int planID)
        {
            // Lấy danh sách CarePlanSchedules của planID
            var listCarePlanSchedule = await _context.CarePlanSchedules
                .Where(x => x.CarePlanId == planID)
                .ToListAsync();

            if (!listCarePlanSchedule.Any()) return false;

            // Lấy danh sách ScheduleId từ CarePlanSchedules
            var scheduleIds = listCarePlanSchedule.Select(x => x.ScheduleId).ToList();

            // Lấy danh sách WorkLogs liên quan, loại bỏ những workLog có Date < hiện tại hoặc có Status "completed"
            var workLogsToDelete = await _context.WorkLogs
                .Where(x => scheduleIds.Contains(x.ScheduleId.Value) &&
                            !(x.Date < DateTime.Now || (x.Status != null && x.Status.ToLower() == "completed")))
                .ToListAsync();

            // Lấy danh sách WorkLogId từ workLogs cần xóa
            var workLogIds = workLogsToDelete.Select(x => x.WorkLogId).ToList();

            // Lấy danh sách UserWorkLogs liên quan
            var userWorkLogsToDelete = await _context.UserWorkLogs
                .Where(x => workLogIds.Contains(x.WorkLogId))
                .ToListAsync();

            // Xóa UserWorkLogs, WorkLogs, CarePlanSchedules
            _context.UserWorkLogs.RemoveRange(userWorkLogsToDelete);
            _context.WorkLogs.RemoveRange(workLogsToDelete);
            _context.CarePlanSchedules.RemoveRange(listCarePlanSchedule);

            // Lưu thay đổi một lần duy nhất
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> IsScheduleConflicted(int carePlanId, DateTime startDate, DateTime endDate, TimeSpan startTime, TimeSpan endTime)
        {
            // Lấy danh sách lịch trình của CarePlan
            var schedules = await _context.CarePlanSchedules.Where(x => x.StarTime == startTime && x.EndTime == endTime).ToListAsync();
            var plan = await _context.Plans.FirstOrDefaultAsync(x => x.PlanId == carePlanId);

            foreach (var schedule in schedules)
            {
                // Deserialize JSON thành List<int> để kiểm tra
                List<int>? dayOfWeekList = !string.IsNullOrEmpty(schedule.DayOfWeek)
                    ? JsonConvert.DeserializeObject<List<int>>(schedule.DayOfWeek)
                    : null;

                List<int>? dayOfMonthList = !string.IsNullOrEmpty(schedule.DayOfMonth)
                    ? JsonConvert.DeserializeObject<List<int>>(schedule.DayOfMonth)
                    : null;
                string[] formats = { "dd/MM/yyyy HH:mm:ss", "dd/MM/yyyy" };
                List<DateTime>? customDates = null;
                if (!string.IsNullOrEmpty(schedule.CustomDates))
                {
                    // Nếu là danh sách JSON (bắt đầu bằng dấu [ và kết thúc bằng dấu ])
                    if (schedule.CustomDates.Trim().StartsWith("[") && schedule.CustomDates.Trim().EndsWith("]"))
                    {
                        var dateStrings = JsonConvert.DeserializeObject<List<string>>(schedule.CustomDates);
                        customDates = dateStrings?
                            .Select(date => DateTime.ParseExact(date.Trim(), formats, CultureInfo.InvariantCulture, DateTimeStyles.None))
                            .ToList();
                    }
                    else
                    {
                        // Nếu chỉ là một chuỗi đơn
                        if (DateTime.TryParseExact(schedule.CustomDates.Trim(), formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime singleDate))
                        {
                            customDates = new List<DateTime> { singleDate };
                        }
                    }
                }
                   

                // Kiểm tra nếu khoảng thời gian không trùng nhau, bỏ qua
                if (endDate < plan.StartDate || startDate > plan.EndDate)
                {
                    continue; // Không có conflict
                }

                // Kiểm tra trùng ngày:
                bool isDateMatched = (customDates != null && customDates.Any(d => d >= startDate.Date && d <= endDate.Date)) // Nếu là ngày tùy chỉnh
                    || (dayOfWeekList != null && dayOfWeekList.Intersect(GetDaysBetween(startDate, endDate)).Any()) // Nếu là Weekly
                    || (dayOfMonthList != null && dayOfMonthList.Intersect(GetValidDaysOfMonth(startDate, endDate)).Any()); // Nếu là Monthly

                // Nếu ngày trùng và thời gian bị trùng -> Conflict
                if (isDateMatched && (schedule.StarTime < endTime && schedule.EndTime > startTime))
                {
                    return true; // Bị trùng
                }
            }

            return false; // Không trùng
        }

        public async Task<bool> IsScheduleConflictedForWorkLog(int? farmId, DateTime startDate, DateTime endDate, TimeSpan startTime, TimeSpan endTime)
        {
            // Lấy danh sách lịch trình của CarePlan
            var schedules = await _context.CarePlanSchedules.Where(x => x.StarTime == startTime && x.EndTime == endTime).ToListAsync();
            var plan = await _context.Plans.FirstOrDefaultAsync(x => x.FarmID == farmId);

            foreach (var schedule in schedules)
            {
                // Deserialize JSON thành List<int> để kiểm tra
                List<int>? dayOfWeekList = !string.IsNullOrEmpty(schedule.DayOfWeek)
                    ? JsonConvert.DeserializeObject<List<int>>(schedule.DayOfWeek)
                    : null;

                List<int>? dayOfMonthList = !string.IsNullOrEmpty(schedule.DayOfMonth)
                    ? JsonConvert.DeserializeObject<List<int>>(schedule.DayOfMonth)
                    : null;
                string[] formats = { "dd/MM/yyyy HH:mm:ss", "dd/MM/yyyy" };
                List<DateTime>? customDates = null;
                if (!string.IsNullOrEmpty(schedule.CustomDates))
                {
                    // Nếu là danh sách JSON (bắt đầu bằng dấu [ và kết thúc bằng dấu ])
                    if (schedule.CustomDates.Trim().StartsWith("[") && schedule.CustomDates.Trim().EndsWith("]"))
                    {
                        var dateStrings = JsonConvert.DeserializeObject<List<string>>(schedule.CustomDates);
                        customDates = dateStrings?
                            .Select(date => DateTime.ParseExact(date.Trim(), formats, CultureInfo.InvariantCulture, DateTimeStyles.None))
                            .ToList();
                    }
                    else
                    {
                        // Nếu chỉ là một chuỗi đơn
                        if (DateTime.TryParseExact(schedule.CustomDates.Trim(), formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime singleDate))
                        {
                            customDates = new List<DateTime> { singleDate };
                        }
                    }
                }


                // Kiểm tra nếu khoảng thời gian không trùng nhau, bỏ qua
                if (endDate < plan.StartDate || startDate > plan.EndDate)
                {
                    continue; // Không có conflict
                }

                // Kiểm tra trùng ngày:
                bool isDateMatched = (customDates != null && customDates.Any(d => d >= startDate.Date && d <= endDate.Date)) // Nếu là ngày tùy chỉnh
                    || (dayOfWeekList != null && dayOfWeekList.Intersect(GetDaysBetween(startDate, endDate)).Any()) // Nếu là Weekly
                    || (dayOfMonthList != null && dayOfMonthList.Intersect(GetValidDaysOfMonth(startDate, endDate)).Any()); // Nếu là Monthly

                // Nếu ngày trùng và thời gian bị trùng -> Conflict
                if (isDateMatched && (schedule.StarTime < endTime && schedule.EndTime > startTime))
                {
                    return true; // Bị trùng
                }
            }

            return false; // Không trùng
        }
        private List<int> GetDaysBetween(DateTime startDate, DateTime endDate)
        {
            List<int> days = new List<int>();
            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (!days.Contains((int)date.DayOfWeek))
                {
                    days.Add((int)date.DayOfWeek);
                }
            }
            return days;
        }
        private List<int> GetValidDaysOfMonth(DateTime startDate, DateTime endDate)
        {
            List<int> days = new List<int>();
            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (!days.Contains(date.Day))
                {
                    days.Add(date.Day);
                }
            }
            return days;
        }
    }
}
