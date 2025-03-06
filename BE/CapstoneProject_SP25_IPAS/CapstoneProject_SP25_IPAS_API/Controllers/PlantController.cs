using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using FluentValidation;
using CapstoneProject_SP25_IPAS_Service.Service;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlantController : ControllerBase
    {

        private readonly IPlantService _plantService;
        private readonly IValidator<IFormFile> _fileValidator;
        private readonly IJwtTokenService _jwtTokenService;
        public PlantController(IPlantService plantService, IValidator<IFormFile> fileValidator, IJwtTokenService jwtTokenService)
        {
            _plantService = plantService;
            _fileValidator = fileValidator;
            _jwtTokenService = jwtTokenService;
        }

        /// <summary>
        /// Lấy thông tin cây theo ID
        /// </summary>
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)}", $"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Plant.getPlantById + "/{plant-id}", Name = "GetPlantById")]
        public async Task<IActionResult> GetPlantById([FromRoute(Name = "plant-id")] int plantId)
        {
            try
            {
                var result = await _plantService.getById(plantId);
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

        /// <summary>
        /// Lấy tất cả cây của một mảnh đất có phân trang
        /// </summary>
        [HttpGet(APIRoutes.Plant.getPlantPagin)]
        public async Task<IActionResult> GetPlantPagin([FromQuery] GetPlantPaginRequest request, PaginationParameter paginationParameter)
        {
            try
            {
                if (!request.farmId.HasValue)
                    request.farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!ModelState.IsValid || !request.farmId.HasValue)
                {
                    return BadRequest(new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Farm Id value is required",
                    });
                }
                var result = await _plantService.getPlantPagin(request, paginationParameter: paginationParameter);
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

        /// <summary>
        /// Lấy tất cả cây của một trang trại có phân trang
        /// </summary>
        //[HttpGet(APIRoutes.Plant.getPlantOfFarm + "/{farm-id}")]
        //public async Task<IActionResult> GetAllPlantsOfFarm([FromRoute(Name = "farm-id")] int farmId, [FromQuery] PaginationParameter paginationParameter)
        //{
        //    try
        //    {
        //        var result = await _plantService.getAllPlantOfFarm(farmId, paginationParameter);
        //        return Ok(result);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new BaseResponse
        //        {
        //            StatusCode = StatusCodes.Status400BadRequest,
        //            Message = ex.Message
        //        });
        //    }
        //}

        /// <summary>
        /// Tạo mới một cây trồng
        /// </summary>
        [HttpPost(APIRoutes.Plant.createPlant)]
        public async Task<IActionResult> CreatePlant([FromForm] PlantCreateRequest plantCreateRequest)
        {
            try
            {
                if(!plantCreateRequest.FarmId.HasValue)
                    plantCreateRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                if (!ModelState.IsValid && !plantCreateRequest.FarmId.HasValue)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = errors.ToString(),

                    });
                }
                var result = await _plantService.createPlant(plantCreateRequest);
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

        /// <summary>
        /// Cập nhật thông tin cây trồng
        /// </summary>
        [HttpPut(APIRoutes.Plant.updatePlantInfo)]
        public async Task<IActionResult> UpdatePlant([FromBody] PlantUpdateRequest plantUpdateRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = errors.ToString(),

                    });
                }
                var result = await _plantService.updatePlant(plantUpdateRequest);
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

        /// <summary>
        /// Xóa cây trồng theo ID
        /// </summary>
        [HttpDelete(APIRoutes.Plant.deletePlant + "/{plant-id}")]
        public async Task<IActionResult> DeletePlant([FromRoute(Name = "plant-id")] int plantId)
        {
            try
            {
                var result = await _plantService.deletePlant(plantId);
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

        /// <summary>
        /// Xóa nhiều cây trồng cùng lúc
        /// </summary>
        [HttpDelete(APIRoutes.Plant.deleteMultiplePlant)]
        public async Task<IActionResult> DeleteMultiplePlants([FromBody] List<int> plantIds)
        {
            try
            {
                var result = await _plantService.deleteMultiplePlant(plantIds);
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

        [HttpPost(APIRoutes.Plant.importPlantFromExcel)]
        public async Task<IActionResult> ImportPlantFromExcel([FromForm] ImportExcelRequest request)
        {
            try
            {
                if (!request.FarmId.HasValue)
                    request.FarmId = _jwtTokenService.GetFarmIdFromToken();
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
                if (!request.FarmId.HasValue)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        IsSuccess = false,
                        Message = "Farm Id is require"
                    });
                }
                var result = await _plantService.ImportPlantAsync(request);
                return Ok(result);
            } catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy tất cả cây của một thửa
        /// </summary>
        [HttpGet(APIRoutes.Plant.getForSelectedForPlot + "/{plot-id}")]
        public async Task<IActionResult> GetForSelectedForPlot([FromRoute(Name = "plot-id")] int plotId)
        {
            try
            {
                var result = await _plantService.getPlantInPlotForSelected(plotId);
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

        /// <summary>
        /// Lấy tất cả cây của một hàng
        /// </summary>
        [HttpGet(APIRoutes.Plant.getForSelectedForRow + "/{row-id}")]
        public async Task<IActionResult> GetForSelectedForRow([FromRoute(Name = "row-id")] int plotId)
        {
            try
            {
                var result = await _plantService.getPlantInRowForSelected(plotId);
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

        [HttpPatch(APIRoutes.Plant.softDeletePlant, Name = "SoftedDeletePlant")]
        public async Task<IActionResult> SoftedDeletePlant([FromBody] List<int> plantIds)
        {
            try
            {
                var result = await _plantService.SoftedMultipleDelete(plantIds);
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

        [HttpGet(APIRoutes.Plant.getPlantNotLocate )]
        public async Task<IActionResult> GetForSelectedForRow([FromQuery(Name = "farmId")] int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        IsSuccess = false,
                        Message = "Farm Id is require"
                    });
                }
                var result = await _plantService.getPlantNotYetPlanting(farmId.Value);
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

        [HttpGet(APIRoutes.Plant.getPlantByGrowthFunc)]
        public async Task<IActionResult> getPlantByGrowthFunc([FromQuery(Name = "farmId")] int? farmId, string activeFunction)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        IsSuccess = false,
                        Message = "Farm Id is require"
                    });
                }
                var result = await _plantService.getPlantByGrowthActiveFunc(farmId.Value, activeFunction);
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

        [HttpPatch(APIRoutes.Plant.PlantDeadMark + "/{plant-id}", Name = "PlantDeadMark")]
        public async Task<IActionResult> PlantDeadMark([FromRoute(Name = "plant-id")] int plantId)
        {
            try
            {
                var result = await _plantService.DeadPlantMark(plantId);
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
