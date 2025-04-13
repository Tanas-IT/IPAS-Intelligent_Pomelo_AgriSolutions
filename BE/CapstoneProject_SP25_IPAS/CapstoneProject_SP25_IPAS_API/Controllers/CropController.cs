using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CropRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CropController : ControllerBase
    {
        private readonly ICropService _cropService;
        private readonly IJwtTokenService _jwtTokenService;

        public CropController(ICropService cropService, IJwtTokenService jwtTokenService)
        {
            _cropService = cropService;
            _jwtTokenService = jwtTokenService;
        }

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Crop.getCropById + "/{crop-id}", Name = "getCropById")]
        public async Task<IActionResult> GetCropByIdAsync([FromRoute(Name = "crop-id")] int cropId)
        {
            try
            {
                var result = await _cropService.getCropById(cropId);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Crop.getAllCropOfFarm, Name = "getAllCropsOfFarm")]
        public async Task<IActionResult> GetAllCropsOfFarmAsync([FromQuery] int? farmId, [FromQuery] PaginationParameter paginationParameter, [FromQuery] CropFilter cropFilter)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!farmId.HasValue)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Farm id has required",
                    });
                }
                var result = await _cropService.getAllCropOfFarm(farmId!.Value, paginationParameter, cropFilter);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Crop.getAllCropOfLandPlot, Name = "getAllCropsOfLandPlot")]
        public async Task<IActionResult> GetAllCropsOfLandPlotAsync([FromQuery] int? landPlotId, [FromQuery] PaginationParameter paginationParameter, [FromQuery] CropFilter cropFilter)
        {
            try
            {
                var result = await _cropService.getAllCropOfLandPlot(landPlotId!.Value, paginationParameter, cropFilter);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpGet(APIRoutes.Crop.getAllCropOfLandPlotForSelect, Name = "getAllCropsOfLandPlotForSelect")]
        public async Task<IActionResult> GetAllCropsOfLandPlotForSelectAsync([FromQuery] int? landplotId, string? searchValue)
        {
            try
            {
                //if (!landplotId.HasValue)
                //{
                //    landplotId = _jwtTokenService.GetFarmIdFromToken();
                //}
                var result = await _cropService.getAllCropOfPlotForSelected(landplotId!.Value, searchValue);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpGet(APIRoutes.Crop.getAllCropOfFarmSelected, Name = "getAllCropOfFarmSelected")]
        public async Task<IActionResult> getAllCropOfFarmSelected([FromQuery] int? farmId)
        {
            if (!farmId.HasValue)
            {
                farmId = _jwtTokenService.GetFarmIdFromToken();
            }
            if (!farmId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    Data = StatusCodes.Status400BadRequest,
                    Message = "Farm is required"
                });
            }

            var result = await _cropService.GetCropsOfFarmForSelected(farmId!.Value);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.Crop.createCrop, Name = "createCrop")]
        public async Task<IActionResult> CreateCropAsync([FromBody] CropCreateRequest cropCreateRequest)
        {
            try
            {
                if (!cropCreateRequest.FarmId.HasValue)
                {
                    cropCreateRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!cropCreateRequest.FarmId.HasValue)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Farm id has required",
                    });
                }
                var result = await _cropService.createCrop(cropCreateRequest);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPut(APIRoutes.Crop.updateCropInfo, Name = "updateCrop")]
        public async Task<IActionResult> UpdateCropAsync([FromBody] CropUpdateInfoRequest cropUpdateRequest)
        {
            try
            {
                var result = await _cropService.updateCrop(cropUpdateRequest);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPatch(APIRoutes.Crop.deleteSoftedCrop + "/{crop-id}", Name = "softDeleteCrop")]
        public async Task<IActionResult> SoftDeleteCropAsync([FromRoute(Name = "crop-id")] int cropId)
        {
            try
            {
                var result = await _cropService.softedDeleteCrop(cropId);
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
        [HttpDelete(APIRoutes.Crop.deletePanentlyCrop + "/{crop-id}", Name = "permanentDeleteCrop")]
        public async Task<IActionResult> PermanentDeleteCropAsync([FromRoute(Name = "crop-id")] int cropId)
        {
            try
            {
                var result = await _cropService.permanentlyDeleteCrop(cropId);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Crop.getCropInCurrentTime, Name = "getCropInCurrentTime")]
        public async Task<IActionResult> GetCropInCurrentTimeAsync(int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue)
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Farm is required"
                    });
                var result = await _cropService.GetCropInCurrentTime(farmId.Value);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Crop.getLandPlotOfCrop, Name = "getLandPlotOfCrop")]
        public async Task<IActionResult> GetLandPlotOfCropAsync([FromRoute] int cropId)
        {
            try
            {
                var result = await _cropService.GetLandPlotsOfCrop(cropId);
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

        [HttpGet(APIRoutes.Crop.exportCSV)]
        public async Task<IActionResult> ExportCriteriaObject([FromQuery] int? farmId)
        {
            if (!farmId.HasValue)
                farmId = _jwtTokenService.GetFarmIdFromToken();

            if (!farmId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Farm Id is required"
                });
            }

            var result = await _cropService.ExportCrop(farmId.Value);

            if (result.StatusCode != 200 || result.Data == null)
            {
                return Ok(result);
            }

            var fileResult = result.Data as ExportFileResult;
            if (fileResult?.FileBytes == null || fileResult.FileBytes.Length == 0)
            {
                return NotFound("No data found to export.");
            }

            return File(fileResult.FileBytes, fileResult.ContentType, fileResult.FileName);
        }
    }
}
