using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.GraftedRequest.GraftedNoteRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GraftedPlantNoteController : ControllerBase
    {
        private readonly IGraftedPlantNoteService _graftedNoteService;

        public GraftedPlantNoteController(IGraftedPlantNoteService graftedNoteService)
        {
            _graftedNoteService = graftedNoteService;
        }

        [HttpPost(APIRoutes.GraftedPlant.createGraftedNote, Name = "CreateGraftedNoteAsync")]
        public async Task<IActionResult> CreateGraftedNoteAsync([FromForm] CreateGraftedNoteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _graftedNoteService.createGraftedNote(request);
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

        [HttpPut(APIRoutes.GraftedPlant.updateGraftedNoteInfo, Name = "updateGraftedNoteInfoAsync")]
        public async Task<IActionResult> updateGraftedNoteInfoAsync([FromBody] UpdateGraftedNoteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _graftedNoteService.updateGraftedNote(request);
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

        [HttpGet(APIRoutes.GraftedPlant.getGraftedNoteById + "/{grafted-note-id}", Name = "GetGraftedNoteByIdAsync")]
        public async Task<IActionResult> GetGraftedNoteByIdAsync([FromRoute(Name = "grafted-note-id")] int graftedNoteId)
        {
            try
            {
                var result = await _graftedNoteService.getGraftedNoteById(graftedNoteId);
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

        [HttpGet(APIRoutes.GraftedPlant.getAllNoteOfGraftedById + "/{grafted-id}", Name = "GetAllNoteOfGraftedByIdAsync")]
        public async Task<IActionResult> GetAllNoteOfGraftedByIdAsync([FromRoute(Name = "grafted-id")] int graftedId)
        {
            try
            {
                var result = await _graftedNoteService.getAllNoteOfGraftedById(graftedId);
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

        [HttpDelete(APIRoutes.GraftedPlant.deleteGraftedNote + "/{grafted-note-id}", Name = "DeleteGraftedNoteAsync")]
        public async Task<IActionResult> DeleteGraftedNoteAsync([FromRoute(Name = "grafted-note-id")] int graftedNoteId)
        {
            try
            {
                var result = await _graftedNoteService.deleteGraftedNote(graftedNoteId);
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
