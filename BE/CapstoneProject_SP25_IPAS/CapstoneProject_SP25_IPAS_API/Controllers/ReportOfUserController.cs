using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportOfUserModels;
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
        public ReportOfUserController(IReportOfUserService reportOfUserService)
        {
            _reportOfUserService = reportOfUserService;
        }

        [HttpGet(APIRoutes.ReportOfUser.getAllReportOfUser, Name = "GetAllReportOfUser")]
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
        public async Task<IActionResult> CreateReportOfUser([FromForm] CreateReportOfUserModel createReportOfUserModel)
        {
            try
            {
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
    }
}
