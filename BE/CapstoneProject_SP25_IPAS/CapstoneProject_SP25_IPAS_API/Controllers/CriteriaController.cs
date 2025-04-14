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
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.MasterTypeRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using CapstoneProject_SP25_IPAS_API.Middleware;

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
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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
        [HttpGet(APIRoutes.Criteria.getCriteriaBySet + "/{mastertype-id}", Name = "getCriteriaBySet")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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
        [HttpGet(APIRoutes.Criteria.getCriteriaOfObject, Name = "getCriteriaOfPlantById")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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
        [HttpGet(APIRoutes.Criteria.getCriteriaSetPagin, Name = "getCriteriaSetPagin")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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
        [HttpPost(APIRoutes.Criteria.createMasTypeCriteria, Name = "createMasTypeCriteria")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
        public async Task<IActionResult> applyCriteriaTargetMultiple([FromBody] ApplyCriteriaForTargetRequest request)
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

        [HttpPost(APIRoutes.Criteria.applyCriteriaForPlant, Name = "applyCriteriaPlant")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
        public async Task<IActionResult> applyCriteriaPlant([FromBody] ApplyCriteriaForPlantRequest request)
        {
            if (!ModelState.IsValid)
            {
                var baseReponse = new BusinessResult()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ModelState.ValidationState.ToString()
                };
                return BadRequest(baseReponse);
            }
            var result = await _criteriaTargetService.ApplyCriteriasForPlant(request);
            return Ok(result);
        }

        [HttpPut(APIRoutes.Criteria.updateCriteriaInfo, Name = "updateCriteria")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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


        [HttpPut(APIRoutes.Criteria.updateCriteriaMultipleTarget, Name = "updateCriteriaMultipleTarget")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
        public async Task<IActionResult> updateCriteriaMultipleTarget([FromBody] UpdateCriteriaTargerRequest request)
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
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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

        [HttpPut(APIRoutes.Criteria.checkCriteriaForGrafted, Name = "checkCriteriaForTarget")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
        public async Task<IActionResult> checkCriteriaForTarget([FromBody] CheckGraftedCriteriaRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();
                var result = await _criteriaTargetService.CheckingCriteriaForGrafted(request);
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

        [HttpPut(APIRoutes.Criteria.checkCriteriaForPlant, Name = "checkCriteriaForPlant")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
        public async Task<IActionResult> checkCriteriaForPlant([FromBody] CheckPlantCriteriaRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();
                var result = await _criteriaTargetService.CheckingCriteriaForPlant(request);
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

        [HttpPut(APIRoutes.Criteria.resetPlantCriteria, Name = "resetPlantCriteria")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
        public async Task<IActionResult> resetPlantCriteria(ResetPlantCriteriaRequest resetRequest)
        {
            try
            {
                var result = await _criteriaTargetService.ResetPlantCriteria(resetRequest);
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
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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

        [HttpGet(APIRoutes.Criteria.getCriteriaSetPlantLotExcept, Name = "getCriteriaSetPlantLotExcept")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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

        [HttpGet(APIRoutes.Criteria.getCriteriaSetGraftedExcept, Name = "getCriteriaSetGraftedExcept")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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

        [HttpGet(APIRoutes.Criteria.getCriteriaSetPlantExcept, Name = "getCriteriaSetPlantExcept")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
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

        [HttpGet(APIRoutes.Criteria.getCriteriaSetProductExcept, Name = "getCriteriaSetProductExcept")]
        //[HybridAuthorize($"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        //[ServiceFilter(typeof(FarmExpiredFilter))]
        public async Task<IActionResult> getCriteriaSetProductExcept([FromQuery] int productId, int? farmId, string? target)
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
            var result = await _criteriaService.GetCriteriaSetProductNotApply(productId: productId, farmId: farmId.Value, target: target);
            return Ok(result);

        }

        [HttpGet(APIRoutes.Criteria.exportCSV)]
        public async Task<IActionResult> ExportCriteriaSet([FromQuery] int? farmId)
        {
            if (!farmId.HasValue)
                farmId = _jwtTokenService.GetFarmIdFromToken();

            if (!farmId.HasValue)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Farm Id is required"
                });
            }

            var result = await _criteriaService.ExportExcel(farmId.Value);

            if (result.StatusCode != 200 || result.Data == null)
            {
                return Ok(result);
            }

            var fileResult = result.Data as ExportFileResult;
            if (fileResult?.FileBytes == null || fileResult.FileBytes.Length == 0)
            {
                return NotFound("No data found to export.");
            }

            return File(fileResult.FileBytes, fileResult.ContentType, fileResult.FileName);
        }

        [HttpGet(APIRoutes.Criteria.exportCSVObject)]
        public async Task<IActionResult> ExportCriteriaObject([FromQuery] GetCriteriaOfTargetRequest request)
        {
            var result = await _criteriaService.ExportExcelForObject(request);

            if (result.StatusCode != 200 || result.Data == null)
            {
                return Ok(result);
            }

            var fileResult = result.Data as ExportFileResult;
            if (fileResult?.FileBytes == null || fileResult.FileBytes.Length == 0)
            {
                return NotFound("No data found to export.");
            }

            return File(fileResult.FileBytes, fileResult.ContentType, fileResult.FileName);
        }
    }
}
