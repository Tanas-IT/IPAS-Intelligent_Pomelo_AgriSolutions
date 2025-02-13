using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkLogController : ControllerBase
    {
        private readonly IWorkLogService _workLogService;

        public WorkLogController(IWorkLogService workLogService)
        {
            _workLogService = workLogService;
        }

        [HttpGet(APIRoutes.WorkLog.getCalendar, Name = "GetCalendar")]
        public async Task<IActionResult> GetCalendar(int userId, int planId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var paramCalendarModel = new ParamCalendarModel()
                {
                    UserId = userId,
                    PlanId = planId,
                    StartDate = startDate,
                    EndDate = endDate
                };
                var result = await _workLogService.GetCalendarEvents(paramCalendarModel);
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
    }
}
