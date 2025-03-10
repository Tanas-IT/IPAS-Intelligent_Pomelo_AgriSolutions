using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.OrderModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.Extensions.Configuration;
using Net.payOS.Types;


namespace CapstoneProject_SP25_IPAS_Service.PaymentMethod.PayOSMethod
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _config;
        private readonly IPackageService _packageService;
        private readonly IFarmService _farmService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public PaymentService(IConfiguration config, IPackageService packageService, IFarmService farmService, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _config = config;
            _packageService = packageService;
            _farmService = farmService;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        private PayOSKey GetPayOSKey()
        {
            return _config.GetSection("PaymentMethod:PayOS").Get<PayOSKey>()!;
        }

        //public async Task<BusinessResult> createPaymentLink(CreatePaymentLinkRequest createRequest)
        //{
        //    var _payOSKey = GetPayOSKey();
        //    // lay package de tinh duoc ngay expired
        //    var packageExistJson = await _packageService.GetPackageById(createRequest.packageId);
        //    if (packageExistJson.Data == null || packageExistJson.StatusCode != 200)
        //        return packageExistJson;
        //    var farmExist = await _farmService.CheckFarmExist(createRequest.farmId);
        //    if (farmExist == null)
        //        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
        //    var package = packageExistJson.Data as PackageModel;
        //    // tao domain tra ve
        //    var domain = _payOSKey.Domain;
        //    var orderCode = long.Parse(DateTimeOffset.Now.ToString("ffffff"));

        //    var cancleURL = _payOSKey.CanclePath + $"farmId={farmExist.FarmId}&orderCode={orderCode}&packageId={createRequest.packageId}&price={package!.PackagePrice}";
        //    var returnURL = _payOSKey.ReturnPath + $"farmId={createRequest.farmId}&orderCode={orderCode}&packageId={createRequest.packageId}&price={package.PackagePrice}";
        //    Net.payOS.PayOS payOS = new Net.payOS.PayOS(apiKey: _payOSKey.ApiKey, checksumKey: _payOSKey.ChecksumKey, clientId: _payOSKey.ClientId);
        //    ItemData item = new ItemData($"{farmExist.FarmName}-{farmExist.FarmCode} x {package!.PackageCode}-{(int)package.Duration!} Days", 1, (int)package.PackagePrice);
        //    List<ItemData> items = new List<ItemData>();
        //    items.Add(item);

        //    long expiredTimestamp = new DateTimeOffset(DateTime.Now.AddDays((int)package!.Duration!)).ToUnixTimeSeconds();
        //    PaymentData paymentData = new PaymentData(
        //        orderCode: orderCode,
        //        amount: (int)package.PackagePrice,
        //        description: createRequest.description,
        //        items: items,
        //        buyerName: farmExist.FarmName,
        //        buyerPhone: farmExist.FarmCode,
        //        //expiredAt: expiredTimestamp,
        //        cancelUrl: $"{domain}/{cancleURL}",
        //        returnUrl: $"{domain}/{returnURL}"
        //        );

        //    CreatePaymentResult createPayment = await payOS.createPaymentLink(paymentData);
        //    return new BusinessResult(200, "Create payment success", createPayment);
        //}

        public async Task<PaymentLinkInformation> getPaymentLinkInformation(int orderId)
        {
            var _payOSKey = GetPayOSKey();
            Net.payOS.PayOS payOS = new Net.payOS.PayOS(apiKey: _payOSKey.ApiKey, checksumKey: _payOSKey.ChecksumKey, clientId: _payOSKey.ClientId);

            PaymentLinkInformation paymentLinkInformation = await payOS.getPaymentLinkInformation(orderId);
            return paymentLinkInformation;
        }

        /// <summary>
        /// Tao payment o db --> tao paymentlink
        /// </summary>
        /// <returns>Link payment</returns>
        public async Task<BusinessResult> CreatePayOsPaymentForOrder(CreatePaymentLinkRequest createRequest)
        {
            try
            {
                var order = await _unitOfWork.OrdersRepository.GetByCondition(x => x.OrderId == createRequest.OrderId);
                if (order == null)
                    return new BusinessResult(400, "Order not found");

                if (order.Status == OrderStatusEnum.Paid.ToString())
                    return new BusinessResult(400, "Order is already paid");

                // Kiểm tra xem Order đã có Payment chưa
                var existingPayment = await _unitOfWork.PaymentRepository.GetByCondition(x => x.OrderId == createRequest.OrderId);
                if (existingPayment != null)
                    return new BusinessResult(400, "Payment already exists for this Order");

                // Lấy thông tin PayOS
                var _payOSKey = GetPayOSKey();
                Net.payOS.PayOS payOS = new Net.payOS.PayOS(apiKey: _payOSKey.ApiKey, checksumKey: _payOSKey.ChecksumKey, clientId: _payOSKey.ClientId);

                ItemData item = new ItemData($"Order {order.OrderCode}", 1, (int)order.TotalPrice!);
                List<ItemData> items = new List<ItemData> { item };

                long expiredTimestamp = new DateTimeOffset(order.ExpiredDate ?? DateTime.UtcNow).ToUnixTimeSeconds();
                // transactionId for payment
                var paymentCode = long.Parse(DateTimeOffset.Now.ToString("ffffff"));
                PaymentData paymentData = new PaymentData(
                    orderCode: paymentCode,
                    amount: (int)order.TotalPrice,
                    description: createRequest.description,
                    buyerName: order.Farm!.FarmName,
                    items: items,
                    buyerPhone: order.Farm.FarmCode,
                    cancelUrl: $"{_payOSKey.Domain}/{_payOSKey.CanclePath}?orderId={createRequest.OrderId}",
                    returnUrl: $"{_payOSKey.Domain}/{_payOSKey.ReturnPath}?orderId={createRequest.OrderId}"
                );

                CreatePaymentResult createPayment = await payOS.createPaymentLink(paymentData);

                // Lưu thông tin thanh toán vào DB
                var payment = new Payment
                {
                    OrderId = order.OrderId,
                    PaymentCode = $"{CodeAliasEntityConst.PAYMENT}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}-{Util.SplitByDash(order.OrderCode!).First()}",
                    //TransactionId = paymentCode.ToString(),
                    Status = OrderStatusEnum.Pending.ToString(),
                    CreateDate = DateTime.UtcNow,
                    PaymentMethod = PaymentMethodEnum.PayOS.ToString(),
                };

                await _unitOfWork.PaymentRepository.Insert(payment);
                int result = await _unitOfWork.SaveAsync();
                if (result > 0)
                    return new BusinessResult(200, "Payment created successfully", createPayment);

                return new BusinessResult(400, "Failed to create payment");
            }
            catch (Exception ex)
            {
                return new BusinessResult(500, ex.Message);
            }
        }

        public async Task<BusinessResult> HandlePaymentCallback(PaymentCallbackRequest callback)
        {
            try
            {
                var payment = await _unitOfWork.PaymentRepository.GetByCondition(x => x.TransactionId == callback.TransactionId);
                if (payment == null)
                    return new BusinessResult(400, "Payment not found");

                if (callback.Status == "Success")
                {
                    // Cập nhật trạng thái thanh toán
                    payment.Status = "Paid";
                    payment.TransactionId = callback.TransactionId;
                    _unitOfWork.PaymentRepository.Update(payment);

                    // Cập nhật Order
                    var order = await _unitOfWork.OrdersRepository.GetByCondition(x => x.OrderId == payment.OrderId);
                    if (order != null)
                    {
                       
                        order.Status = OrderStatusEnum.Paid.ToString();
                        _unitOfWork.OrdersRepository.Update(order);
                    }

                    await _unitOfWork.SaveAsync();
                    return new BusinessResult(200, "Payment completed successfully");
                }
                else
                {
                    payment.Status = "Failed";
                    _unitOfWork.PaymentRepository.Update(payment);
                    await _unitOfWork.SaveAsync();
                    return new BusinessResult(400, "Payment failed");
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(500, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPaymentInfo(int paymentId)
        {
            try
            {
                var payment = await _unitOfWork.PaymentRepository.GetByCondition(x => x.PaymentId == paymentId, "Order");
                if (payment == null)
                    return new BusinessResult(400, "Payment not found");

                var mappedResult = _mapper.Map<PaymentModel>(payment);
                return new BusinessResult(200, "Payment retrieved successfully", mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}


