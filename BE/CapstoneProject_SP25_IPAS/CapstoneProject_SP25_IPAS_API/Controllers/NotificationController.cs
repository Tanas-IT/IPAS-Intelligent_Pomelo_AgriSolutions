using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.NotifcationModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IJwtTokenService _jwtTokenService;

        public NotificationController(INotificationService notificationService, IJwtTokenService jwtTokenService)
        {
            _notificationService = notificationService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost(APIRoutes.Notification.createNotification, Name = "createNotification")]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationModel createNotificationModel, int? farmId)
        {
            try
            {
                if(!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _notificationService.CreateNotification(createNotificationModel, farmId.Value);
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

        [HttpGet(APIRoutes.Notification.getNotificationByUserId, Name = "getNotificationByUserId")]
        public async Task<IActionResult> GetNotificationByUserId(int? userId, bool isRead)
        {
            try
            {
                if (!userId.HasValue)
                {
                    userId = _jwtTokenService.GetUserIdFromToken();
                }
                var result = await _notificationService.GetNotificationByUserId(userId.Value, isRead);
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


        [HttpPost(APIRoutes.Notification.markNotificationIsRead, Name = "markNotificationIsRead")]
        public async Task<IActionResult> MarkNotificationIsRead([FromBody] MarkNotificationIsReadModel markNotificationIsReadModel)
        {
            try
            {
                var result = await _notificationService.MarkisRead(markNotificationIsReadModel.listNotification);
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
