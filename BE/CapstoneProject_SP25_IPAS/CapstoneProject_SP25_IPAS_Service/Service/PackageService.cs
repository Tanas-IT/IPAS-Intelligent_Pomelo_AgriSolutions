using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.OrderModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
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
                Func<IQueryable<Package>, IOrderedQueryable<Package>> orderBy = x => x.OrderBy(x => x.PackageId);
                string includeProperties = "PackageDetails";
                var packages = await _unitOfWork.PackageRepository.Get(filter: filter, includeProperties:
includeProperties, orderBy: orderBy, pageIndex: 1, pageSize: 3);
                //                var packages = await _unitOfWork.PackageRepository.GetAllNoPaging(filter: filter, includeProperties:
                //includeProperties, orderBy: orderBy);
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

        //        public async Task<BusinessResult> GetListPackage()
        //        {
        //            try
        //            {
        //                Expression<Func<Package, bool>> filter = null!;
        //                Func<IQueryable<Package>, IOrderedQueryable<Package>> orderBy = x => x.OrderByDescending(x => x.PackageId);
        //                string includeProperties = "PackageDetails";
        //                var packages = await _unitOfWork.PackageRepository.GetAllNoPaging(filter: filter, includeProperties:
        //includeProperties, orderBy: orderBy);
        //                if (packages == null)
        //                    return new BusinessResult(Const.WARNING_GET_PACKAGES_EMPTY_CODE, Const.WARNING_GET_PACKAGES_EMPTY_MSG);
        //                var mappedResult = _mapper.Map<IEnumerable<PackageModel>>(packages);
        //                return new BusinessResult(Const.SUCCESS_GET_PACKAGES_CODE, Const.SUCCESS_GET_PACKAGES_MSG, mappedResult);
        //            }
        //            catch (Exception ex)
        //            {
        //                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //            }
        //        }

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

        public async Task<BusinessResult> UpdatePackageAsync(UpdatePackageRequest request)
        {
            try
            {
                var package = await _unitOfWork.PackageRepository
                    .GetByCondition(p => p.PackageId == request.PackageId, includeProperties: "PackageDetails");

                if (package == null)
                    return new BusinessResult(400, "Package not found");

                // Cập nhật thông tin chính
                if (!string.IsNullOrEmpty(request.PackageName))
                    package.PackageName = request.PackageName;
                if (request.PackagePrice.HasValue)
                    package.PackagePrice = request.PackagePrice;
                if (request.Duration.HasValue)
                    package.Duration = request.Duration;
                if (!string.IsNullOrEmpty(request.Status))
                    package.Status = request.Status;
                if (request.IsActive.HasValue)
                    package.IsActive = request.IsActive;
                package.UpdateDate = DateTime.Now;

                var existingDetails = package.PackageDetails.ToList();

                var updateDetails = new List<PackageDetail>();
                var insertDetails = new List<PackageDetail>();

                foreach (var detailDto in request.PackageDetails)
                {
                    if (detailDto.PackageDetailId.HasValue)
                    {
                        // Update
                        var existingDetail = existingDetails
                            .FirstOrDefault(d => d.PackageDetailId == detailDto.PackageDetailId.Value);

                        if (existingDetail != null)
                        {
                            existingDetail.FeatureName = detailDto.FeatureName;
                            existingDetail.FeatureDescription = detailDto.FeatureDescription;
                            updateDetails.Add(existingDetail);
                        }
                    }
                    else
                    {
                        // Insert
                        var newDetail = new PackageDetail
                        {
                            PackageDetailCode = CodeAliasEntityConst.PACKAGE_DETAIL + CodeHelper.GenerateCode(),
                            FeatureName = detailDto.FeatureName,
                            FeatureDescription = detailDto.FeatureDescription,
                            PackageId = package.PackageId
                        };
                        insertDetails.Add(newDetail);
                    }
                }

                // Xử lý xóa các detail không còn trong request
                var requestDetailIds = request.PackageDetails
                    .Where(d => d.PackageDetailId.HasValue)
                    .Select(d => d.PackageDetailId.Value)
                    .ToHashSet();

                var toRemove = existingDetails
                    .Where(d => !requestDetailIds.Contains(d.PackageDetailId))
                    .ToList();

                // Các thao tác với repository
                if (updateDetails.Any())
                    _unitOfWork.PackageDetailRepository.UpdateRange(updateDetails);

                if (insertDetails.Any())
                    await _unitOfWork.PackageDetailRepository.InsertRangeAsync(insertDetails);

                if (toRemove.Any())
                    _unitOfWork.PackageDetailRepository.RemoveRange(toRemove);
                _unitOfWork.PackageRepository.Update(package);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                    return new BusinessResult(200, "Package updated successfully");
                return new BusinessResult(400, "Package updated fail");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }


        public async Task<BusinessResult> CreatePackageAsync(CreatePackageRequest request)
        {
            try
            {
                // Tạo mới package entity
                var package = new Package
                {
                    PackageName = request.PackageName,
                    PackagePrice = request.PackagePrice,
                    Duration = request.Duration,
                    Status = PackageStatusConst.IN_ACTIVE,
                    IsActive = request.IsActive,
                    CreateDate = DateTime.Now,
                    PackageCode = CodeAliasEntityConst.PACKAGE + CodeHelper.GenerateCode()
                };

                // Tạo danh sách PackageDetails nếu có
                if (request.PackageDetails != null && request.PackageDetails.Any())
                {
                    foreach (var detailDto in request.PackageDetails)
                    {
                        var detail = new PackageDetail
                        {
                            PackageDetailCode = CodeAliasEntityConst.PACKAGE_DETAIL + CodeHelper.GenerateCode(), // bạn có thể tạo cách khác
                            FeatureName = detailDto.FeatureName,
                            FeatureDescription = detailDto.FeatureDescription
                        };

                        package.PackageDetails.Add(detail);
                    }
                }

                await _unitOfWork.PackageRepository.Insert(package);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    var mappedResult = _mapper.Map<PackageModel>(package);
                    return new BusinessResult(200, "Package Create successfully", package);
                }
                return new BusinessResult(400, "Package Create fail");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

        public async Task<BusinessResult> DeletePackageAsync(int packageId)
        {
            try
            {

                var package = await _unitOfWork.PackageRepository
                    .GetByCondition(p => p.PackageId == packageId, includeProperties: "PackageDetails");

                if (package == null)
                    return new BusinessResult(400, "Package not found");

                // Xóa các package detail trước
                _unitOfWork.PackageDetailRepository.RemoveRange(package.PackageDetails.ToList());

                // Xóa package
                _unitOfWork.PackageRepository.Delete(package);

                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(200, "Package deleted successfully");
                }
                return new BusinessResult(400, "Package delete fail");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }
    }
}
