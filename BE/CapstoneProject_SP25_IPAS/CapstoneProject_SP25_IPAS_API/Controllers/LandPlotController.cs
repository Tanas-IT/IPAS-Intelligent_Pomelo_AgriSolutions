using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GetLantPlotByIdAsync([FromRoute(Name = "landplot-id")] int landplotId)
        {
            var result = await _landPlotService.GetLandPlotById(landplotId);
            return Ok(result);

        }

        [HttpGet(APIRoutes.LandPlot.getAllLandPlotNoPagin, Name = "getAllLandPlotNoPaginAsync")]
        public async Task<IActionResult> getAllLandPlotNoPaginAsync([FromQuery] int? farmId, string? searchKey)
        {
            if (!farmId.HasValue)
            {
                farmId = _jwtTokenService.GetFarmIdFromToken();
            }
            var result = await _landPlotService.GetAllLandPlotNoPagin(farmId: farmId!.Value, searchKey: searchKey);
            return Ok(result);
        }

        [HttpGet(APIRoutes.LandPlot.getAllForSelected, Name = "GetAllForSelectedAsync")]
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

        [HttpPost(APIRoutes.LandPlot.createLandPlot, Name = "createLandPlotAsync")]
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
        public async Task<IActionResult> updateLandPlotInfoAsync([FromBody] LandPlotUpdateRequest landplotUpdateModel)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _landPlotService.UpdateLandPlotInfo(landplotUpdateModel);
            return Ok(result);
        }

        [HttpPut(APIRoutes.LandPlot.updateLandPlotCoordination, Name = "updateLandPlotCooridinationAsync")]
        public async Task<IActionResult> UpdateLandPlotCoorAsync([FromBody] LandPlotUpdateCoordinationRequest updateCoorRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _landPlotService.UpdateLandPlotCoordination(updateCoorRequest);
            return Ok(result);
        }

        [HttpDelete(APIRoutes.LandPlot.deleteLandPlotOfFarm, Name = "DeleteLandPlotAsync")]
        public async Task<IActionResult> DeleteLandPlot([FromQuery] int landPlotId)
        {
            var result = await _landPlotService.deleteLandPlotOfFarm(landPlotId);
            return Ok(result);
        }

        [HttpGet(APIRoutes.LandPlot.getForMap + "/{landplot-id}", Name = "getForMapAsync")]
        public async Task<IActionResult> GetForMapped([FromRoute(Name = "landplot-id")] int landplotId)
        {
            var result = await _landPlotService.GetForMapped(landplotId);
            return Ok(result);

        }

        [HttpPatch(APIRoutes.LandPlot.deleteSoftedLandPlotOfFarm, Name = "deleteSoftedLandPlotOfFarm")]
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
    }
}
