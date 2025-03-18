using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using CapstoneProject_SP25_IPAS_Service.Service;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GrowthStageRequest;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GrowthStageController : ControllerBase
    {
        private readonly IGrowthStageService _growthStageService;
        private readonly IJwtTokenService _jwtTokenService;

        public GrowthStageController(IGrowthStageService growthStageService, IJwtTokenService jwtTokenService)
        {
            _growthStageService = growthStageService;
            _jwtTokenService = jwtTokenService;
        }

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.GrowthStage.getGrowthStageWithPagination, Name = "getAllGrowthStagePaginationAsync")]
        public async Task<IActionResult> GetAllGrowthStage(PaginationParameter paginationParameter, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                if (farmId != null)
                {
                    var result = await _growthStageService.GetAllGrowthStagePagination(paginationParameter, farmId.Value);
                    return Ok(result);
                }
                var badRequest = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "FarmId is required"
                };
                return BadRequest(badRequest);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.GrowthStage.getGrowthStageById, Name = "getGrowthStageByIdAsync")]
        public async Task<IActionResult> GetGrowthStageById([FromRoute] int id)
        {
            try
            {
                var result = await _growthStageService.GetGrowthStageByID(id);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.GrowthStage.createGrowthStage, Name = "createGrowthStageAsync")]
        public async Task<IActionResult> CreateGrowthStage([FromBody] CreateGrowthStageModel createGrowthStageModel, int? farmId)
        {
            try
            {

                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue)
                {
                    var response = new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "FarmId is required",
                    };
                    return BadRequest(response);
                }
                var result = await _growthStageService.CreateGrowthStage(createGrowthStageModel, farmId.Value);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPut(APIRoutes.GrowthStage.updateGrowthStageInfo, Name = "updateGrowthStageAsync")]
        public async Task<IActionResult> UpdateGrowthStage([FromBody] UpdateGrowthStageModel updateGrowthStageModel)
        {
            try
            {
                if (!updateGrowthStageModel.FarmId.HasValue)
                    updateGrowthStageModel.FarmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var badRequest = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "FarmId is required"
                };
                var result = await _growthStageService.UpdateGrowthStageInfo(updateGrowthStageModel);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.GrowthStage.permanenlyDelete, Name = "permenlyDeleteGrowthStage")]
        public async Task<IActionResult> DeleteGrowthStage([FromRoute] int id)
        {
            try
            {
                var result = await _growthStageService.PermanentlyDeleteGrowthStage(id);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.GrowthStage.getGrowthStageByFarm, Name = "getGrowthStageByFarm")]
        public async Task<IActionResult> GetGrowthStageByFarmId([FromRoute(Name = "farm-id")] int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!farmId.HasValue)
                {
                    var response = new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "FarmId is required",
                    };
                    return BadRequest(response);
                }
                var result = await _growthStageService.GetGrowthStageByFarmId(farmId);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.GrowthStage.permentlyDeleteManyGrowthStage, Name = "deleteManyGrowthStage")]
        public async Task<IActionResult> DeleteManyGrowthStage([FromBody] List<int> growthStageId)
        {
            try
            {
                var result = await _growthStageService.PermanentlyDeleteManyGrowthStage(growthStageId);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPatch(APIRoutes.GrowthStage.softDeleteManyGrowthStage, Name = "SoftedDeleteManyGrowthStage")]
        public async Task<IActionResult> SoftedDeleteManyGrowthStage([FromBody] List<int> GrowthStageIds, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if(!farmId.HasValue)
                {
                    var response = new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "FarmId is required",
                    };
                    return BadRequest(response);
                }    
                var result = await _growthStageService.SoftedMultipleDelete(GrowthStageIds, farmId: farmId.Value);
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
