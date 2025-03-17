using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantGrowthHistoryRequest;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlantGrowthHistoryController : ControllerBase
    {
        private readonly IPlantGrowthHistoryService _plantGrowthHistoryService;

        public PlantGrowthHistoryController(IPlantGrowthHistoryService plantGrowthHistoryService)
        {
            _plantGrowthHistoryService = plantGrowthHistoryService;
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPost(APIRoutes.PlantGrowthHistory.createPlantGrowthHistory, Name = "createPlantGrowthHistoryAsync")]
        public async Task<IActionResult> CreatePlantGrowthHistoryAsync([FromForm] CreatePlantGrowthHistoryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _plantGrowthHistoryService.createPlantGrowthHistory(request);
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
        [HttpPut(APIRoutes.PlantGrowthHistory.updatePlantGrowthHistoryInfo, Name = "updatePlantGrowthHistoryAsync")]
        public async Task<IActionResult> UpdatePlantGrowthHistoryAsync([FromBody] UpdatePlantGrowthHistoryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _plantGrowthHistoryService.updatePlantGrowthHistory(request);
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
        [HttpGet(APIRoutes.PlantGrowthHistory.getPlantGrowthHistoryById + "/{plant-growth-history-id}", Name = "getPlantGrowthByIdAsync")]
        public async Task<IActionResult> GetPlantGrowthByIdAsync([FromRoute(Name = "plant-growth-history-id")] int plantGrowthHistoryId)
        {
            try
            {
                var result = await _plantGrowthHistoryService.getPlantGrowthById(plantGrowthHistoryId);
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
        [HttpGet(APIRoutes.PlantGrowthHistory.getAllHistoryOfPlantById + "/{plant-id}", Name = "getAllHistoryOfPlantByIdAsync")]
        public async Task<IActionResult> GetAllHistoryOfPlantByIdAsync([FromRoute(Name = "plant-id")] int plantId)
        {
            try
            {
                var result = await _plantGrowthHistoryService.getAllHistoryOfPlantById(plantId);
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
        [HttpDelete(APIRoutes.PlantGrowthHistory.deletePlantGrowthHistory + "/{plant-growth-history-id}", Name = "deleteGrowthHistoryAsync")]
        public async Task<IActionResult> DeleteGrowthHistoryAsync([FromRoute(Name = "plant-growth-history-id")] int plantGrowthHistoryId)
        {
            try
            {
                var result = await _plantGrowthHistoryService.deleteGrowthHistory(plantGrowthHistoryId);
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
