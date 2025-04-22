using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CropRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net.WebSockets;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static Org.BouncyCastle.Crypto.Engines.SM2Engine;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class CropService : ICropService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IExcelReaderService _excelReaderService;
        public CropService(IUnitOfWork unitOfWork, IMapper mapper, IExcelReaderService excelReaderService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _excelReaderService = excelReaderService;
        }

        public async Task<BusinessResult> createCrop(CropCreateRequest cropCreateRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if (!cropCreateRequest.FarmId.HasValue || cropCreateRequest.FarmId <= 0)
                        return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                    if (cropCreateRequest.StartDate <= DateTime.Now)
                        return new BusinessResult(Const.WARNING_CREATE_CROP_INVALID_YEAR_VALUE_CODE, Const.WARNING_CREATE_CROP_INVALID_YEAR_VALUE_MSG);
                    //if (cropCreateRequest.EndDate <= DateTime.Now)
                    //    return new BusinessResult(Const.WARNING_CREATE_CROP_INVALID_YEAR_VALUE_CODE, Const.WARNING_CREATE_CROP_INVALID_YEAR_VALUE_MSG);
                    if (cropCreateRequest.EndDate < cropCreateRequest.StartDate)
                        return new BusinessResult(400, "End date of crop must later than start date");
                    if (!cropCreateRequest.LandPlotId.Any())
                        return new BusinessResult(Const.WARNING_CREATE_CROP_MUST_HAVE_LANDPLOT_CODE, Const.WARNING_CREATE_CROP_MUST_HAVE_LANDPLOT_MSG);
                    // Tạo đối tượng Crop mới
                    //var lastId = await _unitOfWork.CropRepository.GetLastID();
                    var crop = new Crop
                    {
                        CropCode = $"{CodeAliasEntityConst.CROP}{CodeHelper.GenerateCode()}-{cropCreateRequest.StartDate!.Value.ToString("ddMMyy")}-{cropCreateRequest.EndDate!.Value.ToString("ddMMyy")}",
                        CropName = cropCreateRequest.CropName,
                        //Year = cropCreateRequest.Year,
                        CropExpectedTime = cropCreateRequest.CropExpectedTime,
                        //CropActualTime = cropCreateRequest.CropActualTime,
                        HarvestSeason = cropCreateRequest.HarvestSeason,
                        EstimateYield = cropCreateRequest.EstimateYield,
                        //ActualYield = cropCreateRequest.ActualYield,
                        Notes = cropCreateRequest.Notes,
                        //MarketPrice = cropCreateRequest.MarketPrice,
                        //Status = nameof(FarmStatus.Active),
                        CreateDate = DateTime.UtcNow,
                        FarmId = cropCreateRequest.FarmId,
                        StartDate = cropCreateRequest.StartDate,
                        EndDate = cropCreateRequest.EndDate,
                        IsDeleted = false
                    };
                    if (crop.StartDate > DateTime.Now)
                        crop.Status = CropStatusConst.Planned;
                    else crop.Status = CropStatusConst.InCrop;
                    foreach (var landplotId in cropCreateRequest.LandPlotId)
                    {
                        var existLandplot = await _unitOfWork.LandPlotRepository.GetByID(landplotId);
                        var checkLandPlotInCurCrop = await _unitOfWork.LandPlotCropRepository.GetByCondition(x =>
                                                                        x.LandPlotId == landplotId
                                                                        && x.CropID != crop.CropId
                                                                        && x.Crop.StartDate <= cropCreateRequest.StartDate
                                                                        && x.Crop.EndDate >= cropCreateRequest.EndDate, "Crop");
                        // check thua do co vao mua do chua - khong cho nam trong 2 mua long voi nhau
                        if (checkLandPlotInCurCrop != null)
                            return new BusinessResult(400, $"Plot '{existLandplot.LandPlotName}' is in crop '{checkLandPlotInCurCrop.Crop.CropName}' at time {checkLandPlotInCurCrop.Crop.StartDate.Value.Date.ToString("dd/MM/yyyy")}-{checkLandPlotInCurCrop.Crop.EndDate.Value.Date.ToString("dd/MM/yyyy")}");

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
                        //foreach (var landPlotCropItem in mapResult.LandPlotCrops)
                        //{
                        //    landPlotCropItem.LandPlot = null!;
                        //}
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

                Expression<Func<Crop, bool>> filter = x => x.FarmId == farmId && x.IsDeleted == false;
                Func<IQueryable<Crop>, IOrderedQueryable<Crop>> orderBy = x => x.OrderByDescending(x => x.CropId);
                // Lọc theo SearchText
                if (!string.IsNullOrEmpty(cropFilter.LandPlotIds))
                {
                    List<int> filterList = Util.ParseCommaSeparatedIntList(cropFilter.LandPlotIds!);
                    filter = filter.And(x => x.LandPlotCrops.Any(lc => filterList.Contains(lc.LandPlotId)));
                }
                if (!string.IsNullOrWhiteSpace(paginationParameter.Search))
                {
                    filter = filter.And(c => c.CropName!.ToLower().Contains(paginationParameter.Search.ToLower()) ||
                                                c.HarvestSeason!.ToLower().Contains(paginationParameter.Search.ToLower()));
                }

                // Lọc theo Date
                if (cropFilter.DateFrom.HasValue && cropFilter.DateFrom.HasValue)
                {
                    if (cropFilter.DateTo < cropFilter.DateFrom)
                    {
                        return new BusinessResult(400, "Year to must larger than year from");
                    }
                    filter = filter.And(c => c.StartDate >= cropFilter.DateFrom.Value && c.EndDate <= cropFilter.DateTo!.Value);
                }

                if (!string.IsNullOrEmpty(cropFilter.HarvestSeason))
                {
                    filter = filter.And(c => c.HarvestSeason!.Equals(cropFilter.HarvestSeason));
                }
                // Lọc theo Actual yiel from
                if (cropFilter.ActualYieldFrom.HasValue && cropFilter.ActualYieldTo.HasValue)
                {
                    if (cropFilter.ActualYieldTo < cropFilter.ActualYieldFrom)
                    {
                        return new BusinessResult(400, "Actual yield to must larger than actual yield from");
                    }
                    filter = filter.And(c => c.ActualYield >= cropFilter.ActualYieldFrom.Value && c.ActualYield <= cropFilter.ActualYieldTo.Value);
                }
                // Lọc theo Actual yiel from
                if (cropFilter.MarketPriceFrom.HasValue && cropFilter.MarketPriceTo.HasValue)
                {
                    if (cropFilter.MarketPriceTo < cropFilter.MarketPriceFrom)
                    {
                        return new BusinessResult(400, "Market price to must larger than market price from");
                    }
                    filter = filter.And(c => c.MarketPrice >= cropFilter.MarketPriceFrom.Value && c.MarketPrice <= cropFilter.MarketPriceTo.Value);
                }
                // Lọc theo Status
                if (!string.IsNullOrEmpty(cropFilter.Status))
                {
                    var listStatus = Util.SplitByComma(cropFilter.Status);
                    foreach (var item in listStatus)
                    {
                        filter = filter.And(c => c.Status!.ToLower().Equals(cropFilter.Status.ToLower()));
                    }
                }
                ApplySorting(ref orderBy, paginationParameter.SortBy, paginationParameter.Direction);

                var landPlotCrops = await _unitOfWork.CropRepository.Get(filter: filter, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                var pagin = new PageEntity<CropModel>();
                pagin.List = _mapper.Map<IEnumerable<CropModel>>(landPlotCrops).ToList();
                pagin.TotalRecord = await _unitOfWork.CropRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);

                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, Const.SUCCESS_GET_ALL_CROP_FOUND_MSG, pagin);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getAllCropOfPlotForSelected(int plotId, string? searchValue)
        {
            try
            {
                if (plotId <= 0)
                    return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                Expression<Func<LandPlotCrop, bool>> filter = x => x.LandPlotId == plotId;
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
                    //item.HarvestHistories = null!;
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
                //if (cropFilter.DateFrom.HasValue && cropFilter.DateFrom.HasValue && cropFilter.DateTo < cropFilter.DateFrom)
                //{
                //    return new BusinessResult(400, "Year to must larger than year from");
                //}
                //if (cropFilter.ActualYieldTo.HasValue && cropFilter.ActualYieldFrom.HasValue && cropFilter.ActualYieldTo < cropFilter.ActualYieldFrom)
                //{
                //    return new BusinessResult(400, "Actual yield to must larger than actual yield from");
                //}
                //if (cropFilter.MarketPriceTo.HasValue && cropFilter.MarketPriceFrom.HasValue && cropFilter.MarketPriceTo < cropFilter.MarketPriceFrom)
                //{
                //    return new BusinessResult(400, "Market price to must larger than market price from");
                //}
                //var landPlotCrops = await _unitOfWork.CropRepository.GetAllCropsOfLandPlot(landPlotId: landPlotId, paginationParameter: paginationParameter, cropFilter: cropFilter);
                Expression<Func<Crop, bool>> filter = x => x.LandPlotCrops.Select(lc => lc.LandPlotId).Contains(landPlotId);
                Func<IQueryable<Crop>, IOrderedQueryable<Crop>> orderBy = x => x.OrderByDescending(x => x.CropId);
                // Lọc theo SearchText
                if (!string.IsNullOrEmpty(cropFilter.LandPlotIds))
                {
                    List<string> filterList = Util.SplitByComma(cropFilter.LandPlotIds!);
                    filter = filter.And(x => filterList.Contains(x.LandPlotCrops.Select(lc => lc.LandPlotId).ToString()!));
                }
                if (!string.IsNullOrWhiteSpace(paginationParameter.Search))
                {
                    filter = filter.And(c => c.CropName!.Contains(paginationParameter.Search));
                }

                // Lọc theo Date
                if (cropFilter.DateFrom.HasValue && cropFilter.DateFrom.HasValue)
                {
                    if (cropFilter.DateTo < cropFilter.DateFrom)
                    {
                        return new BusinessResult(400, "Year to must larger than year from");
                    }
                    filter = filter.And(c => c.StartDate >= cropFilter.DateFrom.Value && c.EndDate <= cropFilter.DateTo!.Value);
                }

                if (!string.IsNullOrEmpty(cropFilter.HarvestSeason))
                {
                    filter = filter.And(c => c.HarvestSeason!.Equals(cropFilter.HarvestSeason));
                }
                // Lọc theo Actual yiel from
                if (cropFilter.ActualYieldFrom.HasValue && cropFilter.ActualYieldTo.HasValue)
                {
                    if (cropFilter.ActualYieldTo < cropFilter.ActualYieldFrom)
                    {
                        return new BusinessResult(400, "Actual yield to must larger than actual yield from");
                    }
                    filter = filter.And(c => c.ActualYield >= cropFilter.ActualYieldFrom.Value && c.ActualYield <= cropFilter.ActualYieldTo.Value);
                }
                // Lọc theo Actual yiel from
                if (cropFilter.MarketPriceFrom.HasValue && cropFilter.MarketPriceTo.HasValue)
                {
                    if (cropFilter.MarketPriceTo < cropFilter.MarketPriceFrom)
                    {
                        return new BusinessResult(400, "Market price to must larger than market price from");
                    }
                    filter = filter.And(c => c.MarketPrice >= cropFilter.MarketPriceFrom.Value && c.MarketPrice <= cropFilter.MarketPriceTo.Value);
                }
                // Lọc theo Status
                if (!string.IsNullOrEmpty(cropFilter.Status))
                {
                    var listStatus = Util.SplitByComma(cropFilter.Status);
                    foreach (var item in listStatus)
                    {
                        filter = filter.And(c => c.Status!.ToLower().Equals(cropFilter.Status.ToLower()));
                    }
                }
                ApplySorting(ref orderBy, paginationParameter.SortBy, paginationParameter.Direction);

                var landPlotCrops = await _unitOfWork.CropRepository.Get(filter: filter, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                var pagin = new PageEntity<CropModel>();
                pagin.List = _mapper.Map<IEnumerable<CropModel>>(landPlotCrops).ToList();
                pagin.TotalRecord = await _unitOfWork.CropRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                //if (!landPlotCrops.Any())
                //    return new BusinessResult(Const.WARNING_CROP_OF_LANDPLOT_EMPTY_CODE, Const.WARNING_CROP_OF_LANDPLOT_EMPTY_MSG);
                //var mappedResult = _mapper.Map<IEnumerable<CropModel>>(landPlotCrops);
                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, Const.SUCCESS_GET_ALL_CROP_FOUND_MSG, pagin);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getCropById(int CropId)
        {
            try
            {
                var crop = await _unitOfWork.CropRepository.GetByID(CropId);
                if (crop == null)
                    if (crop == null) return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, Const.WARNING_CROP_NOT_EXIST_MSG);
                var mappedResult = _mapper.Map<CropModel>(crop);
                // tinh tong tat ca san pham ma da ghi nhan thu hoach
                foreach (var harvest in crop.HarvestHistories)
                {
                    var ProdutRecord = harvest.ProductHarvestHistories.Where(x => x.PlantId.HasValue).Sum(x => x.ActualQuantity) ?? 0;
                    mappedResult.YieldHasRecord += ProdutRecord;
                }
                //foreach (var cropItem in mappedResult.LandPlotCrops)
                //{
                //    cropItem.LandPlot = null!;
                //}
                return new BusinessResult(Const.SUCCESS_GET_CROP_CODE, Const.SUCCESS_GET_CROP_BY_ID_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetCropInCurrentTime(int farmId)
        {
            try
            {
                var getCropInCurrentTime = await _unitOfWork.CropRepository.GetCropsInCurrentTime(farmId: farmId);
                if (getCropInCurrentTime != null && getCropInCurrentTime.Any())
                {
                    return new BusinessResult(200, "Get crop in current time success", getCropInCurrentTime);
                }
                return new BusinessResult(200, "No Crop in current time");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetLandPlotsOfCrop(int cropId)
        {
            try
            {
                var getLandPlotOfCrop = await _unitOfWork.CropRepository.GetLandPlotOfCrops(cropId);
                if (getLandPlotOfCrop != null && getLandPlotOfCrop.Any())
                {
                    return new BusinessResult(200, "Get LandPlot of Crop success", getLandPlotOfCrop);
                }
                return new BusinessResult(200, "Get LandPlot of Crop failed");
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
                    var cropEntityUpdate = await _unitOfWork.CropRepository.GetByCondition(x => x.CropId == cropId);

                    if (cropEntityUpdate == null)
                    {
                        return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, Const.WARNING_CROP_NOT_EXIST_MSG);
                    }
                    if (cropEntityUpdate.StartDate.Value.Date < DateTime.Now.Date)
                        return new BusinessResult(400, "Cannot delete Crop has Start");
                    bool isUsed = await _unitOfWork.HarvestHistoryRepository
                .AnyAsync(hh => hh.CropId == cropId) ||
                await _unitOfWork.PlanRepository
                .AnyAsync(p => p.CropId == cropId);
                    if (isUsed)
                    {
                        return new BusinessResult(400, "Cannot delete Crop because it is already in use.");
                    }
                    // Cập nhật các thuộc tính từ model nếu giá trị không null hoặc mặc định
                    cropEntityUpdate.IsDeleted = true;
                    _unitOfWork.CropRepository.Update(cropEntityUpdate);
                    var landplotCrop = await _unitOfWork.LandPlotCropRepository.GetAllNoPaging(x => x.CropID == cropId);
                    _unitOfWork.LandPlotCropRepository.RemoveRange(landplotCrop);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_UPDATE_CROP_CODE, "Delete Crop Success", new { success = true });
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
                    //foreach (var prop in typeof(CropUpdateInfoRequest).GetProperties())
                    //{
                    //    var newValue = prop.GetValue(cropUpdateRequest);
                    //    if (newValue != null && !string.IsNullOrEmpty(newValue.ToString()) && !newValue.ToString()!.Equals("string") && !newValue.ToString()!.Equals("0"))
                    //    {
                    //        var cropProp = typeof(Crop).GetProperty(prop.Name);
                    //        if (cropProp != null && cropProp.CanWrite)
                    //        {
                    //            cropProp.SetValue(cropEntityUpdate, newValue);
                    //        }
                    //    }
                    //}
                    // 🔹 2. Kiểm tra từng thuộc tính và cập nhật nếu có giá trị hợp lệ
                    if (!string.IsNullOrWhiteSpace(cropUpdateRequest.CropName))
                    {
                        cropEntityUpdate.CropName = cropUpdateRequest.CropName;
                    }

                    if (cropUpdateRequest.StartDate.HasValue)
                    {
                        if (cropEntityUpdate.EndDate.HasValue && cropUpdateRequest.StartDate > cropEntityUpdate.EndDate)
                        {
                            return new BusinessResult(400, "Start date cannot be after End date.");
                        }
                        cropEntityUpdate.StartDate = cropUpdateRequest.StartDate;
                    }

                    if (cropUpdateRequest.EndDate.HasValue)
                    {
                        if (cropEntityUpdate.StartDate.HasValue && cropUpdateRequest.EndDate < cropEntityUpdate.StartDate)
                        {
                            return new BusinessResult(400, "End date cannot be before Start date.");
                        }
                        cropEntityUpdate.EndDate = cropUpdateRequest.EndDate;
                    }

                    if (cropEntityUpdate.StartDate.HasValue || cropEntityUpdate.EndDate.HasValue)
                    {
                        // Chỉ lấy LandPlotId từ LandPlotCrops của mùa hiện tại 
                        var landPlotIds = (await _unitOfWork.LandPlotCropRepository.GetAllNoPaging(x => x.CropID == cropEntityUpdate.CropId))
                                                .Select(x => x.LandPlotId)
                                              .Distinct()
                                              .ToList();
                        var overlappingCrops = await _unitOfWork.LandPlotCropRepository.GetAllNoPaging(
                            x => landPlotIds.Contains(x.LandPlotId) &&
                                 x.CropID != cropEntityUpdate.CropId && //  Không lấy chính nó
                                                                        //  Lọc những mùa vụ có khoảng thời gian bị chồng lấn
                                 ((x.Crop.StartDate >= cropEntityUpdate.StartDate && x.Crop.StartDate <= cropEntityUpdate.EndDate) ||
                                  (x.Crop.EndDate >= cropEntityUpdate.StartDate && x.Crop.EndDate <= cropEntityUpdate.EndDate) ||
                                  (x.Crop.StartDate <= cropEntityUpdate.StartDate && x.Crop.EndDate >= cropEntityUpdate.EndDate)),

                            includeProperties: "Crop"
                        );

                        if (overlappingCrops.Any())
                        {
                            var conflictingCrop = overlappingCrops.First().Crop;
                            return new BusinessResult(400, $"Plot is in crop '{conflictingCrop.CropName}' (from {conflictingCrop.StartDate:dd-MM-yyyy} to {conflictingCrop.EndDate:dd-MM-yyyy}) and cannot overlap.");
                        }
                    }

                    if (cropUpdateRequest.CropExpectedTime.HasValue)
                    {
                        cropEntityUpdate.CropExpectedTime = cropUpdateRequest.CropExpectedTime;
                    }

                    if (cropUpdateRequest.CropActualTime.HasValue)
                    {
                        cropEntityUpdate.CropActualTime = cropUpdateRequest.CropActualTime;
                    }

                    if (!string.IsNullOrWhiteSpace(cropUpdateRequest.HarvestSeason))
                    {
                        cropEntityUpdate.HarvestSeason = cropUpdateRequest.HarvestSeason;
                    }

                    if (cropUpdateRequest.EstimateYield.HasValue && cropUpdateRequest.EstimateYield >= 0)
                    {
                        cropEntityUpdate.EstimateYield = cropUpdateRequest.EstimateYield;
                    }

                    if (cropUpdateRequest.ActualYield.HasValue)
                    {
                        cropEntityUpdate.ActualYield = cropUpdateRequest.ActualYield;
                    }

                    if (!string.IsNullOrWhiteSpace(cropUpdateRequest.Notes))
                    {
                        cropEntityUpdate.Notes = cropUpdateRequest.Notes;
                    }

                    if (cropUpdateRequest.MarketPrice.HasValue && cropUpdateRequest.MarketPrice >= 0)
                    {
                        cropEntityUpdate.MarketPrice = cropUpdateRequest.MarketPrice;
                    }
                    if (!string.IsNullOrEmpty(cropUpdateRequest.Status))
                    {
                        cropEntityUpdate.Status = cropUpdateRequest.Status;
                    }
                    else
                    {
                        var cropStatus = DetermineCropStatus(cropUpdateRequest.StartDate, cropUpdateRequest.EndDate, cropUpdateRequest.CropActualTime);
                        cropEntityUpdate.Status = cropStatus;
                    }

                    _unitOfWork.CropRepository.Update(cropEntityUpdate);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapResult = _mapper.Map<CropModel>(cropEntityUpdate);
                        //foreach (var landPlotCropItem in mapResult.LandPlotCrops)
                        //{
                        //    landPlotCropItem.LandPlot = null!;
                        //}
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

        public async Task<BusinessResult> GetCropsOfFarmForSelected(int farmId)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);

                Expression<Func<Crop, bool>> filter = x => x.FarmId == farmId && x.IsDeleted == false;
                //string includeProperties = "Crop,LandPlot";

                var landPlotCrops = await _unitOfWork.CropRepository.GetAllNoPaging(
                    filter: filter
                //includeProperties: includeProperties
                );

                if (!landPlotCrops.Any())
                    return new BusinessResult(Const.WARNING_CROP_OF_FARM_EMPTY_CODE, Const.WARNING_CROP_OF_FARM_EMPTY_MSG);

                // Sắp xếp theo ngày gần nhất với hiện tại (ưu tiên EndDate, nếu không có thì lấy StartDate)
                var sortedCrops = landPlotCrops
                    //.Select(x => x.Crop)
                    .OrderBy(crop => Math.Abs((crop.EndDate ?? crop.StartDate ?? DateTime.MaxValue).Subtract(DateTime.Now).TotalDays))
                    .ToList();

                var mappedResult = _mapper.Map<IEnumerable<ForSelectedModels>>(sortedCrops);

                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, "Get all crop of farm success", mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public string DetermineCropStatus(DateTime? startDate, DateTime? endDate, DateTime? cropActualTime)
        {
            DateTime now = DateTime.UtcNow;

            if (!startDate.HasValue)
                return CropStatusConst.Planned.ToString();

            if (now < startDate.Value)
                return CropStatusConst.Planned.ToString();

            if (now >= startDate.Value && (!endDate.HasValue || now < endDate.Value))
                return CropStatusConst.InCrop.ToString();

            if (endDate.HasValue && now >= endDate.Value && (!cropActualTime.HasValue || now < cropActualTime.Value))
                return CropStatusConst.Harvesting.ToString();

            if ((endDate.HasValue && now >= endDate.Value) || (cropActualTime.HasValue && now >= cropActualTime.Value))
                return CropStatusConst.Completed.ToString();

            return CropStatusConst.Planned.ToString();
        }

        private void ApplySorting(ref Func<IQueryable<Crop>, IOrderedQueryable<Crop>> orderBy, string? sortBy, string? direction)
        {
            bool isDescending = !string.IsNullOrEmpty(direction) && direction.ToLower().Equals("desc");
            sortBy = sortBy?.ToLower() ?? "cropid"; // Mặc định sắp xếp theo CropId

            orderBy = sortBy switch
            {
                "cropid" => isDescending ? x => x.OrderByDescending(c => c.CropId) : x => x.OrderBy(c => c.CropId),
                "cropcode" => isDescending ? x => x.OrderByDescending(c => c.CropCode) : x => x.OrderBy(c => c.CropCode),
                "cropname" => isDescending ? x => x.OrderByDescending(c => c.CropName) : x => x.OrderBy(c => c.CropName),
                "startdate" => isDescending ? x => x.OrderByDescending(c => c.StartDate) : x => x.OrderBy(c => c.StartDate),
                "enddate" => isDescending ? x => x.OrderByDescending(c => c.EndDate) : x => x.OrderBy(c => c.EndDate),
                "createdate" => isDescending ? x => x.OrderByDescending(c => c.CreateDate) : x => x.OrderBy(c => c.CreateDate),
                "updatedate" => isDescending ? x => x.OrderByDescending(c => c.UpdateDate) : x => x.OrderBy(c => c.UpdateDate),
                "cropexpectedtime" => isDescending ? x => x.OrderByDescending(c => c.CropExpectedTime) : x => x.OrderBy(c => c.CropExpectedTime),
                "cropactualtime" => isDescending ? x => x.OrderByDescending(c => c.CropActualTime) : x => x.OrderBy(c => c.CropActualTime),
                "harvestseason" => isDescending ? x => x.OrderByDescending(c => c.HarvestSeason) : x => x.OrderBy(c => c.HarvestSeason),
                "estimateyield" => isDescending ? x => x.OrderByDescending(c => c.EstimateYield) : x => x.OrderBy(c => c.EstimateYield),
                "actualyield" => isDescending ? x => x.OrderByDescending(c => c.ActualYield) : x => x.OrderBy(c => c.ActualYield),
                //"yieldhasrecord" => isDescending ? x => x.OrderByDescending(c => c.YieldHasRecord) : x => x.OrderBy(c => c.YieldHasRecord),
                "status" => isDescending ? x => x.OrderByDescending(c => c.Status) : x => x.OrderBy(c => c.Status),
                "marketprice" => isDescending ? x => x.OrderByDescending(c => c.MarketPrice) : x => x.OrderBy(c => c.MarketPrice),
                //"numberharvest" => isDescending ? x => x.OrderByDescending(c => c.NumberHarvest) : x => x.OrderBy(c => c.NumberHarvest),
                //"numberplot" => isDescending ? x => x.OrderByDescending(c => c.NumberPlot) : x => x.OrderBy(c => c.NumberPlot),
                _ => isDescending ? x => x.OrderByDescending(c => c.CropId) : x => x.OrderBy(c => c.CropId),
            };
        }

        public async Task<BusinessResult> ExportCrop(int farmId)
        {
            try
            {
                var checkFarmExist = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == farmId && x.IsDeleted == false);
                if (checkFarmExist == null)
                {
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                }

                Expression<Func<Crop, bool>> filter = x => x.FarmId == farmId && x.IsDeleted == false;
                Func<IQueryable<Crop>, IOrderedQueryable<Crop>> orderBy = x => x.OrderByDescending(x => x.CropId);

                var landPlotCrops = await _unitOfWork.CropRepository.GetForExport(filter: filter, orderBy: orderBy);
                var exportCrop = _mapper.Map<IEnumerable<CropModel>>(landPlotCrops).ToList();

                if (exportCrop.Any())
                {
                    var fileName = $"Crop_{checkFarmExist.FarmName}_{DateTime.Now:yyyyMMdd}{FileFormatConst.CSV_EXPAND}";
                    var csvExport = await _excelReaderService.ExportToCsvAsync(exportCrop, fileName);

                    return new BusinessResult(Const.EXPORT_CSV_SUCCESS_CODE, Const.EXPORT_CSV_SUCCESS_MSG, new ExportFileResult
                    {
                        FileBytes = csvExport.FileBytes,
                        FileName = csvExport.FileName,
                        ContentType = csvExport.ContentType
                    });
                }

                return new BusinessResult(Const.EXPORT_CSV_FAIL_CODE, Const.SUCCESS_GET_ALL_CROP_EMPTY_MSG);
            }
            catch (Exception ex)
            {
                // Ghi log nếu cần
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }
    }
}
