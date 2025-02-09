using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LegalDocumentRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ResourceRequest;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LegalDocumentController : ControllerBase
    {
        private readonly ILegalDocumentService _legalDocumentService;
        private readonly IJwtTokenService _jwtTokenService;

        public LegalDocumentController(ILegalDocumentService legalDocumentService, IJwtTokenService jwtTokenService)
        {
            _legalDocumentService = legalDocumentService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost(APIRoutes.LegalDocument.createLegalDocument, Name = "createLegalDocumentAsync")]
        public async Task<IActionResult> CreateLegalDocumentAsync([FromForm] LegalDocumentCreateRequest request)
        {
            try
            {
                if (!request.FarmId.HasValue)
                {
                    request.FarmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!ModelState.IsValid || !request.FarmId.HasValue)
                {
                    return BadRequest();
                }
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _legalDocumentService.createDocument(request, request.FarmId.Value);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse { StatusCode = StatusCodes.Status400BadRequest, Message = ex.Message });
            }
        }

        [HttpPut(APIRoutes.LegalDocument.updateLegalDocumentInfo + "", Name = "updateLegalDocumentAsync")]
        public async Task<IActionResult> UpdateLegalDocumentAsync([FromForm] LegalDocumentUpdateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _legalDocumentService.updateDocument(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse { StatusCode = StatusCodes.Status400BadRequest, Message = ex.Message });
            }
        }

        [HttpGet(APIRoutes.LegalDocument.getLegalDocumentById + "/{document-id}", Name = "getLegalDocumentAsync")]
        public async Task<IActionResult> GetLegalDocumentAsync([FromRoute(Name = "document-id")] int documentId)
        {
            try
            {
                var result = await _legalDocumentService.getDocument(documentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse { StatusCode = StatusCodes.Status400BadRequest, Message = ex.Message });
            }
        }

        [HttpGet(APIRoutes.LegalDocument.getAllLegalDocumentIfFarm + "/{farm-id}", Name = "getAllLegalDocumentsOfFarmAsync")]
        public async Task<IActionResult> GetAllLegalDocumentsOfFarmAsync([FromRoute(Name = "farm-id")] int farmId, [FromQuery(Name = "search-value")] string? searchValue)
        {
            try
            {
                var result = await _legalDocumentService.getAllDocumentOfFarm(farmId, searchValue);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse { StatusCode = StatusCodes.Status400BadRequest, Message = ex.Message });
            }
        }

        [HttpDelete( APIRoutes.LegalDocument.deleteLegalDocument + "/{document-id}", Name = "deleteLegalDocumentAsync")]
        public async Task<IActionResult> DeleteLegalDocumentAsync([FromRoute(Name = "document-id")] int documentId)
        {
            try
            {
                var result = await _legalDocumentService.deleteDocument(documentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse { StatusCode = StatusCodes.Status400BadRequest, Message = ex.Message });
            }
        }
    }
}
