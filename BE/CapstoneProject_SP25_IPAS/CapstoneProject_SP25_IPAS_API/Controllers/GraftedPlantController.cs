using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest;
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
    public class GraftedPlantController : ControllerBase
    {
        private readonly IGraftedPlantService _graftedPlantService;
        private readonly IJwtTokenService _jwtTokenService;
        public GraftedPlantController(IGraftedPlantService graftedPlantService, IJwtTokenService jwtTokenService)
        {
            _graftedPlantService = graftedPlantService;
            _jwtTokenService = jwtTokenService;

        }

        // Lấy cây ghép theo ID
        [HttpGet(APIRoutes.GraftedPlant.getGraftedById + "/{graftedPlantId}", Name = "getGraftedById")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> GetGraftedByIdAsync([FromRoute] int graftedPlantId)
        {
            try
            {
                var result = await _graftedPlantService.getGraftedByIdAsync(graftedPlantId);
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

        // Lấy danh sách cây ghép theo phân trang
        [HttpGet(APIRoutes.GraftedPlant.getAllGraftedPagin, Name = "getAllGraftedPagin")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getAllGraftedPagin([FromQuery] GetGraftedPaginRequest getRequest, PaginationParameter paginationParameter)
        {
            try
            {
                if (!getRequest.FarmId.HasValue)
                {
                    getRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!getRequest.FarmId.HasValue)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Farm Id is required"
                    });
                }
                var result = await _graftedPlantService.getAllGraftedPagin(getRequest, paginationParameter);
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


        [HttpGet(APIRoutes.GraftedPlant.getAllGraftedByPlantPagin, Name = "getAllGraftedByPlantPagin")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getAllGraftedByPlantPagin([FromQuery] GetGraftedByPlantRequest getRequest, PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _graftedPlantService.getAllGraftedByPlantPagin(getRequest, paginationParameter);
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
        // Tạo mới cây ghép

        [HttpPost(APIRoutes.GraftedPlant.createGrafted, Name = "createGraftedPlant")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> CreateGraftedPlantAsync([FromBody] CreateGraftedPlantRequest createRequest)
        {
            try
            {
                //if (!createRequest.FarmId.HasValue)
                //{
                //    createRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                //}
                //if (!createRequest.FarmId.HasValue)
                //{
                //    return BadRequest(new BaseResponse
                //    {
                //        StatusCode = StatusCodes.Status400BadRequest,
                //        Message = "Farm Id is required"
                //    });
                //}
                var result = await _graftedPlantService.createGraftedPlantAsync(createRequest);
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

        [HttpPost(APIRoutes.GraftedPlant.CreatePlantFromGrafted, Name = "CreatePlantFromGrafted")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> CreatePlantFromGrafted([FromBody] CreatePlantFromGraftedRequest createRequest)
        {
            if (!createRequest.FarmId.HasValue)
                createRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
            var result = await _graftedPlantService.CreatePlantFromGrafted(createRequest);
            return Ok(result);
        }

        // Cập nhật thông tin cây ghép
        [HttpPut(APIRoutes.GraftedPlant.updateGraftedInfo, Name = "updateGraftedPlant")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> UpdateGraftedPlantAsync([FromBody] UpdateGraftedPlantRequest updateRequest)
        {
            try
            {
                var result = await _graftedPlantService.updateGraftedPlantAsync(updateRequest);
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

        [HttpPut(APIRoutes.GraftedPlant.GroupGraftedPlantsIntoPlantLot, Name = "GroupGraftedPlantsIntoPlantLot")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> GroupGraftedPlantsIntoPlantLot([FromBody] GroupingGraftedRequest createRequest)
        {
            var result = await _graftedPlantService.GroupGraftedPlantsIntoPlantLot(createRequest);
            return Ok(result);
        }

        [HttpPut(APIRoutes.GraftedPlant.UnGroupGraftedPlantsIntoPlantLot, Name = "UnGroupGraftedPlantsIntoPlantLot")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> UnGroupGraftedPlantsIntoPlantLot(List<int> graftPlantsId)
        {
            var result = await _graftedPlantService.UngroupGraftedPlants(graftPlantsId);
            return Ok(result);
        }

        // Xóa mềm cây ghép (chuyển trạng thái đã xóa)
        [HttpPatch(APIRoutes.GraftedPlant.deleteSoftedGrafted, Name = "softDeleteGraftedPlant")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> SoftDeleteGraftedAsync([FromBody] List<int> graftedPlantIds)
        {
            try
            {
                var result = await _graftedPlantService.deteSoftedGraftedAsync(graftedPlantIds);
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

        // Xóa vĩnh viễn cây ghép
        [HttpDelete(APIRoutes.GraftedPlant.deletePermanentlyGrafted, Name = "permanentDeleteGraftedPlant")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> PermanentDeleteGraftedAsync([FromBody] List<int> graftedPlantIds)
        {
            try
            {
                var result = await _graftedPlantService.deletePermanentlyGrafteAsync(graftedPlantIds);
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

        // get for selected
        // Lấy cây ghép theo ID khong lay cay chet va da su dung
        [HttpGet(APIRoutes.GraftedPlant.getGraftedForSelectedByFarmId + "/{farm-id}", Name = "getGraftedForSelectedByFarmIdAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getGraftedForSelectedByFarmIdAsync([FromRoute(Name = "farm-id")] int farmId)
        {
            try
            {
                var result = await _graftedPlantService.getGraftedForSelected(farmId);
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
        [HttpGet(APIRoutes.GraftedPlant.checkGraftedHasApplyCriteria, Name = "checkGraftedHasApplyCriteria")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> checkGraftedHasApplyCriteria([FromQuery] int? plantId, int? graftedPlantId)
        {
            try
            {
                if (!plantId.HasValue && !graftedPlantId.HasValue)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "You must selected plant id or grafted Plant Id"
                    });
                }
                var result = await _graftedPlantService.CheckGraftedConditionAppliedAsync(plantId: plantId, graftedId: graftedPlantId);
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

        [HttpGet(APIRoutes.GraftedPlant.getHistoryOfGraftedPlantById, Name = "getHistoryOfGraftedPlantById")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getHistoryOfGraftedByPlantId([FromQuery] int? farmId, int plantId)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _graftedPlantService.getHistoryOfGraftedPlant(farmId.Value, plantId);
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

        [HttpPut(APIRoutes.GraftedPlant.CompleteGraftedPlant, Name = "CompleteGraftedPlant")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> CompleteGraftedPlant([FromBody] CompletedGraftedPlantRequest Request)
        {
            try
            {
                if (!Request.FarmId.HasValue)
                    Request.FarmId = _jwtTokenService.GetFarmIdFromToken();
                if (!Request.FarmId.HasValue)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "FarmId is Required"
                    });
                }
                var result = await _graftedPlantService.CompletedGraftedPlant(Request);
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

        [HttpPut(APIRoutes.GraftedPlant.MarkDeadGraftedPlants, Name = "MarkDeadGraftedPlants")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> MarkDeadGraftedPlants(List<int> graftPlantsId)
        {
            var result = await _graftedPlantService.markDeadGraftedAsync(graftPlantsId);
            return Ok(result);
        }

        [HttpGet(APIRoutes.GraftedPlant.exportCSV)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> ExportCriteriaObject([FromQuery] GetGraftedPaginRequest getRequest)
        {
            if (!getRequest.FarmId.HasValue)
            {
                getRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
            }
            if (!getRequest.FarmId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Farm Id is required"
                });
            }
            var result = await _graftedPlantService.ExportGrafted(getRequest);

            if (result.StatusCode != 200)
            {
                return Ok(result);
            }
            var fileResult = result.Data as ExportFileResult;
            return File(fileResult.FileBytes, fileResult.ContentType, fileResult.FileName);
        }
    }
}
