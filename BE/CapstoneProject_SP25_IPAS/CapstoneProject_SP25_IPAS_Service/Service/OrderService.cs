using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PackageModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
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

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> GetOrderExpiredOfFarm(int farmId)
        {
            try
            {
                Expression<Func<Order, bool>> filter = x => x.FarmId == farmId && x.ExpiredDate >= DateTime.Now;
                string includeProperties = "Package,Farm";
                //Func<IQueryable<Order>, IOrderedQueryable<Order>> orderBy = x => x.OrderByDescending(x => x.OrderId);

                var order = await _unitOfWork.OrdesRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
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
                var entities = await _unitOfWork.OrdesRepository.Get( filter:filter, orderBy:orderBy , pageIndex :paginationParameter.PageIndex, pageSize:paginationParameter.PageSize);
                var pagin = new PageEntity<OrderModel>();
                pagin.List = _mapper.Map<IEnumerable<OrderModel>>(entities).ToList();
                Expression<Func<Order, bool>> filterCount = null!;
                pagin.TotalRecord = await _unitOfWork.OrdesRepository.Count(filter: filterCount);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);


                var order = await _unitOfWork.OrdesRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
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
    }
}
