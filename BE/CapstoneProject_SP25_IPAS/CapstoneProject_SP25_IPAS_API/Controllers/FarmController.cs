using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FarmController : ControllerBase
    {
        private readonly IFarmService _farmService;
        private readonly IJwtTokenService _jwtTokenService;
        public FarmController(IFarmService farmService, IJwtTokenService jwtTokenService)
        {
            _farmService = farmService;
            _jwtTokenService = jwtTokenService;
        }
        //[HybridAuthorize("Admin,User", "Manager")]
        [HttpGet(APIRoutes.Farm.getFarmWithPagination, Name = "getAllFarmPaginationAsync")]
        public async Task<IActionResult> GetAllFarmWithPaginationAsync(PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _farmService.GetAllFarmPagination(paginationParameter);
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

        //[HybridAuthorize("Admin,User", "Manager")]
        [HttpGet(APIRoutes.Farm.getFarmById + "/{farm-id}", Name = "getFarmByIdAsync")]
        public async Task<IActionResult> GetFarmByIdAsync([FromRoute(Name = "farm-id")] int farmId)
        {
            try
            {

                var result = await _farmService.GetFarmByID(farmId);
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

        [HttpGet(APIRoutes.Farm.getAllFarmOfUser + "/{user-id}", Name = "getAllFarmOfUserAsync")]
        public async Task<IActionResult> GetAllFarmOfUserAsync([FromRoute(Name = "user-id")] int? userId)
        {
            try
            {
                if (userId == null)
                {
                    userId = _jwtTokenService.GetUserIdFromToken();
                }
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }
                var result = await _farmService.GetAllFarmOfUser(userId.Value);
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

        [HttpPost(APIRoutes.Farm.createFarm, Name = "createFarmAsync")]
        public async Task<IActionResult> CreateFarmAsync([FromBody] FarmCreateRequest farmCreateModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var userId = _jwtTokenService.GetUserIdFromToken();
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }
                var result = await _farmService.CreateFarm(farmCreateModel, userId.Value);
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

        [HttpPut(APIRoutes.Farm.updateFarmInfo, Name = "updateFarmInfoAsync")]
        public async Task<IActionResult> UpdateFarmInfoAsync([FromBody] FarmUpdateInfoRequest farmUpdateRequest)
        {
            try
            {
                if (!farmUpdateRequest.FarmId.HasValue)
                {
                    farmUpdateRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!ModelState.IsValid || !farmUpdateRequest.FarmId.HasValue)
                {
                    return BadRequest(ModelState);
                }
                var result = await _farmService.UpdateFarmInfo(farmUpdateRequest, farmId: farmUpdateRequest.FarmId!.Value);
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

        [HttpPut(APIRoutes.Farm.updateFarmCoordination, Name = "updateFarmCooridinationAsync")]
        public async Task<IActionResult> UpdateFarmCoorAsync([FromBody] UpdateFarmCoordinationRequest updateFarmCoordinationRequest)
        {
            try
            {
                if(!updateFarmCoordinationRequest.FarmId.HasValue)
                 updateFarmCoordinationRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                if (!ModelState.IsValid || !updateFarmCoordinationRequest.FarmId.HasValue)
                {
                    return BadRequest(ModelState);
                }
                var result = await _farmService.UpdateFarmCoordination(farmId: updateFarmCoordinationRequest.FarmId.Value, farmCoordinationUpdate: updateFarmCoordinationRequest.FarmUpdateModel);
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

        [HttpDelete(APIRoutes.Farm.softedDeleteFarm + "/{farm-id}", Name = "softedDeleteFarmAsync")]
        public async Task<IActionResult> SoftDeleteFarmAsync([FromRoute(Name = "farm-id")] int farmId)
        {
            try
            {
                var result = await _farmService.SoftDeletedFarm(farmId);
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

        [HttpDelete(APIRoutes.Farm.permanenlyDelete + "/{farm-id}", Name = "permananlyDeleteFarmAsync")]
        public async Task<IActionResult> DeleteFarm([FromRoute(Name = "farm-id")] int farmId)
        {
            try
            {
                var result = await _farmService.permanentlyDeleteFarm(farmId);
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

        [HttpPatch(APIRoutes.Farm.updateFarmLogo, Name = "updateFarmLogoAsync")]
        public async Task<IActionResult> UpdateFarmLogoAsync([FromForm] IFormFile farmLogo)
        {
            try
            {
                var farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!ModelState.IsValid || !farmId.HasValue)
                {
                    return BadRequest();
                }
                var result = await _farmService.UpdateFarmLogo(farmId: farmId.Value, LogoURL: farmLogo);
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
