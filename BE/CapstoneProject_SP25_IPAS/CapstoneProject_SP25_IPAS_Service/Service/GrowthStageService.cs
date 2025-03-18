using AutoMapper;
using AutoMapper.Execution;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.GrowthStageModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GrowthStageRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class GrowthStageService : IGrowthStageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private readonly IFarmService _farmService;
        public GrowthStageService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration, IFarmService farmService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _config = configuration;
            _farmService = farmService;

        }
        //public async Task<BusinessResult> CreateGrowthStage(CreateGrowthStageModel createGrowthStageModel, int farmId)
        //{
        //    using (var transaction = await _unitOfWork.BeginTransactionAsync())
        //    {
        //        try
        //        {
        //            // Lấy danh sách GrowthStage của farm hiện tại
        //            var existingGrowthStages = await _unitOfWork.GrowthStageRepository.GetAllNoPaging(
        //                filter: gs => gs.FarmID == farmId && gs.isDeleted == false
        //            );

        //            // Kiểm tra xung đột với khoảng thời gian
        //            bool isConflict = existingGrowthStages.Any(gs =>
        //                !(createGrowthStageModel.MonthAgeEnd < gs.MonthAgeStart || createGrowthStageModel.MonthAgeStart > gs.MonthAgeEnd)
        //            );

        //            if (isConflict)
        //            {
        //                return new BusinessResult(400, "The Growth Stage duration overlaps or is nested with an existing Growth Stage.");
        //            }

        //            // Đọc danh sách ActiveFunction từ GrowthStage
        //            if (!string.IsNullOrEmpty(createGrowthStageModel.ActiveFunction))
        //            {
        //                var invalidFunctions = await ValidateActiveFunction(createGrowthStageModel.ActiveFunction);
        //                if (invalidFunctions.Any())
        //                {
        //                    return new BusinessResult(400, $"Some ActiveFunction not available: {string.Join(", ", invalidFunctions)}");
        //                }
        //            }

        //            var createGrowthStage = new GrowthStage()
        //            {
        //                GrowthStageCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.GROWTHSTAGE),
        //                GrowthStageName = createGrowthStageModel.GrowthStageName,
        //                MonthAgeStart = createGrowthStageModel.MonthAgeStart,
        //                MonthAgeEnd = createGrowthStageModel.MonthAgeEnd,
        //                CreateDate = DateTime.Now,
        //                Description = createGrowthStageModel.Description,
        //                FarmID = farmId,
        //                ActiveFunction = createGrowthStageModel.ActiveFunction,
        //                isDefault = false,
        //                isDeleted = false,
        //            };
        //            await _unitOfWork.GrowthStageRepository.Insert(createGrowthStage);
        //            var result = await _unitOfWork.SaveAsync();
        //            await transaction.CommitAsync();
        //            if (result > 0)
        //            {
        //                return new BusinessResult(Const.SUCCESS_CREATE_GROWTHSTAGE_CODE, Const.SUCCESS_CREATE_GROWTHSTAGE_MESSAGE, result > 0);
        //            }
        //            return new BusinessResult(Const.FAIL_CREATE_GROWTHSTAGE_CODE, Const.FAIL_CREATE_GROWTHSTAGE_MESSAGE, false);
        //        }
        //        catch (Exception ex)
        //        {
        //            await transaction.RollbackAsync();
        //            return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //        }
        //    }
        //}

        public async Task<BusinessResult> CreateGrowthStage(CreateGrowthStageModel createGrowthStageModel, int farmId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkFarmExist = await _farmService.CheckFarmExist(farmId);
                    if (checkFarmExist == null)
                        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    // Lấy danh sách GrowthStage của farm, sắp xếp theo MonthAgeStart
                    var existingGrowthStages = (await _unitOfWork.GrowthStageRepository.GetAllNoPaging(
                        filter: gs => gs.FarmID == farmId && gs.isDeleted == false
                    )).OrderBy(gs => gs.MonthAgeStart).ToList();

                    // Xác định MonthAgeStart từ giai đoạn trước đó
                    int newMonthAgeStart = existingGrowthStages.Any() ? existingGrowthStages.Last().MonthAgeEnd.GetValueOrDefault() + 1 : 1;

                    if (createGrowthStageModel.MonthAgeEnd <= newMonthAgeStart)
                    {
                        return new BusinessResult(400, "MonthAgeEnd must be greater than the previous stage's MonthAgeEnd.");
                    }

                    // Kiểm tra ActiveFunction
                    if (!string.IsNullOrEmpty(createGrowthStageModel.ActiveFunction))
                    {
                        var invalidFunctions = ValidateActiveFunction(createGrowthStageModel.ActiveFunction);
                        if (invalidFunctions.Any())
                        {
                            return new BusinessResult(400, $"Some ActiveFunction not available: {string.Join(", ", invalidFunctions)}");
                        }
                    }

                    // creat growthstage
                    string farmCode = Util.SplitByDash(checkFarmExist.FarmCode!).First();
                    var createGrowthStage = new GrowthStage()
                    {
                        GrowthStageCode = $"{CodeAliasEntityConst.GROWTHSTAGE}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}-{farmCode}",
                        GrowthStageName = createGrowthStageModel.GrowthStageName,
                        MonthAgeStart = newMonthAgeStart,
                        MonthAgeEnd = createGrowthStageModel.MonthAgeEnd,
                        CreateDate = DateTime.Now,
                        Description = createGrowthStageModel.Description,
                        FarmID = farmId,
                        ActiveFunction = createGrowthStageModel.ActiveFunction,
                        isDefault = false,
                        isDeleted = false,
                    };

                    await _unitOfWork.GrowthStageRepository.Insert(createGrowthStage);
                    var result = await _unitOfWork.SaveAsync();
                    await transaction.CommitAsync();

                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_GROWTHSTAGE_CODE, Const.SUCCESS_CREATE_GROWTHSTAGE_MESSAGE, true);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_GROWTHSTAGE_CODE, Const.FAIL_CREATE_GROWTHSTAGE_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }


        public async Task<BusinessResult> GetAllGrowthStagePagination(PaginationParameter paginationParameter, int farmId)
        {
            try
            {
                Expression<Func<GrowthStage, bool>> filter = x => x.FarmID == farmId! && x.isDeleted == false;
                Func<IQueryable<GrowthStage>, IOrderedQueryable<GrowthStage>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    if (checkInt)
                    {
                        filter = x => x.GrowthStageID == validInt || x.MonthAgeStart == validInt || x.MonthAgeEnd == validInt;
                    }
                    else
                    {
                        filter = x => x.GrowthStageCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.GrowthStageName.ToLower().Contains(paginationParameter.Search.ToLower());
                    }
                }
                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "growthstageid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.GrowthStageID)
                                   : x => x.OrderBy(x => x.GrowthStageID)) : x => x.OrderBy(x => x.GrowthStageID);
                        break;
                    case "growthstagecode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.GrowthStageCode)
                                   : x => x.OrderBy(x => x.GrowthStageCode)) : x => x.OrderBy(x => x.GrowthStageCode);
                        break;
                    case "growthstagename":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.GrowthStageName)
                                   : x => x.OrderBy(x => x.GrowthStageName)) : x => x.OrderBy(x => x.GrowthStageName);
                        break;
                    case "monthagestart":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MonthAgeStart)
                                   : x => x.OrderBy(x => x.MonthAgeStart)) : x => x.OrderBy(x => x.MonthAgeStart);
                        break;
                    case "monthageend":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MonthAgeEnd)
                                   : x => x.OrderBy(x => x.MonthAgeEnd)) : x => x.OrderBy(x => x.MonthAgeEnd);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.MonthAgeStart);
                        break;
                }
                var maxAgeStartNew = await _unitOfWork.GrowthStageRepository.GetMaxAge(farmId);
                string includeProperties = "Farm";
                var entities = await _unitOfWork.GrowthStageRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<GrowthStageModel>();
                pagin.List = _mapper.Map<IEnumerable<GrowthStageModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.GrowthStageRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    //return new BusinessResult(Const.SUCCESS_GET_ALL_GROWTHSTAGE_CODE, Const.SUCCESS_GET_ALL_GROWTHSTAGE_MESSAGE, new { pagin, MaxAgeStart = maxAgeStartNew });
                    return new BusinessResult(Const.SUCCESS_GET_ALL_GROWTHSTAGE_CODE,
                          Const.SUCCESS_GET_ALL_GROWTHSTAGE_MESSAGE,
                          new
                          {
                              list = pagin.List,
                              totalPage = pagin.TotalPage,
                              totalRecord = pagin.TotalRecord,
                              maxAgeStart = maxAgeStartNew
                          });

                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG, new { pagin, MaxAgeStart = maxAgeStartNew });
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetGrowthStageByFarmId(int? farmId)
        {
            try
            {
                var getGrowthStageByFarmId = await _unitOfWork.GrowthStageRepository.GetGrowthStagesByFarmId(farmId);
                if (getGrowthStageByFarmId != null)
                {
                    if (getGrowthStageByFarmId.Count() > 0)
                    {
                        var mappedModel = _mapper.Map<List<ForSelectedModels>>(getGrowthStageByFarmId);
                        return new BusinessResult(Const.SUCCESS_GET_GROWTHSTAGE_BY_FARM_ID_CODE, Const.SUCCESS_GET_GROWTHSTAGE_BY_FARM_ID_MESSAGE, mappedModel);
                    }
                    return new BusinessResult(Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG);
                }
                return new BusinessResult(Const.FAIL_GET_GROWTHSTAGE_BY_FARM_ID_CODE, Const.FAIL_GET_GROWTHSTAGE_BY_FARM_ID_MESSAGE);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetGrowthStageByID(int growthStageId)
        {
            try
            {
                var growthStage = await _unitOfWork.GrowthStageRepository.GetByCondition(x => x.GrowthStageID == growthStageId, "Farm");
                var getGrowthStage = _mapper.Map<GrowthStageModel>(growthStage);
                if (getGrowthStage != null)
                {
                    return new BusinessResult(Const.SUCCESS_GET_GROWTHSTAGE_BY_ID_CODE, Const.SUCCESS_GET_GROWTHSTAGE_BY_ID_MESSAGE, getGrowthStage);
                }
                return new BusinessResult(Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PermanentlyDeleteGrowthStage(int growthStageId)
        {
            try
            {
                string includeProperties = "Plans,Processes";
                var getDeleteGrowthStage = await _unitOfWork.GrowthStageRepository.GetByCondition(x => x.GrowthStageID == growthStageId, includeProperties);
                if (getDeleteGrowthStage != null)
                {
                    foreach (var plan in getDeleteGrowthStage.GrowthStagePlans.ToList())
                    {
                        plan.GrowthStageID = null;
                    }
                    foreach (var process in getDeleteGrowthStage.Processes.ToList())
                    {
                        process.GrowthStageId = null;
                    }
                    await _unitOfWork.SaveAsync();
                    _unitOfWork.GrowthStageRepository.Delete(getDeleteGrowthStage);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_DELETE_GROWTHSTAGE_CODE, Const.SUCCESS_DELETE_GROWTHSTAGE_MESSAGE, result > 0);
                    }
                    return new BusinessResult(Const.FAIL_DELETE_GROWTHSTAGE_CODE, Const.FAIL_DELETE_GROWTHSTAGE_MESSAGE, false);
                }
                return new BusinessResult(Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PermanentlyDeleteManyGrowthStage(List<int> growthStagesId)
        {
            try
            {
                var count = 0;
                var deletedNames = new List<string>();

                foreach (var growthStageDelete in growthStagesId)
                {
                    var getGrowthStageDelete = await _unitOfWork.GrowthStageRepository.GetByID(growthStageDelete);
                    if (getGrowthStageDelete == null)
                        continue;

                    var result = await PermanentlyDeleteGrowthStage(growthStageDelete);
                    if (result.StatusCode == 200)
                    {
                        count++;
                        deletedNames.Add(getGrowthStageDelete.GrowthStageName);
                    }
                }


                if (count == growthStagesId.Count)
                {
                    return new BusinessResult(Const.SUCCESS_DELETE_GROWTHSTAGE_CODE,
                        $"Successfully deleted {count} GrowthStage: {string.Join(", ", deletedNames)}", true);
                }

                return new BusinessResult(Const.FAIL_DELETE_GROWTHSTAGE_CODE,
                    $"Only deleted {count}/{growthStagesId.Count} GrowthStage(s): {string.Join(", ", deletedNames)}", false);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //public async Task<BusinessResult> SoftedMultipleDelete(List<int> growthStagesId)
        //{
        //    using (var transaction = await _unitOfWork.BeginTransactionAsync())
        //    {
        //        try
        //        {
        //            var deletedNames = new List<string>();
        //            foreach (var growthStageDeleteId in growthStagesId)
        //            {
        //                Expression<Func<GrowthStage, bool>> filter = x => x.GrowthStageID == growthStageDeleteId && x.isDefault == false && x.isDeleted == false;
        //                var checkExistGrowthStage = await _unitOfWork.GrowthStageRepository.GetByCondition(x => x.GrowthStageID == growthStageDeleteId);
        //                if (checkExistGrowthStage != null)
        //                {
        //                    checkExistGrowthStage.isDeleted = true;
        //                    deletedNames.Add(checkExistGrowthStage.GrowthStageName);
        //                    _unitOfWork.GrowthStageRepository.Update(checkExistGrowthStage);
        //                }
        //            }
        //            var result = await _unitOfWork.SaveAsync();
        //            if (result == growthStagesId.Count)
        //            {
        //                await transaction.CommitAsync();
        //                return new BusinessResult(Const.SUCCESS_DELETE_MASTER_TYPE_CODE,
        //                    $"Successfully deleted {result} GrowthStage: {string.Join(", ", deletedNames)}", true);
        //            }
        //            await transaction.RollbackAsync();
        //            return new BusinessResult(Const.FAIL_DELETE_GROWTHSTAGE_CODE, Const.FAIL_DELETE_GROWTHSTAGE_MESSAGE, false);
        //        }
        //        catch (Exception ex)
        //        {
        //            await transaction.RollbackAsync();
        //            return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //        }
        //    }
        //}

        public async Task<BusinessResult> SoftedMultipleDelete(List<int> growthStagesId, int farmId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkExistFarm = await _farmService.CheckFarmExist(farmId);
                    if (checkExistFarm == null)
                        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    // Lấy toàn bộ GrowthStage chưa bị xóa để kiểm tra logic
                    var allGrowthStages = await _unitOfWork.GrowthStageRepository.GetAllNoPaging(
                        filter: x => x.isDeleted != true && x.FarmID == farmId,
                        orderBy: q => q.OrderBy(x => x.MonthAgeStart));

                    // Kiểm tra nếu người dùng định xóa hết GrowthStage thì từ chối
                    if (allGrowthStages.Count() - growthStagesId.Count < 1)
                    {
                        return new BusinessResult(Const.FAIL_DELETE_GROWTHSTAGE_CODE, "Cannot delete all GrowthStages.", false);
                    }

                    var deletedNames = new List<string>();
                    var plantsToUpdate = new Dictionary<int, List<int>>(); // Lưu danh sách PlantId theo GrowthStage mới

                    foreach (var growthStageDeleteId in growthStagesId)
                    {
                        // Tìm GrowthStage cần xóa
                        var stageToDelete = allGrowthStages.FirstOrDefault(x => x.GrowthStageID == growthStageDeleteId);
                        if (stageToDelete == null) continue;

                        // Tìm GrowthStage trước và sau
                        var previousStage = allGrowthStages.LastOrDefault(x => x.MonthAgeEnd < stageToDelete.MonthAgeStart);
                        var nextStage = allGrowthStages.FirstOrDefault(x => x.MonthAgeStart > stageToDelete.MonthAgeEnd);

                        // Cập nhật GrowthStage để lấp khoảng trống
                        if (previousStage != null && nextStage != null)
                        {
                            previousStage.MonthAgeEnd = stageToDelete.MonthAgeEnd;
                            _unitOfWork.GrowthStageRepository.Update(previousStage);
                        }
                        else if (previousStage == null && nextStage != null)
                        {
                            nextStage.MonthAgeStart = stageToDelete.MonthAgeStart;
                            _unitOfWork.GrowthStageRepository.Update(nextStage);
                        }

                        // Lấy tất cả cây trồng sử dụng GrowthStage bị xóa
                        var plants = await _unitOfWork.PlantRepository.GetAllNoPaging(
                            filter: p => p.GrowthStageID == growthStageDeleteId, includeProperties: null!);

                        // Gán tất cả cây đó vào danh sách cập nhật
                        int? newGrowthStageId = previousStage?.GrowthStageID ?? nextStage?.GrowthStageID;
                        if (newGrowthStageId.HasValue && plants.Any())
                        {
                            plantsToUpdate.TryAdd(newGrowthStageId.Value, new List<int>());
                            plantsToUpdate[newGrowthStageId.Value].AddRange(plants.Select(p => p.PlantId));
                        }

                        // Đánh dấu GrowthStage đã bị xóa
                        stageToDelete.isDeleted = true;
                        deletedNames.Add(stageToDelete.GrowthStageName!);
                        _unitOfWork.GrowthStageRepository.Update(stageToDelete);
                    }

                    // Lưu thay đổi
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();

                        // Gọi `UpdatePlantGrowthStage` một lần duy nhất cho mỗi GrowthStage
                        foreach (var entry in plantsToUpdate)
                        {
                            await UpdatePlantGrowthStage(entry.Value, entry.Key);
                        }

                        return new BusinessResult(Const.SUCCESS_DELETE_MASTER_TYPE_CODE,
                            $"Successfully deleted {deletedNames.Count()} GrowthStages: {string.Join(", ", deletedNames)}", true);
                    }

                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_DELETE_GROWTHSTAGE_CODE, Const.FAIL_DELETE_GROWTHSTAGE_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }



        //public async Task<BusinessResult> UpdateGrowthStageInfo(UpdateGrowthStageModel updateriteriaTypeModel)
        //{
        //    try
        //    {
        //        var checkExistGrowthStage = await _unitOfWork.GrowthStageRepository.GetByID(updateriteriaTypeModel.GrowthStageId);
        //        if (checkExistGrowthStage != null)
        //        {
        //            if (updateriteriaTypeModel.GrowthStageName != null)
        //            {
        //                checkExistGrowthStage.GrowthStageName = updateriteriaTypeModel.GrowthStageName;
        //            }
        //            if (updateriteriaTypeModel.MonthAgeStart != null)
        //            {
        //                checkExistGrowthStage.MonthAgeStart = updateriteriaTypeModel.MonthAgeStart;
        //            }
        //            if (updateriteriaTypeModel.MonthAgeEnd != null)
        //            {
        //                checkExistGrowthStage.MonthAgeEnd = updateriteriaTypeModel.MonthAgeEnd;
        //            }
        //            if (updateriteriaTypeModel.Description != null)
        //            {
        //                checkExistGrowthStage.Description = updateriteriaTypeModel.Description;
        //            }
        //            if (updateriteriaTypeModel.FarmId != null)
        //            {
        //                checkExistGrowthStage.FarmID = updateriteriaTypeModel.FarmId;
        //            }
        //            if (updateriteriaTypeModel.isDefault != null)
        //            {
        //                checkExistGrowthStage.isDefault = updateriteriaTypeModel.isDefault;
        //            }
        //            if (updateriteriaTypeModel.isDeleted != null)
        //            {
        //                checkExistGrowthStage.isDeleted = updateriteriaTypeModel.isDeleted;
        //            }
        //            var result = await _unitOfWork.SaveAsync();
        //            if (result > 0)
        //            {
        //                return new BusinessResult(Const.SUCCESS_UPDATE_GROWTHSTAGE_CODE, Const.SUCCESS_UPDATE_GROWTHSTAGE_MESSAGE, checkExistGrowthStage);
        //            }
        //            return new BusinessResult(Const.FAIL_UPDATE_GROWTHSTAGE_CODE, Const.FAIL_UPDATE_GROWTHSTAGE_MESSAGE, false);
        //        }
        //        return new BusinessResult(Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG);
        //    }
        //    catch (Exception ex)
        //    {
        //        return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //    }
        //}
        public async Task<BusinessResult> UpdateGrowthStageInfo(UpdateGrowthStageModel updateModel)
        {
            try
            {
                var existingStage = await _unitOfWork.GrowthStageRepository.GetByID(updateModel.GrowthStageId);
                if (existingStage == null)
                {
                    return new BusinessResult(Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE,
                                              Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG);
                }

                int? newStart = updateModel.MonthAgeStart ?? existingStage.MonthAgeStart;
                int? newEnd = updateModel.MonthAgeEnd ?? existingStage.MonthAgeEnd;

                // Lấy danh sách GrowthStage khác của cùng Farm để kiểm tra conflict
                var allStages = (await _unitOfWork.GrowthStageRepository.GetAllNoPaging(
                    filter: gs => gs.FarmID == existingStage.FarmID && gs.GrowthStageID != existingStage.GrowthStageID && gs.isDeleted == false
                )).OrderBy(gs => gs.MonthAgeStart).ToList();

                // Kiểm tra conflict với các GrowthStage khác
                bool isConflict = allStages.Any(gs =>
                    !(newEnd < gs.MonthAgeStart || newStart > gs.MonthAgeEnd)
                );

                if (isConflict)
                {
                    return new BusinessResult(400, "The GrowthStage duration overlaps or is nested with an existing GrowthStage.");
                }

                // ✅ Cập nhật thông tin GrowthStage
                if (!string.IsNullOrEmpty(updateModel.GrowthStageName)) existingStage.GrowthStageName = updateModel.GrowthStageName;
                if (updateModel.MonthAgeStart.HasValue) existingStage.MonthAgeStart = updateModel.MonthAgeStart;
                if (updateModel.MonthAgeEnd.HasValue) existingStage.MonthAgeEnd = updateModel.MonthAgeEnd;
                if (!string.IsNullOrEmpty(updateModel.Description)) existingStage.Description = updateModel.Description;
                //if (updateModel.FarmId.HasValue) existingStage.FarmID = updateModel.FarmId;
                //if (updateModel.isDefault != null) existingStage.isDefault = updateModel.isDefault;
                // ✅ Kiểm tra và cập nhật ActiveFunction
                if (!string.IsNullOrEmpty(updateModel.ActiveFunction))
                {
                    var invalidFunctions = ValidateActiveFunction(updateModel.ActiveFunction);
                    if (invalidFunctions.Any())
                    {
                        return new BusinessResult(400, $"Some ActiveFunction not available: {string.Join(", ", invalidFunctions)}");
                    }
                    existingStage.ActiveFunction = updateModel.ActiveFunction;
                }
                _unitOfWork.GrowthStageRepository.Update(existingStage);
                // ✅ Cập nhật giai đoạn trước nếu cần
                var previousStage = allStages.LastOrDefault(gs => gs.MonthAgeEnd < newStart);
                if (previousStage != null)
                {
                    previousStage.MonthAgeEnd = newStart - 1;
                    _unitOfWork.GrowthStageRepository.Update(previousStage);

                }

                // ✅ Cập nhật giai đoạn sau nếu cần
                var nextStage = allStages.FirstOrDefault(gs => gs.MonthAgeStart > newEnd);
                if (nextStage != null)
                {
                    nextStage.MonthAgeStart = newEnd + 1;
                    _unitOfWork.GrowthStageRepository.Update(nextStage);
                }


                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(Const.SUCCESS_UPDATE_GROWTHSTAGE_CODE,
                                              Const.SUCCESS_UPDATE_GROWTHSTAGE_MESSAGE,
                                              existingStage);
                }
                return new BusinessResult(Const.FAIL_UPDATE_GROWTHSTAGE_CODE, Const.FAIL_UPDATE_GROWTHSTAGE_MESSAGE, false);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }



        public async Task<GrowthStageModel?> GetGrowthStageIdByPlantingDate(int farmId, DateTime plantingDate)
        {
            // Tính số tháng tuổi từ ngày trồng đến hiện tại
            int monthAge = (DateTime.Now.Year - plantingDate.Year) * 12 + (DateTime.Now.Month - plantingDate.Month);

            // Truy vấn trực tiếp từ database
            var matchedStage = await _unitOfWork.GrowthStageRepository
                .GetByCondition(x => x.FarmID == farmId
                               && x.isDeleted == false
                               && x.MonthAgeStart <= monthAge
                               && x.MonthAgeEnd >= monthAge);
            if (matchedStage != null)
            {
                var mappedResult = _mapper.Map<GrowthStageModel>(matchedStage);
                return mappedResult; // Trả về ID nếu tìm thấy, nếu không trả về null
            }
            return null;
        }

        public List<string> ValidateActiveFunction(string activeFunctionRequest)
        {
            // Lấy danh sách ActiveFunction hợp lệ từ appsettings
            var activeFunctionList = _config.GetSection("GrowthStage:ActiveFunction").Get<List<string>>() ?? new List<string>();

            if (!activeFunctionList.Any())
            {
                return new List<string> { "No active function list was found in system" };
            }

            // Chuyển chuỗi request thành danh sách
            List<string> actFuncRequest = Util.SplitByComma(activeFunctionRequest);

            // Kiểm tra giá trị không hợp lệ
            var invalidFunctions = actFuncRequest
                .Where(func => !activeFunctionList.Any(validFunc => validFunc.Equals(func, StringComparison.OrdinalIgnoreCase)))
                .ToList();

            return invalidFunctions; // Trả về danh sách giá trị sai, nếu rỗng nghĩa là hợp lệ
        }

        public async Task<BusinessResult> UpdatePlantGrowthStage(List<int> plantIds, int? newGrowthStageId)
        {
            if (plantIds == null || !plantIds.Any())
            {
                return new BusinessResult(Const.FAIL_UPDATE_PLANT_CODE, "No plants provided for update.", false);
            }

            var plantsToUpdate = await _unitOfWork.PlantRepository.GetAllNoPaging(
                filter: p => plantIds.Contains(p.PlantId), includeProperties: null!);

            if (!plantsToUpdate.Any())
            {
                return new BusinessResult(Const.FAIL_UPDATE_PLANT_CODE, "No matching plants found.", false);
            }

            foreach (var plant in plantsToUpdate)
            {
                plant.GrowthStageID = newGrowthStageId;
                _unitOfWork.PlantRepository.Update(plant);
            }

            var result = await _unitOfWork.SaveAsync();
            if (result > 0)
            {
                return new BusinessResult(Const.SUCCESS_UPDATE_PLANT_CODE,
                    $"Successfully updated GrowthStage for {result} plants.", true);
            }
            return new BusinessResult(Const.FAIL_UPDATE_PLANT_CODE, "Failed to update GrowthStage for plants.", false);
        }

    }
}
