using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest.GraftedNoteRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> CreateGraftedNoteAsync([FromForm] CreateGraftedNoteRequest request)
        {
            try
            {
                //if (!ModelState.IsValid)
                //{
                //    return BadRequest(ModelState);
                //}
                if (!request.UserId.HasValue)
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

        [HttpPut(APIRoutes.GraftedPlant.updateGraftedNoteInfo, Name = "updateGraftedNoteInfoAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.GraftedPlant.getAllNoteOfGraftedPagin, Name = "getAllNoteOfGraftedPagin")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.GraftedPlant.exportGraftedNoteCSV)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> ExportNotes(int graftedPlantId)
        {
            var result = await _graftedNoteService.ExportNotesByGraftedPlantId(graftedPlantId);
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
