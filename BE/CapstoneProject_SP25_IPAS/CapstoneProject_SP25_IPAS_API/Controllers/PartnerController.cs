using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;
using CapstoneProject_SP25_IPAS_Service.Service;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PartnerRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantRequest;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartnerController : ControllerBase
    {
        private readonly IPartnerService _partnerService;
        private readonly IJwtTokenService _jwtTokenService;
        public PartnerController(IPartnerService partnerService, IJwtTokenService jwtTokenService)
        {
            _partnerService = partnerService;
            _jwtTokenService = jwtTokenService;
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Partner.getPartnerWithPagination, Name = "getPartnerWithPagination")]
        public async Task<IActionResult> GetAllPartner([FromQuery] GetPartnerFilterRequest filterRequest, [FromQuery]PaginationParameter paginationParameter)
        {
            try
            {
                if (!filterRequest.FarmId.HasValue)
                    filterRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                if (!filterRequest.FarmId.HasValue)
                    return BadRequest(new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "FarmId cannot be null"
                    });
                var result = await _partnerService.GetAllPartnerPagination(filterRequest, paginationParameter);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Partner.getPartnerById, Name = "getPartnerById")]
        public async Task<IActionResult> GetPartnerById([FromRoute] int id)
        {
            try
            {
                var result = await _partnerService.GetPartnerByID(id);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.Partner.createPartner, Name = "createPartner")]
        public async Task<IActionResult> CreateaPartner([FromBody] CreatePartnerModel createPartnerModel)
        {
            try
            {
                if (!createPartnerModel.FarmId.HasValue)
                    createPartnerModel.FarmId = _jwtTokenService.GetFarmIdFromToken();
                if (!createPartnerModel.FarmId.HasValue)
                    return BadRequest(new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "FarmId cannot be null"
                    });
                var result = await _partnerService.CreatePartner(createPartnerModel);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPut(APIRoutes.Partner.updatePartnerInfo, Name = "updatePartnerInfo")]
        public async Task<IActionResult> UpdatePartner([FromBody] UpdatePartnerModel updatePartnerModel)
        {
            try
            {
                var result = await _partnerService.UpdatePartnerInfo(updatePartnerModel);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.Partner.permanenlyDelete, Name = "permanentlyDeletePartner")]
        public async Task<IActionResult> DeletePartner([FromRoute] int id)
        {
            try
            {
                var result = await _partnerService.PermanentlyDeletePartner(id);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpGet(APIRoutes.Partner.getPartnerByRoleName, Name = "getPartnerByRoleName")]
        public async Task<IActionResult> GetPartnerByRoleName([FromRoute] string roleName)
        {
            try
            {
                var result = await _partnerService.GetPartnerByRoleName(roleName);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpGet(APIRoutes.Partner.getForSelected, Name = "getPartnerForSelected")]
        public async Task<IActionResult> getPartnerForSelected([FromQuery] int? farmId, string? Major)
        {
            try
            {
                if(!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue)
                    return BadRequest(new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "FarmId cannot be null"
                    });
                var result = await _partnerService.GetPartnerForSelected(farmId: farmId!.Value, Major);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPatch(APIRoutes.Partner.softedDeletePartner, Name = "softedDeletePartnerAsync")]
        public async Task<IActionResult> softedDeletePartnerAsync([FromBody] List<int> partners)
        {
            try
            {
                var result = await _partnerService.SoftedMultipleDelete(partners);
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

        [HttpGet(APIRoutes.Partner.exportCSV)]
        public async Task<IActionResult> ExportPartner([FromQuery] int farmId)
        {
            var result = await _partnerService.ExportExcel(farmId);

            if (result.FileBytes == null || result.FileBytes.Length == 0)
            {
                return NotFound("No data found to export.");
            }

            return File(result.FileBytes, result.ContentType, result.FileName);
        }
    }
}
