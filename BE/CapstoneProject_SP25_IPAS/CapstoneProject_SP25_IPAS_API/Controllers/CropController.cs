using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
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

        [HttpGet(APIRoutes.Crop.getCropById + "/{crop-id}", Name = "getCropById")]
        public async Task<IActionResult> GetCropByIdAsync([FromRoute(Name = "crop-id")] int cropId)
        {
            try
            {
                var result = await _cropService.getCrop(cropId);
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

        [HttpGet(APIRoutes.Crop.getAllCropOfFarm , Name = "getAllCropsOfFarm")]
        public async Task<IActionResult> GetAllCropsOfFarmAsync([FromQuery] int? farmId, [FromQuery] PaginationParameter paginationParameter, [FromQuery] CropFilter cropFilter)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
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

        [HttpGet(APIRoutes.Crop.getAllCropOfLandPlotForSelect , Name = "getAllCropsOfLandPlotForSelect")]
        public async Task<IActionResult> GetAllCropsOfLandPlotForSelectAsync([FromQuery] int? landplotId, string? searchValue)
        {
            try
            {
                if (!landplotId.HasValue)
                {
                    landplotId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _cropService.getAllCropOfFarmForSelected(landplotId!.Value, searchValue);
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

        [HttpPost(APIRoutes.Crop.createCrop, Name = "createCrop")]
        public async Task<IActionResult> CreateCropAsync([FromBody] CropCreateRequest cropCreateRequest)
        {
            try
            {
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

        [HttpDelete(APIRoutes.Crop.deleteSoftedCrop + "/{crop-id}", Name = "softDeleteCrop")]
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
    }
}
