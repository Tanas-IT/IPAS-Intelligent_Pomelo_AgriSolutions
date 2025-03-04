using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.GraftedRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
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
        [HttpGet(APIRoutes.GraftedPlant.getAllGraftedPagin, Name = "getGraftedOfPlantPagin")]
        public async Task<IActionResult> GetGraftedOfPlantPaginAsync([FromQuery] GetGraftedPaginRequest getRequest, PaginationParameter paginationParameter)
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
                var result = await _graftedPlantService.getGraftedOfPlantPaginAsync(getRequest, paginationParameter);
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
        public async Task<IActionResult> CreateGraftedPlantAsync([FromBody] CreateGraftedPlantRequest createRequest)
        {
            try
            {
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

        // Cập nhật thông tin cây ghép
        [HttpPut(APIRoutes.GraftedPlant.updateGraftedInfo, Name = "updateGraftedPlant")]
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

        // Xóa mềm cây ghép (chuyển trạng thái đã xóa)
        [HttpPatch(APIRoutes.GraftedPlant.deleteSoftedGrafted, Name = "softDeleteGraftedPlant")]
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
        // Lấy cây ghép theo ID
        [HttpGet(APIRoutes.GraftedPlant.getGraftedForSelectedByFarmId + "/{farm-id}", Name = "getGraftedForSelectedByFarmIdAsync")]
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
        public async Task<IActionResult> getHistoryOfGraftedByPlantId([FromQuery] int? farmId, int plantId)
        {
            try
            {
                if(!farmId.HasValue)
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
    }
}
