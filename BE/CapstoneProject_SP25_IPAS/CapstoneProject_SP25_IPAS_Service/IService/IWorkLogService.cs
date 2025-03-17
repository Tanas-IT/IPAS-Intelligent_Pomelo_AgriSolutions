//using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.GraftedRequest.GraftedNoteRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserWorkLogModel;
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
        public Task<BusinessResult> GetScheduleEvents(ParamScheduleModel paramCalendarModel);
        public Task<BusinessResult> AssignTaskForEmployee(int employeeId, int worklogId);
        public Task<BusinessResult> GetScheduleWithFilters(ScheduleFilter scheduleFilter, int? farmId);
        public Task<BusinessResult> AddNewTask(AddNewTaskModel addNewTaskModel, int? farmId);
        public Task<BusinessResult> GetDetailWorkLog(int workLogId);
        public Task<BusinessResult> UpdateWorkLog(UpdateWorkLogModel updateWorkLogModel, int? farmId);
        public Task<BusinessResult> NoteForWorkLog(CreateNoteModel createNoteModel);
        public Task<BusinessResult> DeleteWorkLog(int workLogId);

    }
}
