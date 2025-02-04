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

        public LandPlotController(ILandPlotService landPlotService)
        {
            this._landPlotService = landPlotService;
        }


        [HttpGet(APIRoutes.LandPlot.getLandPlotById + "{landplot-id}", Name = "getLandPlotByIdAsync")]
        public async Task<IActionResult> GetLantPlotByIdAsync([FromRoute(Name = "landplot-id")] int landplotId)
        {
            var result = await _landPlotService.GetLandPlotById(landplotId);
            return Ok(result);

        }

        [HttpGet(APIRoutes.LandPlot.getAllLandPlotNoPagin, Name = "getAllLandPlotNoPginAsync")]
        public async Task<IActionResult> getAllLandPlotNoPginAsync([FromQuery] int farmId, string? searchKey)
        {
            var result = await _landPlotService.GetAllLandPlotNoPagin(farmId: farmId, searchKey: searchKey);
            return Ok(result);
        }

        [HttpPost(APIRoutes.LandPlot.createLandPlot, Name = "createLandPlotAsync")]
        public async Task<IActionResult> CreateLandPlotAsync([FromBody] LandPlotCreateRequest landPlotCreateModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _landPlotService.CreateLandPlot(landPlotCreateModel);
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
        public async Task<IActionResult> UpdateLandPlotCoorAsync([FromBody] LandPlotUpdateCoordinationRequest updateLandPlotCoordinationRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _landPlotService.UpdateLandPlotCoordination(updateLandPlotCoordinationRequest);
            return Ok(result);
        }

        [HttpDelete(APIRoutes.LandPlot.deleteLandPlotOfFarm, Name = "DeleteLandPlotAsync")]
        public async Task<IActionResult> DeleteLandPlot([FromQuery] int landPlotId)
        {
            var result = await _landPlotService.deleteLandPlotOfFarm(landPlotId);
            return Ok(result);
        }
    }
}
