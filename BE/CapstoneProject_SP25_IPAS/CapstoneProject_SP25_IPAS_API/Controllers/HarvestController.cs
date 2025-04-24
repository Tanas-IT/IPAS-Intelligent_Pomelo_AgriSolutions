using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
//using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest.ProductHarvestRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using FluentValidation;
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
        private readonly IValidator<IFormFile> _fileValidator;

        public HarvestController(IHarvestHistoryService harvestHistoryService, IJwtTokenService jwtTokenService, IValidator<IFormFile> fileValidator)
        {
            _harvestHistoryService = harvestHistoryService;
            _jwtTokenService = jwtTokenService;
            _fileValidator = fileValidator;
        }

        [HttpGet(APIRoutes.Harvest.getHarvestById + "/{harvest-id}", Name = "getHarvestById")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> CreateHarvestAsync([FromBody] CreateHarvestHistoryRequest harvestCreateRequest)
        {
            var result = await _harvestHistoryService.createHarvestHistory(harvestCreateRequest);
            return Ok(result);
        }

        [HttpPost(APIRoutes.Harvest.createProductHarvestHistory, Name = "createProductHarvestHistory")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpPost(APIRoutes.Harvest.createPlantRecordHarvest, Name = "createPlantRecordHarvest")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> createPlantRecordHarvest([FromBody] CreatePlantRecordHarvestRequest request)
        {
            if (!request.UserId.HasValue)
                request.UserId = _jwtTokenService.GetUserIdFromToken();
            if (!request.UserId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "User Id is required"
                });
            }
            var result = await _harvestHistoryService.createPlantRecordHarvest(request);
            return Ok(result);
        }

        [HttpPut(APIRoutes.Harvest.updateHarvestInfo, Name = "updateHarvestAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> UpdateHarvestAsync([FromBody] UpdateHarvestHistoryRequest harvestUpdateRequest)
        {

            if (!string.IsNullOrEmpty(harvestUpdateRequest.StartTime))
            {
                var normalizedStartTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(harvestUpdateRequest.StartTime);
                if (normalizedStartTime != null)
                {
                    harvestUpdateRequest.StartTime = normalizedStartTime; // Gán giá trị chuẩn hóa lại
                }
                else
                {
                    // Handle invalid StartTime here
                    throw new InvalidOperationException("StartTime is invalid.");
                }
            }

            // Validate and normalize EndTime
            if (!string.IsNullOrEmpty(harvestUpdateRequest.EndTime))
            {
                var normalizedEndTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(harvestUpdateRequest.EndTime);
                if (normalizedEndTime != null)
                {
                    harvestUpdateRequest.EndTime = normalizedEndTime; // Gán giá trị chuẩn hóa lại
                }
                else
                {
                    // Handle invalid EndTime here
                    throw new InvalidOperationException("EndTime is invalid.");
                }
            }

            var result = await _harvestHistoryService.updateHarvestHistoryInfo(harvestUpdateRequest);
            return Ok(result);
        }

        [HttpPut(APIRoutes.Harvest.updateProductHarvestInfo, Name = "updateHarvestTypeInfo")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> updateHarvestTypeInfo([FromBody] UpdateProductHarvesRequest harvestTypeUpdateRequest)
        {
            //try
            //{
            if (!harvestTypeUpdateRequest.UserId.HasValue)
                harvestTypeUpdateRequest.UserId = _jwtTokenService.GetUserIdFromToken();
            if (!harvestTypeUpdateRequest.UserId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "User Id is required"
                });
            }
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

        [HttpDelete(APIRoutes.Harvest.deletePermanentlyHarvest + "/{harvest-id}", Name = "deletePermanentlyHarvest")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpPut(APIRoutes.Harvest.SoftedDeletedHarvestHistory, Name = "SoftedDeletedHarvestHistory")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> SoftedDeletedHarvestHistory([FromQuery] List<int> harvestIds)
        {
            var result = await _harvestHistoryService.SoftedDeleted(harvestIds);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.Harvest.deleteProductHarvest, Name = "deleteProductHarvest")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpDelete(APIRoutes.Harvest.deletePlantRecord, Name = "deletePlantRecord")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},,{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> deletePlantRecordAsync(DeletePlantRecoredRequest request)
        {
            try
            {
                if (!request.UserId.HasValue)
                    request.UserId = _jwtTokenService.GetUserIdFromToken();
                if (!request.UserId.HasValue)
                {
                    return BadRequest(new BusinessResult
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "User Id is required"
                    });
                }
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

        [HttpGet(APIRoutes.Harvest.getHarvestForSelectedByPlotId + "/{crop-id}", Name = "getHarvestForSelectedByPlotId")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.Harvest.statisticOfPlantByYear, Name = "statisticOfPlantByYear")]
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> statisticOfPlantByYear([FromQuery] GetStatictisOfPlantByYearRequest request)
        {
            var result = await _harvestHistoryService.StatisticOfPlantByYear(request);
            return Ok(result);
        }

        [HttpGet(APIRoutes.Harvest.statisticOfTopByYear, Name = "statisticOfTopByYear")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.Harvest.getPlantHarvestRecord, Name = "getPlantHarvestRecord")]
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getPlantHarvestRecord([FromQuery] int plantId, [FromQuery] PaginationParameter paginationParameter, [FromQuery] PlantHarvestFilter harvestFilter)
        {
            try
            {
                var result = await _harvestHistoryService.getHarvestHistoryByPlant(plantId: plantId, paginationParameter: paginationParameter, filter: harvestFilter);
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

        [HttpGet(APIRoutes.Harvest.getHarvestSelectedToPlantRecord, Name = "getHarvestSelectedToPlantRecord")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getHarvestSelectedToPlantRecord([FromQuery] GetHarvestForPlantRecordRequest request)
        {
            try
            {
                var result = await _harvestHistoryService.getHarvestPlantCanRecord(request);
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

        [HttpPost(APIRoutes.Harvest.importPlantFromExcel)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> ImportPlantFromExcel([FromForm] ImportHarvestExcelRequest request)
        {
            try
            {
                if (!request.userId.HasValue)
                    request.userId = _jwtTokenService.GetUserIdFromToken();
                var validationResult = await _fileValidator.ValidateAsync(request.fileExcel);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        IsSuccess = false,
                        Message = validationResult.ToProblemDetails().Errors.ToString()
                    });
                }
                if (!request.userId.HasValue)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        IsSuccess = false,
                        Message = "User Id is require"
                    });
                }
                var result = await _harvestHistoryService.ImportPlantRecordAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            }
        }


        [HttpGet(APIRoutes.Harvest.exportCSV)]
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> ExportHarvestRecord([FromQuery] int harvestId)
        {
            var result = await _harvestHistoryService.ExportHarvestRecord(harvestId);

            if (result.Data is ExportFileResult file && file.FileBytes?.Length > 0)
            {
                return File(file.FileBytes, file.ContentType, file.FileName);
            }

            return NotFound(result.Message);
        }
    }
}
