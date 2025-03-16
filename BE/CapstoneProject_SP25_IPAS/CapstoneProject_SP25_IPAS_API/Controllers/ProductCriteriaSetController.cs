using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ProductCriteriaSetRequest;
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.ProductCriteriaSet.getCriteriaSetOfProduct, Name = "getCriteriaSetOfProduct")]
        public async Task<IActionResult> getCriteriaSetOfProduct([FromQuery] int productId)
        {
            try
            {
                var result = await _typetypeService.GetCriteriaSetOfProduct(productId: productId);
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
        [HttpGet(APIRoutes.ProductCriteriaSet.getForSelectedProduct, Name = "getForSelectedProduct")]
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.ProductCriteriaSet.ApplyCriteriaSetToProduct)]
        public async Task<IActionResult> ApplyCriteriaSetToProduct([FromBody] ApplyCriteriaSetToProductRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _typetypeService.ApplyCriteriaSetToProduct(request.ProductId, request.ListCriteriaSet);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.ProductCriteriaSet.DeleteCriteriaSetFromProduct)]
        public async Task<IActionResult> DeleteCriteriaSetFromProduct([FromBody] DeleteCriteriaSetFromProductRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _typetypeService.DeleteCriteriaSetFromProduct(request.ProductId, request.CriteriaSetId);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPut(APIRoutes.ProductCriteriaSet.UpdateCriteriaSetStatus)]
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
