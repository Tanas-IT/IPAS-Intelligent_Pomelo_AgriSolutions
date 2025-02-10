using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
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
            var listCarePlanSchedule = await _context.CarePlanSchedules.Where(x => x.CarePlanId == planID).ToListAsync();
            
            foreach (var item in listCarePlanSchedule)
            {
                var getListWorkLog = await _context.WorkLogs.Where(x => x.ScheduleId == item.ScheduleId).ToListAsync();
                foreach(var workLog in getListWorkLog)
                {
                    var getListUserWorkLog = await _context.UserWorkLogs.Where(x => x.WorkLogId == workLog.WorkLogId).ToListAsync();
                     _context.UserWorkLogs.RemoveRange(getListUserWorkLog);
                    _context.SaveChanges();
                }
                _context.WorkLogs.RemoveRange(getListWorkLog);
                _context.SaveChanges();
            }
            _context.CarePlanSchedules.RemoveRange(listCarePlanSchedule);
            var result = _context.SaveChanges();
            if(result > 0)
            {
                return true;
            }
            return false;
        }

        public async Task<bool> IsScheduleConflicted(int carePlanId, DateTime startDate, DateTime endDate, TimeSpan startTime, TimeSpan endTime)
        {
            // Lấy danh sách lịch trình của CarePlan
            var schedules = await  _context.CarePlanSchedules.Where(x => x.StarTime == startTime && x.EndTime == endTime).ToListAsync();
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

                List<DateTime>? customDates = !string.IsNullOrEmpty(schedule.CustomDates)
                    ? JsonConvert.DeserializeObject<List<DateTime>>(schedule.CustomDates)
                    : null;

                // Kiểm tra nếu khoảng thời gian không trùng nhau, bỏ qua
                if (endDate < plan.StartDate || startDate > plan.EndDate)
                {
                    continue; // Không có conflict
                }

                // Kiểm tra trùng ngày:
                bool isDateMatched = (customDates != null && customDates.Any(d => d >= startDate && d <= endDate)) // Nếu là ngày tùy chỉnh
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
