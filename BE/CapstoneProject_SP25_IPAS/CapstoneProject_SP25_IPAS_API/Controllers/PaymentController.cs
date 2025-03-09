using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Service.PaymentMethod.PayOSMethod;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPayOSService _payOSService;

        public PaymentController(IPayOSService payOSService)
        {
            _payOSService = payOSService;
        }

        [HttpPost(APIRoutes.Payment.createPaymentLinkPayOS, Name = "createPaymentLinkPayOS")]
        public async Task<IActionResult> createPaymentLinkPayOS([FromBody] CreatePaymentLinkRequest reqObj)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Some thing are need"
                    });
                }
                //var orderCode = int.Parse(DateTimeOffset.Now.ToString("ffffff"));
                var paymentReponse = await _payOSService.createPaymentLink(reqObj);
                return Ok(paymentReponse);
            } catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            } 
        }
    }
}
