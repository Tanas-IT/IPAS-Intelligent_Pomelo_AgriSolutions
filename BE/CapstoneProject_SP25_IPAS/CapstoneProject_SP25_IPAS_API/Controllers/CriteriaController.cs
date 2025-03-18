using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeModels;

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
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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

        /// <summary>
        /// Lay nhieu criteria theo mastertype id
        /// </summary>
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Criteria.getCriteriaBySet + "/{mastertype-id}", Name = "getCriteriaBySet")]
        public async Task<IActionResult> getCriteriaBySet([FromRoute(Name = "mastertype-id")] int id)
        {
            try
            {
                var result = await _criteriaService.GetCriteriasByMasterTypeId(id);
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
        [HttpGet(APIRoutes.Criteria.getCriteriaOfObject, Name = "getCriteriaOfPlantById")]
        public async Task<IActionResult> GetCriteriaOfObject([FromQuery] GetCriteriaOfTargetRequest request)
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
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Criteria.getCriteriaSetPagin, Name = "getCriteriaSetPagin")]
        public async Task<IActionResult> GetCriteriaSetPagin(PaginationParameter paginationParameter, MasterTypeFilter masterTypeFilter, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _criteriaService.GetAllCriteriaSetPagination(paginationParameter, masterTypeFilter, farmId!.Value);
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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


        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPut(APIRoutes.Criteria.updateCriteriaMultipleTarget, Name = "updateCriteriaMultipleTarget")]
        public async Task<IActionResult> updateCriteriaMultipleTarget([FromBody] CriteriaTargerRequest request)
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
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Criteria.getCriteriaSetPlantLotExcept, Name = "getCriteriaSetPlantLotExcept")]
        public async Task<IActionResult> getCriteriaSetPlantLotExcept([FromQuery] int plantLotId, int? farmId, string? target)
        {

            if (!farmId.HasValue)
                farmId = _jwtTokenService.GetFarmIdFromToken();
            if (!farmId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Farm id has required"
                });
            }
            var result = await _criteriaService.GetCriteriaSetPlantLotNotApply(plantlotId: plantLotId, farmId: farmId.Value, target: target);
            return Ok(result);

        }

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Criteria.getCriteriaSetGraftedExcept, Name = "getCriteriaSetGraftedExcept")]
        public async Task<IActionResult> getCriteriaSetGraftedExcept([FromQuery] int graftedId, int? farmId, string? target)
        {

            if (!farmId.HasValue)
                farmId = _jwtTokenService.GetFarmIdFromToken();
            if (!farmId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Farm id has required"
                });
            }
            var result = await _criteriaService.GetCriteriaSetGraftedNotApply(graftedId: graftedId, farmId: farmId.Value, target: target);
            return Ok(result);

        }

        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Criteria.getCriteriaSetPlantExcept, Name = "getCriteriaSetPlantExcept")]
        public async Task<IActionResult> getCriteriaSetPlantExcept([FromQuery] int plantId, int? farmId, string? target)
        {

            if (!farmId.HasValue)
                farmId = _jwtTokenService.GetFarmIdFromToken();
            if (!farmId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Farm id has required"
                });
            }
            var result = await _criteriaService.GetCriteriaSetPlantNotApply(plantId: plantId, farmId: farmId.Value, target: target);
            return Ok(result);

        }
    }
}
