using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
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
        public IQueryable<UserWorkLog> GetUserWorkLogsByEmployeeIds();
    }
}
