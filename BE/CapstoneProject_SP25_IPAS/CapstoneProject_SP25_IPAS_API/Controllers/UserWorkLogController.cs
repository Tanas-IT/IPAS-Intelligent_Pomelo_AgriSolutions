using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserWorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
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
                if (!string.IsNullOrEmpty(checkConflictScheduleModel.StartTime))
                {
                    var normalizedStartTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(checkConflictScheduleModel.StartTime);
                    if (normalizedStartTime != null)
                    {
                        checkConflictScheduleModel.StartTime = normalizedStartTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid StartTime here
                        throw new InvalidOperationException("StartTime is invalid.");
                    }
                }

                // Validate and normalize EndTime
                if (!string.IsNullOrEmpty(checkConflictScheduleModel.EndTime))
                {
                    var normalizedEndTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(checkConflictScheduleModel.EndTime);
                    if (normalizedEndTime != null)
                    {
                        checkConflictScheduleModel.EndTime = normalizedEndTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid EndTime here
                        throw new InvalidOperationException("EndTime is invalid.");
                    }
                }
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
                if (!string.IsNullOrEmpty(checkConflictScheduleByStartDateAndEndDateModel.StartTime))
                {
                    var normalizedStartTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(checkConflictScheduleByStartDateAndEndDateModel.StartTime);
                    if (normalizedStartTime != null)
                    {
                        checkConflictScheduleByStartDateAndEndDateModel.StartTime = normalizedStartTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid StartTime here
                        throw new InvalidOperationException("StartTime is invalid.");
                    }
                }

                // Validate and normalize EndTime
                if (!string.IsNullOrEmpty(checkConflictScheduleByStartDateAndEndDateModel.EndTime))
                {
                    var normalizedEndTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(checkConflictScheduleByStartDateAndEndDateModel.EndTime);
                    if (normalizedEndTime != null)
                    {
                        checkConflictScheduleByStartDateAndEndDateModel.EndTime = normalizedEndTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid EndTime here
                        throw new InvalidOperationException("EndTime is invalid.");
                    }
                }
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
