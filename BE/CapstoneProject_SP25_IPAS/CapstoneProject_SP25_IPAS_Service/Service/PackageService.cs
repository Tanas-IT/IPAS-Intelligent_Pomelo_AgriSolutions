using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.OrderModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using MailKit.Search;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PackageService : IPackageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public PackageService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PackageModel> CheckPackageExistAndActive(int packageId)
        {
            try
            {
                Expression<Func<Package, bool>> filter = x => x.IsActive == true && x.PackageId == packageId;
                string includeProperties = "PackageDetails";
                var packages = await _unitOfWork.PackageRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (packages == null)
                    return null!;
                var mappedResult = _mapper.Map<PackageModel>(packages);
                return mappedResult;
            }
            catch (Exception)
            {
                return null!;
            }
        }

        public async Task<BusinessResult> GetAllPackage()
        {
            try
            {
                Expression<Func<Package, bool>> filter = null!;
                Func<IQueryable<Package>, IOrderedQueryable<Package>> orderBy = x => x.OrderByDescending(x => x.PackageId);
                string includeProperties = "PackageDetails";
                var packages = await _unitOfWork.PackageRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (packages == null)
                    return new BusinessResult(Const.WARNING_GET_PACKAGES_EMPTY_CODE, Const.WARNING_GET_PACKAGES_EMPTY_MSG);
                var mappedResult = _mapper.Map<IEnumerable<PackageModel>>(packages);
                return new BusinessResult(Const.SUCCESS_GET_PACKAGES_CODE, Const.SUCCESS_GET_PACKAGES_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetListPackageToBuy()
        {
            try
            {
                Expression<Func<Package, bool>> filter = x => x.IsActive == true;
                Func<IQueryable<Package>, IOrderedQueryable<Package>> orderBy = x => x.OrderByDescending(x => x.PackageId);
                string includeProperties = "PackageDetails";
                var packages = await _unitOfWork.PackageRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (packages == null)
                    return new BusinessResult(Const.WARNING_GET_PACKAGES_EMPTY_CODE, Const.WARNING_GET_PACKAGES_EMPTY_MSG);
                var mappedResult = _mapper.Map<IEnumerable<PackageModel>>(packages);
                return new BusinessResult(Const.SUCCESS_GET_PACKAGES_CODE, Const.SUCCESS_GET_PACKAGES_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPackageById(int packageId)
        {
            try
            {
                Expression<Func<Package, bool>> filter = x => /*x.IsActive == true &&*/ x.PackageId == packageId;
                string includeProperties = "PackageDetails";
                var packages = await _unitOfWork.PackageRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (packages == null)
                    return new BusinessResult(Const.WARNING_GET_PACKAGES_EMPTY_CODE, Const.WARNING_GET_PACKAGES_EMPTY_MSG);
                var mappedResult = _mapper.Map<PackageModel>(packages);
                return new BusinessResult(Const.SUCCESS_GET_PACKAGES_CODE, Const.SUCCESS_GET_PACKAGES_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //public async Task<BusinessResult> GetPackageExpiredOfFarm(int farmId)
        //{
        //    try
        //    {
        //        Expression<Func<Order, bool>> filter = x => x.FarmId == farmId && x.ExpiredDate >= DateTime.Now;
        //        string includeProperties = "Package,Farm";
        //        //Func<IQueryable<Order>, IOrderedQueryable<Order>> orderBy = x => x.OrderByDescending(x => x.OrderId);

        //        var packages = await _unitOfWork.OrdesRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
        //        if (packages == null)
        //            return new BusinessResult(Const.WARNING_GET_PACKAGES_EMPTY_CODE, Const.WARNING_GET_PACKAGES_EMPTY_MSG);
        //        var mappedResult = _mapper.Map<PackageModel>(packages);
        //        return new BusinessResult(Const.SUCCESS_GET_PACKAGES_CODE, Const.SUCCESS_GET_PACKAGES_MSG, mappedResult);
        //    }
        //    catch (Exception ex)
        //    {
        //        return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //    }
        //}
    }
}
