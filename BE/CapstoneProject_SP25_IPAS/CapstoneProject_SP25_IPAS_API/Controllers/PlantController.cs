using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using FluentValidation;
using CapstoneProject_SP25_IPAS_Service.Service;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_API.Middleware;

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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Plant.getPlantById + "/{plant-id}", Name = "GetPlantById")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Plant.getPlantByCode + "/{plant-code}", Name = "getPlantByCode")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getPlantByCode([FromRoute(Name = "plant-code")] string plantCode)
        {
            try
            {
                var result = await _plantService.getByCode(plantCode);
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Plant.getPlantPagin)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> CreatePlant([FromForm] PlantCreateRequest plantCreateRequest)
        {
            try
            {
                if (!plantCreateRequest.FarmId.HasValue)
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.Plant.deletePlant + "/{plant-id}")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.Plant.deleteMultiplePlant)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.Plant.importPlantFromExcel)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        /// Lấy tất cả cây của một thửa
        /// </summary>
        [HttpGet(APIRoutes.Plant.getForSelectedForPlot + "/{plot-id}")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> GetForSelectedForRow([FromRoute(Name = "row-id")] int plotId)
        {
            //try
            //{
            var result = await _plantService.getPlantInRowForSelected(plotId);
            return Ok(result);
            //}
            //catch (Exception ex)
            //{
            //    return BadRequest(new BaseResponse
            //    {
            //        StatusCode = StatusCodes.Status400BadRequest,
            //        Message = ex.Message
            //    });
            //}
        }

        [HttpGet(APIRoutes.Plant.getForSelectedActFunc)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getForSelectedActFunc([FromQuery] int? farmId, int? plotId, int rowId, string? actFunction)
        {
            if (!farmId.HasValue)
                farmId = _jwtTokenService.GetFarmIdFromToken();
            if (!ModelState.IsValid || !farmId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                });
            }
            var result = await _plantService.getPlantActFuncionForSelected(farmId!.Value, plotId, rowId, actFunction);
            return Ok(result);
        }

        [HttpPatch(APIRoutes.Plant.softDeletePlant, Name = "SoftedDeletePlant")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.Plant.getPlantNotLocate)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getPlantNotLocate([FromQuery(Name = "farmId")] int? farmId)
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
        /// <summary>
        /// Lấy ra tất cả các cây ở trong giai đoạn có thể làm gì 
        /// </summary>
        /// <param name="activeFunction">Harvest,Grafted</param>
        [HttpGet(APIRoutes.Plant.getPlantByGrowthFunc)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.Plant.exportCSV)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> ExportNotes([FromQuery] GetPlantPaginRequest exportRequest)
        {
            var result = await _plantService.ExportExcel(exportRequest);
            if (result.StatusCode != 200)
                return Ok(result);
            if (result.Data is ExportFileResult file && file.FileBytes?.Length > 0)
            {
                return File(file.FileBytes, file.ContentType, file.FileName);
            }

            return NotFound(result.Message);
        }

    }
}
