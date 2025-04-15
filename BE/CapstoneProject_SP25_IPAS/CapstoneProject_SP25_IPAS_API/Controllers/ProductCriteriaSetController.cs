using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ProductCriteriaSetRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductCriteriaSetController : ControllerBase
    {
        private readonly ITypeTypeService _typetypeService;
        private readonly IJwtTokenService _jwtTokenService;
        public ProductCriteriaSetController(ITypeTypeService typetypeService, IJwtTokenService jwtTokenService)
        {
            _typetypeService = typetypeService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpGet(APIRoutes.ProductCriteriaSet.getCriteriaSetOfProduct, Name = "getCriteriaSetOfProduct")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getCriteriaSetOfProduct([FromQuery] GetProductCriteriaRequest getRequest)
        {
            try
            {
                var result = await _typetypeService.GetCriteriaSetOfProduct(request: getRequest);
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
        [HttpGet(APIRoutes.ProductCriteriaSet.getForSelectedProduct, Name = "getForSelectedProduct")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getForSelectedProduct([FromQuery] int productId, int? farmId, string target)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (farmId.HasValue)
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Farm is required"
                    });
                var result = await _typetypeService.getCriteriaSetForSelectedProduct(productId: productId, farmId: farmId!.Value, target: target);
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
        [HttpPost(APIRoutes.ProductCriteriaSet.ApplyCriteriaSetToProduct)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> ApplyCriteriaSetToProduct([FromBody] ApplyCriteriaSetToProductRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _typetypeService.ApplyCriteriaSetToProduct(request.ProductId, request.ListCriteriaSet);
            return Ok(result);
        }

        [HttpDelete(APIRoutes.ProductCriteriaSet.DeleteCriteriaSetFromProduct)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> DeleteCriteriaSetFromProduct([FromBody] DeleteCriteriaSetFromProductRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _typetypeService.DeleteCriteriaSetFromProduct(request.ProductId, request.CriteriaSetId);
            return Ok(result);
        }

        [HttpPut(APIRoutes.ProductCriteriaSet.UpdateCriteriaSetStatus)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> UpdateCriteriaSetStatus([FromBody] UpdateProductCriteriaSetRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _typetypeService.UpdateCriteriaSetStatus(request.ProductId, request.CriteriaSetId, request.IsActive!.Value);
            return Ok(result);
        }
    }
}
