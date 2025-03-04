using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.GraftedRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.GraftedModel;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CapstoneProject_SP25_IPAS_Service.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class GraftedPlantService : IGraftedPlantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        //private readonly IPlantService _plantService;
        private readonly MasterTypeConfig _masterTypeConfig;
        public GraftedPlantService(IUnitOfWork unitOfWork, IMapper mapper, MasterTypeConfig masterTypeConfig)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            //_plantService = plantService;
            _masterTypeConfig = masterTypeConfig;
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
                    var validationResult = await CheckPlantBeforeGrafted(createRequest.PlantId);
                    if (!string.IsNullOrEmpty(validationResult))
                        return new BusinessResult(400, validationResult);
                   
                    // Kiểm tra cây đã hoàn thành đủ điều kiện để chiết cành chưa
                    var criteriaResult = await CheckGraftedConditionCompletedAsync(plantId: createRequest.PlantId, null);
                    if (criteriaResult.StatusCode != 200)
                        return criteriaResult; // neu sai thi tra ve loi chua apply tieu chi nao luon

                    // Create the new Plant entity from the request
                    //var jsonData = JsonConvert.DeserializeObject<PlantModel>(plantExist.Data!.ToString()!);
                    //var jsonData = plantExist.Data as PlantModel;

                    var graftedCreateEntity = new GraftedPlant()
                    {
                        GraftedPlantCode = $"{CodeAliasEntityConst.GRAFTED_PLANT}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}-{Util.SplitByDash(plantExist.PlantCode!).First()}",
                        GraftedPlantName = createRequest.GraftedPlantName,
                        GrowthStage = createRequest.GrowthStage,
                        Status = /*createRequest.Status*/ "",
                        GraftedDate = createRequest.GraftedDate,
                        Note = createRequest.Note,
                        PlantId = plantExist.PlantId,
                        IsDeleted = false,
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
                    filter = filter.And(x => filterList.Contains(x.PlantId.ToString()!));
                }

                if (!string.IsNullOrEmpty(getRequest.GrowthStage))
                    filter = filter.And(x => x.GrowthStage!.ToLower().Contains(getRequest.GrowthStage.ToLower()));

                if (!string.IsNullOrEmpty(getRequest.Status))
                    filter = filter.And(x => x.Status!.ToLower().Contains(getRequest.Status.ToLower()));

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

                if (!string.IsNullOrEmpty(getRequest.PlantLotId))
                {
                    List<string> filterList = Util.SplitByComma(getRequest.PlantLotId);
                    filter = filter.And(x => filterList.Contains(x.PlantLotId.ToString()!));
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
                        case "grafteddate":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.GraftedDate)
                                : x => x.OrderBy(x => x.GraftedDate);
                            break;
                        case "growthstage":
                            orderBy = paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.GrowthStage)
                                : x => x.OrderBy(x => x.GrowthStage);
                            break;
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
                        default:
                            orderBy = x => x.OrderBy(x => x.GraftedPlantId);
                            break;
                    }
                }
                string includeProperties = "PlantLot,Plant";
                var entities = await _unitOfWork.GraftedPlantRepository.Get(
                    filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);

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

                if (!string.IsNullOrEmpty(updateRequest.GrowthStage))
                    existingGraftedPlant.GrowthStage = updateRequest.GrowthStage;

                if (updateRequest.SeparatedDate.HasValue)
                    existingGraftedPlant.SeparatedDate = updateRequest.SeparatedDate.Value;

                if (!string.IsNullOrEmpty(updateRequest.Status))
                    existingGraftedPlant.Status = updateRequest.Status;

                if (updateRequest.GraftedDate.HasValue)
                    existingGraftedPlant.GraftedDate = updateRequest.GraftedDate.Value;

                if (!string.IsNullOrEmpty(updateRequest.Note))
                    existingGraftedPlant.Note = updateRequest.Note;

                if (updateRequest.PlantLotId.HasValue && updateRequest.PlantLotId.Value >= 0)
                    existingGraftedPlant.PlantLotId = updateRequest.PlantLotId.Value;

                // Cập nhật thời gian chỉnh sửa
                //existingPlant.UpdateDate = DateTime.UtcNow;

                // Lưu vào database
                _unitOfWork.GraftedPlantRepository.Update(existingGraftedPlant);
                int result = await _unitOfWork.SaveAsync();

                if (result > 0)
                {
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
                Expression<Func<GraftedPlant, bool>> filter = x => x.FarmId == farmId;
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
            string targetType = "";

            // check plant exist
            if (plantId.HasValue)
            {
                var plantExist = await _unitOfWork.PlantRepository.getById(plantId.Value);
                if (plantExist == null)
                    return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                appliedCriterias = (List<CriteriaTarget>)await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId);
                targetType = _masterTypeConfig.GraftedConditionApply!;
            }
            // check grafted exixt
            if (graftedId.HasValue)
            {
                var checkGraftedId = await getGraftedByIdAsync(graftedId.Value);
                if (checkGraftedId.StatusCode != 200 || checkGraftedId.Data == null)
                    return checkGraftedId;
                appliedCriterias = (List<CriteriaTarget>)await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId);
                targetType = _masterTypeConfig.GraftedEvaluationApply!;
            }

            // Lọc danh sách tiêu chí có TypeName = "Criteria" và Target = "GraftedCondition"
            bool hasAppliedGraftedCondition = appliedCriterias.Any(x =>
                    x.Criteria!.MasterType!.TypeName == "Criteria" &&
                    x.Criteria.MasterType.Target == targetType);

            if (!hasAppliedGraftedCondition)
            {
                return new BusinessResult(400, "The tree has not been apply criteria.");
            }

            return new BusinessResult(200, "The tree has been apply criteria.");
        }

        /// <summary>
        /// Kiểm tra xem cây đã hoàn thành đủ tiêu chí làm cây mẹ chưa.
        /// </summary>
        public async Task<BusinessResult> CheckGraftedConditionCompletedAsync(int? plantId, int? graftedId)
        {
            var appliedCriterias = new List<CriteriaTarget>();
            string targetType = "";
            // check plant exist
            if (plantId.HasValue)
            {
                var plantExist = await _unitOfWork.PlantRepository.getById(plantId: plantId.Value);
                if (plantExist == null)
                    return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                appliedCriterias = (List<CriteriaTarget>)await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId);
                targetType = _masterTypeConfig.GraftedConditionApply!;
            }
            // check grafted exixt
            if (graftedId.HasValue)
            {
                var checkGraftedId = await getGraftedByIdAsync(graftedId.Value);
                if (checkGraftedId.StatusCode != 200 || checkGraftedId.Data == null)
                    return checkGraftedId;
                appliedCriterias = (List<CriteriaTarget>)await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId);
                targetType = _masterTypeConfig.GraftedConditionApply!;
            }
            // Lọc danh sách tiêu chí có TypeName = "Criteria" và Target = "GraftedCondition"
            var graftedConditions = appliedCriterias.Where(x =>
                x.Criteria!.MasterType!.TypeName == "Criteria" &&
                x.Criteria.MasterType.Target == targetType).ToList();

            // Kiểm tra xem có tiêu chí nào chưa hoàn thành không
            var uncompletedCriterias = graftedConditions.Where(x => !x.isChecked!.Value).ToList();

            if (uncompletedCriterias.Any())
            {
                var uncompletedNames = uncompletedCriterias.Select(x => x.Criteria!.CriteriaName).ToList();
                return new BusinessResult(400, $"The tree has not yet complete the criteria: {string.Join(",", uncompletedNames)}");
            }

            return new BusinessResult(200, "The tree has complete all the criteria to be a mother tree");
        }
        /// <summary>
        /// hàm để tính được số nhánh có thể chiết được trên cây, dựa theo công thức tuyến tính 
        /// C=min(5×N^1.5,100)
        /// </summary>
        /// <param name="plantingDate"></param>
        /// <returns></returns>
        private int CalculateMaxGraftedBranches(DateTime plantingDate)
        {
            // Lấy ngày hiện tại
            DateTime currentDate = DateTime.Now;

            // Tính số tháng từ ngày trồng đến hiện tại
            int totalMonths = (currentDate.Year - plantingDate.Year) * 12 + (currentDate.Month - plantingDate.Month);

            // Chuyển số tháng thành số năm tuổi (tính theo tháng)
            double treeAge = totalMonths / 12.0;

            // Đảm bảo tuổi cây không âm (tránh lỗi nhập sai)
            if (treeAge < 0) return 0;

            // Áp dụng công thức C = min(5 × N^1.5, 100)
            double maxBranches = Math.Min(5 * Math.Pow(treeAge, 1.4), 100);

            // Làm tròn xuống để tránh số lẻ cành chiết
            return (int)Math.Floor(maxBranches);
        }

        public async Task<string> CheckPlantBeforeGrafted(int plantId)
        {
            var errors = new List<string>();
            var plant = await _unitOfWork.PlantRepository.getById(plantId);
            if (plant == null)
                errors.Add("Plant not found");
            else
            {
                // kiểm tra xem cây đã ở giai đoạn được chiết cành chưa
                var canGrafted = await _unitOfWork.PlantRepository.CheckIfPlantCanBeGraftedAsync(plantId, "Grafted");
                if (!canGrafted)
                    errors.Add("Plant not in stage can be grafted.");
                // kiem tra tinh trang suc khoe cua cay
                if (!plant.HealthStatus!.Equals(HealthStatusConst.HEALTHY.ToString(), StringComparison.OrdinalIgnoreCase))
                    errors.Add("This plant is not healthy enough to be grafted, please check again.");
                // kiểm tra xem cây đã chiết bao nhiêu cành trong năm nay để ko cho chiết nữa
                var maxGraftedBranches = CalculateMaxGraftedBranches(plant.PlantingDate!.Value);
                var countGraftedInYear = await _unitOfWork.GraftedPlantRepository.Count(x => x.PlantId == plantId
                    && !x.IsDeleted!.Value
                    && x.GraftedDate!.Value.Year == DateTime.Now.Year);

                if (countGraftedInYear >= maxGraftedBranches)
                    errors.Add($"This plant has already grafted {countGraftedInYear} times this year, no more grafting allowed.");
            }

            return errors.Count > 0 ? string.Join("\n", errors) : null!;
        }

        public async Task<BusinessResult> getHistoryOfGraftedPlant(int farmId, int plantId)
        {
            try
            {
                var getPlantInfo = await _unitOfWork.PlantRepository.GetByCondition(x => x.FarmId == farmId && x.PlantId == plantId);

                if (getPlantInfo == null)
                {
                    return new BusinessResult(Const.FAIL_GET_GRAFTED_PLANT_CODE, "No plant was found");
                }

                // Tìm cây gốc (F0)
                var rootPlant = await GetRootPlantAsync(getPlantInfo);

                // Lấy toàn bộ lịch sử chiết cành từ cây gốc
                var history = GetPlantGraftingHistory(rootPlant, 0);

                return new BusinessResult(Const.SUCCESS_GET_GRAFTED_PLANT_CODE, Const.SUCCESS_GET_GRAFTED_OF_PLANT_MSG, history);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Hàm tìm cây gốc (F0)
        private async Task<Plant> GetRootPlantAsync(Plant plant)
        {
            while (plant.PlantReferenceId != null)
            {
                plant = await _unitOfWork.PlantRepository.GetByID(plant.PlantReferenceId.Value);
            }
            return plant;
        }

        // Đệ quy lấy lịch sử chiết cành
        private PlantGraftingHistoryModel GetPlantGraftingHistory(Plant plant, int generation)
        {
            return new PlantGraftingHistoryModel
            {
                PlantId = plant.PlantId,
                PlantName = plant.PlantName,
                Generation = generation,
                PlantingDate = plant.PlantingDate,
                ChildPlants = plant.ChildPlants.Select(child => GetPlantGraftingHistory(child, generation + 1)).ToList()
            };
        }
    }
}
