using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.Extensions.Configuration;
using CapstoneProject_SP25_IPAS_Common.Enum;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
//using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest.ProductHarvestRequest;
using Microsoft.IdentityModel.Tokens;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.HarvestModels;
using CloudinaryDotNet.Actions;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.Models;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using MailKit.Search;
using System.Linq;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ScheduleRequest;
using Microsoft.EntityFrameworkCore;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantRequest;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class HarvestHistoryService : IHarvestHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private readonly IWorkLogService _workLogService;
        private readonly IScheduleService _scheduleService;
        private readonly IExcelReaderService _excelReaderService;
        public HarvestHistoryService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration config, IWorkLogService workLogService, IScheduleService scheduleService, IExcelReaderService excelReaderService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _config = config;
            _workLogService = workLogService;
            _scheduleService = scheduleService;
            _excelReaderService = excelReaderService;
        }

        public async Task<BusinessResult> createHarvestHistory(CreateHarvestHistoryRequest createRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var cropExist = await _unitOfWork.CropRepository.getCropInExpired(createRequest.CropId);
                    if (cropExist == null)
                        return new BusinessResult(Const.WARNING_CROP_EXPIRED_CODE, Const.WARNING_CROP_EXPIRED_MSG);
                    if (!cropExist.HarvestHistories.Any())
                    {
                        cropExist.CropActualTime = createRequest.DateHarvest;
                        cropExist.Status = CropStatusConst.Harvesting.ToString();
                        // Cập nhật crop neu no la ngay dau tien trong mua
                        _unitOfWork.CropRepository.Update(cropExist);
                    }
                    if (createRequest.DateHarvest < DateTime.Now)
                        return new BusinessResult(Const.WARNING_HARVEST_DATE_IN_PAST_CODE, Const.WARNING_HARVEST_DATE_IN_PAST_MSG);
                    if (createRequest.DateHarvest < cropExist.StartDate || createRequest.DateHarvest > cropExist.EndDate)
                        return new BusinessResult(400, "Harvest date is out of crop");
                    var harvestHistory = new HarvestHistory()
                    {
                        HarvestHistoryCode = $"{CodeAliasEntityConst.HARVEST_HISTORY}{CodeHelper.GenerateCode()}-{createRequest.DateHarvest!.Value.ToString("ddMMyy")}-{Util.SplitByDash(cropExist.CropCode!).First().ToUpper()}",
                        DateHarvest = createRequest.DateHarvest,
                        HarvestHistoryNote = createRequest.HarvestHistoryNote,
                        HarvestStatus = HarvestStatusConst.NOT_YET,
                        TotalPrice = createRequest.ProductHarvestHistory.Any(x => x.SellPrice.HasValue)
                                            ? createRequest.ProductHarvestHistory.Where(x => x.SellPrice.HasValue).Sum(x => x.SellPrice!.Value)
                                            : null,
                        CropId = cropExist.CropId,
                        IsDeleted = false,
                    };

                    if (createRequest.ProductHarvestHistory?.Any() == true)
                    {
                        var duplicateMasterTypeIds = createRequest.ProductHarvestHistory
                            .GroupBy(x => x.MasterTypeId)
                            .Where(g => g.Count() > 1)
                            .Select(g => g.Key)
                            .ToList();

                        if (duplicateMasterTypeIds.Any())
                        {
                            return new BusinessResult(400, $"You has select duplicate product type");
                        }
                        foreach (var item in createRequest.ProductHarvestHistory)
                        {
                            var checkMasterTypeExist = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(item.MasterTypeId, TypeNameInMasterEnum.Product.ToString());
                            if (checkMasterTypeExist == null)
                            {
                                return new BusinessResult(Const.WARNING_HARVEST_TYPE_OF_PRODUCT_NOT_SUITABLE_CODE, Const.WARNING_HARVEST_TYPE_OF_PRODUCT_NOT_SUITABLE_MSG);
                            }
                            var historyType = new ProductHarvestHistory()
                            {
                                MasterTypeId = item.MasterTypeId,
                                SellPrice = item.SellPrice,
                                CostPrice = item.CostPrice,
                                Unit = item.Unit,
                                QuantityNeed = item.QuantityNeed,
                                RecordDate = DateTime.Now
                                //ProcessId = item.ProcessId ?? null,
                            };
                            harvestHistory.ProductHarvestHistories.Add(historyType);
                        }
                    }
                    await _unitOfWork.HarvestHistoryRepository.Insert(harvestHistory);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        // Gán HarvestId cho task
                        createRequest.AddNewTask.HarvestHistoryId = harvestHistory.HarvestHistoryId;
                        createRequest.AddNewTask.TaskName = $"Harvest-{harvestHistory.HarvestHistoryCode}";
                        createRequest.AddNewTask.DateWork = harvestHistory.DateHarvest;
                        // Gọi service tạo Task sau khi đã có ID
                        var addNewTask = await _workLogService.AddNewTask(createRequest.AddNewTask, cropExist.FarmId);
                        if (addNewTask.StatusCode != 200)
                            return addNewTask;

                        //await _unitOfWork.SaveAsync();
                        var mappedResult = _mapper.Map<HarvestHistoryModel>(harvestHistory);
                        await transaction.CommitAsync();

                        return new BusinessResult(Const.SUCCESS_CREATE_HARVEST_HISTORY_CODE, Const.SUCCESS_CREATE_HARVEST_HISTORY_MSG, mappedResult);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_CREATE_HARVEST_HISTORY_CODE, Const.FAIL_CREATE_HARVEST_HISTORY_MSG);
                    }
                }
                catch (AutoMapperMappingException ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(ex.Message);
                    Console.WriteLine(ex.InnerException?.Message);
                    return new BusinessResult(400, "Fail to create harvest.", ex.Message);

                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(400, "Fail to create harvest.", ex.Message);
                }

            }
        }

        public async Task<BusinessResult> createProductHarvestHistory(CreateHarvestTypeHistoryRequest createRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var existHarvest = await _unitOfWork.HarvestHistoryRepository.GetByID(createRequest.HarvestHistoryId!.Value);
                    if (existHarvest == null)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);

                    // 1. Kiểm tra Product có tồn tại hay không
                    var masterType = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(
                        createRequest.MasterTypeId, TypeNameInMasterEnum.Product.ToString());

                    if (masterType == null)
                        return new BusinessResult(Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_CODE,
                                                  Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_MSG);

                    //bool hasPlantId = createRequest.PlantId.HasValue;

                    // 2. Kiểm tra xem sản phẩm đã tồn tại trong buổi thu hoạch chưa
                    Expression<Func<ProductHarvestHistory, bool>> checkExistingCondition = x =>
                        x.MasterTypeId == createRequest.MasterTypeId &&
                        x.HarvestHistoryId == createRequest.HarvestHistoryId &&
                        x.PlantId == null;

                    var existingProductHarvest = await _unitOfWork.ProductHarvestHistoryRepository.GetByCondition(checkExistingCondition);

                    //// 3. Nếu đã có sản phẩm này trong buổi thu hoạch
                    if (existingProductHarvest != null)
                    {
                        return new BusinessResult(400, "This product has apply to harvest");
                    }
                    //    //if (!hasPlantId)
                    //    //{
                    //    //    // Nếu không có PlantId trong request --> Báo lỗi vì sản phẩm đã tồn tại
                    //    //    return new BusinessResult(400, "This product of harvest already exists, check your request again!");
                    //    //}

                    //    // Nếu có PlantId, kiểm tra xem đã tồn tại PlantID đó chưa
                    //    checkExistingCondition = checkExistingCondition.And(x => x.PlantId == createRequest.PlantId);
                    //    var existingHarvestWithPlant = await _unitOfWork.HarvestTypeHistoryRepository.GetByCondition(checkExistingCondition);

                    //    if (existingHarvestWithPlant != null)
                    //    {
                    //        // Nếu đã tồn tại sản phẩm thu hoạch có PlantID này, cộng dồn quantity
                    //        existingHarvestWithPlant.QuantityNeed += createRequest.Quantity;
                    //    }
                    //    else
                    //    {
                    //        // Nếu chưa tồn tại bản ghi có PlantID, tạo mới bản ghi
                    //        var newHarvestEntry = new ProductHarvestHistory()
                    //        {
                    //            MasterTypeId = createRequest.MasterTypeId,
                    //            HarvestHistoryId = createRequest.HarvestHistoryId.Value,
                    //            PlantId = createRequest.PlantId,
                    //            Unit = existingHarvest.Unit,
                    //            //Price = crea.Price,
                    //            //QuantityNeed = createRequest.Quantity
                    //            ActualQuantity = createRequest.Quantity
                    //        };
                    //        await _unitOfWork.HarvestTypeHistoryRepository.Insert(newHarvestEntry);
                    //    }
                    //}
                    //else
                    //{
                    // 4. Nếu sản phẩm chưa tồn tại trong buổi thu hoạch, tạo mới bản ghi tổng quát
                    var newHarvestEntry = new ProductHarvestHistory()
                    {
                        MasterTypeId = createRequest.MasterTypeId,
                        HarvestHistoryId = createRequest.HarvestHistoryId.Value,
                        //PlantId = createRequest.PlantId,  // Có thể NULL nếu chưa có cây cụ thể
                        Unit = createRequest.Unit,
                        SellPrice = createRequest.SellPrice,
                        CostPrice = createRequest.CostPrice,
                        QuantityNeed = createRequest.Quantity
                    };
                    await _unitOfWork.ProductHarvestHistoryRepository.Insert(newHarvestEntry);
                    //}
                    if (existingProductHarvest!.SellPrice.HasValue)
                    {
                        existHarvest.TotalPrice = existHarvest.TotalPrice!.GetValueOrDefault() + newHarvestEntry.SellPrice.Value;
                        _unitOfWork.HarvestHistoryRepository.Update(existHarvest);
                    }
                    // 5. Lưu thay đổi vào database
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();

                        // Lấy dữ liệu đã tạo để trả về
                        Expression<Func<ProductHarvestHistory, bool>> filter = x =>
                            x.HarvestHistoryId == createRequest.HarvestHistoryId &&
                            x.MasterTypeId == createRequest.MasterTypeId;

                        //if (hasPlantId)
                        //    filter = filter.And(x => x.PlantId == createRequest.PlantId);

                        string includeProperties = "HarvestHistory,Product";
                        //var harvestHistory = await _unitOfWork.HarvestTypeHistoryRepository.GetByCondition(filter, includeProperties);
                        var harvestHistory = await _unitOfWork.HarvestHistoryRepository.GetByID(createRequest.HarvestHistoryId.Value);
                        var mappedResult = _mapper.Map<HarvestHistoryModel>(harvestHistory);

                        return new BusinessResult(Const.SUCCESS_UPDATE_HARVEST_HISTORY_CODE,
                                                  "Create product in harvest success.", mappedResult);
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

        public async Task<BusinessResult> createPlantRecordHarvest(CreatePlantRecordHarvestRequest createRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkUserExist = await _unitOfWork.UserRepository.GetByID(createRequest.UserId.Value);
                    if (checkUserExist == null)
                        return new BusinessResult(400, "You are not permission to create record");
                    if (!createRequest.HarvestHistoryId.HasValue)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);
                    if (createRequest.plantHarvestRecords == null)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, "No record are create");

                    // 1. Kiểm tra MasterType có tồn tại hay không
                    var masterType = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(
                        createRequest.MasterTypeId, TypeNameInMasterEnum.Product.ToString());

                    if (masterType == null)
                        return new BusinessResult(Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_CODE,
                                                  Const.WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_MSG);

                    //bool hasPlantId = createRequest.PlantId.HasValue;

                    // 2. Kiểm tra xem sản phẩm đã tồn tại trong buổi thu hoạch chưa
                    Expression<Func<ProductHarvestHistory, bool>> checkExistingCondition = x =>
                        x.MasterTypeId == createRequest.MasterTypeId &&
                        x.HarvestHistoryId == createRequest.HarvestHistoryId &&
                        x.PlantId == null;

                    var existingProduct = await _unitOfWork.ProductHarvestHistoryRepository.GetByCondition(checkExistingCondition);

                    // 3. Nếu sản phẩm chưa tồn tại trong buổi thu hoạch, trả lỗi
                    if (existingProduct == null)
                    {
                        return new BusinessResult(400, "This product not exist in harvest to record");
                    }
                    // kiểm tra xem đã tồn tại PlantID đó chưa
                    //foreach (var plant in createRequest.plantHarvestRecords)
                    //{

                    //    checkExistingCondition = checkExistingCondition.And(x =>
                    //        x.MasterTypeId == createRequest.MasterTypeId &&
                    //        x.HarvestHistoryId == createRequest.HarvestHistoryId &&
                    //        x.PlantId == plant.PlantId);
                    //    var existingHarvestWithPlant = await _unitOfWork.ProductHarvestHistoryRepository.GetByCondition(checkExistingCondition);

                    //    if (existingHarvestWithPlant != null)
                    //    {
                    //        // Nếu đã tồn tại sản phẩm thu hoạch có PlantID này, cộng dồn quantity
                    //        existingHarvestWithPlant.ActualQuantity += plant.Quantity;
                    //        _unitOfWork.ProductHarvestHistoryRepository.Update(existingHarvestWithPlant);
                    //    }
                    //    else
                    //    {
                    //        // Nếu chưa tồn tại bản ghi có PlantID, tạo mới bản ghi
                    //        var newHarvestEntry = new ProductHarvestHistory()
                    //        {
                    //            MasterTypeId = createRequest.MasterTypeId,
                    //            HarvestHistoryId = createRequest.HarvestHistoryId.Value,
                    //            PlantId = plant.PlantId,
                    //            Unit = existingProduct.Unit,
                    //            ActualQuantity = plant.Quantity
                    //        };
                    //        await _unitOfWork.ProductHarvestHistoryRepository.Insert(newHarvestEntry);
                    //    }
                    //}
                    var updateList = new List<ProductHarvestHistory>();
                    var insertList = new List<ProductHarvestHistory>();

                    var plantIds = createRequest.plantHarvestRecords.Select(p => p.PlantId).ToList();
                    var existingHarvests = await _unitOfWork.ProductHarvestHistoryRepository.GetAllNoPaging(x =>
                        x.MasterTypeId == createRequest.MasterTypeId &&
                        x.HarvestHistoryId == createRequest.HarvestHistoryId &&
                        plantIds.Contains(x.PlantId!.Value));

                    foreach (var plant in createRequest.plantHarvestRecords)
                    {
                        int index = 1;
                        var canHarvest = await _unitOfWork.PlantRepository.CheckIfPlantCanBeInTargetAsync(plantId: plant.PlantId, ActFunctionGrStageEnum.Harvest.ToString());
                        if (canHarvest != true)
                            return new BusinessResult(400, $"Plant number {index} is not in suitable growth stage to harvest");
                        var existingHarvest = existingHarvests.FirstOrDefault(x => x.PlantId == plant.PlantId);
                        if (existingHarvest != null)
                        {
                            existingHarvest.ActualQuantity += plant.Quantity;
                            existingHarvest.UserID = checkUserExist.UserId;
                            existingHarvest.RecordDate = DateTime.Now;
                            updateList.Add(existingHarvest);
                        }
                        else
                        {
                            insertList.Add(new ProductHarvestHistory
                            {
                                MasterTypeId = createRequest.MasterTypeId,
                                HarvestHistoryId = createRequest.HarvestHistoryId.Value,
                                PlantId = plant.PlantId,
                                Unit = existingProduct.Unit,
                                ActualQuantity = plant.Quantity,
                                UserID = checkUserExist.UserId,
                                RecordDate = DateTime.Now,
                            });
                        }
                        index++;
                    }

                    if (updateList.Any())
                        _unitOfWork.ProductHarvestHistoryRepository.UpdateRange(updateList);
                    if (insertList.Any())
                        await _unitOfWork.ProductHarvestHistoryRepository.InsertRangeAsync(insertList);
                    // 5. Lưu thay đổi vào database
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();

                        // Lấy dữ liệu đã tạo để trả về
                        //Expression<Func<ProductHarvestHistory, bool>> filter = x =>
                        //    x.HarvestHistoryId == createRequest.HarvestHistoryId &&
                        //    x.MasterTypeId == createRequest.MasterTypeId &&
                        //    x.PlantId == createRequest.PlantId;

                        //string includeProperties = "HarvestHistory,MasterType";
                        //var harvestHistory = await _unitOfWork.ProductHarvestHistoryRepository.GetByCondition(filter, includeProperties);
                        //var mappedResult = _mapper.Map<ProductHarvestHistoryModel>(harvestHistory);

                        return new BusinessResult(Const.SUCCESS_UPDATE_HARVEST_HISTORY_CODE,
                                                  Const.SUCCESS_UPDATE_HARVEST_HISTORY_MSG/*, mappedResult*/);
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
                    string includeProperties = "ProductHarvestHistories,CarePlanSchedules";
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

        public async Task<BusinessResult> deleteProductHarvest(int harvestHistoryId, int masterTypeId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    Expression<Func<ProductHarvestHistory, bool>> filter = x => x.HarvestHistoryId == harvestHistoryId && x.MasterTypeId == masterTypeId;
                    //if (plantId.HasValue)
                    //    filter.And(x => x.PlantId == plantId);
                    var harvestHistory = await _unitOfWork.ProductHarvestHistoryRepository.GetAllNoPaging(filter);
                    if (harvestHistory == null)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);
                    bool productIsBeingUsed = await _unitOfWork.ProductHarvestHistoryRepository.AnyAsync(x => x.HarvestHistoryId == harvestHistoryId
                                                && x.MasterTypeId == masterTypeId
                                                && x.PlantId != null);
                    if (productIsBeingUsed)
                        return new BusinessResult(400, "Product is still have record of plant, cannot delete");
                    _unitOfWork.ProductHarvestHistoryRepository.RemoveRange(harvestHistory);
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
                return new BusinessResult(200, Const.WARNING_HARVEST_TYPE_HISTORY_EMPTY_MSG);

            var mappedResult = _mapper.Map<IEnumerable<ProductHarvestHistoryModel>>(historyTypes);
            return new BusinessResult(Const.SUCCESS_GET_HARVEST_TYPE_HISTORY_ALL_PAGINATION_CODE, Const.SUCCESS_GET_HARVEST_TYPE_HISTORY_ALL_PAGINATION_MSG, mappedResult);
        }

        public async Task<BusinessResult> getHarvestById(int harvestId)
        {
            var harvest = await _unitOfWork.HarvestHistoryRepository.GetByCondition(h => h.HarvestHistoryId == harvestId);
            if (harvest == null)
                return new BusinessResult(Const.WARNING_HARVEST_NOT_EXIST_CODE, Const.WARNING_HARVEST_NOT_EXIST_MSG);
            var mappedResult = _mapper.Map<HarvestHistoryModel>(harvest);
            foreach (var product in mappedResult.ProductHarvestHistory)
            {
                product.plantLogHarvest = harvest.ProductHarvestHistories
                    .Where(x => x.MasterTypeId == product.MasterTypeId && x.HarvestHistoryId == product.HarvestHistoryId && x.PlantId != null)
                    .Select(x => new PlantLogHarvestModel
                    {
                        ProductHarvestHistoryId = x.ProductHarvestHistoryId,
                        HarvestHistoryId = x.HarvestHistoryId,
                        PlantId = x.PlantId,
                        PlantName = x.Plant.PlantName,
                        PlantCode = x.Plant.PlantCode,
                        ActualQuantity = x.ActualQuantity
                    }).ToList();
            }
            return new BusinessResult(Const.SUCCESS_GET_HARVEST_HISTORY_CODE, Const.SUCCESS_GET_HARVEST_HISTORY_MSG, mappedResult);

        }

        public async Task<BusinessResult> getHarvestHistoryByCrop(int cropId, PaginationParameter paginationParameter, HarvestFilter filterRequest)
        {
            try
            {
                if (cropId <= 0)
                    return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, Const.WARNING_CROP_NOT_EXIST_MSG);
                Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = x => x.OrderByDescending(x => x.DateHarvest);
                Expression<Func<HarvestHistory, bool>> filter = c => c.CropId == cropId && c.Crop!.IsDeleted == false && c.IsDeleted == false;
                //Expression<Func<HarvestHistory, bool>> filter = x => x.CropId == cropId && x.Crop!.StartDate >= DateTime.Now && x.Crop.EndDate <= DateTime.Now;
                //Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = x => x.OrderByDescending(x => x.HarvestHistoryId);
                if (filterRequest.DateHarvestFrom.HasValue && filterRequest.DateHarvestTo.HasValue)
                {
                    if (filterRequest.DateHarvestTo < filterRequest.DateHarvestFrom)
                        return new BusinessResult(400, "Date harvest from must before harvest to ");
                    filter = filter.And(x => x.DateHarvest >= filterRequest.DateHarvestFrom &&
                                            x.DateHarvest <= filterRequest.DateHarvestTo);
                }
                if (filterRequest.TotalPriceFrom.HasValue && filterRequest.DateHarvestTo.HasValue)
                {
                    if (filterRequest.TotalPriceTo < filterRequest.TotalPriceFrom)
                        return new BusinessResult(400, "Total price from must less than total price to");
                    filter = filter.And(x => x.TotalPrice >= filterRequest.TotalPriceFrom &&
                                           x.TotalPrice <= filterRequest.TotalPriceTo);
                }
                if (filterRequest.TotalPriceFrom.HasValue && filterRequest.DateHarvestTo.HasValue)
                {
                    if (filterRequest.TotalPriceTo < filterRequest.TotalPriceFrom)
                        return new BusinessResult(400, "Total price from must less than total price to");
                    filter = filter.And(x => x.TotalPrice >= filterRequest.TotalPriceFrom &&
                                           x.TotalPrice <= filterRequest.TotalPriceTo);
                }
                if (!string.IsNullOrEmpty(filterRequest.Status))
                {
                    var listStatus = Util.SplitByComma(filterRequest.Status);

                    filter = filter.And(h => listStatus.Contains(h.HarvestStatus!.ToLower()));
                }

                ApplySorting(orderBy: ref orderBy, paginationParameter.SortBy, paginationParameter.Direction);
                var landPlotCrops = await _unitOfWork.HarvestHistoryRepository.GetHarvestPaginFilterAsync(filter: filter, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                //if (!landPlotCrops.Any())
                //    return new BusinessResult(Const.WARNING_CROP_OF_FARM_EMPTY_CODE, Const.WARNING_CROP_OF_FARM_EMPTY_MSG);
                //var mappedResult = _mapper.Map<IEnumerable<HarvestHistoryModel>>(landPlotCrops);
                var pagin = new PageEntity<HarvestHistoryModel>();
                pagin.List = _mapper.Map<IEnumerable<HarvestHistoryModel>>(landPlotCrops);
                //pagin.List.ToList().ForEach(h => h.ProductHarvestHistory.Where(x => x.PlantId == null));
                foreach (var havest in pagin.List)
                {
                    havest.ProductHarvestHistory = havest.ProductHarvestHistory.Where(x => x.PlantId == null).ToList();
                    havest.NumberProduct = havest.ProductHarvestHistory.Count();
                }
                pagin.TotalRecord = await _unitOfWork.HarvestHistoryRepository.Count(filter: filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, Const.SUCCESS_GET_ALL_CROP_FOUND_MSG, pagin);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getHarvestByCode(string harvestCode)
        {
            if (string.IsNullOrEmpty(harvestCode))
                return new BusinessResult(400, "Code is empty");

            var harvest = await _unitOfWork.HarvestHistoryRepository.GetByCondition(h => h.HarvestHistoryCode!.ToLower().Equals(harvestCode.ToLower()));
            if (harvest == null)
                return new BusinessResult(Const.WARNING_HARVEST_NOT_EXIST_CODE, Const.WARNING_HARVEST_NOT_EXIST_MSG);
            var mappedResult = _mapper.Map<HarvestHistoryModel>(harvest);
            return new BusinessResult(Const.SUCCESS_GET_HARVEST_HISTORY_CODE, Const.SUCCESS_GET_HARVEST_HISTORY_MSG, mappedResult);

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

                    if (!string.IsNullOrEmpty(updateRequest.HarvestHistoryNote))
                    {
                        harvestHistory.HarvestHistoryNote = updateRequest.HarvestHistoryNote;
                    }
                    if (updateRequest.TotalPrice.HasValue)
                        harvestHistory.TotalPrice = updateRequest.TotalPrice;
                    if (!string.IsNullOrEmpty(updateRequest.HarvestStatus))
                    {
                        if (!HarvestStatusConst.ValidStatuses.Contains(updateRequest.HarvestStatus.ToLower()))
                        {
                            return new BusinessResult(400, $"Invalid harvest status '{updateRequest.HarvestStatus}'");
                        }
                        harvestHistory.HarvestStatus = updateRequest.HarvestStatus;
                    }
                    if (updateRequest.DateHarvest.HasValue || !string.IsNullOrEmpty(updateRequest.StartTime) || !string.IsNullOrEmpty(updateRequest.EndTime))
                    {
                        var scheduleExist = await _unitOfWork.CarePlanScheduleRepository.GetByCondition(x => x.HarvestHistoryID == harvestHistory.HarvestHistoryId && x.IsDeleted == false);
                        if (updateRequest.DateHarvest.HasValue)
                            harvestHistory.DateHarvest = updateRequest.DateHarvest;
                        var updateSheduleRequest = new ChangeTimeOfScheduleModel
                        {
                            StartTime = updateRequest.StartTime,
                            EndTime = updateRequest.EndTime,
                            CustomeDates = new List<DateTime> { harvestHistory.DateHarvest!.Value },
                            ScheduleId = scheduleExist.ScheduleId
                        };
                        var updateWorkLog = await _scheduleService.ChangeTimeOfSchedule(updateSheduleRequest);
                        if (updateWorkLog.StatusCode != 200)
                            return updateWorkLog;
                    }

                    _unitOfWork.HarvestHistoryRepository.Update(harvestHistory);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<HarvestHistoryModel>(harvestHistory);
                        mappedResult.ProductHarvestHistory = null!;
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

        public async Task<BusinessResult> updateProductHarvest(UpdateProductHarvesRequest updateRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkUserExist = await _unitOfWork.UserRepository.GetByID(updateRequest.UserId.Value);
                    if (checkUserExist == null)
                        return new BusinessResult(400, "You are not perrmisstion to update");
                    //Expression<Func<ProductHarvestHistory, bool>> filter = x => x.HarvestHistoryId == updateRequest.HarvestHistoryId && x.MasterTypeId == updateRequest.MasterTypeId;
                    Expression<Func<ProductHarvestHistory, bool>> filter = x => x.ProductHarvestHistoryId == updateRequest.ProductHarvestHistoryId;
                    //if (updateRequest.PlantId.HasValue)
                    //    filter.And(x => x.PlantId == updateRequest.PlantId);
                    string includeProperties = "HarvestHistory,Product";
                    var harvestHistory = await _unitOfWork.ProductHarvestHistoryRepository.GetByCondition(filter, includeProperties);
                    if (harvestHistory == null)
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);
                    if (harvestHistory.PlantId.HasValue) // la record da them vao
                    {
                        if (updateRequest.Quantity.HasValue && updateRequest.Quantity.Value > 0)
                            harvestHistory.ActualQuantity = updateRequest.Quantity;
                        harvestHistory.UserID = checkUserExist.UserId;
                        harvestHistory.RecordDate = DateTime.Now;
                    }
                    else if (!harvestHistory.PlantId.HasValue) // la cac san pham can thu hoach
                    {
                        if (harvestHistory.QuantityNeed.HasValue && updateRequest.Quantity > 0)
                            harvestHistory.QuantityNeed = updateRequest.Quantity;
                        if (!string.IsNullOrEmpty(updateRequest.Unit))
                        {
                            harvestHistory.Unit = updateRequest.Unit;
                            // Cập nhật tất cả các bản ghi cùng MasterTypeId
                            var relatedHarvestHistories = await _unitOfWork.ProductHarvestHistoryRepository
                                .GetAllNoPaging(x => x.MasterTypeId == harvestHistory.MasterTypeId && x.HarvestHistoryId == harvestHistory.HarvestHistoryId && x.ProductHarvestHistoryId != harvestHistory.ProductHarvestHistoryId);
                            var recordsToUpdate = relatedHarvestHistories.Where(x => x.ProductHarvestHistoryId != harvestHistory.ProductHarvestHistoryId).ToList();

                            foreach (var item in relatedHarvestHistories)
                            {
                                item.Unit = updateRequest.Unit;
                            }
                            _unitOfWork.ProductHarvestHistoryRepository.UpdateRange(relatedHarvestHistories);
                        }
                        if (updateRequest.SellPrice.HasValue)
                            harvestHistory.SellPrice = updateRequest.SellPrice;
                        if (updateRequest.CostPrice.HasValue)
                            harvestHistory.CostPrice = updateRequest.CostPrice;
                    }
                    _unitOfWork.ProductHarvestHistoryRepository.Update(harvestHistory);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        var mappedResult = _mapper.Map<ProductHarvestHistoryModel>(harvestHistory);
                        await transaction.CommitAsync();
                        return new BusinessResult(200, Const.SUCCESS_UPDATE_HARVEST_HISTORY_MSG, mappedResult);
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
                    return new BusinessResult(500, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getHarvestForSelectedByPlotId(int cropId)
        {
            Expression<Func<HarvestHistory, bool>> filter = x => x.CropId == cropId && x.Crop!.StartDate >= DateTime.Now && x.Crop.EndDate <= DateTime.Now;
            Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = x => x.OrderByDescending(x => x.HarvestHistoryId);

            var harvest = await _unitOfWork.HarvestHistoryRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
            if (harvest == null)
                return new BusinessResult(Const.WARNING_HARVEST_NOT_EXIST_CODE, Const.WARNING_HARVEST_NOT_EXIST_MSG);
            var mappedResult = _mapper.Map<IEnumerable<ForSelectedModels>>(harvest);
            return new BusinessResult(Const.SUCCESS_GET_HARVEST_HISTORY_CODE, Const.SUCCESS_GET_HARVEST_HISTORY_MSG, mappedResult);

        }

        public async Task<BusinessResult> StatisticOfPlantByYear(GetStatictisOfPlantByYearRequest request)
        {
            try
            {
                // 🔹 1. Lấy dữ liệu thu hoạch từ DB theo năm, sản phẩm và cây trồng
                var harvestData = await _unitOfWork.ProductHarvestHistoryRepository
                    .GetAllNoPaging(x => x.PlantId == request.plantId &&
                                         x.HarvestHistory.DateHarvest.HasValue &&
                                         x.MasterTypeId == request.productId &&
                                         x.HarvestHistory.DateHarvest.Value.Year >= request.yearFrom &&
                                         x.HarvestHistory.DateHarvest.Value.Year <= request.yearTo,
                                         includeProperties: "HarvestHistory,Product");

                //  2. Kiểm tra dữ liệu
                if (harvestData == null || !harvestData.Any())
                {
                    return new BusinessResult(200, "No harvest data found for this plant in the selected years.");
                }

                //  3. Lấy thông tin sản phẩm (chỉ có 1 loại sản phẩm duy nhất)
                var masterType = harvestData.First().Product;
                var totalQuantity = harvestData.Sum(x => x.ActualQuantity ?? 0);

                var yearlyStatistic = new YearlyStatistic
                {
                    YearFrom = request.yearFrom,
                    YearTo = request.yearTo,
                    TotalYearlyQuantity = totalQuantity,
                    MasterTypeId = masterType.MasterTypeId,
                    MasterTypeCode = masterType.MasterTypeCode,
                    MasterTypeName = masterType.MasterTypeName,
                    NumberHarvest = harvestData.Count(),
                    MonthlyData = harvestData
                        .Where(x => x.HarvestHistory.DateHarvest.HasValue)
                        .GroupBy(x => new { x.HarvestHistory.DateHarvest.Value.Year, x.HarvestHistory.DateHarvest.Value.Month })
                        .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                        .Select(group => new MonthlyStatistic
                        {
                            Year = group.Key.Year,
                            Month = group.Key.Month,
                            TotalQuantity = group.Sum(x => x.ActualQuantity ?? 0),
                            HarvestCount = group.Count()
                        }).ToList()
                };

                return new BusinessResult(200, "Successfully retrieved statistics.", yearlyStatistic);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> deletePlantRecord(DeletePlantRecoredRequest request)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    try
                    {
                        Expression<Func<ProductHarvestHistory, bool>> filter = x => request.ProductHarvestHistoryId.Contains(x.ProductHarvestHistoryId);
                        //if (plantId.HasValue)
                        //    filter.And(x => x.PlantId == plantId);
                        var harvestHistory = await _unitOfWork.ProductHarvestHistoryRepository.GetAllNoPaging(filter);
                        if (harvestHistory == null)
                            return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);

                        _unitOfWork.ProductHarvestHistoryRepository.RemoveRange(harvestHistory);
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
            catch (Exception ex)
            {
                return new BusinessResult(500, ex.Message);
            }
        }

        public async Task<BusinessResult> getProductInHarvestForSelected(int harvestId)
        {
            try
            {
                var checkHarvestExis = await _unitOfWork.ProductHarvestHistoryRepository.GetByCondition(x => x.HarvestHistoryId == harvestId);
                if (checkHarvestExis == null)
                    return new BusinessResult(400, "Harvest not exist");
                var productInHarvest = await _unitOfWork.ProductHarvestHistoryRepository.GetAllNoPaging(filter: x => x.HarvestHistoryId == harvestId && x.PlantId == null, includeProperties: "Product");
                if (!productInHarvest.Any())
                    return new BusinessResult(400, "No product found in this harvest");
                var product = productInHarvest.Select(x => x.Product);
                var mappedResult = _mapper.Map<IEnumerable<ForSelectedModels>>(product);
                return new BusinessResult(200, "Get Product for selected success", mappedResult);

            }
            catch (Exception ex)
            {
                return new BusinessResult(500, ex.Message);
            }
        }

        public async Task<BusinessResult> GetTopPlantsByYear(GetTopStatisticByYearRequest request)
        {
            try
            {
                if (request.yearFrom.HasValue && request.yearTo.HasValue && request.yearFrom > request.yearTo)
                    return new BusinessResult(400, "Year From larger than Year To ");
                //  1. Lấy danh sách thu hoạch theo loại sản phẩm
                request.yearFrom = request.yearFrom ?? DateTime.Now.Year;
                request.yearTo = request.yearTo ?? DateTime.Now.Year;
                var harvestData = await _unitOfWork.ProductHarvestHistoryRepository
                    .getToTopStatistic(
                        x => x.MasterTypeId == request.productId &&
                             x.PlantId.HasValue &&
                             x.ActualQuantity.HasValue &&
                             x.Plant!.FarmId == request.farmId &&
                             x.Plant.IsDead == false &&
                             x.Plant.IsDeleted == false &&
                             x.HarvestHistory.DateHarvest.HasValue &&
                             x.HarvestHistory.DateHarvest.Value.Year >= request.yearFrom &&
                             x.HarvestHistory.DateHarvest.Value.Year <= request.yearTo
                    );

                if (harvestData == null || !harvestData.Any())
                {
                    return new BusinessResult(200, "No harvest data found for this product.");
                }

                //  2. Nhóm theo cây và tính tổng sản lượng + số lần thu hoạch
                var topPlants = harvestData
           .GroupBy(x => x.Plant!.PlantId)
           .Select(group => new
           {
               Plant = _mapper.Map<PlantModel>(group.First().Plant),  // Lấy object Plant đầy đủ
                                                                      //Plant = group.Key,
               TotalQuantity = group.Sum(x => x.ActualQuantity ?? 0), // Tổng sản lượng
               HarvestCount = group.Count() // Số lần thu hoạch
           })
           .OrderByDescending(x => x.TotalQuantity) // Sắp xếp theo tổng sản lượng
           .Take(request.topN ?? 20) // Giới hạn số lượng
           .ToList();

                return new BusinessResult(200, "Successfully retrieved top plants.", topPlants);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetTopPlantsByCrop(GetTopStatisticByCropRequest request)
        {
            try
            {
                if (request.cropId.Any())
                {
                    var checkCropExist = await _unitOfWork.CropRepository
                        .GetAllNoPaging(x => request.cropId.Contains(x.CropId) &&
                            x.IsDeleted == false &&
                            x.FarmId == request.farmId);
                    if (!checkCropExist.Any())
                        return new BusinessResult(400, "No crop was found");
                }
                else
                {
                    request.cropId = (await _unitOfWork.CropRepository.GetCropsInCurrentTime(request.farmId)).Select(x => x.CropId).ToList();
                }
                //  1. Lấy danh sách thu hoạch theo loại sản phẩm
                var harvestData = await _unitOfWork.ProductHarvestHistoryRepository
                    .getToTopStatistic(
                        x => x.MasterTypeId == request.productId &&
                             x.PlantId.HasValue &&
                             x.ActualQuantity.HasValue &&
                             x.Plant!.FarmId == request.farmId &&
                             x.Plant.IsDead == false &&
                             x.Plant.IsDeleted == false &&
                             request.cropId.Contains(x.HarvestHistory.CropId!.Value)
                    );

                if (harvestData == null || !harvestData.Any())
                {
                    return new BusinessResult(200, "No harvest data found for this product.");
                }

                //  2. Nhóm theo cây và tính tổng sản lượng + số lần thu hoạch
                var topPlants = harvestData
           .GroupBy(x => x.Plant)
           .Select(group => new
           {
               Plant = _mapper.Map<PlantModel>(group.Key),  // Lấy object Plant đầy đủ
               TotalQuantity = group.Sum(x => x.ActualQuantity ?? 0), // Tổng sản lượng
               HarvestCount = group.Count() // Số lần thu hoạch
           })
           .OrderByDescending(x => x.TotalQuantity) // Sắp xếp theo tổng sản lượng
           .Take(request.topN ?? 20) // Giới hạn số lượng
           .ToList();

                return new BusinessResult(200, "Successfully retrieved top plants.", topPlants);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private void ApplySorting(ref Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy, string? sortBy, string? direction)
        {
            bool isDescending = !string.IsNullOrEmpty(direction) && direction.ToLower().Equals("desc");
            sortBy = sortBy?.ToLower() ?? "harvesthistoryid"; // Mặc định sắp xếp theo HarvestHistoryId

            switch (sortBy)
            {
                case "harvesthistorycode":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.HarvestHistoryCode).ThenByDescending(c => c.HarvestHistoryId))
                                           : (x => x.OrderByDescending(o => o.HarvestHistoryCode).ThenByDescending(c => c.HarvestHistoryId));
                    break;
                case "dateharvest":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.DateHarvest).ThenByDescending(c => c.HarvestHistoryId))
                                           : (x => x.OrderByDescending(o => o.DateHarvest).ThenByDescending(c => c.HarvestHistoryId));
                    break;
                case "harvesthistorynote":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.HarvestHistoryNote).ThenByDescending(c => c.HarvestHistoryId))
                                           : (x => x.OrderByDescending(o => o.HarvestHistoryNote).ThenByDescending(c => c.HarvestHistoryId));
                    break;
                case "totalprice":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.TotalPrice).ThenByDescending(c => c.HarvestHistoryId))
                                           : (x => x.OrderByDescending(o => o.TotalPrice).ThenByDescending(c => c.HarvestHistoryId));
                    break;
                case "harveststatus":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.HarvestStatus).ThenByDescending(c => c.HarvestHistoryId))
                                           : (x => x.OrderByDescending(o => o.HarvestStatus).ThenByDescending(c => c.HarvestHistoryId));
                    break;
                case "cropid":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.CropId).ThenByDescending(c => c.HarvestHistoryId))
                                           : (x => x.OrderByDescending(o => o.CropId).ThenByDescending(c => c.HarvestHistoryId));
                    break;
                case "yieldhasrecord":
                    orderBy = isDescending
                        ? x => x.OrderByDescending(c => c.ProductHarvestHistories.Where(x => x.PlantId != null).Sum(x => x.ActualQuantity)).ThenByDescending(c => c.HarvestHistoryId)
                        : x => x.OrderBy(c => c.ProductHarvestHistories.Where(x => x.PlantId != null).Sum(x => x.ActualQuantity)).ThenByDescending(c => c.HarvestHistoryId);
                    break;
                default:
                    orderBy = isDescending ? (x => x.OrderBy(o => o.HarvestHistoryId))
                                           : (x => x.OrderByDescending(o => o.HarvestHistoryId));
                    break;
            }
        }

        public async Task<BusinessResult> SoftedDeleted(List<int> harvestHistoryIds)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var harvestHistories = await _unitOfWork.HarvestHistoryRepository
                        .GetAllNoPaging(h => harvestHistoryIds.Contains(h.HarvestHistoryId));

                    if (!harvestHistories.Any())
                        return new BusinessResult(Const.WARNING_GET_HARVEST_NOT_EXIST_CODE, Const.WARNING_GET_HARVEST_NOT_EXIST_MSG);

                    // Xóa mềm HarvestHistory
                    harvestHistories.ToList().ForEach(h => h.IsDeleted = true);
                    _unitOfWork.HarvestHistoryRepository.UpdateRange(harvestHistories);

                    // Xóa cứng ProductHarvestHistory (không có IsDeleted)
                    var productHarvestHistories = await _unitOfWork.ProductHarvestHistoryRepository
                        .GetAllNoPaging(p => harvestHistoryIds.Contains(p.HarvestHistoryId));

                    _unitOfWork.ProductHarvestHistoryRepository.RemoveRange(productHarvestHistories);

                    // Xóa mềm CarePlanSchedule
                    var carePlanSchedules = await _unitOfWork.CarePlanScheduleRepository
                        .GetAllNoPaging(c => harvestHistoryIds.Contains(c.HarvestHistoryID ?? 0));

                    carePlanSchedules.ToList().ForEach(c => c.IsDeleted = true);
                    _unitOfWork.CarePlanScheduleRepository.UpdateRange(carePlanSchedules);
                    // Xóa mềm WorkLog
                    var scheduleIds = carePlanSchedules.Select(c => c.ScheduleId).ToList();

                    var workLogs = await _unitOfWork.WorkLogRepository
                        .GetAllNoPaging(w => w.ScheduleId.HasValue && scheduleIds.Contains(w.ScheduleId.Value));

                    workLogs.ToList().ForEach(w => w.IsDeleted = true);
                    _unitOfWork.WorkLogRepository.UpdateRange(workLogs);

                    // Xóa cứng UserWorkLog
                    var workLogIds = workLogs.Select(u => u.WorkLogId).ToList();

                    var userWorkLogs = await _unitOfWork.UserWorkLogRepository
                        .GetAllNoPaging(u => workLogIds.Contains(u.WorkLogId));

                    _unitOfWork.UserWorkLogRepository.RemoveRange(userWorkLogs);

                    // Xóa cứng TaskFeedback
                    var taskFeedbacks = await _unitOfWork.TaskFeedbackRepository
                        .GetAllNoPaging(t => workLogIds.Contains(t.WorkLogId.Value));

                    _unitOfWork.TaskFeedbackRepository.RemoveRange(taskFeedbacks);

                    // Lưu thay đổi vào DB
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_UPDATE_HARVEST_HISTORY_CODE, "Delete Harvest Success");
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
                    return new BusinessResult(Const.FAIL_UPDATE_HARVEST_HISTORY_CODE, Const.FAIL_UPDATE_HARVEST_HISTORY_MSG, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getHarvestHistoryByPlant(int plantId, PaginationParameter paginationParameter, PlantHarvestFilter filterRequest)
        {
            try
            {
                if (plantId <= 0)
                    return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, Const.WARNING_CROP_NOT_EXIST_MSG);
                Func<IQueryable<ProductHarvestHistory>, IOrderedQueryable<ProductHarvestHistory>> orderBy = x => x.OrderByDescending(x => x.HarvestHistory.DateHarvest);
                Expression<Func<ProductHarvestHistory, bool>> filter = c => c.PlantId == plantId && c.HarvestHistory.Crop!.IsDeleted == false && c.HarvestHistory.IsDeleted == false;
                //Expression<Func<HarvestHistory, bool>> filter = x => x.CropId == cropId && x.Crop!.StartDate >= DateTime.Now && x.Crop.EndDate <= DateTime.Now;
                //Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = x => x.OrderByDescending(x => x.HarvestHistoryId);
                if (filterRequest.DateHarvestFrom.HasValue && filterRequest.DateHarvestTo.HasValue)
                {
                    if (filterRequest.DateHarvestTo < filterRequest.DateHarvestFrom)
                        return new BusinessResult(400, "Date harvest from must before harvest to ");
                    filter = filter.And(x => x.HarvestHistory.DateHarvest >= filterRequest.DateHarvestFrom &&
                                            x.HarvestHistory.DateHarvest <= filterRequest.DateHarvestTo);
                }
                if (filterRequest.totalQuantityFrom.HasValue && filterRequest.totalQuantityTo.HasValue)
                {
                    if (filterRequest.totalQuantityTo < filterRequest.totalQuantityFrom)
                        return new BusinessResult(400, "Total price from must less than total price to");
                    filter = filter.And(x => x.ActualQuantity >= filterRequest.totalQuantityFrom &&
                                           x.ActualQuantity <= filterRequest.totalQuantityTo);
                }
                if (!string.IsNullOrEmpty(filterRequest.productIds))
                {
                    var filterList = Util.SplitByComma(filterRequest.productIds);
                    filter = filter.And(x => filterList.Contains(x.MasterTypeId.ToString()));
                }
                ApplyPlantHarvestSorting(orderBy: ref orderBy, paginationParameter.SortBy, paginationParameter.Direction);
                var plantProductRecord = await _unitOfWork.ProductHarvestHistoryRepository.getPlantLogHarvestPagin(filter: filter, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                //if (!landPlotCrops.Any())
                //    return new BusinessResult(Const.WARNING_CROP_OF_FARM_EMPTY_CODE, Const.WARNING_CROP_OF_FARM_EMPTY_MSG);
                //var mappedResult = _mapper.Map<IEnumerable<HarvestHistoryModel>>(landPlotCrops);
                var pagin = new PageEntity<PlantLogHarvestModel>();
                pagin.List = _mapper.Map<IEnumerable<PlantLogHarvestModel>>(plantProductRecord);
                pagin.TotalRecord = await _unitOfWork.ProductHarvestHistoryRepository.Count(filter: filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, Const.SUCCESS_GET_ALL_CROP_FOUND_MSG, pagin);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
        private void ApplyPlantHarvestSorting(ref Func<IQueryable<ProductHarvestHistory>, IOrderedQueryable<ProductHarvestHistory>> orderBy, string? sortBy, string? direction)
        {
            bool isDescending = !string.IsNullOrEmpty(direction) && direction.ToLower().Equals("desc");
            sortBy = sortBy?.ToLower() ?? "harvesthistoryid"; // Mặc định sắp xếp theo HarvestHistoryId

            switch (sortBy)
            {
                case "harvesthistorycode":
                    orderBy = isDescending ? (x => x.OrderByDescending(o => o.HarvestHistory.HarvestHistoryCode).ThenByDescending(c => c.HarvestHistory.DateHarvest))
                                           : (x => x.OrderBy(o => o.HarvestHistory.HarvestHistoryCode).ThenByDescending(c => c.HarvestHistory.DateHarvest));
                    break;
                case "dateharvest":
                    orderBy = isDescending ? (x => x.OrderByDescending(o => o.HarvestHistory.DateHarvest).ThenByDescending(c => c.HarvestHistoryId))
                                           : (x => x.OrderBy(o => o.HarvestHistory.DateHarvest).ThenByDescending(c => c.HarvestHistoryId));
                    break;
                case "cropname":
                    orderBy = isDescending ? (x => x.OrderByDescending(o => o.HarvestHistory!.Crop.CropName).ThenByDescending(c => c.HarvestHistory.DateHarvest))
                                           : (x => x.OrderBy(o => o.HarvestHistory!.Crop.CropName).ThenByDescending(c => c.HarvestHistory.DateHarvest));
                    break;
                case "productname":
                    orderBy = isDescending ? (x => x.OrderByDescending(o => o.Product!.MasterTypeName).ThenByDescending(c => c.HarvestHistoryId))
                                           : (x => x.OrderBy(o => o.Product!.MasterTypeName).ThenByDescending(c => c.HarvestHistoryId));
                    break;
                case "actualquantity":
                    orderBy = isDescending
                        ? x => x.OrderByDescending(c => c.ActualQuantity).ThenByDescending(c => c.HarvestHistoryId)
                        : x => x.OrderBy(c => c.ActualQuantity).ThenByDescending(c => c.HarvestHistoryId);
                    break;
                default:
                    orderBy = isDescending ? (x => x.OrderByDescending(o => o.HarvestHistory.DateHarvest))
                                           : (x => x.OrderBy(o => o.HarvestHistory.DateHarvest));
                    break;
            }
        }

        public async Task<BusinessResult> getHarvestPlantCanRecord(GetHarvestForPlantRecordRequest request)
        {
            try
            {
                var plantExist = await _unitOfWork.PlantRepository.getById(request.PlantId);
                if (plantExist == null)
                    return new BusinessResult(Const.WARNING_CROP_NOT_EXIST_CODE, "Plant not exist");
                var dateCanRecordConfig = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.RECORD_AFTER_DATE, (int)3);
                Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = x => x.OrderByDescending(x => x.DateHarvest);
                Expression<Func<HarvestHistory, bool>> filter = c => c.Crop.LandPlotCrops.Select(x => x.LandPlotId).ToList().Contains(plantExist.LandRow.LandPlotId.Value)
                && c.Crop!.IsDeleted == false
                && c.IsDeleted == false
                //&& c.DateHarvest >= request.StartDate
                && c.DateHarvest!.Value.AddDays(dateCanRecordConfig).Date >= DateTime.Now.Date;

                //&& c.DateHarvest >= DateTime.Now.AddDays(-7);
                //filter = filter.And(x => EF.Functions.DateDiffDay(DateTime.Now, x.DateHarvest.Value) <= 7);
                var landPlotCrops = await _unitOfWork.HarvestHistoryRepository.GetAllHarvest(filter: filter, orderBy: orderBy);
                //if (!landPlotCrops.Any())
                //    return new BusinessResult(Const.WARNING_CROP_OF_FARM_EMPTY_CODE, Const.WARNING_CROP_OF_FARM_EMPTY_MSG);
                //var mappedResult = _mapper.Map<IEnumerable<HarvestHistoryModel>>(landPlotCrops);
                var mappedResult = _mapper.Map<IEnumerable<HarvestHistoryModel>>(landPlotCrops);
                //pagin.List.ToList().ForEach(h => h.ProductHarvestHistory.Where(x => x.PlantId == null));
                foreach (var havest in mappedResult)
                {
                    havest.ProductHarvestHistory = null!;
                    havest.CarePlanSchedules = null!;
                }
                return new BusinessResult(Const.SUCCESS_GET_ALL_CROP_CODE, "Get all Harvest plant can record success", mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ImportPlantRecordAsync(ImportHarvestExcelRequest request)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    // 1. Kiểm tra Harvest History
                    var harvest = await _unitOfWork.HarvestHistoryRepository
                        .GetHarvestAndProduct(x => x.HarvestHistoryId == request.harvestId && x.IsDeleted == false);

                    if (harvest == null)
                        return new BusinessResult(400, "Harvest History is not exist");

                    // 2. Đọc file Excel
                    List<PlantRecordHarvestImportMdoel> recordCsvList =
                        await _excelReaderService.ReadCsvFileAsync<PlantRecordHarvestImportMdoel>(request.fileExcel);
                    if (!recordCsvList.Any())
                        return new BusinessResult(400, "File excel is empty. Please try again!");

                    // 3. Kiểm tra trùng lặp trong file
                    var (duplicateErrors, validPlants) = await _excelReaderService.FindDuplicatesInFileAsync(recordCsvList);
                    if (duplicateErrors.Any())
                    {
                        var duplicateMsg = string.Join("\n", duplicateErrors.Select(error =>
                            $"Row {string.Join(" and ", error.RowIndexes)} is exist in data."));
                        return new BusinessResult(Const.WARNING_IMPORT_PLANT_DUPLICATE_CODE, duplicateMsg, duplicateErrors);
                    }

                    // 4. Chuẩn bị dữ liệu kiểm tra
                    var plotIds = (await _unitOfWork.LandPlotCropRepository
                        .GetAllNoPaging(x => x.CropID == harvest.CropId && !x.LandPlot.IsDeleted!.Value, includeProperties: "LandPlot"))
                        .Select(x => x.LandPlotId).ToList();

                    var allRowOfCrop = (await _unitOfWork.LandRowRepository
                        .GetAllNoPaging(x => plotIds.Contains(x.LandPlotId!.Value) && !x.IsDeleted.Value))
                        .Select(x => x.LandRowId).ToHashSet();

                    var plantCodes = validPlants.Select(x => x.PlantCode).Distinct().ToList();
                    var masterTypeCodes = validPlants.Select(x => x.MasterTypeCode).Distinct().ToList();

                    var plants = (await _unitOfWork.PlantRepository
                        .GetAllNoPaging(x => plantCodes.Contains(x.PlantCode)
                            && !x.IsDead.Value && !x.IsDeleted.Value
                            && allRowOfCrop.Contains(x.LandRowId!.Value)))
                        .ToDictionary(x => x.PlantCode);

                    var masterTypes = (await _unitOfWork.MasterTypeRepository
                        .GetAllNoPaging(x => masterTypeCodes.Contains(x.MasterTypeCode)
                            && x.TypeName!.ToLower() == TypeNameInMasterEnum.Product.ToString().ToLower()))
                        .ToDictionary(x => x.MasterTypeCode);

                    var selectedProductIds = harvest.ProductHarvestHistories
                        .Select(x => x.MasterTypeId).ToHashSet();

                    // 5. Kiểm tra lỗi và mapping dữ liệu
                    string errorList = "";
                    bool fileHasError = false;
                    var harvestRecord = new List<ProductHarvestHistory>();

                    foreach (var plant in validPlants)
                    {
                        if (!plants.TryGetValue(plant.PlantCode, out var plantExist))
                        {
                            fileHasError = true;
                            errorList += $"\nRow {plant.NumberOrder}: Plant is not exist or not in crop can harvest.";
                            continue;
                        }
                        else
                        {
                            bool plantCanHarvest = await _unitOfWork.PlantRepository.CheckIfPlantCanBeInTargetAsync(plantExist.PlantId, ActFunctionGrStageEnum.Harvest.ToString());
                            if (!plantCanHarvest)
                            {
                                fileHasError = true;
                                errorList += $"\nRow {plant.NumberOrder}: Plant is not in stage can harvest.";
                                continue;
                            }
                        }

                        if (!masterTypes.TryGetValue(plant.MasterTypeCode, out var masterType))
                        {
                            fileHasError = true;
                            errorList += $"\nRow {plant.NumberOrder}: MasterTypeCode not exist or not product.";
                            continue;
                        }

                        if (!selectedProductIds.Contains(masterType.MasterTypeId))
                        {
                            fileHasError = true;
                            errorList += $"\nRow {plant.NumberOrder}: MasterTypeCode is not selected product in harvest.";
                            continue;
                        }

                        if (!plant.Quantity.HasValue || plant.Quantity.Value <= 0)
                        {
                            fileHasError = true;
                            errorList += $"\nRow {plant.NumberOrder}: Quantity must be > 0.";
                            continue;
                        }

                        harvestRecord.Add(new ProductHarvestHistory
                        {
                            HarvestHistoryId = harvest.HarvestHistoryId,
                            MasterTypeId = masterType.MasterTypeId,
                            Unit = harvest.ProductHarvestHistories
                            .FirstOrDefault(x => x.MasterTypeId == masterType.MasterTypeId)?.Unit,
                            UserID = request.userId,
                            PlantId = plantExist.PlantId,
                            ActualQuantity = plant.Quantity.Value,
                            RecordDate = DateTime.Now
                        });
                    }

                    if (fileHasError)
                        return new BusinessResult(Const.FAIL_IMPORT_PLANT_CODE, errorList);

                    // 6. Thêm vào database
                    await _unitOfWork.ProductHarvestHistoryRepository.InsertRangeAsync(harvestRecord);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_IMPORT_PLANT_CODE, $"Import {result} record harvest from excel success");
                    }

                    return new BusinessResult(Const.FAIL_IMPORT_PLANT_CODE, "Save to database failed");
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_IMPORT_PLANT_CODE, "Error when import", ex.Message);
            }
        }

    }
}
