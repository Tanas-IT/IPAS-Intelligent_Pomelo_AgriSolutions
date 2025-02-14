using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HarvestController : ControllerBase
    {
        private readonly IHarvestHistoryService _harvestHistoryService;

        public HarvestController(IHarvestHistoryService harvestHistoryService)
        {
            _harvestHistoryService = harvestHistoryService;
        }

        [HttpGet(APIRoutes.Harvest.getHarvestById + "/{harvest-id}", Name = "getHarvestById")]
        public async Task<IActionResult> GetCropByIdAsync([FromRoute(Name = "harvest-id")] int harvestId)
        {
            try
            {
                var result = await _harvestHistoryService.getHarvestById(harvestId);
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

        [HttpGet(APIRoutes.Harvest.getAllHarvestPagin, Name = "getAllHarvestOfCrop")]
        public async Task<IActionResult> GetAllCropsOfFarmAsync([FromQuery] int cropId, [FromQuery] PaginationParameter paginationParameter, [FromQuery] HarvestFilter harvestFilter)
        {
            try
            {
                var result = await _harvestHistoryService.getHarvestHistoryByCrop(cropId: cropId, paginationParameter:paginationParameter, filter: harvestFilter);
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

        [HttpGet(APIRoutes.Harvest.getPlantsHasHarvest , Name = "getDetailOfHarvest")]
        public async Task<IActionResult> GetDetailOfHarvestAsync([FromQuery] int harvestId, int masterTypeId)
        {
            try
            {
                var result = await _harvestHistoryService.getAllHistoryPlantOfHarvest(harvestId, masterTypeId);
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

        [HttpPost(APIRoutes.Harvest.createHarvest, Name = "createHarvest")]
        public async Task<IActionResult> CreateHarvestAsync([FromBody] CreateHarvestHistoryRequest harvestCreateRequest)
        {
            try
            {
                var result = await _harvestHistoryService.createHarvestHistory(harvestCreateRequest);
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

        [HttpPost(APIRoutes.Harvest.createHarvesTypeHistory, Name = "createHarvesTypeHistory")]
        public async Task<IActionResult> createHarvesTypeHistory([FromBody] CreateHarvestTypeHistoryRequest harvestTypeCreateRequest)
        {
            try
            {
                var result = await _harvestHistoryService.createHarvesTypeHistory(harvestTypeCreateRequest);
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

        [HttpPut(APIRoutes.Harvest.updateHarvestInfo, Name = "updateHarvestAsync")]
        public async Task<IActionResult> UpdateHarvestAsync([FromBody] UpdateHarvestHistoryRequest harvestUpdateRequest)
        {
            try
            {
                var result = await _harvestHistoryService.updateHarvestHistoryInfo(harvestUpdateRequest);
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

        [HttpPut(APIRoutes.Harvest.updateHarvestTypeInfo, Name = "updateHarvestTypeInfo")]
        public async Task<IActionResult> updateHarvestTypeInfo([FromBody] UpdateHarvesTypeHistoryRequest harvestTypeUpdateRequest)
        {
            try
            {
                var result = await _harvestHistoryService.updateHarvesTypeHistory(harvestTypeUpdateRequest);
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

        [HttpDelete(APIRoutes.Harvest.deletePermanentlyHarvest + "/{harvest-id}", Name = "deletePermanentlyHarvest")]
        public async Task<IActionResult> SoftDeleteHarvestAsync([FromRoute(Name = "harvest-id")] int harvestId)
        {
            try
            {
                var result = await _harvestHistoryService.deleteHarvestHistory(harvestId);
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

        [HttpDelete(APIRoutes.Harvest.deleteHarvestType, Name = "deleteHarvestType")]
        public async Task<IActionResult> deleteHarvestTypeAsync([FromQuery] int harvestId, int masterTypeId, int? plantId)
        {
            try
            {
                var result = await _harvestHistoryService.deleteHarvestType(harvestId,masterTypeId, plantId);
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
