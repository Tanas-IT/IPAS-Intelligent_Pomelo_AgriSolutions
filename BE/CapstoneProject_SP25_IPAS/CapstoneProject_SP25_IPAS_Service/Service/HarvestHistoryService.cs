using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.ObjectStatus;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_Common.Enum;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest;
using CapstoneProject_SP25_IPAS_Service.BusinessModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.HarvestModels;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class HarvestHistoryService : IHarvestHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;

        public HarvestHistoryService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration config)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _config = config;
        }

        public async Task<BusinessResult> createHarvestHistory(CreateHarvestHistoryRequest createRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if (!createRequest.CropId.HasValue)
                        return new BusinessResult(Const.WARNING_HARVEST_MUST_IN_CROP_CODE, Const.WARNING_HARVEST_MUST_IN_CROP_MSG);
                    if (createRequest.DateHarvest < DateTime.Now)
                        return new BusinessResult(Const.WARNING_HARVEST_DATE_IN_PAST_CODE, Const.WARNING_HARVEST_DATE_IN_PAST_MSG);

                    var cropExist = await _unitOfWork.CropRepository.getCropInExpired(createRequest.CropId.Value);
                    if (cropExist == null)
                        return new BusinessResult(Const.WARNING_CROP_EXPIRED_CODE, Const.WARNING_CROP_EXPIRED_MSG);
                    var harvestHistory = new HarvestHistory()
                    {
                        HarvestHistoryCode = $"{CodeAliasEntityConst.HARVEST_HISTORY}-{createRequest.DateHarvest!.Value.ToString("ddMMyyyyHHmmss")}-{CodeAliasEntityConst.CROP}{cropExist.CropId}-{CodeHelper.GenerateCode()}",
                        DateHarvest = createRequest.DateHarvest,
                        HarvestHistoryNote = createRequest.HarvestHistoryNote,
                        HarvestStatus = HarvestStatusConst.NOT_YET,
                        TotalPrice = createRequest.TotalPrice,
                        CropId = cropExist.CropId,
                    };

                    if (createRequest.HarvestTypeHistories?.Any() == true)
                    {
                        var duplicateMasterTypeIds = createRequest.HarvestTypeHistories
                            .GroupBy(x => x.MasterTypeId)
                            .Where(g => g.Count() > 1)
                            .Select(g => g.Key)
                            .ToList();

                        if (duplicateMasterTypeIds.Any())
                        {
                            return new BusinessResult(400, $"You has select duplicate product type");
                        }
                        //var masterType = await _unitOfWork.MasterTypeRepository.GetMasterTypesByTypeName(TypeNameInMasterEnum.HarvestType.ToString());
                        //if (masterType == null)
                        //    return new BusinessResult(Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_CODE, Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_MSG);
                        foreach (var item in createRequest.HarvestTypeHistories)
                        {
                            var checkMasterTypeExist = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(item.MasterTypeId, TypeNameInMasterEnum.Product.ToString());
                            if (checkMasterTypeExist == null)
                            {
                                return new BusinessResult(Const.WARNING_HARVEST_TYPE_OF_PRODUCT_NOT_SUITABLE_CODE, Const.WARNING_HARVEST_TYPE_OF_PRODUCT_NOT_SUITABLE_MSG);
                            }
                            var historyType = new HarvestTypeHistory()
                            {
                                MasterTypeId = item.MasterTypeId,
                                SellPrice = item.Price,
                                Unit = item.Unit,
                                Quantity = item.Quantity,
                                //ProcessId = item.ProcessId ?? null,
                            };
                            //if (item.ProcessId.HasValue)
                            //{
                            //    var processExists = await _unitOfWork.ProcessRepository.GetByID(item.ProcessId.Value);
                            //    if (processExists != null)
                            //    {
                            //        historyType.ProcessId = item.ProcessId;
                            //    }
                            //}
                            harvestHistory.HarvestTypeHistories.Add(historyType);
                        }
                    }

                    await _unitOfWork.HarvestHistoryRepository.Insert(harvestHistory);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<HarvestHistoryModel>(harvestHistory);
                        return new BusinessResult(Const.SUCCESS_CREATE_HARVEST_HISTORY_CODE, Const.SUCCESS_CREATE_HARVEST_HISTORY_MSG, mappedResult);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_CREATE_HARVEST_HISTORY_CODE, Const.FAIL_CREATE_HARVEST_HISTORY_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, Const.FAIL_CREATE_FARM_MSG, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> createHarvesTypeHistory(CreateHarvestTypeHistoryRequest createRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if (!createRequest.HarvestHistoryId.HasValue)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);

                    // 1. Kiểm tra MasterType có tồn tại hay không
                    var masterType = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(
                        createRequest.MasterTypeId, TypeNameInMasterEnum.Product.ToString());

                    if (masterType == null)
                        return new BusinessResult(Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_CODE,
                                                  Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_MSG);

                    bool hasPlantId = createRequest.PlantId.HasValue;

                    // 2. Kiểm tra xem sản phẩm đã tồn tại trong buổi thu hoạch chưa
                    Expression<Func<HarvestTypeHistory, bool>> checkExistingCondition = x =>
                        x.MasterTypeId == createRequest.MasterTypeId &&
                        x.HarvestHistoryId == createRequest.HarvestHistoryId;

                    var existingHarvest = await _unitOfWork.HarvestTypeHistoryRepository.GetByCondition(checkExistingCondition);

                    // 3. Nếu đã có sản phẩm này trong buổi thu hoạch
                    if (existingHarvest != null)
                    {
                        if (!hasPlantId)
                        {
                            // Nếu không có PlantId trong request --> Báo lỗi vì sản phẩm đã tồn tại
                            return new BusinessResult(400, "This product of harvest already exists, check your request again!");
                        }

                        // Nếu có PlantId, kiểm tra xem đã tồn tại PlantID đó chưa
                        checkExistingCondition = checkExistingCondition.And(x => x.PlantId == createRequest.PlantId);
                        var existingHarvestWithPlant = await _unitOfWork.HarvestTypeHistoryRepository.GetByCondition(checkExistingCondition);

                        if (existingHarvestWithPlant != null)
                        {
                            // Nếu đã tồn tại sản phẩm thu hoạch có PlantID này, cộng dồn quantity
                            existingHarvestWithPlant.Quantity += createRequest.Quantity;
                        }
                        else
                        {
                            // Nếu chưa tồn tại bản ghi có PlantID, tạo mới bản ghi
                            var newHarvestEntry = new HarvestTypeHistory()
                            {
                                MasterTypeId = createRequest.MasterTypeId,
                                HarvestHistoryId = createRequest.HarvestHistoryId.Value,
                                PlantId = createRequest.PlantId,
                                Unit = existingHarvest.Unit,
                                //Price = crea.Price,
                                Quantity = createRequest.Quantity
                            };
                            await _unitOfWork.HarvestTypeHistoryRepository.Insert(newHarvestEntry);
                        }
                    }
                    else
                    {
                        // 4. Nếu sản phẩm chưa tồn tại trong buổi thu hoạch, tạo mới bản ghi tổng quát
                        var newHarvestEntry = new HarvestTypeHistory()
                        {
                            MasterTypeId = createRequest.MasterTypeId,
                            HarvestHistoryId = createRequest.HarvestHistoryId.Value,
                            //PlantId = createRequest.PlantId,  // Có thể NULL nếu chưa có cây cụ thể
                            Unit = createRequest.Unit,
                            SellPrice = createRequest.Price,
                            Quantity = createRequest.Quantity
                        };
                        await _unitOfWork.HarvestTypeHistoryRepository.Insert(newHarvestEntry);
                    }

                    // 5. Lưu thay đổi vào database
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();

                        // Lấy dữ liệu đã tạo để trả về
                        Expression<Func<HarvestTypeHistory, bool>> filter = x =>
                            x.HarvestHistoryId == createRequest.HarvestHistoryId &&
                            x.MasterTypeId == createRequest.MasterTypeId;

                        if (hasPlantId)
                            filter = filter.And(x => x.PlantId == createRequest.PlantId);

                        string includeProperties = "HarvestHistory,MasterType";
                        var harvestHistory = await _unitOfWork.HarvestTypeHistoryRepository.GetByCondition(filter, includeProperties);
                        var mappedResult = _mapper.Map<HarvestTypeHistoryModel>(harvestHistory);

                        return new BusinessResult(Const.SUCCESS_UPDATE_HARVEST_HISTORY_CODE,
                                                  Const.SUCCESS_UPDATE_HARVEST_HISTORY_MSG, mappedResult);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_CREATE_HARVEST_HISTORY_CODE,
                                                  Const.FAIL_CREATE_HARVEST_HISTORY_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_HARVEST_HISTORY_CODE,
                                              Const.FAIL_UPDATE_HARVEST_HISTORY_MSG, ex.Message);
                }
            }
        }


        public async Task<BusinessResult> deleteHarvestHistory(int harvestHistoryId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    Expression<Func<HarvestHistory, bool>> filter = x => x.HarvestHistoryId == harvestHistoryId;
                    string includeProperties = "HarvestTypeHistories";
                    var harvestHistory = await _unitOfWork.HarvestHistoryRepository.GetByCondition(filter, includeProperties);
                    if (harvestHistory == null)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);

                    _unitOfWork.HarvestHistoryRepository.Delete(harvestHistory);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_HARVEST_HISTORY_CODE, Const.SUCCESS_DELETE_HARVEST_HISTORY_MSG, new { success = true });
                    }
                    else
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.FAIL_CREATE_HARVEST_HISTORY_CODE, Const.FAIL_CREATE_HARVEST_HISTORY_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_DELETE_PERMANENTLY_HARVEST_HISTORY_CODE, Const.FAIL_DELETE_PERMANENTLY_HARVEST_HISTORY_MSG, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> deleteHarvestType(int harvestHistoryId, int masterTypeId, int? plantId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    Expression<Func<HarvestTypeHistory, bool>> filter = x => x.HarvestHistoryId == harvestHistoryId && x.MasterTypeId == masterTypeId;
                    if (plantId.HasValue)
                        filter.And(x => x.PlantId == plantId);
                    var harvestHistory = await _unitOfWork.HarvestTypeHistoryRepository.GetAllNoPaging(filter);
                    if (harvestHistory == null)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);

                    _unitOfWork.HarvestTypeHistoryRepository.RemoveRange(harvestHistory);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_HARVEST_HISTORY_CODE, Const.SUCCESS_DELETE_HARVEST_HISTORY_MSG, new { success = true });
                    }
                    else
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.FAIL_CREATE_HARVEST_HISTORY_CODE, Const.FAIL_CREATE_HARVEST_HISTORY_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_DELETE_PERMANENTLY_HARVEST_HISTORY_CODE, Const.FAIL_DELETE_PERMANENTLY_HARVEST_HISTORY_MSG, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getAllHistoryPlantOfHarvest(int harvestId, int masterTypeId)
        {
            var harvest = await _unitOfWork.HarvestHistoryRepository.GetByID(harvestId);
            if (harvest == null)
                return new BusinessResult(Const.WARNING_HARVEST_NOT_EXIST_CODE, Const.WARNING_HARVEST_NOT_EXIST_MSG);
            var masterType = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(masterTypeId, TypeNameInMasterEnum.Product.ToString());
            if (masterType == null)
                return new BusinessResult(Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_CODE, Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_MSG);
            var historyTypes = await _unitOfWork.HarvestHistoryRepository.GetAllPlantOfHarvesType(harvestId, masterTypeId);

            if (!historyTypes.Any())
                return new BusinessResult(Const.WARNING_HARVEST_TYPE_HISTORY_EMPTY_CODE, Const.WARNING_HARVEST_TYPE_HISTORY_EMPTY_MSG);

            var mappedResult = _mapper.Map<IEnumerable<HarvestTypeHistoryModel>>(historyTypes);
            return new BusinessResult(Const.SUCCESS_GET_HARVEST_TYPE_HISTORY_ALL_PAGINATION_CODE, Const.SUCCESS_GET_HARVEST_TYPE_HISTORY_ALL_PAGINATION_MSG, mappedResult);
        }

        public async Task<BusinessResult> getHarvestById(int harvestId)
        {
            var harvest = await _unitOfWork.HarvestHistoryRepository.GetByID(harvestId);
            if (harvest == null)
                return new BusinessResult(Const.WARNING_HARVEST_NOT_EXIST_CODE, Const.WARNING_HARVEST_NOT_EXIST_MSG);
            var mappedResult = _mapper.Map<HarvestHistoryModel>(harvest);
            return new BusinessResult(Const.SUCCESS_GET_HARVEST_HISTORY_CODE, Const.SUCCESS_GET_HARVEST_HISTORY_MSG, mappedResult);

        }

        public async Task<BusinessResult> getHarvestHistoryByCrop(int cropId, PaginationParameter paginationParameter, HarvestFilter filter)
        {
            try
            {
                if (cropId <= 0)
                    return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, Const.WARNING_CROP_NOT_EXIST_MSG);
                if (filter.DateHarvestFrom.HasValue && filter.DateHarvestTo.HasValue && filter.DateHarvestTo < filter.DateHarvestFrom)
                {
                    return new BusinessResult(400, "Date harvest from must before harvest to ");
                }
                if (filter.TotalPriceFrom.HasValue && filter.DateHarvestTo.HasValue && filter.TotalPriceTo < filter.TotalPriceFrom)
                {
                    return new BusinessResult(400, "Total price from must less than total price to");
                }
                if (!string.IsNullOrEmpty(filter.Status))
                {
                    return new BusinessResult(400, "Market price to must larger than market price from");
                }
                var landPlotCrops = await _unitOfWork.HarvestHistoryRepository.GetHarvestPaginFilterAsync(cropId: cropId, paginationParameter: paginationParameter, filter: filter);
                if (!landPlotCrops.Any())
                    return new BusinessResult(Const.WARNING_CROP_OF_FARM_EMPTY_CODE, Const.WARNING_CROP_OF_FARM_EMPTY_MSG);
                var mappedResult = _mapper.Map<IEnumerable<HarvestHistoryModel>>(landPlotCrops);
                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, Const.SUCCESS_GET_ALL_CROP_FOUND_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> updateHarvestHistoryInfo(UpdateHarvestHistoryRequest updateRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    var harvestHistory = await _unitOfWork.HarvestHistoryRepository.GetByID(updateRequest.HarvestHistoryId);
                    if (harvestHistory == null)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);

                    harvestHistory.DateHarvest = updateRequest.DateHarvest;
                    harvestHistory.HarvestHistoryNote = updateRequest.HarvestHistoryNote;
                    harvestHistory.TotalPrice = updateRequest.TotalPrice;
                    harvestHistory.HarvestStatus = updateRequest.HarvestStatus;

                    _unitOfWork.HarvestHistoryRepository.Update(harvestHistory);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<HarvestHistoryModel>(harvestHistory);
                        mappedResult.HarvestTypeHistories = null!;
                        return new BusinessResult(Const.SUCCESS_UPDATE_HARVEST_HISTORY_CODE, Const.SUCCESS_UPDATE_HARVEST_HISTORY_MSG, mappedResult);
                    }
                    else
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.FAIL_CREATE_HARVEST_HISTORY_CODE, Const.FAIL_CREATE_HARVEST_HISTORY_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.CommitAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_HARVEST_HISTORY_CODE, Const.FAIL_UPDATE_HARVEST_HISTORY_MSG, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> updateHarvesTypeHistory(UpdateHarvesTypeHistoryRequest updateRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    Expression<Func<HarvestTypeHistory, bool>> filter = x => x.HarvestHistoryId == updateRequest.HarvestHistoryId && x.MasterTypeId == updateRequest.MasterTypeId;
                    if (updateRequest.PlantId.HasValue)
                        filter.And(x => x.PlantId == updateRequest.PlantId);
                    string includeProperties = "HarvestHistory,MasterType";
                    var harvestHistory = await _unitOfWork.HarvestTypeHistoryRepository.GetByCondition(filter, includeProperties);
                    if (harvestHistory == null)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);

                    if (updateRequest.Quantity.HasValue && updateRequest.Quantity.Value > 0)
                        harvestHistory.Quantity = updateRequest.Quantity;
                    if (string.IsNullOrEmpty(updateRequest.Unit))
                        harvestHistory.Unit = updateRequest.Unit;
                    if (harvestHistory.Quantity.HasValue && updateRequest.Quantity > 0)
                        harvestHistory.Quantity = updateRequest.Quantity;
                    _unitOfWork.HarvestTypeHistoryRepository.Update(harvestHistory);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        var mappedResult = _mapper.Map<HarvestTypeHistoryModel>(harvestHistory);
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_HARVEST_HISTORY_CODE, Const.SUCCESS_DELETE_HARVEST_HISTORY_MSG, mappedResult);
                    }
                    else
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.FAIL_CREATE_HARVEST_HISTORY_CODE, Const.FAIL_CREATE_HARVEST_HISTORY_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_DELETE_PERMANENTLY_HARVEST_HISTORY_CODE, Const.FAIL_DELETE_PERMANENTLY_HARVEST_HISTORY_MSG, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getHarvestForSelectedByPlotId(int cropId)
        {
            Expression<Func<HarvestHistory, bool>> filter = x => x.CropId == cropId && x.Crop!.EndDate >= DateTime.Now;
            Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = x => x.OrderByDescending(x => x.HarvestHistoryId);

            var harvest = await _unitOfWork.HarvestHistoryRepository.GetAllNoPaging(filter: filter, orderBy: orderBy );
            if (harvest == null)
                return new BusinessResult(Const.WARNING_HARVEST_NOT_EXIST_CODE, Const.WARNING_HARVEST_NOT_EXIST_MSG);
            var mappedResult = _mapper.Map<IEnumerable<ForSelectedModels>>(harvest);
            return new BusinessResult(Const.SUCCESS_GET_HARVEST_HISTORY_CODE, Const.SUCCESS_GET_HARVEST_HISTORY_MSG, mappedResult);

        }

        public async Task<BusinessResult> statisticOfPlantByYear(int plantId, int year)
        {
            try
            {
                // Lọc dữ liệu theo năm cụ thể
                DateTime startDate = new DateTime(year, 1, 1);
                DateTime endDate = new DateTime(year, 12, 31);

                var harvestData = await _unitOfWork.HarvestTypeHistoryRepository
                    .GetAllNoPaging(x => x.PlantId == plantId &&
                                             x.HarvestHistory.DateHarvest.HasValue &&
                                             x.HarvestHistory.DateHarvest >= startDate &&
                                             x.HarvestHistory.DateHarvest <= endDate,
                                        includeProperties: "HarvestHistory,MasterType");

                if (harvestData == null || !harvestData.Any())
                {
                    return new BusinessResult(200, "No harvest data found for this plant in the selected year.");
                }

                var yearlyStatistic = new YearlyStatistic
                {
                    Year = year,
                    MonthlyData = harvestData
                        .Where(x => x.Quantity.HasValue)
                        .GroupBy(x => x.HarvestHistory.DateHarvest.Value.Month)
                        .OrderBy(g => g.Key)
                        .Select(monthGroup => new MonthlyStatistic
                        {
                            Month = monthGroup.Key,
                            TotalQuatity = monthGroup.Sum(x => x.Quantity ?? 0),
                            HarvestDetails = monthGroup
                                .GroupBy(x => x.MasterTypeId)
                                .Select(mtGroup => new HarvestStatistic
                                {
                                    MasterTypeId = mtGroup.Key,
                                    MasterTypeCode = mtGroup.FirstOrDefault()!.MasterType.MasterTypeCode,
                                    MasterTypeName = mtGroup.FirstOrDefault()!.MasterType?.MasterTypeName,
                                    TotalQuantity = mtGroup.Sum(x => x.Quantity ?? 0)
                                }).ToList()
                        }).ToList()
                };

                // Tính tổng sản lượng của cả năm
                yearlyStatistic.TotalYearlyQuantity = yearlyStatistic.MonthlyData
                    .Sum(m => m.HarvestDetails.Sum(h => h.TotalQuantity));

                return new BusinessResult(200, "Successfully retrieved statistics.", yearlyStatistic);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

    }
}
