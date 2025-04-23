using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserWorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ScheduleRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;

        public ScheduleController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpPut(APIRoutes.Schedule.updateTimeAndEmployee, Name = "updateTimeAndEmployee")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> UpdateTimeAndEmployeeAsync([FromBody] ChangeTimeAndEmployeeModel changeTimeAndEmployeeModel)
        {
            try
            {
                if (!string.IsNullOrEmpty(changeTimeAndEmployeeModel.StartTime))
                {
                    var normalizedStartTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(changeTimeAndEmployeeModel.StartTime);
                    if (normalizedStartTime != null)
                    {
                        changeTimeAndEmployeeModel.StartTime = normalizedStartTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid StartTime here
                        throw new InvalidOperationException("StartTime is invalid.");
                    }
                }

                // Validate and normalize EndTime
                if (!string.IsNullOrEmpty(changeTimeAndEmployeeModel.EndTime))
                {
                    var normalizedEndTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(changeTimeAndEmployeeModel.EndTime);
                    if (normalizedEndTime != null)
                    {
                        changeTimeAndEmployeeModel.EndTime = normalizedEndTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid EndTime here
                        throw new InvalidOperationException("EndTime is invalid.");
                    }
                }
                var result = await _scheduleService.UpdateTimeAndEmployee(changeTimeAndEmployeeModel);
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

        [HttpPut(APIRoutes.Schedule.changeTimeOfSchedule, Name = "changeTimeOfSchedule")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> ChangeTimeOfSchedule([FromBody] ChangeTimeOfScheduleModel changeTimeOfScheduleModel)
        {
            try
            {
                if (!string.IsNullOrEmpty(changeTimeOfScheduleModel.StartTime))
                {
                    var normalizedStartTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(changeTimeOfScheduleModel.StartTime);
                    if (normalizedStartTime != null)
                    {
                        changeTimeOfScheduleModel.StartTime = normalizedStartTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid StartTime here
                        throw new InvalidOperationException("StartTime is invalid.");
                    }
                }

                // Validate and normalize EndTime
                if (!string.IsNullOrEmpty(changeTimeOfScheduleModel.EndTime))
                {
                    var normalizedEndTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(changeTimeOfScheduleModel.EndTime);
                    if (normalizedEndTime != null)
                    {
                        changeTimeOfScheduleModel.EndTime = normalizedEndTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid EndTime here
                        throw new InvalidOperationException("EndTime is invalid.");
                    }
                }
                var result = await _scheduleService.ChangeTimeOfSchedule(changeTimeOfScheduleModel);
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
