using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IWorkLogRepository
    {
        public Task<List<WorkLog>> GetListWorkLogByListSchedules(List<CarePlanSchedule> schedules);
        public Task<List<WorkLog>> GetListWorkLogByWorkLogDate(WorkLog newWorkLog);
        public Task<List<WorkLog>> GetListWorkLogByScheduelId(int scheduleId);
        public Task<bool> DeleteWorkLogAndUserWorkLog(WorkLog deleteWorkLog);
        public Task<bool> AssignTaskForUser(int employeeId, int workLogId);

        public Task<List<WorkLog>> GetCalendarEvents(int? userId = null, int? planId = null, DateTime? startDate = null, DateTime? endDate = null);

    }
}
