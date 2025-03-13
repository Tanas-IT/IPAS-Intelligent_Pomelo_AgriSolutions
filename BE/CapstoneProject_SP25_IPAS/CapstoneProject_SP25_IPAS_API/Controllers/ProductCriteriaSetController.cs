using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
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
        public async Task<IActionResult> getCriteriaSetOfProduct([FromQuery]int productId)
        {
            try
            {
                var result = await _typetypeService.GetCriteriaSetForProduct(productId: productId);
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
