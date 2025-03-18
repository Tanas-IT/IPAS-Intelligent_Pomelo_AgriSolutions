using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using Net.payOS.Types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service.PaymentMethod.PayOSMethod
{
    public interface IPaymentService
    {
        //public Task<BusinessResult> createPaymentLink(CreatePaymentLinkRequest createPaymentLinkRequest);
        public Task<PaymentLinkInformation> getPaymentLinkInformation(int orderId);
        public Task<BusinessResult> CreatePayOsPaymentForOrder(CreatePaymentLinkRequest createPaymentLinkRequest);
        public Task<BusinessResult> HandlePaymentCallback(PaymentCallbackRequest callback);
        public Task<BusinessResult> GetPaymentInfo(int paymentId);

    }
}
