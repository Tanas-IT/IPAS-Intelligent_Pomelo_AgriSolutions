using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GrowthStageController : ControllerBase
    {
        private readonly IGrowthStageService _growthStageService;

        public GrowthStageController(IGrowthStageService growthStageService)
        {
            _growthStageService = growthStageService;
        }

        [HttpGet(APIRoutes.GrowthStage.getGrowthStageWithPagination, Name = "getAllGrowthStagePaginationAsync")]
        public async Task<IActionResult> GetAllGrowthStage(PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _growthStageService.GetAllGrowthStagePagination(paginationParameter);
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

        [HttpPost(APIRoutes.GrowthStage.createGrowthStage, Name = "createGrowthStageAsync")]
        public async Task<IActionResult> CreateGrowthStage([FromBody] CreateGrowthStageModel createGrowthStageModel)
        {
            try
            {
                var result = await _growthStageService.CreateGrowthStage(createGrowthStageModel);
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

        [HttpPut(APIRoutes.GrowthStage.updateGrowthStageInfo, Name = "updateGrowthStageAsync")]
        public async Task<IActionResult> UpdateGrowthStage([FromBody] UpdateGrowthStageModel updateGrowthStageModel)
        {
            try
            {
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
    }
}
