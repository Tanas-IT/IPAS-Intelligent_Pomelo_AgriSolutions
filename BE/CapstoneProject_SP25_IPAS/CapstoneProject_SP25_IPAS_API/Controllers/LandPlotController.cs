using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandPlotRequest;
using CapstoneProject_SP25_IPAS_API.Middleware;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LandPlotController : ControllerBase
    {
        private readonly ILandPlotService _landPlotService;
        private readonly IJwtTokenService _jwtTokenService;
        public LandPlotController(ILandPlotService landPlotService, IJwtTokenService jwtTokenService)
        {
            this._landPlotService = landPlotService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpGet(APIRoutes.LandPlot.getLandPlotById + "/{landplot-id}", Name = "getLandPlotByIdAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> GetLantPlotByIdAsync([FromRoute(Name = "landplot-id")] int landplotId)
        {
            var result = await _landPlotService.GetLandPlotById(landplotId);
            return Ok(result);

        }
        [HttpGet(APIRoutes.LandPlot.getAllLandPlotNoPagin, Name = "getAllLandPlotNoPaginAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getAllLandPlotNoPaginAsync([FromQuery] int? farmId, string? searchKey)
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
                    Message = "Farm is required",
                });
            }
            var result = await _landPlotService.GetAllLandPlotNoPagin(farmId: farmId!.Value, searchKey: searchKey);
            return Ok(result);
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpGet(APIRoutes.LandPlot.getLandPlotEmpty, Name = "getLandPlotEmptyAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getLandPlotEmptyAsync([FromQuery] int? farmId)
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
                    Message = "Farm is required",
                });
            }
            var result = await _landPlotService.GetLandPlotEmpty(farmId: farmId!.Value);
            return Ok(result);
        }

        [HttpGet(APIRoutes.LandPlot.getAllForSelected, Name = "GetAllForSelectedAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getAllForSelectedAsync([FromQuery] int? farmId)
        {
            if (!farmId.HasValue)
            {
                farmId = _jwtTokenService.GetFarmIdFromToken();
            }
            if (!farmId.HasValue)
            {
                var response = new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "FarmId is Require"
                };
                return BadRequest(response);
            }
            var result = await _landPlotService.GetLandPlotForSelected(farmId: farmId!.Value);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)}")]
        [HttpPost(APIRoutes.LandPlot.createLandPlot, Name = "createLandPlotAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> CreateLandPlotAsync([FromBody] LandPlotCreateRequest landPlotCreateRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (!landPlotCreateRequest.FarmId.HasValue)
            {
                landPlotCreateRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
            }

            var result = await _landPlotService.CreateLandPlot(landPlotCreateRequest);
            return Ok(result);
        }

        [HttpPut(APIRoutes.LandPlot.updateLandPlotInfo, Name = "updateLandPlotInfoAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> updateLandPlotInfoAsync([FromBody] LandPlotUpdateRequest landplotUpdateModel)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _landPlotService.UpdateLandPlotInfo(landplotUpdateModel);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)}")]
        [HttpPut(APIRoutes.LandPlot.updateLandPlotCoordination, Name = "updateLandPlotCooridinationAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> UpdateLandPlotCoorAsync([FromBody] LandPlotUpdateCoordinationRequest updateCoorRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _landPlotService.UpdateLandPlotCoordination(updateCoorRequest);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)}")]
        [HttpDelete(APIRoutes.LandPlot.deleteLandPlotOfFarm, Name = "DeleteLandPlotAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> DeleteLandPlot([FromQuery] int landPlotId)
        {
            var result = await _landPlotService.deleteLandPlotOfFarm(landPlotId);
            return Ok(result);
        }

        [HttpGet(APIRoutes.LandPlot.getForMap + "/{landplot-id}", Name = "getForMapAsync")]
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> GetForMapped([FromRoute(Name = "landplot-id")] int landplotId)
        {
            var result = await _landPlotService.GetForMapped(landplotId);
            return Ok(result);

        }

        [HttpPatch(APIRoutes.LandPlot.deleteSoftedLandPlotOfFarm, Name = "deleteSoftedLandPlotOfFarm")]
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)}")]
        //[CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> deleteSoftedLandPlotOfFarm([FromBody] int plantIds)
        {
            try
            {
                var result = await _landPlotService.SofteDelete(plantIds);
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

        [HttpPut(APIRoutes.LandPlot.updateVisualMap, Name = "updateVisualMap")]
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        //[CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> updateVisualMap([FromBody] UpdatePlotVisualMapRequest updateRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _landPlotService.UpdateLandPlotVisualMap(updateRequest);
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
