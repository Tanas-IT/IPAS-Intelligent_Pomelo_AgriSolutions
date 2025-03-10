using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.OrderModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using MimeKit.Tnef;
using Newtonsoft.Json;
using ProjNet.CoordinateSystems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPackageService _packageService;
        private readonly IFarmService _farmService;
        public OrderService(IUnitOfWork unitOfWork, IMapper mapper, IPackageService packageService, IFarmService farmService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _packageService = packageService;
            _farmService = farmService;
        }

        public async Task<BusinessResult> CreateOrder(OrderCreateRequest createRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // kiem tra package & farm exist
                    var checkPackageExist = await _packageService.CheckPackageExistAndActive(createRequest.PackageId);
                    if (checkPackageExist == null)
                        return new BusinessResult(Const.WARNING_PACKAGE_TO_CREATE_NOT_ACTIVE_OR_EXIST_CODE, Const.WARNING_PACKAGE_TO_CREATE_NOT_ACTIVE_OR_EXIST_MSG);
                    var checkFarmExist = await _farmService.GetFarmByID(createRequest.FarmId);
                    if (checkFarmExist.StatusCode != 200 || checkFarmExist.Data == null)
                        return checkFarmExist;
                    // get farmcode and packagecode
                    //var farmData = JsonConvert.DeserializeObject<FarmModel>(checkFarmExist.Data);
                    var farmData = checkFarmExist.Data as FarmModel;

                    var getLastExpired = await GetLastExpiredOfFarm(farmId: farmData!.FarmId, newPackageDuration: (int)checkPackageExist.Duration!.Value);
                    var farmCode = Util.SplitByDash(farmData!.FarmCode!);
                    var packagecode = Util.SplitByDash(checkPackageExist.PackageCode!);
                    var orderWithPayment = new Order
                    {
                        OrderCode = $"{CodeAliasEntityConst.ORDER}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}-{farmCode.First()}-{packagecode.First().ToUpper()}",
                        OrderDate = DateTime.Now,
                        TotalPrice = createRequest.TotalPrice,
                        Notes = createRequest.Notes,
                        EnrolledDate = DateTime.Now,
                        //ExpiredDate = DateTime.Now.AddDays((int)checkPackageExist.Duration!),
                        ExpiredDate = getLastExpired,
                        FarmId = farmData.FarmId,
                        PackageId = checkPackageExist.PackageId,
                        Status = OrderStatusEnum.Pending.ToString(),
                    };
                    string ordercode = Util.SplitByDash(orderWithPayment.OrderCode).First();
                    var payment = new Payment
                    {
                        PaymentCode = $"{CodeAliasEntityConst.PAYMENT}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}-{ordercode.ToUpper()}",
                        TransactionId = createRequest.TransactionId,
                        CreateDate = DateTime.Now,
                        PaymentMethod = createRequest.PaymentMethod,
                        Status = createRequest.PaymentStatus,
                    };
                    orderWithPayment.Payment = payment;
                    await _unitOfWork.OrdersRepository.Insert(orderWithPayment);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        var mappedResult = _mapper.Map<OrderModel>(orderWithPayment);
                        return new BusinessResult(Const.SUCCESS_CREATE_ORDER_CODE, Const.SUCCESS_CREATE_ORDER_MSG, mappedResult);
                    }
                    return new BusinessResult(Const.SUCCESS_CREATE_ORDER_CODE, Const.SUCCESS_CREATE_ORDER_MSG);

                }
                catch (Exception ex)
                {
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> GetOrderExpiredOfFarm(int farmId)
        {
            try
            {
                Expression<Func<Order, bool>> filter = x => x.FarmId == farmId && x.ExpiredDate >= DateTime.Now;
                string includeProperties = "Package,Farm";
                //Func<IQueryable<Order>, IOrderedQueryable<Order>> orderBy = x => x.OrderByDescending(x => x.OrderId);

                var order = await _unitOfWork.OrdersRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (order == null)
                    return new BusinessResult(Const.WARNING_FARM_EXPIRED_CODE, Const.WARNING_FARM_EXPIRED_MSG);
                var mappedResult = _mapper.Map<OrderModel>(order);
                return new BusinessResult(Const.SUCCESS_GET_PACKAGES_CODE, Const.SUCCESS_GET_PACKAGES_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetOrdersOfFarm(int farmId, PaginationParameter paginationParameter)
        {
            try
            {
                Expression<Func<Order, bool>> filter = x => x.FarmId == farmId && x.ExpiredDate >= DateTime.Now;
                string includeProperties = "Package,Farm";
                Func<IQueryable<Order>, IOrderedQueryable<Order>> orderBy = x => x.OrderByDescending(x => x.EnrolledDate);

                switch (paginationParameter.SortBy)
                {
                    case "ordercode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.OrderCode)
                                   : x => x.OrderBy(x => x.OrderCode)) : x => x.OrderBy(x => x.OrderCode);
                        break;
                    case "ordername":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.OrderName)
                                   : x => x.OrderBy(x => x.OrderName)) : x => x.OrderBy(x => x.OrderName);
                        break;
                    case "totalprice":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.TotalPrice)
                                   : x => x.OrderBy(x => x.TotalPrice)) : x => x.OrderBy(x => x.TotalPrice);
                        break;
                    case "orderdate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.OrderDate)
                                   : x => x.OrderBy(x => x.OrderDate)) : x => x.OrderBy(x => x.OrderDate);
                        break;
                    case "enrolleddate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.EnrolledDate)
                                   : x => x.OrderBy(x => x.EnrolledDate)) : x => x.OrderBy(x => x.EnrolledDate);
                        break;
                    case "expireddate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ExpiredDate)
                                   : x => x.OrderBy(x => x.ExpiredDate)) : x => x.OrderBy(x => x.ExpiredDate);
                        break;
                    case "packagename":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Package!.PackageName)
                                   : x => x.OrderBy(x => x.Package!.PackageName)) : x => x.OrderBy(x => x.Package!.PackageName);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.FarmId);
                        break;
                }
                var entities = await _unitOfWork.OrdersRepository.Get(filter: filter, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                var pagin = new PageEntity<OrderModel>();
                pagin.List = _mapper.Map<IEnumerable<OrderModel>>(entities).ToList();
                Expression<Func<Order, bool>> filterCount = null!;
                pagin.TotalRecord = await _unitOfWork.OrdersRepository.Count(filter: filterCount);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);


                var order = await _unitOfWork.OrdersRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (order == null)
                    return new BusinessResult(Const.WARNING_GET_PACKAGES_EMPTY_CODE, Const.WARNING_GET_PACKAGES_EMPTY_MSG);
                var mappedResult = _mapper.Map<IEnumerable<OrderModel>>(order);
                return new BusinessResult(Const.SUCCESS_GET_PACKAGES_CODE, Const.SUCCESS_GET_PACKAGES_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public Task<BusinessResult> UpdateOrder(UpdateOrderRequest updateRequest)
        {
            throw new NotImplementedException();
        }

        private async Task<DateTime> GetLastExpiredOfFarm(int farmId, int newPackageDuration)
        {
            try
            {
                var ordersBought = await _unitOfWork.OrdersRepository.GetAllNoPaging(x => x.FarmId == farmId && x.Status!.ToLower().Equals(OrderStatusEnum.Paid.ToString().ToLower()));
                if (ordersBought == null || !ordersBought.Any())
                    return DateTime.Now;
                var lastExpiredDate = ordersBought.Max(x => x.ExpiredDate ?? DateTime.UtcNow);
                if (lastExpiredDate <= DateTime.Now)
                    lastExpiredDate = DateTime.Now;
                else
                {
                    lastExpiredDate.AddDays(newPackageDuration);
                }
                return lastExpiredDate;
            }
            catch (Exception)
            {
                return DateTime.Now;
            }
        }
    }

}
