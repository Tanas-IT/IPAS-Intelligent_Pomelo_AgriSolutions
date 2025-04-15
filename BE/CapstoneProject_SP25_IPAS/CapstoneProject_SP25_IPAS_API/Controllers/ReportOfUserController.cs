using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportOfUserRequest;
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
    public class ReportOfUserController : ControllerBase
    {
        private readonly IReportOfUserService _reportOfUserService;
        private readonly IJwtTokenService _jwtTokenService;
        public ReportOfUserController(IReportOfUserService reportOfUserService, IJwtTokenService jwtTokenService)
        {
            _reportOfUserService = reportOfUserService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpGet(APIRoutes.ReportOfUser.getAllReportOfUser, Name = "GetAllReportOfUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        public async Task<IActionResult> GetAllReportOfUser([FromQuery] GetAllReportOfUserModel getAllReportOfUserModel)
        {
            try
            {
                var result = await _reportOfUserService.GetAllReportOfCustomer(getAllReportOfUserModel);
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

        [HttpPost(APIRoutes.ReportOfUser.createReportOfUser, Name = "createReportOfUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        public async Task<IActionResult> CreateReportOfUser([FromForm] CreateReportOfUserModel createReportOfUserModel)
        {
            try
            {
                if(createReportOfUserModel.QuestionerID == null)
                {
                    createReportOfUserModel.QuestionerID = _jwtTokenService.GetUserIdFromToken();
                }
                var result = await _reportOfUserService.CreateReportOfCustomer(createReportOfUserModel);
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

        [HttpPut(APIRoutes.ReportOfUser.UpdateReportOfUser, Name = "updateReportOfUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)},{nameof(RoleEnum.USER)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        public async Task<IActionResult> UpdateReportOfUser([FromForm] UpdateReportOfUserModel updateReportOfUserModel)
        {
            try
            {
                var result = await _reportOfUserService.UpdateReportOfCustomer(updateReportOfUserModel);
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

        [HttpDelete(APIRoutes.ReportOfUser.DeleteReportOfUser, Name = "deleteReportOfUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}{nameof(RoleEnum.USER)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        public async Task<IActionResult> DeleteReportOfUser([FromBody] DeleteReportOfUserModel deleteReportOfUser)
        {
            try
            {
                var result = await _reportOfUserService.PermantlyDeleteReportOfCustomer(deleteReportOfUser);
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

        [HttpPost(APIRoutes.ReportOfUser.AssignTagToImageinReportOfUser, Name = "assignTagToImageinReportOfUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        public async Task<IActionResult> AssignTagToImageinReportOfUser([FromBody] AssignTagToImageModel assignTagToImageModel, [FromQuery] int? answererId)
        {
            try
            {
                if (answererId == null)
                {
                    answererId = _jwtTokenService.GetUserIdFromToken();
                }
                var result = await _reportOfUserService.AssignTagToImage(tagId: assignTagToImageModel.TagId, reportId: assignTagToImageModel.ReportId, answerId: answererId);
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

        [HttpGet(APIRoutes.ReportOfUser.getReportOfUser, Name = "getReportOfUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)},{nameof(RoleEnum.USER)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        public async Task<IActionResult> GetReportOfUser([FromQuery] GetAllReportOfUserModel getAllReportOfUserModel, int? userId)
        {
            try
            {
                if (userId == null)
                {
                    userId = _jwtTokenService.GetUserIdFromToken();
                }
                var result = await _reportOfUserService.GetReportOfUser(getAllReportOfUserModel, userId.Value);
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

        [HttpPost(APIRoutes.ReportOfUser.answerReportOfUser, Name = "answerReportOfUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        public async Task<IActionResult> AnswerReportOfUser([FromBody] AnswerReportModel answerReportModel, [FromQuery] int? answererId)
        {
            try
            {
                if (answererId == null)
                {
                    answererId = _jwtTokenService.GetUserIdFromToken();
                }
                var result = await _reportOfUserService.AnswerReport(answerReportModel, answererId);
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

        [HttpGet(APIRoutes.ReportOfUser.getAllReportOfUserWithPagin, Name = "getAllReportOfUserWithPagin")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)},{nameof(RoleEnum.USER)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        public async Task<IActionResult> GetAllReportOfUserWithPaginAsync([FromQuery] PaginationParameter paginationParameter, [FromQuery] FilterGetAllRepoterPagin filterGetAllRepoter)
        {
            try
            {
                var result = await _reportOfUserService.GetAllReportOfCustomerWithPagin(paginationParameter, filterGetAllRepoter);
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
