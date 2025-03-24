using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using Microsoft.Extensions.Configuration;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandPlotRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantLotRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlantLotService : IPlantLotService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly ProgramDefaultConfig _masterTypeConfig;
        private readonly ICriteriaTargetService _criteriaTargetService;
        public PlantLotService(IUnitOfWork unitOfWork, IConfiguration configuration, IMapper mapper, ProgramDefaultConfig programDefaultConfig, ICriteriaTargetService criteriaTargetService)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _mapper = mapper;
            _masterTypeConfig = programDefaultConfig;
            _criteriaTargetService = criteriaTargetService;
        }

        public async Task<BusinessResult> CreateManyPlant(List<CriteriaForPlantLotRequestModel> criterias, int quantity)
        {
            try
            {
                bool checkIsSystem = true;
                foreach (var criteria in criterias)
                {
                    var result = await _unitOfWork.CriteriaRepository.GetByCondition(x => x.CriteriaId == criteria.CriteriaId);
                    if (result == null)
                    {
                        checkIsSystem = false;
                        break;
                    }

                }
                if (!checkIsSystem)
                {
                    return new BusinessResult(Const.FAIL_CREATE_MANY_PLANT_BECAUSE_CRITERIA_INVALID_CODE, Const.FAIL_CREATE_MANY_PLANT_BECAUSE_CRITERIA_INVALID_MESSAGE, false);
                }
                var checkFullIsActiveCriteria = criterias.Where(x => x.IsChecked == true).ToList();
                if (checkFullIsActiveCriteria.Count() == criterias.Count())
                {
                    for (int i = 0; i < quantity; i++)
                    {
                        string code = CodeHelper.GenerateCode();
                        var newPlant = new Plant()
                        {
                            PlantCode = $"{CodeAliasEntityConst.PLANT}-{DateTime.Now.ToString("ddmmyyyy")}",
                            PlantName = $"Plant {code}",
                            CreateDate = DateTime.Now,
                            HealthStatus = HealthStatusConst.HEALTHY,
                            GrowthStageID = 2,
                            UpdateDate = DateTime.Now,
                            IsDeleted = false,
                            IsPassed = false,
                        };
                        await _unitOfWork.PlantRepository.Insert(newPlant);
                    }
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_MANY_PLANT_FROM_PLANT_LOT_CODE, Const.SUCCESS_CREATE_MANY_PLANT_FROM_PLANT_LOT_MESSAGE, result > 0);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_MANY_PLANT_FROM_PLANT_LOT_CODE, Const.FAIL_CREATE_MANY_PLANT_FROM_PLANT_LOT_MESSAGE, false);

                }
                else
                {
                    return new BusinessResult(Const.WARNING_CREATE_MANY_PLANT_FROM_PLANT_LOT_CODE, Const.WARNING_CREATE_MANY_PLANT_FROM_PLANT_LOT_MSG, false);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> CreatePlantLot(CreatePlantLotModel createPlantLotModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // 1. Kiểm tra farm tồn tại
                    var checkFarmExist = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == createPlantLotModel.FarmId && x.IsDeleted == false);
                    if (checkFarmExist == null)
                        return new BusinessResult(Const.WARNING_GET_ALL_FARM_DOES_NOT_EXIST_CODE, Const.WARNING_GET_ALL_FARM_DOES_NOT_EXIST_MSG);
                    var masterTypeExist = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(createPlantLotModel.MasterTypeId, TypeNameInMasterEnum.Cultivar.ToString());
                    if (masterTypeExist == null)
                        return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, "This type not suitable for Seeding");

                    //// 2. Lấy danh sách tiêu chí cần áp dụng từ config
                    //List<string> criteriaTargetNeed = _masterTypeConfig.PlantLotCriteriaApply!.PlantLotEvaluation!
                    //                                .Concat(_masterTypeConfig.PlantLotCriteriaApply.PlantLotCondition!)
                    //                                .Where(x => !string.IsNullOrEmpty(x)) // 🔹 Loại bỏ giá trị null hoặc rỗng
                    //                                .ToList();

                    ////  3. Lấy danh sách tiêu chí đã có trong hệ thống (MasterType)
                    //var criteriaSetForPlantLot = await _unitOfWork.MasterTypeRepository
                    //    .GetCriteriaSetOfFarm(
                    //        TypeNameInMasterEnum.Criteria.ToString(),
                    //        createPlantLotModel.FarmId!.Value,
                    //        criteriaTargetNeed
                    //    );

                    //if (!criteriaSetForPlantLot.Any())
                    //    return new BusinessResult(400, $"You need to set up Criteria set for: {string.Join(", ", criteriaTargetNeed)}");

                    ////  4. Kiểm tra xem tất cả tiêu chí trong config đã có trong DB chưa
                    //var existingCriteriaTargets = criteriaSetForPlantLot.Select(x => x.Target!.ToLower()).ToList();
                    //var missingCriteria = criteriaTargetNeed
                    //    .Where(x => !existingCriteriaTargets.Contains(x.ToLower()))
                    //    .ToList();

                    //if (missingCriteria.Any())
                    //    return new BusinessResult(400, $"You need to set up Criteria set for: {string.Join(", ", missingCriteria)}");

                    ////  5. Kiểm tra nếu tiêu chí nào không có danh sách Criteria con
                    //var emptyCriteriaSet = criteriaSetForPlantLot
                    //    .Where(x => x.Criterias == null || !x.Criterias.Any()) // 🔹 MasterType nào không có Criteria
                    //    .Select(x => x.MasterTypeName) // 🔹 Lấy tên MasterType
                    //    .ToList();

                    //if (emptyCriteriaSet.Any())
                    //    return new BusinessResult(400, $"The following Criteria Sets are empty and must have at least one Criteria: {string.Join(", ", emptyCriteriaSet)}");

                    //  6. Kiểm tra đối tác có tồn tại không
                    var checkPartnerExist = await _unitOfWork.PartnerRepository.GetByCondition(x => x.PartnerId == createPlantLotModel.PartnerId && x.IsDeleted == false);
                    if (checkPartnerExist == null)
                        return new BusinessResult(Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_MSG);

                    //  7. Tạo lô cây (PlantLot)
                    var plantLot = new PlantLot()
                    {
                        PlantLotCode = $"{CodeAliasEntityConst.PLANT_LOT}{CodeHelper.GenerateCode()}-{DateTime.Now:ddMMyy}-{createPlantLotModel.ImportedQuantity}",
                        ImportedDate = DateTime.Now,
                        PreviousQuantity = createPlantLotModel.ImportedQuantity,
                        //LastQuantity = 0,
                        UsedQuantity = 0,
                        PartnerId = createPlantLotModel.PartnerId,
                        PlantLotName = createPlantLotModel.Name,
                        Unit = createPlantLotModel.Unit,
                        Note = createPlantLotModel.Note,
                        Status = PlantLotStatusConst.PENDING,
                        FarmID = createPlantLotModel.FarmId,
                        MasterTypeId = createPlantLotModel.MasterTypeId,
                        PlantLotReferenceId = null,
                        isDeleted = false,
                        IsPassed = false,
                        IsFromGrafted = createPlantLotModel.IsFromGrafted ?? false,
                        //InputQuantity = 0
                    };

                    await _unitOfWork.PlantLotRepository.Insert(plantLot);
                    var checkInsertPlantLot = await _unitOfWork.SaveAsync();

                    if (checkInsertPlantLot > 0)
                    {
                        string includeProperties = "Partner,MasterType";
                        var createdPlantlot = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == plantLot.PlantLotId, includeProperties);

                        //// 9. Lấy danh sách tiêu chí để apply
                        //var criteriaDataList = criteriaSetForPlantLot
                        //    .SelectMany(masterType => masterType.Criterias!)
                        //    .Select(criteria => new CriteriaData
                        //    {
                        //        CriteriaId = criteria.CriteriaId,
                        //        IsChecked = false, // Mới áp dụng nên chưa được kiểm tra
                        //        Priority = criteria.Priority ?? 1
                        //    }).ToList();

                        //// 10. Gọi hàm `ApplyCriteriasForTarget`
                        //var criteriaApplyRequest = new CriteriaTargerRequest
                        //{
                        //    PlantLotId = new List<int> { plantLot.PlantLotId },
                        //    CriteriaData = criteriaDataList,
                        //    allowOveride = false
                        //};
                        //await _criteriaTargetService.ApplyCriteriasForTarget(criteriaApplyRequest);
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<PlantLotModel>(createdPlantlot);
                        return new BusinessResult(Const.SUCCESS_CREATE_PLANT_LOT_CODE, Const.SUCCESS_CREATE_PLANT_LOT_MESSAGE, mappedResult);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_PLANT_LOT_CODE, Const.FAIL_CREATE_PLANT_LOT_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }


        public async Task<BusinessResult> CreateAdditionalPlantLot(CreateAdditionalPlantLotModel createModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // Kiểm tra lô hàng chính có tồn tại không
                    var mainPlantLot = await _unitOfWork.PlantLotRepository.GetByCondition(x =>
                        x.PlantLotId == createModel.MainPlantLotId && x.isDeleted == false, includeProperties: "InversePlantLotReference");

                    if (mainPlantLot == null)
                    {
                        return new BusinessResult(400, "Main Plant Lot does not exist or is invalid.");
                    }
                    if (!mainPlantLot.InputQuantity.HasValue /*&& mainPlantLot.InputQuantity == 0*/)
                        return new BusinessResult(400, "Main PlantLot has not have input quantity");
                    //  Tính số lượng còn thiếu
                    var totalInputQuantityAddition = 0;
                    if (mainPlantLot.InversePlantLotReference.Any())
                    {

                        foreach (var additionaLot in mainPlantLot.InversePlantLotReference)
                        {
                            if (!additionaLot.InputQuantity.HasValue)
                                return new BusinessResult(400, $"The lot name: {additionaLot.PlantLotName} not have input quantity to create new additional.");
                        }
                        totalInputQuantityAddition = mainPlantLot.InversePlantLotReference.Sum(x => x.InputQuantity)!.Value;
                    }
                    int missingQuantity = mainPlantLot.PreviousQuantity!.Value - (mainPlantLot.InputQuantity!.Value + totalInputQuantityAddition);
                    if (missingQuantity <= 0)
                    {
                        return new BusinessResult(400, "Main Plant Lot does not require additional stock.");
                    }

                    //  Kiểm tra số lượng nhập bù không được lớn hơn số còn thiếu
                    if (createModel.ImportedQuantity > missingQuantity)
                    {
                        return new BusinessResult(400, $"Imported quantity exceeds missing amount. You can only add up to {missingQuantity}.");
                    }
                    //var checkCriteriaSet = await getcriteriaSet(mainPlantLot.FarmID!.Value);
                    //if (checkCriteriaSet.StatusCode != 200)
                    //    return checkCriteriaSet;
                    //var criteriaSetData = checkCriteriaSet.Data as List<MasterType>;
                    var criteriaSetData = await _unitOfWork.CriteriaTargetRepository.GetAllNoPaging(x => x.PlantLotID == mainPlantLot.PlantLotId);
                    //  Tạo lô nhập bù
                    var additionalPlantLot = new PlantLot()
                    {
                        PlantLotCode = $"{CodeAliasEntityConst.PLANT_LOT}{CodeHelper.GenerateCode()}-{DateTime.Now:ddMMyyyy}-{Util.SplitByDash(mainPlantLot.PlantLotCode).First()}",
                        ImportedDate = DateTime.UtcNow,
                        PreviousQuantity = createModel.ImportedQuantity, // Số lượng nhập bù
                        LastQuantity = null,
                        UsedQuantity = 0,
                        PartnerId = mainPlantLot.PartnerId,
                        PlantLotName = $"{mainPlantLot.PlantLotName} - Additional {mainPlantLot.InversePlantLotReference.Count() + 1}",
                        Unit = mainPlantLot.Unit,
                        Note = createModel.Note,
                        Status = PlantLotStatusConst.PENDING,
                        FarmID = mainPlantLot.FarmID,
                        MasterTypeId = mainPlantLot.MasterTypeId,
                        PlantLotReferenceId = mainPlantLot.PlantLotId, // Gán ID của lô chính
                        isDeleted = false,
                        IsPassed = false
                    };

                    await _unitOfWork.PlantLotRepository.Insert(additionalPlantLot);
                    var result = await _unitOfWork.SaveAsync();
                    await transaction.CommitAsync();

                    if (result > 0)
                    {
                        if (criteriaSetData.Any())
                        {

                            // 9. Lấy danh sách tiêu chí từ lô chính để apply
                            var criteriaDataList = criteriaSetData!
                                //.SelectMany(masterType => masterType.Criterias!)
                                .Select(criteria => new CriteriaData
                                {
                                    CriteriaId = criteria.CriteriaID!.Value,
                                    //IsChecked = false, // Mới áp dụng nên chưa được kiểm tra
                                    ValueChecked = null,
                                    Priority = criteria.Priority ?? 1
                                }).ToList();

                            // 10. Gọi hàm `ApplyCriteriasForTarget`
                            var criteriaApplyRequest = new ApplyCriteriaForTargetRequest
                            {
                                PlantLotId = new List<int> { additionalPlantLot.PlantLotId },
                                CriteriaData = criteriaDataList,
                                //allowOveride = false
                            };
                            await _criteriaTargetService.ApplyCriteriasForTarget(criteriaApplyRequest);
                        }
                        string includeProperties = "Partner,MasterType";
                        var updatedPlantLot = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == additionalPlantLot.PlantLotId, includeProperties);
                        var mappedResult = _mapper.Map<PlantLotModel>(updatedPlantLot);

                        return new BusinessResult(Const.SUCCESS_CREATE_PLANT_LOT_CODE, "Additional Plant Lot created successfully", mappedResult);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_PLANT_LOT_CODE, "Failed to create additional Plant Lot", false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> DeletePlantLot(int plantLotId)
        {
            try
            {
                string includeProperties = "CriteriaTargets,InversePlantLotReference";
                var entityPlantLotDelete = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == plantLotId, includeProperties);
                _unitOfWork.PlantLotRepository.Delete(entityPlantLotDelete);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(Const.SUCCESS_DELETE_PLANT_LOT_CODE, Const.SUCCESS_DELETE_PLANT_LOT_MESSAGE, result > 0);
                }
                return new BusinessResult(Const.FAIL_DELETE_PLANT_LOT_CODE, Const.FAIL_DELETE_PLANT_LOT_MESSAGE, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetAllPlantLots(GetPlantLotRequest filterRequest, PaginationParameter paginationParameter)
        {
            try
            {
                var checkParam = checkParamGetRequest(filterRequest);
                if (checkParam.Success == false)
                    return new BusinessResult(400, checkParam.ErorrMessage);
                // chi lay nhung plot chinh, ko lay plot nhap phu
                Expression<Func<PlantLot, bool>> filter = x => x.FarmID == filterRequest.FarmId && x.PlantLotReferenceId == null && x.isDeleted == false;
                Func<IQueryable<PlantLot>, IOrderedQueryable<PlantLot>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    //int validInt = 0;
                    //var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    //DateTime validDate = DateTime.Now;
                    //if (checkInt)
                    //{
                    //    filter = x => x.PlantLotId == validInt || x.PreviousQuantity == validInt || x.LastQuantity == validInt;
                    //}
                    //else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    //{
                    //    filter = x => x.ImportedDate == validDate;
                    //}
                    //else
                    //{
                    filter = filter.And(x => x.PlantLotCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                   || x.PlantLotName.ToLower().Contains(paginationParameter.Search.ToLower())
                                   || x.Status.ToLower().Contains(paginationParameter.Search.ToLower())
                                   || x.Unit.ToLower().Contains(paginationParameter.Search.ToLower())
                                   || x.Note.ToLower().Contains(paginationParameter.Search.ToLower())
                                   || x.Partner.PartnerName.ToLower().Contains(paginationParameter.Search.ToLower()));
                    //}
                }
                if (filterRequest.isFromGrafted.HasValue)
                {
                    filter = filter.And(x => x.IsFromGrafted == filterRequest.isFromGrafted);
                }
                if (!string.IsNullOrEmpty(filterRequest.PartnerId))
                {
                    var filterList = Util.SplitByComma(filterRequest.PartnerId);
                    filter = filter.And(x => filterList.Contains(x.PartnerId!.ToString()!));
                }
                if (!string.IsNullOrEmpty(filterRequest.Status))
                {
                    var filterList = Util.SplitByComma(filterRequest.Status);
                    filter = filter.And(x => filterList.Contains(x.Status!.ToLower()));
                }
                if (filterRequest.ImportedDateFrom.HasValue && filterRequest.ImportedDateTo.HasValue)
                {
                    filter = filter.And(x => x.ImportedDate >= filterRequest.ImportedDateFrom && x.ImportedDate <= filterRequest.ImportedDateTo);
                }
                if (filterRequest.PreviousQuantityFrom.HasValue && filterRequest.PreviousQuantityTo.HasValue)
                {
                    filter = filter.And(x => x.PreviousQuantity >= filterRequest.PreviousQuantityFrom && x.PreviousQuantity <= filterRequest.PreviousQuantityTo);
                }
                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "plantlotid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantLotId)
                                   : x => x.OrderBy(x => x.PlantLotId)) : x => x.OrderBy(x => x.PlantLotId);
                        break;
                    case "plantlotcode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantLotCode)
                                   : x => x.OrderBy(x => x.PlantLotCode)) : x => x.OrderBy(x => x.PlantLotCode);
                        break;
                    case "plantlotname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantLotName)
                                   : x => x.OrderBy(x => x.PlantLotName)) : x => x.OrderBy(x => x.PlantLotName);
                        break;
                    case "status":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Status)
                                   : x => x.OrderBy(x => x.Status)) : x => x.OrderBy(x => x.Status);
                        break;
                    case "unit":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Unit)
                                   : x => x.OrderBy(x => x.Unit)) : x => x.OrderBy(x => x.Unit);
                        break;
                    case "note":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Note)
                                   : x => x.OrderBy(x => x.Note)) : x => x.OrderBy(x => x.Note);
                        break;
                    case "partnername":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Partner.PartnerName)
                                   : x => x.OrderBy(x => x.Partner.PartnerName)) : x => x.OrderBy(x => x.Partner.PartnerName);
                        break;
                    case "previousquantity":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.PreviousQuantity)
                                   : x => x.OrderBy(x => x.PreviousQuantity)) : x => x.OrderBy(x => x.PreviousQuantity);
                        break;
                    case "inputquantity":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.InputQuantity)
                                   : x => x.OrderBy(x => x.InputQuantity)) : x => x.OrderBy(x => x.InputQuantity);
                        break;
                    case "lastquantity":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.LastQuantity)
                                   : x => x.OrderBy(x => x.LastQuantity)) : x => x.OrderBy(x => x.LastQuantity);
                        break;
                    case "usedquantity":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.UsedQuantity)
                                   : x => x.OrderBy(x => x.UsedQuantity)) : x => x.OrderBy(x => x.UsedQuantity);
                        break;
                    case "importeddate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.ImportedDate)
                                   : x => x.OrderBy(x => x.ImportedDate)) : x => x.OrderBy(x => x.ImportedDate);
                        break;
                    case "seedingname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.MasterType!.MasterTypeName)
                                   : x => x.OrderBy(x => x.MasterType.MasterTypeName)) : x => x.OrderBy(x => x.MasterType.MasterTypeName);
                        break;
                    case "mastertypeid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.MasterTypeId)
                                   : x => x.OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeId);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.PlantLotId);
                        break;
                }
                string includeProperties = "Partner,MasterType";
                var entities = await _unitOfWork.PlantLotRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<PlantLotModel>();
                pagin.List = _mapper.Map<IEnumerable<PlantLotModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.PlantLotRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_PLANT_LOT_CODE, Const.SUCCESS_GET_ALL_PLANT_LOT_MESSAGE, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG, new PageEntity<PlantLotModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPlantLotById(int plantLotId)
        {
            try
            {
                //var plantLot = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == plantLotId, "Partner,InversePlantLotReference,MasterType");
                var plantLot = await _unitOfWork.PlantLotRepository.GetPlantLotWithAllReferences(plantLotId);
                if (plantLot != null)
                {
                    var result = _mapper.Map<PlantLotModel>(plantLot);
                    return new BusinessResult(Const.SUCCESS_GET_PLANT_LOT_BY_ID_CODE, Const.SUCCESS_GET_PLANT_LOT_BY_ID_MESSAGE, result);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdatePlantLot(UpdatePlantLotModel updatePlantLotRequestModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    var checkExistPlantLot = await _unitOfWork.PlantLotRepository.GetByID(updatePlantLotRequestModel.PlantLotID);

                    if (checkExistPlantLot != null)
                    {
                        if (updatePlantLotRequestModel.MasterTypeId.HasValue)
                        {
                            var checkMasterTypeExist = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(updatePlantLotRequestModel.MasterTypeId.Value, TypeNameInMasterEnum.Cultivar.ToString());
                            if (checkMasterTypeExist == null)
                                return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);
                            //var checkMasterTypeExist = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.MasterTypeId == updatePlantLotRequestModel.MasterTypeId && x.IsDelete == false);
                            if (checkExistPlantLot == null)
                                return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_MSG);
                            checkExistPlantLot.MasterTypeId = updatePlantLotRequestModel.MasterTypeId;
                        }
                        if (updatePlantLotRequestModel.PartnerID.HasValue)
                        {
                            checkExistPlantLot.PartnerId = updatePlantLotRequestModel.PartnerID;
                        }
                        if (!string.IsNullOrEmpty(updatePlantLotRequestModel.Name))
                        {
                            checkExistPlantLot.PlantLotName = updatePlantLotRequestModel.Name;
                        }
                        if (updatePlantLotRequestModel.InputQuantity.HasValue /*&& updatePlantLotRequestModel.InputQuantity != 0*/)
                        {
                            // chi check dieu kien can de nhap
                            //var requiredConditions = _masterTypeConfig.PlantLotCriteriaApply?.PlantLotCondition ?? new List<string>();
                            var requiredCondition = await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x => x.ConfigKey.Trim().ToLower().Equals(SystemConfigConst.PLANT_LOT_CONDITION_APPLY.Trim().ToLower()));
                            var requiredList = requiredCondition.Any() ? requiredCondition.Select(x => x.ConfigValue).ToList() : new List<string>();

                            var checkCondition = await CheckPlantLotCriteriaCompletedAsync(checkExistPlantLot.PlantLotId, requiredList);
                            // neu khong pass thi input quantity là 0 luôn
                            if (checkCondition.StatusCode == 400)
                                return new BusinessResult(checkCondition.StatusCode, checkCondition.Message!);
                            if (checkCondition.StatusCode == 300)
                            {
                                checkExistPlantLot.InputQuantity = 0;
                                checkExistPlantLot.LastQuantity = 0;
                            }
                            else
                            {
                                if (updatePlantLotRequestModel.InputQuantity > checkExistPlantLot.PreviousQuantity)
                                    return new BusinessResult(400, "Last Quantity larger than previous quantity");
                                checkExistPlantLot.InputQuantity = updatePlantLotRequestModel.InputQuantity;
                            }
                        }
                        if (updatePlantLotRequestModel.LastQuantity.HasValue /*&& updatePlantLotRequestModel.LastQuantity != 0*/)
                        {
                            // chi check dieu kien can de danh gia
                            //var requiredConditions = _masterTypeConfig.PlantLotCriteriaApply?.PlantLotEvaluation ?? new List<string>();
                            var requiredCondition = await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x => x.ConfigKey.Trim().ToLower().Equals(SystemConfigConst.PLANT_LOT_EVALUATION_APPLY.Trim().ToLower()));
                            var requiredList = requiredCondition.Any() ? requiredCondition.Select(x => x.ConfigValue).ToList() : new List<string>();
                            var checkCondition = await CheckPlantLotCriteriaCompletedAsync(checkExistPlantLot.PlantLotId, requiredList);
                            if (checkCondition.StatusCode != 200)
                                return new BusinessResult(checkCondition.StatusCode, checkCondition.Message!);
                            if (updatePlantLotRequestModel.LastQuantity > checkExistPlantLot.InputQuantity)
                                return new BusinessResult(400, "Last Quantity larger than input quantity");
                            checkExistPlantLot.LastQuantity = updatePlantLotRequestModel.LastQuantity;
                        }
                        if (updatePlantLotRequestModel.UsedQuantity.HasValue && updatePlantLotRequestModel.UsedQuantity != 0)
                        {
                            // check dk can de nhap va dieu kien danh gia chat luong truoc khi trong
                            //var requiredConditions = _masterTypeConfig.PlantLotCriteriaApply?.PlantLotCondition!.Concat(_masterTypeConfig.PlantLotCriteriaApply?.PlantLotEvaluation!).ToList() ?? new List<string>();
                            var requiredCondition = await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x =>
                                                x.ConfigKey.Trim().ToLower().Equals(SystemConfigConst.PLANT_LOT_EVALUATION_APPLY.Trim().ToLower()) ||
                                                x.ConfigKey.Trim().ToLower().Equals(SystemConfigConst.PLANT_LOT_CONDITION_APPLY.Trim().ToLower()));
                            var requiredList = requiredCondition.Any() ? requiredCondition.Select(x => x.ConfigValue).ToList() : new List<string>();

                            var checkCondition = await CheckPlantLotCriteriaCompletedAsync(checkExistPlantLot.PlantLotId, requiredList);
                            if (checkCondition.StatusCode != 200)
                                return new BusinessResult(checkCondition.StatusCode, checkCondition.Message!);
                            if (checkExistPlantLot.IsPassed == false)
                                return new BusinessResult(400, "This plantlot not mark as PASS to use");
                            if (updatePlantLotRequestModel.UsedQuantity > checkExistPlantLot.LastQuantity)
                                return new BusinessResult(400, "Used Quantity larger than last quantity");
                            checkExistPlantLot.UsedQuantity = updatePlantLotRequestModel.UsedQuantity;
                        }
                        if (!string.IsNullOrEmpty(updatePlantLotRequestModel.Unit))
                        {
                            checkExistPlantLot.Unit = updatePlantLotRequestModel.Unit;
                        }
                        if (!string.IsNullOrEmpty(updatePlantLotRequestModel.Note))
                        {
                            checkExistPlantLot.Note = updatePlantLotRequestModel.Note;
                        }
                        if (!string.IsNullOrEmpty(updatePlantLotRequestModel.Status))
                        {
                            checkExistPlantLot.Status = updatePlantLotRequestModel.Status;
                        }
                        if (updatePlantLotRequestModel.IsPass.HasValue && updatePlantLotRequestModel.IsPass == true)
                        {

                            // check dk can de nhap va dieu kien danh gia chat luong truoc khi trong
                            //var requiredConditions = _masterTypeConfig.PlantLotCriteriaApply?.PlantLotCondition!.Concat(_masterTypeConfig.PlantLotCriteriaApply?.PlantLotEvaluation!).ToList() ?? new List<string>();
                            //var checkCondition = await CheckPlantLotCriteriaCompletedAsync(checkExistPlantLot.PlantLotId, requiredConditions);
                            //if (checkCondition.StatusCode != 200)
                            //    return new BusinessResult(checkCondition.StatusCode, checkCondition.Message!);
                            if (!checkExistPlantLot.LastQuantity.HasValue)
                                return new BusinessResult(400, "You must enter last quantity before Completed to use");
                            if (checkExistPlantLot.LastQuantity == 0)
                                return new BusinessResult(400, "This plant lot no have any seeding to use");
                            checkExistPlantLot.PassedDate = DateTime.Now;
                            checkExistPlantLot.IsPassed = updatePlantLotRequestModel.IsPass;
                        }
                        _unitOfWork.PlantLotRepository.Update(checkExistPlantLot);
                        var result = await _unitOfWork.SaveAsync();
                        if (result > 0)
                        {
                            await transaction.CommitAsync();
                            string includeProperties = "Partner,MasterType";
                            var updatedPlantLot = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == updatePlantLotRequestModel.PlantLotID, includeProperties);
                            var mappedResult = _mapper.Map<PlantLotModel>(updatedPlantLot);

                            return new BusinessResult(Const.SUCCESS_UPDATE_PLANT_LOT_CODE, Const.SUCCESS_UPDATE_PLANT_LOT_MESSAGE, mappedResult);
                        }
                        else
                        {
                            await transaction.RollbackAsync();
                            return new BusinessResult(Const.FAIL_UPDATE_PLANT_LOT_CODE, Const.FAIL_UPDATE_PLANT_LOT_MESSAGE, false);
                        }
                    }
                    else
                    {
                        return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> FillPlantToPlot(FillPlanToPlotRequest fillRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    // Lấy thông tin lô cây
                    var plantLot = await _unitOfWork.PlantLotRepository.GetByID(fillRequest.plantLotId);
                    if (plantLot == null)
                        return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                    if (plantLot.IsPassed == false)
                        return new BusinessResult(400, "Plant lot not mark as PASS to fill to plot");
                    //var masterTypeExist = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(fillRequest.MasterTypeId, TypeNameInMasterEnum.Cultiva.ToString());
                    //if (masterTypeExist == null)
                    //    return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);

                    var growthStageExist = await _unitOfWork.GrowthStageRepository.GetByCondition(x => x.GrowthStageID == fillRequest.growthStageId);
                    if (growthStageExist == null)
                        return new BusinessResult(Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG);
                    // Kiểm tra số lượng cây có thể trồng
                    int quantityToPlant = plantLot.LastQuantity - plantLot.UsedQuantity ?? 0;
                    if (quantityToPlant <= 0)
                    {
                        return new BusinessResult(Const.WARNING_PLANT_LOT_NOT_REMAIN_ANY_PLANT_CODE, Const.WARNING_PLANT_LOT_NOT_REMAIN_ANY_PLANT_MSG);
                    }

                    // Lấy thông tin thửa đất
                    var landPlot = await _unitOfWork.LandPlotRepository.GetByCondition(x => x.LandPlotId == fillRequest.landPlotId, "LandRows");
                    if (landPlot == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                    }

                    // Lấy danh sách hàng trên thửa đất
                    var landRows = landPlot.LandRows.ToList();
                    if (landRows == null || !landRows.Any())
                    {
                        return new BusinessResult(Const.WARNING_LANDPLOT_NOT_HAVE_ANY_ROW_CODE, Const.WARNING_LANDPLOT_NOT_HAVE_ANY_ROW_MSG, false);
                    }

                    int remainingPlants = quantityToPlant;
                    foreach (var row in landRows)
                    {
                        if (remainingPlants <= 0) break;

                        int maxTreeAmount = row.TreeAmount ?? 0;
                        if (maxTreeAmount <= 0) continue;

                        // Lấy danh sách cây hiện có trong hàng
                        var existingPlants = (await _unitOfWork.PlantRepository
                            .GetAllNoPaging(x => x.LandRowId == row.LandRowId && x.IsDead == false && x.IsDeleted == false))
                            .OrderBy(p => p.PlantIndex)
                            .ToList();

                        HashSet<int> occupiedIndexes = existingPlants
                            .Where(p => p.PlantIndex.HasValue)
                            .Select(p => p.PlantIndex!.Value)
                            .ToHashSet();

                        // Tạo danh sách các vị trí trống trong hàng
                        List<int> availableIndexes = Enumerable.Range(1, maxTreeAmount)
                            .Where(index => !occupiedIndexes.Contains(index))
                            .ToList();

                        int plantsToAdd = Math.Min(remainingPlants, availableIndexes.Count);
                        var listPlantInsert = new List<Plant>();
                        for (int i = 0; i < plantsToAdd; i++)
                        {
                            string code = CodeHelper.GenerateCode();

                            var newPlant = new Plant
                            {
                                PlantName = $"Plant {code}",
                                PlantCode = $"{CodeAliasEntityConst.PLANT}{CodeHelper.GenerateCode()}-{DateTime.Now:ddMMyy}-{Util.SplitByDash(plantLot.PlantLotCode).First()}",
                                PlantingDate = DateTime.UtcNow,
                                HealthStatus = HealthStatusConst.HEALTHY,
                                LandRowId = row.LandRowId,
                                FarmId = landPlot.FarmId,
                                IsDeleted = false,
                                GrowthStageID = fillRequest.growthStageId,
                                MasterTypeId = plantLot.MasterTypeId,  // gán giống của lô đó vào cho cây này (cần kiểm tra xem lô cây đó là chiét ra hay sao nữa)
                                PlantIndex = availableIndexes[i], // Gán vị trí trống hợp lệ
                                IsDead = false,
                            };
                            listPlantInsert.Add(newPlant);
                        }
                        if (listPlantInsert.Any())
                        {
                            await _unitOfWork.PlantRepository.InsertRangeAsync(listPlantInsert);
                            if (plantLot.IsFromGrafted == true)
                            {
                                await updateUsedGraftedPlantInLot(plantLotId: plantLot.PlantLotId, listPlantInsert.Count());
                            }
                            remainingPlants -= plantsToAdd;
                        }
                    }

                    // Cập nhật số lượng cây còn lại trong PlantLot
                    plantLot.UsedQuantity += (quantityToPlant - remainingPlants);
                    _unitOfWork.PlantLotRepository.Update(plantLot);
                    // Lưu thay đổi
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_UPDATE_PLANT_LOT_CODE, "Plant has fill in plot success", plantLot);
                    }
                    // nếu sai
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_PLANT_LOT_CODE, Const.FAIL_UPDATE_PLANT_LOT_MESSAGE);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> GetForSelectedByFarmId(int farmId, bool? isFromGrafted)
        {
            try
            {
                Expression<Func<PlantLot, bool>> filter = x => x.FarmID == farmId && x.LastQuantity >= x.UsedQuantity && x.isDeleted == false;
                if (isFromGrafted.HasValue && isFromGrafted == true)
                    filter = filter.And(x => x.IsFromGrafted == isFromGrafted && !x.Status!.ToLower().Equals(PlantLotStatusConst.COMPLETED.ToLower()));
                Func<IQueryable<PlantLot>, IOrderedQueryable<PlantLot>> orderBy = x => x.OrderByDescending(od => od.PlantLotId)!;
                //string includeProperties = "Partner";
                //var plantLot = await _unitOfWork.PlantLotRepository.GetAllNoPaging(x => x.FarmID == farmId && x.isDeleted == false, includeProperties: includeProperties, orderBy: orderBy);
                var plantLot = await _unitOfWork.PlantLotRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
                if (plantLot != null)
                {
                    var result = _mapper.Map<IEnumerable<ForSelectedModels>>(plantLot);
                    return new BusinessResult(Const.SUCCESS_GET_PLANT_LOT_BY_ID_CODE, Const.SUCCESS_GET_PLANT_LOT_BY_ID_MESSAGE, result);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> softedMultipleDelete(List<int> plantLotIds)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    //if (string.IsNullOrEmpty(plantIds))
                    //    return new BusinessResult(400, "No plant Id to delete");
                    //List<string> plantIdList = Util.SplitByComma(plantIds);
                    //foreach (var MasterTypeId in plantIdList)
                    //{
                    Expression<Func<PlantLot, bool>> filter = x => plantLotIds.Contains(x.PlantLotId) && x.isDeleted == false;
                    var plantsExistGet = await _unitOfWork.PlantLotRepository.GetAllNoPaging(filter: filter);
                    foreach (var item in plantsExistGet)
                    {

                        item.isDeleted = true;
                        _unitOfWork.PlantLotRepository.Update(item);
                    }
                    //}
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PLANT_LOT_CODE, $"Delete {result.ToString()} plant success", result > 0);
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_DELETE_PLANT_LOT_CODE, Const.FAIL_DELETE_PLANT_LOT_MESSAGE, new { success = false });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }
        private (bool Success, string ErorrMessage) checkParamGetRequest(GetPlantLotRequest request)
        {
            //if (!request.farmId.HasValue && !request.LandPlotId.HasValue && !request.LandRowId.HasValue)
            //    return (false, "No destination to get plant");
            if (request.ImportedDateFrom.HasValue && request.ImportedDateTo.HasValue && request.ImportedDateFrom.Value > request.ImportedDateTo)
                return (false, "Row index 'From' must smaller or equal than Row index 'To' ");
            if (request.PreviousQuantityFrom.HasValue && request.PreviousQuantityTo.HasValue && request.PreviousQuantityFrom.Value > request.PreviousQuantityTo.Value)
                return (false, "Plant index 'From' in row must smaller or equal than plant index 'To' ");
            return (true, null!);
        }

        /// <summary>
        /// Kiem tra xem plantLot da hoan thanh dc kiem tra dau vao chua
        /// doc cau cac target kiem tra tu appsetting --> check cac dk da duoc apply tu truoc --> tra ket qua
        /// </summary>
        /// <param name="plantLotId"></param>
        /// <returns></returns>
        //public async Task<BusinessResult> CheckPlantLotConditionAppliedAsync(int plantLotId)
        //{
        //    var appliedCriterias = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantLotId: plantLotId);

        //    // Kiểm tra lô cây có tồn tại không
        //    var plantLotExist = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == plantLotId && x.isDeleted == false);
        //    if (plantLotExist == null)
        //        return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);

        //    // Lấy danh sách điều kiện từ cấu hình
        //    var requiredConditions = _masterTypeConfig.PlantLotCriteriaApply?.PlantLotCondition ?? new List<string>();

        //    // Kiểm tra xem PlantLot có được apply đủ tiêu chí không
        //    bool hasAppliedCondition = appliedCriterias.Any(x =>
        //        x.Criteria!.MasterType!.TypeName!.Equals(TypeNameInMasterEnum.Criteria.ToString(), StringComparison.OrdinalIgnoreCase)
        //        && requiredConditions.Any(t => t.Equals(x.Criteria.MasterType.Target, StringComparison.OrdinalIgnoreCase)));

        //    if (!hasAppliedCondition)
        //    {
        //        return new BusinessResult(400, "The plant lot has not been applied the required conditions.");
        //    }

        //    return new BusinessResult(200, "The plant lot has been applied the required conditions.");
        //}

        //public async Task<BusinessResult> CheckPlantLotEvaluationCompletedAsync(int plantLotId)
        //{
        //    var appliedCriterias = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantLotId: plantLotId);

        //    // Kiểm tra lô cây có tồn tại không
        //    var plantLotExist = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.MasterTypeId == plantLotId && x.isDeleted == false);
        //    // Lấy danh sách điều kiện từ cấu hình
        //    var requiredEvaluations = _masterTypeConfig.PlantLotCriteriaApply?.PlantLotEvaluation ?? new List<string>();

        //    // Kiểm tra xem tất cả các tiêu chí đánh giá đã được hoàn thành chưa
        //    bool hasCompletedEvaluation = appliedCriterias
        //        .Where(x => requiredEvaluations.Contains(x.Criteria!.MasterType!.Target, StringComparer.OrdinalIgnoreCase))
        //        .All(x => x.IsChecked == true);

        //    if (!hasCompletedEvaluation)
        //    {
        //        return new BusinessResult(400, "The plant lot has not completed all required evaluations.");
        //    }

        //    return new BusinessResult(200, "The plant lot has successfully completed all required evaluations.");
        //}

        private async Task<BusinessResult> CheckPlantLotHasCheckCriteriaAsync(int plantLotId, List<string> criteriaRequireCheck)
        {
            var appliedCriterias = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantLotId: plantLotId);

            // Kiểm tra xem tất cả các tiêu chí phải được check và pass thì mới trả về true 
            // vì có chỉ cần bắt trường hợp tất cả được check nhưng có 1 cái nào đó ko pass để handle
            // có value --> là được check rồi nhưng ko pass
            bool hasCompletedEvaluation = appliedCriterias
                .Where(x => criteriaRequireCheck.Contains(x.Criteria!.MasterType!.Target, StringComparer.OrdinalIgnoreCase))
                .All(x => x.ValueChecked.HasValue && x.IsPassed == true);
            // neu co cai nao check ma ko pass thi tra loi 300 de handle
            if (!hasCompletedEvaluation)
            {
                return new BusinessResult(300, "The plant lot has not passed all required.");
            }

            return new BusinessResult(200, "The plant lot has successfully completed all required.");
        }

        private async Task<BusinessResult> CheckPlantLotCriteriaCompletedAsync(int plantLotId, List<string> criteriaRequireCheck)
        {
            // 2. Lấy danh sách tiêu chí đã áp dụng
            var appliedCriterias = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantLotId: plantLotId);

            // 3. Kiểm tra xem đã áp dụng **tất cả tiêu chí trong danh sách yêu cầu chưa**
            var appliedCriteriaTargets = appliedCriterias
                .Where(x => criteriaRequireCheck.Contains(x.Criteria!.MasterType!.Target, StringComparer.OrdinalIgnoreCase))
                .ToList();

            if (!appliedCriteriaTargets.Any())
            {
                return new BusinessResult(200, $"The plant lot has not been applied any required criteria: {string.Join(",", criteriaRequireCheck)}");
            }

            // 4. Kiểm tra xem tất cả tiêu chí đã được **hoàn thành** chưa (`IsPassed == true`)
            bool hasCompletedCriteria = appliedCriteriaTargets.All(x => x.IsPassed == true);

            if (!hasCompletedCriteria)
            {
                return new BusinessResult(400, $"The plant lot has not checked all required criteria: {string.Join(",", criteriaRequireCheck)} ");
            }

            return new BusinessResult(200, "The plant lot has successfully checked all required criteria.");
        }


        private async Task<BusinessResult> getcriteriaSet(int farmId)
        {
            // 2. Lấy danh sách tiêu chí cần áp dụng từ config
            List<string> criteriaTargetNeed = _masterTypeConfig.PlantLotCriteriaApply!.PlantLotEvaluation!
                                            .Concat(_masterTypeConfig.PlantLotCriteriaApply.PlantLotCondition!)
                                            .Where(x => !string.IsNullOrEmpty(x)) // Loại bỏ giá trị null hoặc rỗng
                                            .ToList();

            //  3. Lấy danh sách tiêu chí đã có trong hệ thống (MasterType)
            var criteriaSetForPlantLot = await _unitOfWork.MasterTypeRepository
                .GetCriteriaSetOfFarm(
                    TypeNameInMasterEnum.Criteria.ToString(),
                    farmId,
                    criteriaTargetNeed
                );

            if (!criteriaSetForPlantLot.Any())
                return new BusinessResult(400, $"You need to set up Criteria set for: {string.Join(", ", criteriaTargetNeed)}");

            //  4. Kiểm tra xem tất cả tiêu chí trong config đã có trong DB chưa
            var existingCriteriaTargets = criteriaSetForPlantLot.Select(x => x.Target!.ToLower()).ToList();
            var missingCriteria = criteriaTargetNeed
                .Where(x => !existingCriteriaTargets.Contains(x.ToLower()))
                .ToList();

            if (missingCriteria.Any())
                return new BusinessResult(400, $"You need to set up Criteria set for: {string.Join(", ", missingCriteria)}");

            //  5. Kiểm tra nếu tiêu chí nào không có danh sách Criteria con
            var emptyCriteriaSet = criteriaSetForPlantLot
                .Where(x => x.Criterias == null || !x.Criterias.Any()) // 🔹 MasterType nào không có Criteria
                .Select(x => x.MasterTypeName) // 🔹 Lấy tên MasterType
                .ToList();

            if (emptyCriteriaSet.Any())
                return new BusinessResult(400, $"The following Criteria Sets are empty and must have at least one Criteria: {string.Join(", ", emptyCriteriaSet)}");
            return new BusinessResult(200, "Get criteria set success", criteriaSetForPlantLot);
        }

        private async Task updateUsedGraftedPlantInLot(int plantLotId, int numberOfGraftedPlant)
        {
            // chi lay nhung cay khoe manh trong lo thoi
            Expression<Func<GraftedPlant, bool>> filter = x => x.PlantLotId == plantLotId &&
                                        x.Status.ToLower().Equals(GraftedPlantStatusConst.HEALTHY.ToString().ToLower());

            var graftedPlant = await _unitOfWork.GraftedPlantRepository.Get(filter: filter, pageIndex: 1, pageSize: numberOfGraftedPlant);
            foreach (var grafted in graftedPlant)
            {
                // dnah dau used cac cay do
                grafted.Status = GraftedPlantStatusConst.IS_USED.ToString().ToLower();
            }
            _unitOfWork.GraftedPlantRepository.UpdateRange(graftedPlant);
            return;
        }

        public async Task<BusinessResult> CheckingCriteriaForLot(CheckPlantLotCriteriaRequest request)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkExistPlantLot = await _unitOfWork.PlantLotRepository.GetByID(request.PlantLotID);
                    if (checkExistPlantLot == null)
                        return new BusinessResult(400, "Plant lot not exist");
                    if (!request.criteriaDatas.Any())
                    {
                        return new BusinessResult(500, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                    }

                    // Lấy danh sách CriteriaTarget 
                    var CriteriaTargetList = (await _unitOfWork.CriteriaTargetRepository
                       .GetAllNoPaging(filter: x => request.PlantLotID.Equals(x.PlantLotID!.Value), includeProperties: "Criteria")).ToList();

                    if (!CriteriaTargetList.Any())
                    {
                        return new BusinessResult(Const.FAIL_GET_CRITERIA_CODE, "Don't have criteria to complete task");
                    }

                    var criteriaDict = request.criteriaDatas.ToDictionary(c => c.CriteriaId);

                    foreach (var lotCriteria in CriteriaTargetList)
                    {
                        if (lotCriteria.CriteriaID.HasValue && criteriaDict.TryGetValue(lotCriteria.CriteriaID.Value, out var criteriaData))
                        {
                            // Cập nhật trạng thái `IsChecked`
                            //if (criteriaData.IsChecked.HasValue)
                            if (criteriaData.ValueChecked.HasValue)
                            {
                                //plantCriteria.IsChecked = criteriaData.IsChecked;
                                lotCriteria.ValueChecked = criteriaData.ValueChecked;
                                lotCriteria.CheckedDate = DateTime.Now;
                            }

                            // Cập nhật trạng thái `IsPassed`
                            if (lotCriteria.Criteria!.MinValue.HasValue && lotCriteria.Criteria.MaxValue.HasValue)
                            {
                                if (criteriaData.ValueChecked >= lotCriteria.Criteria!.MinValue && criteriaData.ValueChecked <= lotCriteria.Criteria.MaxValue)
                                {
                                    lotCriteria.IsPassed = true;
                                }
                                if (criteriaData.ValueChecked < lotCriteria.Criteria!.MinValue && criteriaData.ValueChecked > lotCriteria.Criteria.MaxValue)
                                {
                                    lotCriteria.IsPassed = false;
                                }
                            }

                        }
                        lotCriteria.Criteria = null;
                    }
                    // Cập nhật danh sách CriteriaTarget 
                    _unitOfWork.CriteriaTargetRepository.UpdateRange(CriteriaTargetList);

                    #region kiem check dieu kien TRUOC khi duyet lo
                    bool flag = false;  // để duyệt qua điều kiện 1 khỏi duyệt qua điều kiện 2
                    // kiem tra xem cac criteria do co hoan thanh duoc tieu chi de nhap so luong chua, neu check het ma con cai nao ko pass thi update lại số
                    var requiredCondition = await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x => x.ConfigKey.ToLower().Equals(SystemConfigConst.PLANT_LOT_CONDITION_APPLY));
                    var ConditionList = requiredCondition.Any() ? requiredCondition.Select(x => x.ConfigValue).ToList() : new List<string>();

                    var checkCondition = await CheckPlantLotHasCheckCriteriaAsync(request.PlantLotID, ConditionList);
                    // neu check het cai nay ma ko pass thi cap nhat inputQuantity va LastQuantity
                    if (checkCondition.StatusCode == 300)
                    {
                        flag = true;
                        checkExistPlantLot.InputQuantity = 0;
                        checkExistPlantLot.LastQuantity = 0;
                        _unitOfWork.PlantLotRepository.Update(checkExistPlantLot);
                    }
                    #endregion

                    #region kiem check dieu kien trc khi SAU duyet lo
                    if (flag == false)
                    {
                        // kiem tra xem cac criteria do co hoan thanh duoc tieu chi de nhap so luong chua, neu check het ma con cai nao ko pass thi update lại số
                        var requiredEvaluation = await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x => x.ConfigKey.Trim().ToLower().Equals(SystemConfigConst.PLANT_LOT_EVALUATION_APPLY.Trim().ToLower()));
                        var EvaluationList = requiredCondition.Any() ? requiredEvaluation.Select(x => x.ConfigValue).ToList() : new List<string>();

                        var checkEvaluation = await CheckPlantLotHasCheckCriteriaAsync(request.PlantLotID, EvaluationList);
                        // neu check het cai nay ma ko pass thi cap nhat inputQuantity va LastQuantity
                        if (checkEvaluation.StatusCode == 300)
                        {
                            checkExistPlantLot.LastQuantity = 0;
                            _unitOfWork.PlantLotRepository.Update(checkExistPlantLot);
                        }
                    }
                    #endregion

                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        //var newPlantCriteria = await _unitOfWork.CriteriaTargetRepository
                        //    .GetAllCriteriaOfPlantNoPaging(targetList!.FirstOrDefault()!.Value);

                        return new BusinessResult(Const.SUCCES_CHECK_PLANT_CRITERIA_CODE, Const.SUCCES_CHECK_PLANT_CRITERIA_MSG, new { success = true });
                    }

                    return new BusinessResult(Const.FAIL_CHECK_CRITERIA_TARGET_CODE, Const.FAIL_CHECK_CRITERIA_TARGET_MSG, new { success = false });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }
    }
}
