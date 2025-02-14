using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.ObjectStatus;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class CropService : ICropService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CropService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> createCrop(CropCreateRequest cropCreateRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if (!cropCreateRequest.FarmId.HasValue || cropCreateRequest.FarmId <= 0)
                        return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                    if (cropCreateRequest.Year < DateTime.Now.Year)
                        return new BusinessResult(Const.WARNING_CREATE_CROP_INVALID_YEAR_VALUE_CODE, Const.WARNING_CREATE_CROP_INVALID_YEAR_VALUE_MSG);
                    if (!cropCreateRequest.LandPlotId.Any())
                        return new BusinessResult(Const.WARNING_CREATE_CROP_MUST_HAVE_LANDPLOT_CODE, Const.WARNING_CREATE_CROP_MUST_HAVE_LANDPLOT_MSG);
                    // Tạo đối tượng Crop mới
                    var crop = new Crop
                    {
                        CropCode = $"CROP-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                        CropName = cropCreateRequest.CropName,
                        Year = cropCreateRequest.Year,
                        CropExpectedTime = cropCreateRequest.CropExpectedTime,
                        //CropActualTime = cropCreateRequest.CropActualTime,
                        HarvestSeason = cropCreateRequest.HarvestSeason,
                        EstimateYield = cropCreateRequest.EstimateYield,
                        //ActualYield = cropCreateRequest.ActualYield,
                        Notes = cropCreateRequest.Notes,
                        //MarketPrice = cropCreateRequest.MarketPrice,
                        Status = nameof(FarmStatus.Active),
                        CreateDate = DateTime.UtcNow,
                        FarmId = cropCreateRequest.FarmId,
                        StartDate = cropCreateRequest.StartDate,
                        EndDate = cropCreateRequest.EndDate,
                        IsDeleted = false
                    };

                    foreach (var landplotId in cropCreateRequest.LandPlotId)
                    {
                        var existLandplot = await _unitOfWork.LandPlotRepository.GetByID(landplotId);
                        if (existLandplot != null)
                        {
                            var landPlotCrop = new LandPlotCrop
                            {
                                LandPlotId = landplotId,
                            };

                            crop.LandPlotCrops.Add(landPlotCrop);
                        }
                    }
                    await _unitOfWork.CropRepository.Insert(crop);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapResult = _mapper.Map<CropModel>(crop);
                        foreach (var landPlotCropItem in mapResult.LandPlotCrops)
                        {
                            landPlotCropItem.LandPlot = null!;
                        }
                        return new BusinessResult(Const.SUCCESS_CREATE_CROP_CODE, Const.SUCCESS_CREATE_CROP_MSG, mapResult);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_CREATE_CROP_CODE, Const.FAIL_CREATE_CROP_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getAllCropOfFarm(int farmId, PaginationParameter paginationParameter, CropFilter cropFilter)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                if(cropFilter.YearFrom.HasValue && cropFilter.YearFrom.HasValue && cropFilter.YearTo < cropFilter.YearFrom)
                {
                    return new BusinessResult(400, "Year to must larger than year from");
                }
                if (cropFilter.ActualYieldTo.HasValue && cropFilter.ActualYieldFrom.HasValue && cropFilter.ActualYieldTo < cropFilter.ActualYieldFrom)
                {
                    return new BusinessResult(400, "Actual yield to must larger than actual yield from");
                }
                if (cropFilter.MarketPriceTo.HasValue && cropFilter.MarketPriceFrom.HasValue && cropFilter.MarketPriceTo < cropFilter.MarketPriceFrom)
                {
                    return new BusinessResult(400, "Market price to must larger than market price from");
                }
                var landPlotCrops = await _unitOfWork.CropRepository.GetAllCropsOfFarm(FarmId: farmId, paginationParameter: paginationParameter, cropFilter: cropFilter);
                if (!landPlotCrops.Any())
                    return new BusinessResult(Const.WARNING_CROP_OF_FARM_EMPTY_CODE, Const.WARNING_CROP_OF_FARM_EMPTY_MSG);
                var mappedResult = _mapper.Map<IEnumerable<CropModel>>(landPlotCrops);
                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, Const.SUCCESS_GET_ALL_CROP_FOUND_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getAllCropOfFarmForSelected(int cropid, string? searchValue)
        {
            try
            {
                if (cropid <= 0)
                    return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                Expression<Func<LandPlotCrop, bool>> filter = x => x.CropID == cropid && x.Crop.EndDate >= DateTime.Now;
                if (!string.IsNullOrEmpty(searchValue))
                {
                    filter = filter.And(x => x.Crop.CropName!.ToLower().Contains(searchValue.ToLower()));
                }
                Func<IQueryable<Crop>, IOrderedQueryable<Crop>> orderBy = x => x.OrderByDescending(x => x.CropId);
                string includeProperties = "Crop";
                var landPlotCrops = await _unitOfWork.LandPlotCropRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties);
                if (!landPlotCrops.Any())
                    return new BusinessResult(Const.WARNING_CROP_OF_FARM_EMPTY_CODE, Const.WARNING_CROP_OF_FARM_EMPTY_MSG);
                var mappedResult = _mapper.Map<IEnumerable<CropModel>>(landPlotCrops.Select(x => x.Crop));
                foreach (var item in mappedResult)
                {
                    item.HarvestHistories = null!;
                    item.LandPlotCrops = null!;
                }
                mappedResult.OrderBy(x => x.CropId).GroupBy(x => x.CropId);
                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, Const.SUCCESS_GET_ALL_CROP_FOUND_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getAllCropOfLandPlot(int landPlotId, PaginationParameter paginationParameter, CropFilter cropFilter)
        {
            try
            {
                if (landPlotId <= 0)
                    return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                if (cropFilter.YearFrom.HasValue && cropFilter.YearFrom.HasValue && cropFilter.YearTo < cropFilter.YearFrom)
                {
                    return new BusinessResult(400, "Year to must larger than year from");
                }
                if (cropFilter.ActualYieldTo.HasValue && cropFilter.ActualYieldFrom.HasValue && cropFilter.ActualYieldTo < cropFilter.ActualYieldFrom)
                {
                    return new BusinessResult(400, "Actual yield to must larger than actual yield from");
                }
                if (cropFilter.MarketPriceTo.HasValue && cropFilter.MarketPriceFrom.HasValue && cropFilter.MarketPriceTo < cropFilter.MarketPriceFrom)
                {
                    return new BusinessResult(400, "Market price to must larger than market price from");
                }
                var landPlotCrops = await _unitOfWork.CropRepository.GetAllCropsOfLandPlot(landPlotId: landPlotId, paginationParameter: paginationParameter, cropFilter: cropFilter);
                if (!landPlotCrops.Any())
                    return new BusinessResult(Const.WARNING_CROP_OF_LANDPLOT_EMPTY_CODE, Const.WARNING_CROP_OF_LANDPLOT_EMPTY_MSG);
                var mappedResult = _mapper.Map<IEnumerable<CropModel>>(landPlotCrops);
                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, Const.SUCCESS_GET_ALL_CROP_FOUND_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getCrop(int CropId)
        {
            try
            {
                var crop = await _unitOfWork.CropRepository.GetByID(CropId);
                if (crop == null)
                    if (crop == null) return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, Const.WARNING_CROP_NOT_EXIST_MSG);
                var mappedResult = _mapper.Map<CropModel>(crop);
                foreach (var cropItem in mappedResult.LandPlotCrops)
                {
                    cropItem.LandPlot = null!;
                }
                return new BusinessResult(Const.SUCCESS_GET_CROP_CODE, Const.SUCCESS_GET_CROP_BY_ID_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> permanentlyDeleteCrop(int cropId)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<Crop, bool>> filter = x => x.CropId == cropId;
                    // set up them trong context moi xoa dc tat ca 1 lan
                    var crop = await _unitOfWork.CropRepository.getCropToDelete(cropId);
                    if (crop == null) return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, Const.WARNING_CROP_NOT_EXIST_MSG);
                    _unitOfWork.CropRepository.Delete(crop);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PERMANENTLY_FARM_CODE, Const.SUCCESS_DELETE_PERMANENTLY_FARM_MSG, new { success = true });
                    }
                    else return new BusinessResult(Const.FAIL_DELETE_CROP_CODE, Const.FAIL_DELETE_CROP_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> softedDeleteCrop(int cropId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // Kiểm tra xem crop có tồn tại không
                    var cropEntityUpdate = await _unitOfWork.CropRepository.GetByID(cropId);

                    if (cropEntityUpdate == null)
                    {
                        return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, Const.WARNING_CROP_NOT_EXIST_MSG);
                    }

                    // Cập nhật các thuộc tính từ model nếu giá trị không null hoặc mặc định
                    cropEntityUpdate.IsDeleted = true;
                    _unitOfWork.CropRepository.Update(cropEntityUpdate);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_UPDATE_CROP_CODE, Const.SUCCESS_UPDATE_CROP_MSG, new { success = true });
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                }
                catch (Exception ex)
                {
                    await transaction.CommitAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }


        public async Task<BusinessResult> updateCrop(CropUpdateInfoRequest cropUpdateRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // Kiểm tra xem crop có tồn tại không
                    var cropEntityUpdate = await _unitOfWork.CropRepository.GetByID(cropUpdateRequest.CropId);

                    if (cropEntityUpdate == null)
                    {
                        return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, Const.WARNING_CROP_NOT_EXIST_MSG);
                    }

                    // Cập nhật các thuộc tính từ model nếu giá trị không null hoặc mặc định
                    foreach (var prop in typeof(CropUpdateInfoRequest).GetProperties())
                    {
                        var newValue = prop.GetValue(cropUpdateRequest);
                        if (newValue != null && !string.IsNullOrEmpty(newValue.ToString()) && !newValue.ToString()!.Equals("string") && !newValue.ToString()!.Equals("0"))
                        {
                            var cropProp = typeof(Crop).GetProperty(prop.Name);
                            if (cropProp != null && cropProp.CanWrite)
                            {
                                cropProp.SetValue(cropEntityUpdate, newValue);
                            }
                        }
                    }

                    _unitOfWork.CropRepository.Update(cropEntityUpdate);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapResult = _mapper.Map<CropModel>(cropEntityUpdate);
                        foreach (var landPlotCropItem in mapResult.LandPlotCrops)
                        {
                            landPlotCropItem.LandPlot = null!;
                        }
                        return new BusinessResult(Const.SUCCESS_UPDATE_CROP_CODE, Const.SUCCESS_UPDATE_CROP_MSG, mapResult);
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                }
                catch (Exception ex)
                {
                    await transaction.CommitAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }
    }
}
