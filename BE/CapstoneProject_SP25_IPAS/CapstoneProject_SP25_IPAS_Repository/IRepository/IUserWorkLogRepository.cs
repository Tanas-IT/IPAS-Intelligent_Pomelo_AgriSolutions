using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IUserWorkLogRepository
    {
        public Task<List<UserWorkLog>> CheckUserConflictSchedule(int userId, WorkLog workLog);
        public Task<bool> CheckUserConflictByStartTimeSchedule(int userId, TimeSpan startTime, TimeSpan endTime, DateTime dateCheck);
        public Task<bool> CheckUserConflictByStartDateAndEndDate(int userId, TimeSpan startTime, TimeSpan endTime, DateTime startDate, DateTime endDate);

        public Task<List<UserWorkLog>> GetListUserWorkLogByWorkLogId(int workLogId);
        public Task<List<UserWorkLog>> GetListUserWorkLogToStatistic(int farmId);
        public Task<List<UserFarm>> GetUserWorkLogsByEmployeeIds(int? top, int? farmId, string? search);
        public Task<bool> DeleteUserWorkLogByWorkLogId(int workLogId);
        public Task<List<UserWorkLog>> GetUserWorkLogByUserId(int userId);
        public Task<List<UserWorkLog>> GetEmployeeToDayTask(int userId);
        public Task<int> GetTasksCompletedAsync(int userId, string status, DateTime from, DateTime to);
        public Task<double> GetHoursWorkedAsync(int userId, DateTime from, DateTime to);
        public Task<int> GetSkillScoreAsync(int userId, string status, DateTime from, DateTime to);
        public Task<int> GetAiReportsSubmittedAsync(int userId, DateTime from, DateTime to);
        public Task<int> GetPendingTasksTodayAsync(int userId, string status, DateTime today);
        public Task<List<ProductivityChartItem>> GetChartDataAsync(int userId, DateTime from, DateTime to, string timeRange);
    }
}
