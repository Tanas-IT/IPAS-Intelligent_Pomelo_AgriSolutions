using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserWorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserWorkLogController : ControllerBase
    {
        private readonly IUserWorkLogService _userWorkLogService;

        public UserWorkLogController(IUserWorkLogService userWorkLogService)
        {
            _userWorkLogService = userWorkLogService;
        }

        [HttpPost(APIRoutes.UserWorkLog.CheckConflict, Name = "CheckConflict")]
        public async Task<IActionResult> CheckConflictSchedule([FromBody] CheckConflictScheduleModel checkConflictScheduleModel)
        {
            try
            {
                var result = await _userWorkLogService.CheckUserConflictSchedule(checkConflictScheduleModel);
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

        [HttpPost(APIRoutes.UserWorkLog.CheckConflictByStartDateAndEndDate, Name = "CheckConflictByStartDateAndEndDate")]
        public async Task<IActionResult> CheckConflictSchedule([FromBody] CheckConflictScheduleByStartDateAndEndDateModel checkConflictScheduleByStartDateAndEndDateModel)
        {
            try
            {
                var result = await _userWorkLogService.CheckUserConflictByStartDateAndEndDate(checkConflictScheduleByStartDateAndEndDateModel);
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
