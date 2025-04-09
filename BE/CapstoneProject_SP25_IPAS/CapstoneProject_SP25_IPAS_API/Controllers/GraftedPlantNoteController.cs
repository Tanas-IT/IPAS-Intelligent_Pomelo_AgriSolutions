using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest.GraftedNoteRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GraftedPlantNoteController : ControllerBase
    {
        private readonly IGraftedPlantNoteService _graftedNoteService;
        private readonly IJwtTokenService _jwtTokenService;
        public GraftedPlantNoteController(IGraftedPlantNoteService graftedNoteService, IJwtTokenService jwtTokenService)
        {
            _graftedNoteService = graftedNoteService;
            _jwtTokenService = jwtTokenService;
        }

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPost(APIRoutes.GraftedPlant.createGraftedNote, Name = "CreateGraftedNoteAsync")]
        public async Task<IActionResult> CreateGraftedNoteAsync([FromForm] CreateGraftedNoteRequest request)
        {
            try
            {
                //if (!ModelState.IsValid)
                //{
                //    return BadRequest(ModelState);
                //}
                if(!request.UserId.HasValue)
                    request.UserId = _jwtTokenService.GetUserIdFromToken();
                if (!request.UserId.HasValue)
                {
                    return BadRequest(new BusinessResult
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "User Id is required"
                    });
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.GraftedPlant.getAllNoteOfGraftedPagin, Name = "getAllNoteOfGraftedPagin")]
        public async Task<IActionResult> getAllNoteOfGraftedPagin([FromQuery] GetGraftedNoteRequest getRequest, PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _graftedNoteService.getAllNoteOfGraftedPagin(getRequest, paginationParameter);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)}")]
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

        [HttpGet(APIRoutes.GraftedPlant.exportCSV)]
        public async Task<IActionResult> ExportNotes(int graftedPlantId)
        {
            var result = await _graftedNoteService.ExportNotesByGraftedPlantId(graftedPlantId);

            if (result.FileBytes == null || result.FileBytes.Length == 0)
            {
                return NotFound("No data found to export.");
            }

            return File(result.FileBytes, result.ContentType, result.FileName);
        }
    }
}
