using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest.CriteriaTagerRequest;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CriteriaController : ControllerBase
    {
        private readonly ICriteriaService _criteriaService;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly ICriteriaTargetService _criteriaTargetService;
        public CriteriaController(ICriteriaService criteriaService, IJwtTokenService jwtTokenService, ICriteriaTargetService criteriaTargetService)
        {
            _criteriaService = criteriaService;
            _jwtTokenService = jwtTokenService;
            _criteriaTargetService = criteriaTargetService;
        }

        [HttpGet(APIRoutes.Criteria.getCriteriaById + "/{criteria-id}", Name = "getCriteriaById")]
        public async Task<IActionResult> GetCriteriaById([FromRoute(Name = "criteria-id")] int id)
        {
            try
            {
                var result = await _criteriaService.GetCriteriaById(id);
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

        [HttpPut(APIRoutes.Criteria.updateCriteriaInfo, Name = "updateCriteria")]
        public async Task<IActionResult> UpdateCriteria(CriteriaUpdateRequest updateRequest)
        {
            try
            {
                var result = await _criteriaService.UpdateOneCriteriaInType(updateRequest);
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

        [HttpPut(APIRoutes.Criteria.updateListCriteriaType, Name = "updateListCriteria")]
        public async Task<IActionResult> UpdateListCriteria([FromBody] ListCriteriaUpdateRequest request)
        {
            try
            {
                var result = await _criteriaService.UpdateListCriteriaInType(request);
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

        [HttpGet(APIRoutes.Criteria.getCriteriaOfObject , Name = "getCriteriaOfPlantById")]
        public async Task<IActionResult> GetCriteriaOfPlantById([FromQuery]GetCriteriaOfTargetRequest request)
        {
            try
            {
                var result = await _criteriaService.GetCriteriaOfTarget(request);
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

        [HttpPost(APIRoutes.Criteria.createMasTypeCriteria, Name = "createMasTypeCriteria")]
        public async Task<IActionResult> createMasTypeCriteria([FromBody] CreateCriteriaMasterTypeRequest request)
        {
            try
            {
                if (!request.CreateMasTypeRequest.FarmId.HasValue)
                    request.CreateMasTypeRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                if (!ModelState.IsValid || !request.CreateMasTypeRequest.FarmId.HasValue)
                    return BadRequest();
                var result = await _criteriaService.CreateCriteriaWithMasterType(request);
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

        [HttpPost(APIRoutes.Criteria.applyCriteriaTargetMultiple, Name = "applyCriteriaTargetMultiple")]
        public async Task<IActionResult> applyCriteriaTargetMultiple([FromBody] CriteriaTargerRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();
                var result = await _criteriaTargetService.ApplyCriteriasForTarget(request);
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

        [HttpPut(APIRoutes.Criteria.updateCriteriaMultipleTarget, Name = "updateCriteriaMultipleTarget")]
        public async Task<IActionResult> updateCriteriaMultipleTarget([FromBody] CriteriaTargerRequest request )
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();
                var result = await _criteriaTargetService.UpdateCriteriaMultipleTarget(request, request.allowOveride);
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

        [HttpPut(APIRoutes.Criteria.updateCriteriaTarget, Name = "updateCriteriaTarget")]
        public async Task<IActionResult> updateCriteriaTarget([FromBody] UpdateCriteriaTargetRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();
                var result = await _criteriaTargetService.UpdateCriteriaForSingleTarget(request, request.allowOveride);
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

        [HttpPut(APIRoutes.Criteria.checkCriteriaForTarget, Name = "checkCriteriaForTarget")]
        public async Task<IActionResult> checkCriteriaForTarget([FromBody] CheckPlantCriteriaRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();
                var result = await _criteriaTargetService.CheckingCriteriaForTarget(request);
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

        [HttpDelete(APIRoutes.Criteria.deleteCriteriaMultipleTarger, Name = "deleteCriteriaMultipleTarger")]
        public async Task<IActionResult> deleteCriteriaMultipleTarger([FromBody] DeleteCriteriaTargetRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();
                var result = await _criteriaTargetService.DelteteCriteriaForMultipleTarget(request);
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
