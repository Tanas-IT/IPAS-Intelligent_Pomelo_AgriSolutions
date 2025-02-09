using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IUserWorkLogRepository
    {
        public Task<bool> CheckUserConflictSchedule(int userId, WorkLog workLog);
        public Task<bool> CheckUserConflictByStartTimeSchedule(int userId, TimeSpan startTime, TimeSpan endTime);
    }
}
