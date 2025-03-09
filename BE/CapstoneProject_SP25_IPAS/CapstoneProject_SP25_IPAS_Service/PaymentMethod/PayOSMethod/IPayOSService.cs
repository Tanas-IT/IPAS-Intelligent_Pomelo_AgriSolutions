using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using Net.payOS.Types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.PaymentMethod.PayOSMethod
{
    public interface IPayOSService
    {
        public Task<BusinessResult> createPaymentLink(CreatePaymentLinkRequest createPaymentLinkRequest);
        public Task<PaymentLinkInformation> getPaymentLinkInformation(int orderId);
    }
}
