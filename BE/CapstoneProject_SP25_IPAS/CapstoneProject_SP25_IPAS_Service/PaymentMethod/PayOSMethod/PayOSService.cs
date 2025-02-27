using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PackageModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Net.payOS.Types;


namespace CapstoneProject_SP25_IPAS_Service.PaymentMethod.PayOS
{
    public class PayOSService : IPayOSService
    {
        private readonly IConfiguration _config;
        private readonly IPackageService _packageService;
        private readonly IFarmService _farmService;
        public PayOSService(IConfiguration config, IPackageService packageService, IFarmService farmService)
        {
            _config = config;
            _packageService = packageService;
            _farmService = farmService;
        }

        private PayOSKey GetPayOSKey()
        {
            return _config.GetSection("PaymentMethod:PayOS").Get<PayOSKey>()!;
        }

        public async Task<BusinessResult> createPaymentLink(CreatePaymentLinkRequest createRequest)
        {
            var _payOSKey = GetPayOSKey();
            // lay package de tinh duoc ngay expired
            var packageExistJson = await _packageService.GetPackageById(createRequest.packageId);
            if (packageExistJson.Data == null || packageExistJson.StatusCode != 200) 
                return packageExistJson;
            var farmExist = await _farmService.CheckFarmExist(createRequest.farmId);
            if (farmExist == null)
                return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
            var package = packageExistJson.Data as PackageModel;
            // tao domain tra ve
            var domain = _payOSKey.Domain;
            var orderCode = long.Parse(DateTimeOffset.Now.ToString("ffffff"));

            var cancleURL = _payOSKey.CanclePath + $"farmId={farmExist.FarmId}&orderCode={orderCode}&packageId={createRequest.packageId}&price={package!.PackagePrice}";
            var returnURL = _payOSKey.ReturnPath + $"farmId={createRequest.farmId}&orderCode={orderCode}&packageId={createRequest.packageId}&price={package.PackagePrice}"; 
            Net.payOS.PayOS payOS = new Net.payOS.PayOS(apiKey: _payOSKey.ApiKey, checksumKey: _payOSKey.ChecksumKey, clientId: _payOSKey.ClientId);
            ItemData item = new ItemData($"{farmExist.FarmName}-{farmExist.FarmCode} x {package!.PackageCode}-{(int)package.Duration!} Days", 1 , (int)package.PackagePrice);
            List<ItemData> items = new List<ItemData>();
            items.Add(item);

            long expiredTimestamp = new DateTimeOffset(DateTime.Now.AddDays((int)package!.Duration!)).ToUnixTimeSeconds();
            PaymentData paymentData = new PaymentData(
                orderCode: orderCode,
                amount: (int)package.PackagePrice,
                description: createRequest.description,
                items: items,
                buyerName: farmExist.FarmName,
                buyerPhone:farmExist.FarmCode,
                //expiredAt: expiredTimestamp,
                cancelUrl: $"{domain}/{cancleURL}",
                returnUrl: $"{domain}/{returnURL}"
                );

            CreatePaymentResult createPayment = await payOS.createPaymentLink(paymentData);
            return new BusinessResult(200, "Create payment success", createPayment);
        }

        public async Task<PaymentLinkInformation> getPaymentLinkInformation(int orderId)
        {
            var _payOSKey = GetPayOSKey();
            Net.payOS.PayOS payOS = new Net.payOS.PayOS(apiKey: _payOSKey.ApiKey, checksumKey: _payOSKey.ChecksumKey, clientId: _payOSKey.ClientId);

            PaymentLinkInformation paymentLinkInformation = await payOS.getPaymentLinkInformation((long)orderId);
            return paymentLinkInformation;
        }

    }
}


