using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IWorkLogService
    {
        public Task<BusinessResult> GetCalendarEvents(ParamCalendarModel paramCalendarModel);
        public Task<BusinessResult> AssignTaskForEmployee(int employeeId, int worklogId);
        public Task<BusinessResult> GetScheduleFilters(PaginationParameter paginationParameter, ScheduleFilter scheduleFilter);
    }
}
