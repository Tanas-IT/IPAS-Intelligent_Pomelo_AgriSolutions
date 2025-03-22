
using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using CapstoneProject_SP25_IPAS_Common.Enum;
using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc.Filters;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.GraftedModel;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class GraftedPlantService : IGraftedPlantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        //private readonly IPlantService _plantService;
        private readonly ProgramDefaultConfig _masterTypeConfig;
        private readonly ICriteriaTargetService _criteriaTargetService;
        public GraftedPlantService(IUnitOfWork unitOfWork, IMapper mapper, ProgramDefaultConfig masterTypeConfig, ICriteriaTargetService criteriaTargetService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            //_plantService = plantService;
            _masterTypeConfig = masterTypeConfig;
            _criteriaTargetService = criteriaTargetService;
        }

        public async Task<BusinessResult> createGraftedPlantAsync(CreateGraftedPlantRequest createRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var plantExist = await _unitOfWork.PlantRepository.getById(createRequest.PlantId);
                    if (plantExist == null)
                        return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);

                    // Kiểm tra các điều kiện để chiết cành
                    var validationResult = await CheckPlantConditionGrafted(createRequest.PlantId);
                    if (!string.IsNullOrEmpty(validationResult))
                        return new BusinessResult(400, validationResult);

                    // Kiểm tra cây đã hoàn thành đủ điều kiện để chiết cành chưa

                    //var criteriaResult = await CheckGraftedConditionCompletedAsync(plantId: createRequest.PlantId, null);
                    //var requiredConditions = _masterTypeConfig.GraftedCriteriaApply?.GraftedConditionApply ?? new List<string>();
                    //var criteriaResult = await CheckPlantCriteriaCompletedAsync(plantId: createRequest.PlantId, criteriaRequireCheck: requiredConditions);
                    //if (criteriaResult.StatusCode != 200)
                    //return criteriaResult; // neu sai thi tra ve loi chua apply tieu chi nao luon

                    if (plantExist.IsPassed != true)
                        return new BusinessResult(400, "Mother Plant is not mark as PASS to grafted");
                    // Create the new Plant entity from the request
                    //var jsonData = JsonConvert.DeserializeObject<PlantModel>(plantExist.Data!.ToString()!);
                    //var jsonData = plantExist.Data as PlantModel;
                    var code = CodeHelper.GenerateCode();
                    var graftedCreateEntity = new GraftedPlant()
                    {
                        GraftedPlantCode = $"{CodeAliasEntityConst.GRAFTED_PLANT}{code}-{DateTime.Now.ToString("ddMMyy")}-{Util.SplitByDash(plantExist.PlantCode!).First()}",
                        GraftedPlantName = createRequest.GraftedPlantName ?? $"GraftPlant {code}",
                        //GrowthStage = createRequest.GrowthStage,
                        Status = GraftedPlantStatusConst.HEALTHY,
                        GraftedDate = createRequest.GraftedDate,
                        Note = createRequest.Note,
                        MotherPlantId = plantExist.PlantId,
                        IsDeleted = false,
                        IsCompleted = false,
                    };

                    //// Insert the new grafted entity into the repository
                    await _unitOfWork.GraftedPlantRepository.Insert(graftedCreateEntity);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<GraftedPlantModels>(graftedCreateEntity);
                        return new BusinessResult(Const.SUCCESS_CREATE_GRAFTED_PLANT_CODE, Const.SUCCESS_CREATE_GRAFTED_PLANT_MSG, mappedResult);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_PLANT_CODE, Const.FAIL_CREATE_PLANT_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_CREATE_PLANT_CODE, Const.FAIL_CREATE_PLANT_MSG, ex.Message);
            }
        }

        public async Task<BusinessResult> deletePermanentlyGrafteAsync(List<int> graftedPlantIds)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if (graftedPlantIds == null || !graftedPlantIds.Any())
                    {
                        return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, "No valid GraftedPlantIds provided.");
                    }

                    // Filter to find all plants with matching IDs
                    Expression<Func<GraftedPlant, bool>> filter = x => graftedPlantIds.Contains(x.GraftedPlantId);
                    //string includeProperties = "GraftedPlantNotes,Resources,CriteriaTargets";
                    var grafteds = await _unitOfWork.GraftedPlantRepository.GetAllNoPaging(filter);

                    if (grafteds == null || !grafteds.Any())
                    {
                        return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                    }

                    // Delete each plant entity
                    //foreach (var plant in plants)
                    //{
                    _unitOfWork.GraftedPlantRepository.RemoveRange(grafteds);
                    //}

                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, $"Delete {grafteds.Count()} record success", new { success = true });
                    }
                    return new BusinessResult(Const.FAIL_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, Const.FAIL_DELETE_SOFTED_GRAFTED_PLANT_MSG);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> deteSoftedGraftedAsync(List<int> graftedPlantIdsDelete)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if (graftedPlantIdsDelete == null || !graftedPlantIdsDelete.Any())
                    {
                        return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, "No valid GraftedPlantIds provided.");
                    }

                    // Filter to find all plants with matching IDs
                    Expression<Func<GraftedPlant, bool>> filter = x => graftedPlantIdsDelete.Contains(x.GraftedPlantId);
                    //string includeProperties = "GraftedPlantNotes,Resources,CriteriaTargets";
                    var grafteds = await _unitOfWork.GraftedPlantRepository.GetAllNoPaging(filter);

                    if (grafteds == null || !grafteds.Any())
                    {
                        return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                    }
                    grafteds.ToList().ForEach(gr =>
                    {
                        gr.IsDeleted = true;
                    });
                    _unitOfWork.GraftedPlantRepository.UpdateRange(grafteds);

                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, $"Delete {grafteds.Count()} record success", new { success = true });
                    }
                    return new BusinessResult(Const.FAIL_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, Const.FAIL_DELETE_SOFTED_GRAFTED_PLANT_MSG);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getGraftedByIdAsync(int graftedPlantId)
        {
            try
            {
                Expression<Func<GraftedPlant, bool>> filter = x => x.GraftedPlantId == graftedPlantId && x.IsDeleted != true;
                string includeProperties = "PlantLot,Plant";
                var graftedPlant = await _unitOfWork.GraftedPlantRepository.GetByCondition(filter, includeProperties);
                // kiem tra null
                if (graftedPlant == null)
                    return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                // neu khong null return ve mapper
                var result = _mapper.Map<GraftedPlantModels>(graftedPlant);
                return new BusinessResult(Const.SUCCESS_GET_GRAFTED_PLANT_CODE, Const.SUCCESS_GET_GRAFTED_OF_PLANT_MSG, result);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getGraftedOfPlantPaginAsync(GetGraftedPaginRequest getRequest, PaginationParameter paginationParameter)
        {
            try
            {
                var checkFarmExist = await _unitOfWork.FarmRepository.GetByID(getRequest.FarmId!.Value);
                if (checkFarmExist == null)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

                Expression<Func<GraftedPlant, bool>> filter = x => !x.IsDeleted!.Value && x.FarmId == getRequest.FarmId;

                if (!string.IsNullOrEmpty(getRequest.PlantIds))
                {
                    var filterList = Util.SplitByComma(getRequest.PlantIds);
                    filter = filter.And(x => filterList.Contains(x.MotherPlantId.ToString()!));
                }

                //if (!string.IsNullOrEmpty(getRequest.GrowthStage))
                //    filter = filter.And(x => x.GrowthStage!.ToLower().Contains(getRequest.GrowthStage.ToLower()));

                if (!string.IsNullOrEmpty(getRequest.Status))
                {
                    var filterList = Util.SplitByComma(getRequest.Status);
                    filter = filter.And(x => filterList.Contains(x.Status!.ToLower()));

                    //filter = filter.And(x => x.Status!.ToLower().Contains(getRequest.Status.ToLower()));
                }

                if (getRequest.SeparatedDateFrom.HasValue && getRequest.SeparatedDateTo.HasValue)
                {
                    if (getRequest.SeparatedDateFrom > getRequest.SeparatedDateTo)
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);

                    filter = filter.And(x => x.SeparatedDate >= getRequest.SeparatedDateFrom && x.SeparatedDate <= getRequest.SeparatedDateTo);
                }

                if (getRequest.GraftedDateFrom.HasValue && getRequest.GraftedDateTo.HasValue)
                {
                    if (getRequest.GraftedDateFrom > getRequest.GraftedDateTo)
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);

                    filter = filter.And(x => x.GraftedDate >= getRequest.GraftedDateFrom && x.GraftedDate <= getRequest.GraftedDateTo);
                }

                if (!string.IsNullOrEmpty(getRequest.PlantLotIds))
                {
                    List<string> filterList = Util.SplitByComma(getRequest.PlantLotIds);
                    filter = filter.And(x => filterList.Contains(x.PlantLotId.ToString()!));
                }

                if (getRequest.IsCompleted.HasValue)
                    filter = filter.And(x => x.IsCompleted == getRequest.IsCompleted);

                if (!string.IsNullOrEmpty(getRequest.CultivarIds))
                {
                    List<string> filterList = Util.SplitByComma(getRequest.CultivarIds);
                    filter = filter.And(x => filterList.Contains(x.Plant!.MasterTypeId.ToString()!));
                }

                Func<IQueryable<GraftedPlant>, IOrderedQueryable<GraftedPlant>> orderBy = x => x.OrderByDescending(x => x.GraftedPlantId);

                if (!string.IsNullOrEmpty(paginationParameter.SortBy))
                {
                    switch (paginationParameter.SortBy.ToLower())
                    {
                        case "graftedplantid":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.GraftedPlantId)
                                : x => x.OrderBy(x => x.GraftedPlantId);
                            break;
                        case "graftedplantcode":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.GraftedDate)
                                : x => x.OrderBy(x => x.GraftedDate);
                            break;
                        case "grafteddate":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.GraftedDate)
                                : x => x.OrderBy(x => x.GraftedDate);
                            break;
                        //case "growthstage":
                        //    orderBy = paginationParameter.Direction!.ToLower() == "desc"
                        //        ? x => x.OrderByDescending(x => x.GrowthStage)
                        //        : x => x.OrderBy(x => x.GrowthStage);
                        //    break;
                        case "status":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.Status)
                                : x => x.OrderBy(x => x.Status);
                            break;
                        case "plantlotid":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.PlantLotId)
                                : x => x.OrderBy(x => x.PlantLotId);
                            break;
                        case "iscompleted":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.PlantLotId)
                                : x => x.OrderBy(x => x.PlantLotId);
                            break;
                        case "plantid":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.PlantLotId)
                                : x => x.OrderBy(x => x.PlantLotId);
                            break;
                        case "cultivarid":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.PlantLotId)
                                : x => x.OrderBy(x => x.PlantLotId);
                            break;
                        case "cultivarname":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.PlantLotId)
                                : x => x.OrderBy(x => x.PlantLotId);
                            break;
                        default:
                            orderBy = x => x.OrderBy(x => x.GraftedPlantId);
                            break;
                    }
                }
                //string includeProperties = "PlantLot,Plant";
                var entities = await _unitOfWork.GraftedPlantRepository.Get(
                    filter, orderBy, /*includeProperties,*/ paginationParameter.PageIndex, paginationParameter.PageSize);

                var pagin = new PageEntity<GraftedPlantModels>
                {
                    List = _mapper.Map<IEnumerable<GraftedPlantModels>>(entities).ToList(),
                    TotalRecord = await _unitOfWork.GraftedPlantRepository.Count(filter),
                    TotalPage = PaginHelper.PageCount(await _unitOfWork.GraftedPlantRepository.Count(filter), paginationParameter.PageSize)
                };

                if (pagin.List.Any())
                    return new BusinessResult(Const.SUCCESS_GET_GRAFTED_PLANT_CODE, Const.SUCCESS_GET_GRAFTED_OF_PLANT_MSG, pagin);
                else
                    return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG, new PageEntity<GraftedPlantModels>());
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> updateGraftedPlantAsync(UpdateGraftedPlantRequest updateRequest)
        {
            try
            {
                // Kiểm tra cây ghép có tồn tại không
                Expression<Func<GraftedPlant, bool>> filter = x => x.GraftedPlantId == updateRequest.GraftedPlantId && x.IsDeleted != true;
                string includeProperties = "PlantLot,Plant";
                var existingGraftedPlant = await _unitOfWork.GraftedPlantRepository.GetByCondition(filter, includeProperties);
                if (existingGraftedPlant == null)
                {
                    return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                }

                // Cập nhật thông tin nếu có giá trị mới
                if (!string.IsNullOrEmpty(updateRequest.GraftedPlantName))
                    existingGraftedPlant.GraftedPlantName = updateRequest.GraftedPlantName;

                //if (!string.IsNullOrEmpty(updateRequest.GrowthStage))
                //    existingGraftedPlant.GrowthStage = updateRequest.GrowthStage;

                if (updateRequest.SeparatedDate.HasValue)
                    existingGraftedPlant.SeparatedDate = updateRequest.SeparatedDate.Value;

                if (!string.IsNullOrEmpty(updateRequest.Status))
                {
                    if (updateRequest.Status.Equals(GraftedPlantStatusConst.IS_USED, StringComparison.OrdinalIgnoreCase) && existingGraftedPlant.IsCompleted == false)
                        return new BusinessResult(400, "This grafted is not complete to use");
                    existingGraftedPlant.Status = updateRequest.Status;
                }

                if (updateRequest.GraftedDate.HasValue)
                    existingGraftedPlant.GraftedDate = updateRequest.GraftedDate.Value;

                if (!string.IsNullOrEmpty(updateRequest.Note))
                    existingGraftedPlant.Note = updateRequest.Note;

                if (updateRequest.PlantLotId.HasValue && updateRequest.PlantLotId.Value >= 0)
                {
                    var checkPlantLotExist = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == updateRequest.PlantLotId && x.isDeleted != true);
                    if (checkPlantLotExist == null)
                        return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                    existingGraftedPlant.PlantLotId = updateRequest.PlantLotId.Value;
                }

                // Cập nhật thời gian chỉnh sửa
                //existingPlant.UpdateDate = DateTime.UtcNow;

                // Lưu vào database
                _unitOfWork.GraftedPlantRepository.Update(existingGraftedPlant);
                int result = await _unitOfWork.SaveAsync();

                if (result > 0)
                {
                    var mappedResult = _mapper.Map<GraftedPlantModels>(existingGraftedPlant);
                    return new BusinessResult(Const.SUCCESS_UPDATE_GRAFTED_PLANT_CODE, Const.SUCCESS_UPDATE_GRAFTED_PLANT_MSG, existingGraftedPlant);
                }

                return new BusinessResult(Const.FAIL_UPDATE_PLANT_CODE, Const.FAIL_UPDATE_PLANT_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getGraftedForSelected(int farmId)
        {
            try
            {
                Expression<Func<GraftedPlant, bool>> filter = x => x.FarmId == farmId && !x.Status.ToLower().Equals(GraftedPlantStatusConst.IS_USED) && !x.Status.ToLower().Equals(GraftedPlantStatusConst.DEAD);
                Func<IQueryable<GraftedPlant>, IOrderedQueryable<GraftedPlant>> orderBy = x => x.OrderByDescending(x => x.GraftedPlantId);
                var plantInPlot = await _unitOfWork.GraftedPlantRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
                if (!plantInPlot.Any())
                    return new BusinessResult(200, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                var mapReturn = _mapper.Map<IEnumerable<ForSelectedModels>>(plantInPlot);
                return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_SUCCESS_MSG, mapReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        /// <summary>
        /// Kiểm tra xem cây đã áp dụng điều kiện "GraftedCondition" chưa.
        /// </summary>
        public async Task<BusinessResult> CheckGraftedConditionAppliedAsync(int? plantId, int? graftedId)
        {
            var appliedCriterias = new List<CriteriaTarget>();
            List<string> targetType = new();

            // check plant exist
            if (plantId.HasValue)
            {
                var plantExist = await _unitOfWork.PlantRepository.getById(plantId.Value);
                if (plantExist == null)
                    return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                appliedCriterias = (List<CriteriaTarget>)await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId);
                targetType = _masterTypeConfig.GraftedCriteriaApply!.GraftedConditionApply!;
            }
            // check grafted exixt
            if (graftedId.HasValue)
            {
                var checkGraftedId = await getGraftedByIdAsync(graftedId.Value);
                if (checkGraftedId.StatusCode != 200 || checkGraftedId.Data == null)
                    return checkGraftedId;
                appliedCriterias = (List<CriteriaTarget>)await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId);
                targetType = _masterTypeConfig.GraftedCriteriaApply!.GraftedEvaluationApply!;
            }

            // Lọc danh sách tiêu chí có TypeName = "Criteria" và Target = "GraftedCondition"
            bool hasAppliedGraftedCondition = appliedCriterias.Any(x =>
                    x.Criteria!.MasterType!.TypeName == "Criteria" &&
                     targetType.Any(t => t.Equals(x.Criteria.MasterType.Target, StringComparison.OrdinalIgnoreCase)));

            if (!hasAppliedGraftedCondition)
            {
                return new BusinessResult(400, "The tree has not been apply criteria.");
            }

            return new BusinessResult(200, "The tree has been apply criteria.");
        }

        /// <summary>
        /// kiem tra da check het dieu kien evalution chua
        /// --> update graftedPlant -> them PlantId, CompletedDate, PlantLotId (neu co)
        /// </summary>
        /// <param name="request"></param>
        public async Task<BusinessResult> CompletedGraftedPlant(CompletedGraftedPlantRequest request)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkGraftedExist = await _unitOfWork.GraftedPlantRepository.GetByCondition(x => x.GraftedPlantId == request.GraftedPlantId && x.IsDeleted!.Value == false, "Plant");
                    if (checkGraftedExist == null)
                        return new BusinessResult(400, "Grafted Plant Not exist");
                    //var plantExist = await _unitOfWork.PlantRepository.GetByID(checkGraftedExist.PlantId!.Value);
                    // kiem tra da hoan thanh cac criteria cua grafted evaluation chua --> bac buoc hoan thanh het
                    if (checkGraftedExist.SeparatedDate.HasValue)
                        return new BusinessResult(400, "This grafted has seperate before. Please check again");
                    if (checkGraftedExist.PlantLotId.HasValue)
                        return new BusinessResult(400, "This grafted has in plant lot before. Please check again");
                    //var requiredCondition = _masterTypeConfig.GraftedCriteriaApply!.GraftedEvaluationApply ?? new List<string>();
                    var requiredCondition = await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x => x.ConfigKey.ToLower().Equals(SystemConfigConst.GRAFTED_EVALUATION_APPLY));
                    var requiredList = requiredCondition.Select(x => x.ConfigValue).ToList() ?? new List<string>(); 
                    var checkCriteriaBefore = await _criteriaTargetService.CheckCriteriaComplete(PlantId: null, PlantLotId: null, GraftedId: request.GraftedPlantId, TargetsList: requiredList);
                    if (checkCriteriaBefore.enable == false)
                        return new BusinessResult(400, checkCriteriaBefore.ErrorMessage);

                    if (request.PlantLotId.HasValue && request.PlantLotId.Value >= 0)
                    {
                        // neu complete xong add vô trong lô thì có thể truyền lotId liền luôn, còn ko thì để đó
                        var checkPlantLotExist = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == request.PlantLotId && x.isDeleted != true);
                        if (checkPlantLotExist == null)
                            return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                        if (checkPlantLotExist.MasterTypeId != checkGraftedExist.Plant!.MasterTypeId)
                            return new BusinessResult(400, "This Plantlot not same cultivar with this plant");
                        checkPlantLotExist.PreviousQuantity = checkPlantLotExist.PreviousQuantity.Value + 1;
                        _unitOfWork.PlantLotRepository.Update(checkPlantLotExist);
                        checkGraftedExist.PlantLotId = request.PlantLotId.Value;
                        //checkPlantLotExist.Status = GraftedPlantStatusConst.GROUPED;
                    }
                    checkGraftedExist.IsCompleted = true;
                    checkGraftedExist.SeparatedDate = DateTime.Now;

                    _unitOfWork.GraftedPlantRepository.Update(checkGraftedExist);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<GraftedPlantModels>(checkGraftedExist);
                        return new BusinessResult(Const.SUCCESS_UPDATE_GRAFTED_PLANT_CODE, Const.SUCCESS_UPDATE_GRAFTED_PLANT_MSG, mappedResult);
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_PLANT_CODE, Const.FAIL_UPDATE_PLANT_MSG);

                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        /// <summary>
        /// Kiểm tra xem cây đã HOÀN THÀNH đủ Tiêu chí làm cây mẹ(GraftedCondition)/Tiêu chí để cây chiết(GraftedEvalution) --> CÂY chưa.
        /// </summary>
        public async Task<BusinessResult> CheckGraftedConditionCompletedAsync(int? plantId, int? graftedId)
        {
            var appliedCriterias = new List<CriteriaTarget>();
            List<string> targetType = new();
            // check plant exist
            if (plantId.HasValue)
            {
                var plantExist = await _unitOfWork.PlantRepository.getById(plantId: plantId.Value);
                if (plantExist == null)
                    return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                appliedCriterias = (List<CriteriaTarget>)await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId);
                targetType = _masterTypeConfig.GraftedCriteriaApply!.GraftedConditionApply!;
            }
            // check grafted exixt
            if (graftedId.HasValue)
            {
                var checkGraftedId = await getGraftedByIdAsync(graftedId.Value);
                if (checkGraftedId.StatusCode != 200 || checkGraftedId.Data == null)
                    return checkGraftedId;
                appliedCriterias = (List<CriteriaTarget>)await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(graftedPlantId: graftedId);
                targetType = _masterTypeConfig.GraftedCriteriaApply!.GraftedEvaluationApply!;
            }
            // Lọc danh sách tiêu chí có TypeName = "Criteria" và Target = "GraftedCondition"
            var graftedConditions = appliedCriterias.Where(x =>
                x.Criteria!.MasterType!.TypeName!.Equals(TypeNameInMasterEnum.Criteria.ToString(), StringComparison.OrdinalIgnoreCase) &&
                 //x.Criteria.MasterType.Target == targetType).ToList();
                 targetType.Any(t => t.Equals(x.Criteria.MasterType.Target, StringComparison.OrdinalIgnoreCase)));

            // Kiểm tra xem có tiêu chí nào chưa hoàn thành không
            //var uncompletedCriterias = graftedConditions.Where(x => !x.IsChecked!.Value).ToList();
            var uncompletedCriterias = graftedConditions.Where(x => !x.IsPassed!.Value).ToList();

            if (uncompletedCriterias.Any())
            {
                var uncompletedNames = uncompletedCriterias.Select(x => x.Criteria!.CriteriaName).ToList();
                return new BusinessResult(400, $"The tree has not yet complete the criteria: {string.Join(",", uncompletedNames)}");
            }

            return new BusinessResult(200, "The tree has complete all the criteria to be conducted a function");
        }

        //public async Task<BusinessResult> CheckPlantCriteriaCompletedAsync(List<string> criteriaRequireCheck, int? plantId = null, int? graftedId = null)
        //{
        //    var appliedCriterias = new List<CriteriaTarget>();
        //    List<string> targetType = new();
        //    // 2. Lấy danh sách tiêu chí đã áp dụng
        //    if (plantId != null)
        //    {
        //        appliedCriterias = (await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId)).ToList();
        //    }
        //    if (graftedId != null)
        //    {
        //        appliedCriterias = (await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(graftedPlantId: graftedId)).ToList();
        //    }
        //    // 3. Kiểm tra xem đã áp dụng **tất cả tiêu chí trong danh sách yêu cầu chưa**
        //    var appliedCriteriaTargets = appliedCriterias
        //        .Where(x => criteriaRequireCheck.Contains(x.Criteria!.MasterType!.Target, StringComparer.OrdinalIgnoreCase))
        //        .ToList();

        //    if (!appliedCriteriaTargets.Any())
        //    {
        //        return new BusinessResult(400, $"The plant lot has not been applied any required criteria set: {string.Join(",", criteriaRequireCheck)}");
        //    }

        //    // 4. Kiểm tra xem tất cả tiêu chí đã được **hoàn thành** chưa (`IsPassed == true`)
        //    bool hasCompletedCriteria = appliedCriteriaTargets.All(x => x.IsPassed == true);

        //    if (!hasCompletedCriteria)
        //    {
        //        return new BusinessResult(400, $"The plant lot has not PASSS all required criteria: {string.Join(",", criteriaRequireCheck)} ");
        //    }

        //    return new BusinessResult(200, "The plant lot has successfully checked all required criteria.");
        //}

        /// <summary>
        /// hàm để tính được số nhánh có thể chiết được trên cây, dựa theo công thức tuyến tính 
        /// C=min(5×N^1.5,100)
        /// </summary>
        /// <param name="plantingDate"></param>
        private async Task<int> CalculateMaxGraftedBranches(DateTime plantingDate)
        {
            double growthExponent = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.GROWTH_EXPONENT, (double)1.4);
            double initialBranchingCoefficient = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.INITIAL_BRANCHING_COEFFICIENT, (double)5.0);
            int MaximumGraftingLimit = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MAXIMUM_GRAFTING_LIMIT, 100);
            // Lấy ngày hiện tại
            DateTime currentDate = DateTime.Now;

            // Tính số tháng từ ngày trồng đến hiện tại
            int totalMonths = (currentDate.Year - plantingDate.Year) * 12 + (currentDate.Month - plantingDate.Month);

            // Chuyển số tháng thành số năm tuổi (tính theo tháng)
            double treeAge = totalMonths / 12.0;

            // Đảm bảo tuổi cây không âm (tránh lỗi nhập sai)
            if (treeAge < 0) return 0;

            // Áp dụng công thức C = min(5 × N^1.5, 100)
            double maxBranches = Math.Min(initialBranchingCoefficient * Math.Pow(treeAge, growthExponent), MaximumGraftingLimit);

            // Làm tròn xuống để tránh số lẻ cành chiết
            return (int)Math.Floor(maxBranches);
        }

        public async Task<string> CheckPlantConditionGrafted(int plantId)
        {
            var errors = new List<string>();
            var plant = await _unitOfWork.PlantRepository.getById(plantId);
            //if (plant == null)
            //    errors.Add("Plant not found");
            //else
            //{
            // kiểm tra xem cây đã ở giai đoạn được chiết cành chưa
            var canGrafted = await _unitOfWork.PlantRepository.CheckIfPlantCanBeInTargetAsync(plantId, ActFunctionGrStageEnum.Grafted.ToString());
            if (!canGrafted)
                errors.Add("Plant not in stage can be grafted.");
            // kiem tra tinh trang suc khoe cua cay
            if (!plant.HealthStatus!.Equals(HealthStatusConst.HEALTHY.ToString(), StringComparison.OrdinalIgnoreCase))
                errors.Add("This plant is not healthy enough to be grafted, please check again.");
            // kiểm tra xem cây đã chiết bao nhiêu cành trong năm nay để ko cho chiết nữa
            var maxGraftedBranches = CalculateMaxGraftedBranches(plant.PlantingDate!.Value);
            var countGraftedInYear = await _unitOfWork.GraftedPlantRepository.Count(x => x.MotherPlantId == plantId
                && !x.IsDeleted!.Value
                && x.GraftedDate!.Value.Year == DateTime.Now.Year);

            if (countGraftedInYear >= (await maxGraftedBranches))
                errors.Add($"This plant has already grafted {countGraftedInYear} times this year, no more grafting allowed.");
            //}

            return errors.Count > 0 ? string.Join("\n", errors) : null!;
        }

        public async Task<BusinessResult> getHistoryOfGraftedPlant(int farmId, int plantId)
        {
            try
            {
                var plant = await _unitOfWork.PlantRepository.GetByCondition(x => x.FarmId == farmId && x.PlantId == plantId, "ChildPlants");
                if (plant == null)
                {
                    return new BusinessResult(Const.FAIL_GET_GRAFTED_PLANT_CODE, "No plant was found");
                }

                // Tìm cây gốc (F0)
                var rootPlant = await GetRootPlantAsync(plant);

                // Lấy danh sách tổ tiên từ F0 đến cây hiện tại
                var ancestors = await GetAncestorsAsync(rootPlant, plant);

                // Xác định thế hệ hiện tại (F của plant)
                int currentGeneration = ancestors.Count; // Nếu ancestors có 2 phần tử -> cây hiện tại là F2

                // Lấy danh sách con cháu (tính thế hệ từ currentGeneration + 1)
                var descendants = GetDescendants(plant, currentGeneration + 1);

                var result = new PlantGraftingHistoryResult
                {
                    PlantId = plant.PlantId,
                    PlantName = plant.PlantName,
                    Generation = currentGeneration,
                    PlantingDate = plant.PlantingDate,
                    Ancestors = ancestors,
                    Descendants = descendants
                };

                return new BusinessResult(Const.SUCCESS_GET_GRAFTED_PLANT_CODE, Const.SUCCESS_GET_GRAFTED_OF_PLANT_MSG, result);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private async Task<Plant> GetRootPlantAsync(Plant plant)
        {
            while (plant.PlantReferenceId != null)
            {
                plant = await _unitOfWork.PlantRepository.GetByCondition(x => x.PlantId == plant.PlantReferenceId.Value, "ChildPlants");
            }
            return plant;
        }

        private async Task<List<PlantGraftingHistoryModel>> GetAncestorsAsync(Plant root, Plant targetPlant)
        {
            var ancestors = new List<PlantGraftingHistoryModel>();
            int generation = 0; // Bắt đầu từ F0

            Plant current = root;
            while (current.PlantId != targetPlant.PlantId)
            {
                ancestors.Add(new PlantGraftingHistoryModel
                {
                    PlantId = current.PlantId,
                    PlantName = current.PlantName,
                    Generation = generation++,
                    PlantingDate = current.PlantingDate
                });

                if (current.ChildPlants.Any(p => p.PlantId == targetPlant.PlantId))
                    break; // Dừng lại khi tìm thấy cây hiện tại trong danh sách con

                current = await _unitOfWork.PlantRepository.GetByCondition(x => x.PlantId == targetPlant.PlantReferenceId.Value, "ChildPlants");
            }
            return ancestors;
        }

        private List<PlantGraftingHistoryModel> GetDescendants(Plant plant, int generation)
        {
            return plant.ChildPlants.Select(child => new PlantGraftingHistoryModel
            {
                PlantId = child.PlantId,
                PlantName = child.PlantName,
                Generation = generation,
                PlantingDate = child.PlantingDate,
                ChildPlants = GetDescendants(child, generation + 1)
            }).ToList();
        }
        public async Task<BusinessResult> GroupGraftedPlantsIntoPlantLot(GroupingGraftedRequest request)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    //  1️ Kiểm tra lô tồn tại
                    var plantLot = await _unitOfWork.PlantLotRepository
                        .GetByCondition(x => x.PlantLotId == request.plantLotId && x.isDeleted == false);

                    if (plantLot == null)
                        return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, "PlantLot does not exist.");

                    //  2️ Lấy danh sách GraftedPlants truyền vào
                    var graftedPlants = await _unitOfWork.GraftedPlantRepository
                        .GetAllNoPaging(filter: x => request.graftedPlantIds.Contains(x.GraftedPlantId), includeProperties: "Plant");

                    if (!graftedPlants.Any())
                        return new BusinessResult(400, "No valid GraftedPlants found.");

                    List<string> errorMessages = new();

                    //  3️ Kiểm tra điều kiện từng graftedPlant
                    foreach (var grafted in graftedPlants)
                    {
                        if (grafted.IsDeleted == true)
                            errorMessages.Add($"GraftedPlant {grafted.GraftedPlantCode} is deleted.");

                        if (grafted.IsCompleted == false)
                            errorMessages.Add($"GraftedPlant {grafted.GraftedPlantCode} is not COMPLETED yet.");

                        if (grafted.PlantLotId.HasValue || grafted.Status.Equals(GraftedPlantStatusConst.IS_USED, StringComparison.OrdinalIgnoreCase))
                            errorMessages.Add($"GraftedPlant {grafted.GraftedPlantCode} is already in another plantlot.");
                    }

                    //  4️ Nếu có lỗi, trả về danh sách lỗi
                    if (errorMessages.Any())
                        return new BusinessResult(400, string.Join("/n", errorMessages));

                    var distinctMasterTypes = graftedPlants
                        .Where(gp => gp.Plant != null)
                        .Select(gp => gp.Plant!.MasterTypeId)
                        .Distinct()
                        .ToList();

                    if (distinctMasterTypes.Count > 1)
                    {
                        return new BusinessResult(400, "All GraftedPlants must have the same seeding to be grouped.");
                    }

                    int? selectedMasterTypeId = distinctMasterTypes.FirstOrDefault();

                    //  6️ Kiểm tra MasterType của PlantLot
                    if (plantLot.MasterTypeId == null)
                    {
                        // Nếu PlantLot chưa có giống, gán MasterType của GraftedPlant vào
                        plantLot.MasterTypeId = selectedMasterTypeId;
                    }
                    else if (plantLot.MasterTypeId != selectedMasterTypeId)
                    {
                        return new BusinessResult(400, "The PlantLot has a different seeding. Cannot group these Grafted Plants.");
                    }
                    //  5️ Cập nhật GraftedPlant & số lượng PlantLot
                    foreach (var grafted in graftedPlants)
                    {

                        grafted.PlantLotId = plantLot.PlantLotId;   // Đánh dấu đã gán vào lô
                        //grafted.Status = GraftedPlantStatusConst.GROUPED;
                        grafted.Plant = null;
                    }

                    // 6️ Cập nhật lại số lượng của lô
                    plantLot.PreviousQuantity = plantLot.PreviousQuantity.GetValueOrDefault() + graftedPlants.Count();

                    // 7️ Lưu 
                    _unitOfWork.GraftedPlantRepository.UpdateRange(graftedPlants);
                    _unitOfWork.PlantLotRepository.Update(plantLot);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(200, $"Successfully grouped {graftedPlants.Count()} GraftedPlants into PlantLot. {plantLot.PlantLotName}", true);
                    }
                    else
                    {
                        return new BusinessResult(500, "Failed to save changes.");
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(500, ex.Message);
                }
            }

        }
        public async Task<BusinessResult> CreatePlantFromGrafted(CreatePlantFromGraftedRequest request)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    //  1️ Kiểm tra GraftedPlant có tồn tại không
                    var graftedPlant = await _unitOfWork.GraftedPlantRepository.GetByCondition(x => x.GraftedPlantId == request.graftedId && x.IsDeleted == false);
                    if (graftedPlant == null)
                        return new BusinessResult(400, "GraftedPlant does not exist.");
                    if (graftedPlant.IsCompleted == false)
                        return new BusinessResult(400, "This grafted not complete to plant.");
                    var motherPlant = await _unitOfWork.PlantRepository.GetByCondition(x => x.PlantId == graftedPlant.MotherPlantId);
                    //  2️ Kiểm tra điều kiện

                    if (graftedPlant.Status == GraftedPlantStatusConst.IS_USED)
                        return new BusinessResult(400, $"GraftedPlant {graftedPlant.GraftedPlantCode} is already used.");


                    if (graftedPlant.Status != GraftedPlantStatusConst.HEALTHY)
                        return new BusinessResult(400, $"GraftedPlant {graftedPlant.GraftedPlantCode} is not in a healthy condition for planting.");



                    // 2.1 kiểm tra vị trí sắp trồng có trống hay ko
                    var landrowExist = await _unitOfWork.LandRowRepository.GetByCondition(x => x.LandRowId == request.LandRowId, "Plants,LandPlot");
                    if (landrowExist == null)
                        return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);
                    if (landrowExist.Plants.Count >= landrowExist.TreeAmount)
                        return new BusinessResult(Const.WARNING_PLANT_IN_LANDROW_FULL_CODE, Const.WARNING_PLANT_IN_LANDROW_FULL_MSG);
                    if (landrowExist.Plants.Any(x => x.PlantIndex == request.PlantIndex && x.IsDead == false && x.IsDeleted == false))
                        return new BusinessResult(400, $"Index {request.PlantIndex} in row {landrowExist.RowIndex} has exist plant");

                    if (graftedPlant.PlantLotId.HasValue)
                    {
                        var plantLotExist = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == graftedPlant.PlantLotId);
                        if (plantLotExist.UsedQuantity.HasValue && plantLotExist.UsedQuantity.Value == plantLotExist.LastQuantity.Value)
                            return new BusinessResult(400, "Plant lot of this grafted plant has used completed.");
                        plantLotExist.PreviousQuantity -= 1;
                        plantLotExist.LastQuantity = plantLotExist.LastQuantity!.Value > 0 ? plantLotExist.LastQuantity - 1 : null;
                        plantLotExist.InputQuantity = plantLotExist.InputQuantity!.Value > 0 ? plantLotExist.InputQuantity - 1 : null;
                        // cap nhat lai plantlot
                        _unitOfWork.PlantLotRepository.Update(plantLotExist);
                    }

                    //  4️ Tạo mới một Plant từ GraftedPlant
                    string code = CodeHelper.GenerateCode();

                    var newPlant = new Plant
                    {
                        PlantCode = $"{CodeAliasEntityConst.PLANT}{code}-{DateTime.Now.ToString("ddMMyy")}-{Util.SplitByDash(motherPlant.PlantCode!).First()}",
                        PlantName = $"{graftedPlant.GraftedPlantName} + {code}",
                        PlantingDate = DateTime.Now,
                        CreateDate = DateTime.Now,
                        HealthStatus = graftedPlant.Status,
                        MasterTypeId = motherPlant.MasterTypeId ?? null, // Lấy MasterTypeId từ MotherPlant
                        PlantReferenceId = graftedPlant.MotherPlantId, // Gán cây mẹ
                        Description = $"Generated from GraftedPlant {graftedPlant.GraftedPlantCode}",
                        FarmId = graftedPlant.FarmId,
                        LandRowId = request.LandRowId, // Chưa có hàng trồng cụ thể
                        IsDeleted = false,
                        IsPassed = false,
                        IsDead = false,
                        PlantIndex = request.PlantIndex
                    };
                    newPlant.PlantName = $"Plant {newPlant.PlantIndex} - {landrowExist.RowIndex} - {landrowExist.LandPlot!.LandPlotName}";
                    //  5️ Cập nhật trạng thái của GraftedPlant thành IS_USED
                    graftedPlant.FinishedPlantCode = newPlant.PlantCode;
                    graftedPlant.Status = GraftedPlantStatusConst.IS_USED;

                    // 6️ cap nhật PlantLot bên kia vì đã sài cây này rồi

                    await _unitOfWork.PlantRepository.Insert(newPlant);
                    _unitOfWork.GraftedPlantRepository.Update(graftedPlant);

                    //  7️ Lưu thay đổi vào DB
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedPlant = _mapper.Map<PlantModel>(newPlant);
                        return new BusinessResult(200, "Successfully created Plant from GraftedPlant.", mappedPlant);
                    }
                    else
                    {
                        return new BusinessResult(500, "Failed to save changes.");
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(500, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> UngroupGraftedPlants(List<int> graftedPlantIds)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // 1️ Lấy danh sách các GraftedPlant cần ungroup
                    var graftedPlants = await _unitOfWork.GraftedPlantRepository
                        .GetAllNoPaging(filter: x => graftedPlantIds.Contains(x.GraftedPlantId) && x.PlantLotId.HasValue/*, includeProperties: "PlantLot"*/);

                    if (!graftedPlants.Any())
                        return new BusinessResult(400, "No valid GraftedPlants found.");

                    List<string> errorMessages = new();

                    // 2️ Kiểm tra điều kiện của từng GraftedPlant
                    foreach (var grafted in graftedPlants)
                    {
                        if (grafted.Status == GraftedPlantStatusConst.IS_USED)
                            errorMessages.Add($"GraftedPlant {grafted.GraftedPlantCode} has already been used and cannot be ungrouped.");
                    }

                    if (errorMessages.Any())
                        return new BusinessResult(400, string.Join("\n", errorMessages));

                    // 3️ Gom nhóm GraftedPlant theo PlantLotId để biết số lượng cần giảm ở mỗi PlantLot
                    var plantLotQuantityReduction = graftedPlants
                        .GroupBy(gp => gp.PlantLotId)
                        .ToDictionary(g => g.Key!.Value, g => g.Count()); // Key là PlantLotId, Value là số lượng GraftedPlant bị bỏ

                    // 4️ Cập nhật GraftedPlant để bỏ liên kết với PlantLot
                    foreach (var grafted in graftedPlants)
                    {
                        grafted.PlantLotId = null;
                    }
                    _unitOfWork.GraftedPlantRepository.UpdateRange(graftedPlants);

                    // 5️ Lấy tất cả các PlantLot bị ảnh hưởng chỉ 1 lần duy nhất
                    var affectedPlantLots = await _unitOfWork.PlantLotRepository
                        .GetAllNoPaging(x => plantLotQuantityReduction.Keys.Contains(x.PlantLotId));

                    // 6️ Giảm số lượng PreviousQuantity của từng PlantLot
                    foreach (var plantLot in affectedPlantLots)
                    {
                        int reduceAmount = plantLotQuantityReduction[plantLot.PlantLotId];
                        plantLot.PreviousQuantity = Math.Max(0, plantLot.PreviousQuantity.GetValueOrDefault() - reduceAmount);
                        _unitOfWork.PlantLotRepository.Update(plantLot);
                    }

                    // 7️ Lưu thay đổi vào DB
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(200, $"Successfully ungrouped {graftedPlants.Count()} GraftedPlants.", true);
                    }
                    else
                    {
                        return new BusinessResult(500, "Failed to save changes.");
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(500, ex.Message);
                }
            }

        }
    }
}

