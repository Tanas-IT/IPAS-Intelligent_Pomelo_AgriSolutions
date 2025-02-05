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
using Microsoft.AspNetCore.Authorization;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FarmController : ControllerBase
    {
        private readonly IFarmService _farmService;

        public FarmController(IFarmService farmService)
        {
            _farmService = farmService;
        }
        [HybridAuthorize("Admin,User", "Manager")]
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

        [HybridAuthorize("Admin,User", "Manager")]
        [HttpGet(APIRoutes.Farm.getFarmById, Name = "getFarmByIdAsync")]
        public async Task<IActionResult> GetFarmByIdAsync([FromQuery(Name = "farmId")] int farmId)
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

        //[Authorize(Roles = "User")]
        [HttpGet(APIRoutes.Farm.getAllFarmOfUser, Name = "getAllFarmOfUserAsync")]
        public async Task<IActionResult> GetAllFarmOfUserAsync([FromQuery] int userId)
        {
            try
            {
                var result = await _farmService.GetAllFarmOfUser(userId);
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

                var result = await _farmService.CreateFarm(farmCreateModel);
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
        public async Task<IActionResult> UpdateFarmInfoAsync([FromBody] FarmUpdateRequest farmUpdateModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _farmService.UpdateFarmInfo(farmUpdateModel);
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
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _farmService.UpdateFarmCoordination(farmId: updateFarmCoordinationRequest.FarmId, farmCoordinationUpdate: updateFarmCoordinationRequest.FarmUpdateModel);
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

        [HttpDelete(APIRoutes.Farm.softedDeleteFarm, Name = "softedDeleteFarmAsync")]
        public async Task<IActionResult> SoftDeleteFarmAsync([FromQuery(Name = "farmId")] int farmId)
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

        [HttpDelete(APIRoutes.Farm.permanenlyDelete, Name = "permananlyDeleteFarmAsync")]
        public async Task<IActionResult> DeleteFarm([FromQuery] int farmId)
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
        public async Task<IActionResult> UpdateFarmLogoAsync([FromForm] int farmId, IFormFile farmLogo)
        {
            try
            {
                var result = await _farmService.UpdateFarmLogo(farmId: farmId, LogoURL: farmLogo);
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
