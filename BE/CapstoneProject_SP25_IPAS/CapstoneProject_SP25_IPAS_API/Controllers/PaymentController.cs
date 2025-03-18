using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Service.Service.PaymentMethod.PayOSMethod;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService payOSService)
        {
            _paymentService = payOSService;
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
                var paymentReponse = await _paymentService.CreatePayOsPaymentForOrder(reqObj);
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
        [HttpGet(APIRoutes.Payment.getPaymentInfo, Name = "getPaymentInfo")]
        public async Task<IActionResult> GetPaymentInfo([FromQuery] int paymentId)
        {
            try
            {
                var result = await _paymentService.GetPaymentInfo(paymentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse { StatusCode = 400, Message = ex.Message });
            }
        }

        [HttpPut(APIRoutes.Payment.handdlePayment)]
        public async Task<IActionResult> handdlePayment (PaymentCallbackRequest request)
        {
            try
            {
                var result = await _paymentService.HandlePaymentCallback(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse { StatusCode = 400, Message = ex.Message });
            }
        }
    }
}
