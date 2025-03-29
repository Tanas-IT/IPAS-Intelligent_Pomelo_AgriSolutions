using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
//using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest.ProductHarvestRequest;
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
    public class HarvestController : ControllerBase
    {
        private readonly IHarvestHistoryService _harvestHistoryService;
        private readonly IJwtTokenService _jwtTokenService;
        public HarvestController(IHarvestHistoryService harvestHistoryService, IJwtTokenService jwtTokenService)
        {
            _harvestHistoryService = harvestHistoryService;
            _jwtTokenService = jwtTokenService;
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Harvest.getAllHarvestPagin, Name = "getAllHarvestOfCrop")]
        public async Task<IActionResult> getAllHarvestOfCropAsync([FromQuery] int cropId, [FromQuery] PaginationParameter paginationParameter, [FromQuery] HarvestFilter harvestFilter)
        {
            try
            {
                var result = await _harvestHistoryService.getHarvestHistoryByCrop(cropId: cropId, paginationParameter: paginationParameter, filter: harvestFilter);
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
        [HttpGet(APIRoutes.Harvest.getPlantsHasHarvest, Name = "getDetailOfHarvest")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Harvest.getProductInHarvestForSelected, Name = "getProductForSelectedInHarvest")]
        public async Task<IActionResult> getProductForSelectedInHarvest([FromQuery] int harvestId)
        {

            var result = await _harvestHistoryService.getProductInHarvestForSelected(harvestId);
            return Ok(result);

        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Harvest.getHarvestByCode + "/{harvest-code}", Name = "getHarvestByCode")]
        public async Task<IActionResult> getHarvestByCode([FromRoute(Name = "harvest-code")] string harvestCode)
        {

            var result = await _harvestHistoryService.getHarvestByCode(harvestCode);
            return Ok(result);

        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.Harvest.createHarvest, Name = "createHarvest")]
        public async Task<IActionResult> CreateHarvestAsync([FromBody] CreateHarvestHistoryRequest harvestCreateRequest)
        {
            var result = await _harvestHistoryService.createHarvestHistory(harvestCreateRequest);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.Harvest.createProductHarvestHistory, Name = "createProductHarvestHistory")]
        public async Task<IActionResult> createProductHarvestHistory([FromBody] CreateHarvestTypeHistoryRequest harvestTypeCreateRequest)
        {
            //try
            //{
            var result = await _harvestHistoryService.createProductHarvestHistory(harvestTypeCreateRequest);
            return Ok(result);
            //}
            //catch (Exception ex)
            //{
            //    var response = new BaseResponse()
            //    {
            //        StatusCode = StatusCodes.Status400BadRequest,
            //        Message = ex.Message
            //    };
            //    return BadRequest(response);
            //}
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPost(APIRoutes.Harvest.createPlantRecordHarvest, Name = "createPlantRecordHarvest")]
        public async Task<IActionResult> createPlantRecordHarvest([FromBody] CreatePlantRecordHarvestRequest request)
        {
            var result = await _harvestHistoryService.createPlantRecordHarvest(request);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPut(APIRoutes.Harvest.updateHarvestInfo, Name = "updateHarvestAsync")]
        public async Task<IActionResult> UpdateHarvestAsync([FromBody] UpdateHarvestHistoryRequest harvestUpdateRequest)
        {
            var result = await _harvestHistoryService.updateHarvestHistoryInfo(harvestUpdateRequest);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPut(APIRoutes.Harvest.updateProductHarvestInfo, Name = "updateHarvestTypeInfo")]
        public async Task<IActionResult> updateHarvestTypeInfo([FromBody] UpdateProductHarvesRequest harvestTypeUpdateRequest)
        {
            //try
            //{
            var result = await _harvestHistoryService.updateProductHarvest(harvestTypeUpdateRequest);
            return Ok(result);
            //}
            //catch (Exception ex)
            //{
            //    var response = new BaseResponse()
            //    {
            //        StatusCode = StatusCodes.Status400BadRequest,
            //        Message = ex.Message
            //    };
            //    return BadRequest(response);
            //}
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.Harvest.deletePermanentlyHarvest + "/{harvest-id}", Name = "deletePermanentlyHarvest")]
        public async Task<IActionResult> deletePermanentlyHarvest([FromRoute(Name = "harvest-id")] int harvestId)
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.Harvest.deleteProductHarvest, Name = "deleteProductHarvest")]
        public async Task<IActionResult> deleteProductHarvestAsync([FromQuery] int harvestId, int masterTypeId)
        {
            try
            {
                var result = await _harvestHistoryService.deleteProductHarvest(harvestId, masterTypeId);
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
        [HttpDelete(APIRoutes.Harvest.deletePlantRecord, Name = "deletePlantRecord")]
        public async Task<IActionResult> deletePlantRecordAsync(DeletePlantRecoredRequest request)
        {
            try
            {
                var result = await _harvestHistoryService.deletePlantRecord(request);
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
        [HttpGet(APIRoutes.Harvest.getHarvestForSelectedByPlotId + "/{crop-id}", Name = "getHarvestForSelectedByPlotId")]
        public async Task<IActionResult> getHarvestForSelected([FromRoute(Name = "crop-id")] int cropId)
        {
            try
            {
                var result = await _harvestHistoryService.getHarvestForSelectedByPlotId(cropId);
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
        [HttpGet(APIRoutes.Harvest.statisticOfPlantByYear, Name = "statisticOfPlantByYear")]
        public async Task<IActionResult> statisticOfPlantByYear([FromQuery] GetStatictisOfPlantByYearRequest request)
        {
            var result = await _harvestHistoryService.StatisticOfPlantByYear(request);
            return Ok(result);
        }

        [HttpGet(APIRoutes.Harvest.statisticOfTopByYear, Name = "statisticOfTopByYear")]
        public async Task<IActionResult> statisticOfTopByYear([FromQuery] GetTopStatisticByYearRequest request)
        {
            if (!request.farmId.HasValue)
                request.farmId = _jwtTokenService.GetFarmIdFromToken();
            if (!request.farmId.HasValue)
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Farm is required"
                });
            var result = await _harvestHistoryService.GetTopPlantsByYear(request);
            return Ok(result);
        }

        [HttpGet(APIRoutes.Harvest.statisticOfTopByCrop, Name = "statisticOfTopByCrop")]
        public async Task<IActionResult> statisticOfTopByCrop([FromQuery] GetTopStatisticByCropRequest request)
        {
            if (!request.farmId.HasValue)
                request.farmId = _jwtTokenService.GetFarmIdFromToken();
            if (!request.farmId.HasValue)
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Farm is required"
                });
            var result = await _harvestHistoryService.GetTopPlantsByCrop(request);
            return Ok(result);
        }
    }
}
