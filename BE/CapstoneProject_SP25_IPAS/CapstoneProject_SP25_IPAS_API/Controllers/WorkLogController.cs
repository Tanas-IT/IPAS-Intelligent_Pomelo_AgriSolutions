using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkLogController : ControllerBase
    {
        private readonly IWorkLogService _workLogService;
        private readonly IJwtTokenService _jwtTokenService;

        public WorkLogController(IWorkLogService workLogService, IJwtTokenService jwtTokenService)
        {
            _workLogService = workLogService;
            _jwtTokenService = jwtTokenService;
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.WorkLog.getSchedule, Name = "GetSchedule")]
        public async Task<IActionResult> GetSchedule(int userId, int? planId, DateTime? startDate, DateTime? endDate, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var paramCalendarModel = new ParamScheduleModel()
                {
                    UserId = userId,
                    PlanId = planId,
                    StartDate = startDate,
                    EndDate = endDate,
                    FarmId = farmId
                };
                var result = await _workLogService.GetScheduleEvents(paramCalendarModel);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.WorkLog.getAllSchedule, Name = "GetAllSchedule")]
        public async Task<IActionResult> GetAllSchedule(ScheduleFilter scheduleFilter, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _workLogService.GetScheduleWithFilters(scheduleFilter, farmId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPost(APIRoutes.WorkLog.assignTask, Name = "AssignTask")]
        public async Task<IActionResult> AssignTask(int employeeId, int workLogId)
        {
            try
            {
                var result = await _workLogService.AssignTaskForEmployee(employeeId, workLogId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPost(APIRoutes.WorkLog.addNewTask, Name = "AddNewTask")]
        public async Task<IActionResult> AddNewTask([FromBody] AddNewTaskModel addNewTaskModel, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _workLogService.AddNewTask(addNewTaskModel, farmId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.WorkLog.getDetailTask, Name = "GetDetailTask")]
        public async Task<IActionResult> GetDetailTask([FromRoute] int workLogId)
        {
            try
            {
                var result = await _workLogService.GetDetailWorkLog(workLogId);

                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPost(APIRoutes.WorkLog.NoteForWorkLog, Name = "NoteForWorkLog")]
        public async Task<IActionResult> NoteForWorkLog([FromForm] CreateNoteModel createNoteModel)
        {
            try
            {
                var result = await _workLogService.NoteForWorkLog(createNoteModel);

                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPut(APIRoutes.WorkLog.updateWorkLogInfo, Name = "UpdateWorkLogInfo")]
        public async Task<IActionResult> UpdateWorkLog([FromBody] UpdateWorkLogModel updateWorkLogModel, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _workLogService.UpdateWorkLog(updateWorkLogModel, farmId);

                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpDelete(APIRoutes.WorkLog.deleteWorkLog, Name = "DeleteWorkLog")]
        public async Task<IActionResult> DeleteWorkLog([FromRoute] int id)
        {
            try
            {
                var result = await _workLogService.DeleteWorkLog(id);

                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPost(APIRoutes.WorkLog.addNewWorkLog, Name = "AddNewWorkLog")]
        public async Task<IActionResult> AddNewWorkLog([FromBody] AddWorkLogModel addWorkLogModel, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _workLogService.AddNewWorkLog(addWorkLogModel, farmId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPut(APIRoutes.WorkLog.updateStatusOfWorkLog, Name = "UpdateStatusOfWorkLog")]
        public async Task<IActionResult> UpdateStatusOfWorkLog([FromBody] UpdateStatusWorkLogModel updateStatusWorkLogModel, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _workLogService.UpdateStatusWorkLog(updateStatusWorkLogModel, farmId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPut(APIRoutes.WorkLog.ReAssignTask, Name = "ReAssignTask")]
        public async Task<IActionResult> ReAssignTask([FromBody] ReAssignWorkLogModel reAssignWorkLogModel, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _workLogService.ReAssignEmployeeForWorkLog(reAssignWorkLogModel.WorkLogId, reAssignWorkLogModel.listEmployeeModel, farmId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPut(APIRoutes.WorkLog.ChangeEmployeeOfWorkLog, Name = "ChangeEmployeeOfWorkLog")]
        public async Task<IActionResult> ChangeEmployeeOfWorkLog([FromBody] ChangeEmployeeOfWorkLog changeEmployeeOfWorkLogs)
        {
            try
            {
                var result = await _workLogService.ChangeEmployeeOfWorkLog(changeEmployeeOfWorkLogs);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPut(APIRoutes.WorkLog.CanceledWorkLogByEmployee, Name = "CanceledWorkLogByEmployee")]
        public async Task<IActionResult> CanceledWorkLogByEmployee([FromBody] CancelledWorkLogModel cancelledWorkLogModel)
        {
            try
            {
                var result = await _workLogService.CanceledWorkLogByEmployee(cancelledWorkLogModel.WorkLogId, cancelledWorkLogModel.UserId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPut(APIRoutes.WorkLog.CheckAttendance, Name = "CheckAttendance")]
        public async Task<IActionResult> CheckAttendance([FromBody] CheckAttendanceModel checkAttendanceModel)
        {
            try
            {
                var result = await _workLogService.CheckAttendance(checkAttendanceModel);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
    }
}
