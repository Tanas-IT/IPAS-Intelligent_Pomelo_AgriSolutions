using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ScheduleRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
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
        public Task<BusinessResult> AssignTaskForEmployee(int employeeId, int worklogId, int farmId, bool? isReporter);
        public Task<BusinessResult> GetScheduleWithFilters(ScheduleFilter scheduleFilter, int? farmId);
        public Task<BusinessResult> AddNewTask(AddNewTaskModel addNewTaskModel, int? farmId);
        public Task<BusinessResult> AddNewWorkLog(AddWorkLogModel addNewTaskModel, int? farmId);
        public Task<BusinessResult> UpdateStatusWorkLog(UpdateStatusWorkLogModel updateStatusWorkLogModel, int? farmId);
        public Task<BusinessResult> GetDetailWorkLog(int workLogId);
        public Task<BusinessResult> UpdateWorkLog(UpdateWorkLogModel updateWorkLogModel, int? farmId);
        public Task<BusinessResult> NoteForWorkLog(CreateNoteModel createNoteModel, int farmId);
        public Task<BusinessResult> UpdateNoteForWorkLog(CreateNoteModel updateNoteModel, int farmId);
        public Task<BusinessResult> DeleteWorkLog(int workLogId);
        public Task<BusinessResult> ReAssignEmployeeForWorkLog(int workLogId, List<EmployeeModel> employeeModels, int? farmId);
        public Task<BusinessResult> ChangeEmployeeOfWorkLog(ChangeEmployeeOfWorkLog changeEmployeeOfWorkLog);
        public Task<BusinessResult> CanceledWorkLogByEmployee(int workLogId, int userId, int farmId);
        public Task<BusinessResult> CheckAttendance(CheckAttendanceModel checkAttendanceModel, int farmId);
        public Task<BusinessResult> TaskStatics(int farmId);
        public Task<BusinessResult> GetWorkLogbyStatus(GetWorkLogByStatusParam getWorkLogByStatusModel);
        public Task<BusinessResult> GetAttendanceList(int workLogId);
        public Task<BusinessResult> CancelReplacement(CancelledWorkLogModel cancelledWorkLogModel);
        public Task<BusinessResult> GetListEmployeeToUpdateWorkLog(int workLogId);
        public Task<BusinessResult> CanTakeAttendance(int workLogId);
        public Task<BusinessResult> RedoAssignWorkLog(RedoWorkLogModel addNewTaskModel, int? farmId);
        public Task<BusinessResult> GetStatusOfWorkLogForManager();
    }
}
