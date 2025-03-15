using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;
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
    }
}
