using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.CriteriaModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.MasterTypeRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Org.BouncyCastle.Asn1.X509;
using System.Linq.Expressions;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class CriteriaService : ICriteriaService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFarmService _farmService;
        private readonly ProgramDefaultConfig _masterTypeConfig
            ;
        public CriteriaService(IUnitOfWork unitOfWork, IMapper mapper, IFarmService farmService, ProgramDefaultConfig programDefaultConfig)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _farmService = farmService;
            _masterTypeConfig = programDefaultConfig;
        }

        public async Task<BusinessResult> UpdateListCriteriaInType(ListCriteriaUpdateRequest listUpdate)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    var masterType = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.MasterTypeId == listUpdate.MasterTypeId && x.IsDefault == false && x.IsDeleted == false, "Criterias");
                    if (masterType == null)
                        return new BusinessResult(Const.FAIL_GET_MASTER_TYPE_CODE, Const.FAIL_GET_MASTER_TYPE_DETAIL_MESSAGE);
                    // update MasterType
                    if (!string.IsNullOrEmpty(listUpdate.MasterTypeName))
                    {
                        masterType.MasterTypeName = listUpdate.MasterTypeName;
                    }
                    if (!string.IsNullOrEmpty(listUpdate.Target))
                    {
                        if (!_masterTypeConfig.CriteriaTargets!.Any(target => target.Equals(listUpdate.Target, StringComparison.OrdinalIgnoreCase)) && masterType.TypeName!.ToLower().Equals("criteria"))
                            return new BusinessResult(400, "Type name not suitable with system");
                        masterType.Target = listUpdate.Target;
                    }
                    if (listUpdate.IsActive != null)
                    {
                        masterType.IsActive = listUpdate.IsActive;
                    }
                    if (!string.IsNullOrEmpty(listUpdate.MasterTypeDescription))
                    {
                        masterType.MasterTypeDescription = listUpdate.MasterTypeDescription;
                    }
                    // Chuyển danh sách hiện có thành Dictionary để tra cứu nhanh**
                    var existingCriteriaDict = masterType.Criterias.ToDictionary(c => c.CriteriaId);

                    // Tạo danh sách xử lý
                    var criteriaToUpdate = new List<Criteria>();
                    var criteriaToAdd = new List<Criteria>();
                    var receivedCriteriaIds = new HashSet<int>();


                    foreach (var request in listUpdate.criteriasCreateRequests)
                    {
                        if (request.CriteriaId.HasValue && existingCriteriaDict.ContainsKey(request.CriteriaId.Value))
                        {
                            // Cập nhật dữ liệu
                            var existingCriteria = existingCriteriaDict[request.CriteriaId.Value];
                            //var existingCriteria = await _unitOfWork.CriteriaRepository.GetByCondition(x => x.CriteriaId == request.CriteriaId.Value);
                            existingCriteria.CriteriaName = request.CriteriaName;
                            existingCriteria.CriteriaDescription = request.CriteriaDescription;
                            existingCriteria.Priority = request.Priority;
                            existingCriteria.FrequencyDate = request.FrequencyDate;
                            existingCriteria.IsActive = request.IsActive;
                            if (request.MinValue.HasValue && request.MaxValue.HasValue && request.MinValue > request.MaxValue)
                                return new BusinessResult(400, "Min value must smaller than max value");
                            existingCriteria.MinValue = request.MinValue;
                            existingCriteria.MaxValue = request.MaxValue;
                            existingCriteria.Unit = request.Unit;
                            criteriaToUpdate.Add(existingCriteria);
                            receivedCriteriaIds.Add(request.CriteriaId.Value);

                        }
                        else
                        {
                            if (request.MinValue.HasValue && request.MaxValue.HasValue && request.MinValue > request.MaxValue)
                                return new BusinessResult(400, "Min value must smaller than max value");
                            // Thêm mới
                            var newCriteria = new Criteria
                            {
                                CriteriaName = request.CriteriaName,
                                CriteriaDescription = request.CriteriaDescription,
                                Priority = request.Priority,
                                IsActive = true,
                                IsDeleted = false,
                                IsDefault = false,
                                MinValue = request.MinValue,
                                MaxValue = request.MaxValue,
                                FrequencyDate = request.FrequencyDate,
                                MasterTypeID = masterType.MasterTypeId,
                                CriteriaCode = $"{CodeAliasEntityConst.CRITERIA}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}",
                            };
                            criteriaToAdd.Add(newCriteria);
                        }
                    }

                    //masterType.Criterias = null!;
                    _unitOfWork.MasterTypeRepository.Update(masterType);
                    // Tìm các phần tử cần xóa (không có trong danh sách cập nhật
                    var criteriaToRemove = masterType.Criterias.Where(c => !receivedCriteriaIds.Contains(c.CriteriaId)).ToList();
                    foreach (var criteria in criteriaToRemove)
                    {
                        criteria.IsDeleted = true;
                        criteria.MasterType = null;
                    }
                    // Thực hiện các thao tác với EF
                    if (criteriaToRemove.Any()) _unitOfWork.CriteriaRepository.UpdateRange(criteriaToRemove);
                    if (criteriaToUpdate.Any()) _unitOfWork.CriteriaRepository.UpdateRange(criteriaToUpdate);
                    if (criteriaToAdd.Any()) await _unitOfWork.CriteriaRepository.InsertRangeAsync(criteriaToAdd);

                    // Luu thay đổi
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var criteriaOfterUpdate = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.MasterTypeId == listUpdate.MasterTypeId, "Criterias");
                        var afterUpdate = _mapper.Map<MasterTypeModel>(criteriaOfterUpdate);
                        return new BusinessResult(Const.SUCCESS_UPDATE_CRITERIA_CODE, Const.SUCCESS_UPDATE_CRITERIA_MSG, afterUpdate);
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_CRITERIA_CODE, Const.FAIL_UPDATE_CRITERIA_MSG);

                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }
        public async Task<BusinessResult> GetCriteriaById(int criteriaId)
        {
            try
            {
                var criteria = await _unitOfWork.CriteriaRepository.GetByCondition(x => x.CriteriaId == criteriaId);
                if (criteria == null) return new BusinessResult(Const.FAIL_GET_CRITERIA_BY_ID_CODE, Const.FAIL_GET_CRITERIA_BY_ID_MSG);
                var result = _mapper.Map<CriteriaModel>(criteria);
                return new BusinessResult(Const.SUCCESS_GET_CRITERIA_BY_ID_CODE, Const.SUCCESS_GET_CRITERIA_BY_ID_MSG, result);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateOneCriteriaInType(CriteriaUpdateRequest criteriaUpdateRequests)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {

                    var criteria = await _unitOfWork.CriteriaRepository.GetByCondition(x => x.CriteriaId == criteriaUpdateRequests.CriteriaId && x.IsDeleted == false);
                    if (criteria == null) return new BusinessResult(Const.FAIL_GET_CRITERIA_BY_ID_CODE, Const.FAIL_GET_CRITERIA_BY_ID_MSG);
                    if (!string.IsNullOrEmpty(criteriaUpdateRequests.CriteriaName))
                        criteria.CriteriaName = criteriaUpdateRequests.CriteriaName;
                    if (!string.IsNullOrEmpty(criteriaUpdateRequests.CriteriaDescription))
                        criteria.CriteriaDescription = criteriaUpdateRequests.CriteriaDescription;
                    if (criteriaUpdateRequests.Priority.HasValue)
                        criteria.Priority = criteriaUpdateRequests.Priority;
                    if (criteriaUpdateRequests.IsActive.HasValue)
                        criteria.IsActive = criteriaUpdateRequests.IsActive;
                    if (!string.IsNullOrEmpty(criteriaUpdateRequests.Unit))
                        criteria.Unit = criteriaUpdateRequests.Unit;
                    if (criteriaUpdateRequests.MinValue.HasValue)
                        criteria.MinValue = criteriaUpdateRequests.MinValue;
                    if (criteriaUpdateRequests.MaxValue.HasValue)
                        criteria.MaxValue = criteriaUpdateRequests.MaxValue;
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var criteriaOfterUpdate = _mapper.Map<CriteriaModel>(criteria);
                        return new BusinessResult(Const.SUCCESS_UPDATE_CRITERIA_CODE, Const.SUCCESS_UPDATE_CRITERIA_MSG, criteriaOfterUpdate);
                    }
                    return new BusinessResult(Const.FAIL_UPDATE_CRITERIA_CODE, Const.FAIL_UPDATE_CRITERIA_MSG);

                }
                catch (Exception ex)
                {
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> GetCriteriaOfTarget(GetCriteriaOfTargetRequest request)
        {
            try
            {
                if (!(request.PlantID.HasValue || request.GraftedPlantID.HasValue || request.PlantLotID.HasValue))
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);

                var criteriaByType = await _unitOfWork.CriteriaTargetRepository
                    .GetAllCriteriaOfTargetNoPaging(request.PlantID, request.GraftedPlantID, request.PlantLotID);

                if (!criteriaByType.Any())
                {
                    return new BusinessResult(200, Const.WARNING_GET_CRITERIA_OF_PLANT_EMPTY_MSG);
                }

                var groupedData = criteriaByType
                    .Where(pc => /*pc.Criteria?.MasterType != null &&*/ pc.Criteria!.IsDeleted == false) // Lọc các tiêu chí có MasterType
                    .GroupBy(pc => pc.Criteria!.MasterType!.MasterTypeId) // Nhóm theo MasterTypeId
                    .Select(group => new GroupedCriteriaModel
                    {
                        MasterTypeId = group.Key,
                        MasterTypeName = group.First().Criteria!.MasterType!.MasterTypeName!,
                        Target = group.First().Criteria!.MasterType!.Target,
                        CriteriaList = group.OrderBy(pc => pc.Priority).Select(pc => new CriteriaInfoModel
                        {
                            PlantId = pc.PlantID,
                            GraftedPlantId = pc.GraftedPlantID,
                            PlantLotId = pc.PlantLotID,
                            Priority = pc.Priority,
                            CriteriaId = pc.Criteria!.CriteriaId,
                            CriteriaName = pc.Criteria!.CriteriaName!,
                            Description = pc.Criteria!.CriteriaDescription!,
                            //IsChecked = pc.IsChecked,
                            MinValue = pc.Criteria.MinValue,
                            MaxValue = pc.Criteria.MaxValue,
                            Unit = pc.Criteria.Unit,
                            ValueChecked = pc.ValueChecked,
                            CreateDate = pc.CreateDate,
                            CheckedDate = pc.CheckedDate,
                            IsPassed = pc.IsPassed,
                            FrequencyDate = pc.Criteria.FrequencyDate
                        }).ToList()
                    })
                    .OrderBy(x => x.Target)
                    .ThenBy(x => x.MasterTypeId)
                    .ToList();

                return new BusinessResult(Const.SUCCES_GET_PLANT_CRITERIA_CODE, Const.SUCCES_GET_PLANT_CRITERIA_MSG, groupedData);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetAllCriteriaSetPagination(PaginationParameter paginationParameter, MasterTypeFilter masterTypeFilter, int farmId)
        {
            try
            {
                masterTypeFilter.TypeName = TypeNameInMasterEnum.Criteria.ToString();
                Expression<Func<MasterType, bool>> filter = x => x.IsDeleted == false;
                if (farmId > 0)
                    filter = filter.And(x => (x.FarmID == farmId && x.IsDeleted == false) || (x.IsDefault == true && x.FarmID == null));
                else
                    filter = filter.And(x => x.IsDefault == true && x.FarmID == null);
                //return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                Func<IQueryable<MasterType>, IOrderedQueryable<MasterType>> orderBy = x => x.OrderByDescending(x => x.MasterTypeId);
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {

                    filter = x => x.MasterTypeCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.MasterTypeName.ToLower().Contains(paginationParameter.Search.ToLower())
                                  //|| x.MasterTypeCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.MasterTypeDescription.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.CreateBy.ToLower().Contains(paginationParameter.Search.ToLower());
                    //|| x.TypeName.ToLower().Contains(paginationParameter.Search.ToLower());
                }

                if (masterTypeFilter.createDateFrom.HasValue || masterTypeFilter.createDateTo.HasValue)
                {
                    if (!masterTypeFilter.createDateFrom.HasValue || !masterTypeFilter.createDateTo.HasValue)
                    {
                        return new BusinessResult(Const.WARNING_MISSING_DATE_FILTER_CODE, Const.WARNING_MISSING_DATE_FILTER_MSG);
                    }

                    if (masterTypeFilter.createDateFrom.Value > masterTypeFilter.createDateTo.Value)
                    {
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);
                    }
                    filter = filter.And(x => x.CreateDate >= masterTypeFilter.createDateFrom &&
                                             x.CreateDate <= masterTypeFilter.createDateTo);
                }
                if (masterTypeFilter.isActive.HasValue)
                    filter = filter.And(x => x.IsActive == masterTypeFilter.isActive);
                if (!string.IsNullOrEmpty(masterTypeFilter.MasterTypeName))
                {
                    filter = filter.And(x => x.MasterTypeName!.ToLower().Contains(masterTypeFilter.MasterTypeName.ToLower()));
                    //}
                }

                if (masterTypeFilter.TypeName != null)
                {
                    List<string> filterList = Util.SplitByComma(masterTypeFilter.TypeName);
                    filter = filter.And(x => filterList.Contains(x.TypeName.ToLower()));
                }
                if (!string.IsNullOrEmpty(paginationParameter.SortBy))
                {
                    switch (paginationParameter.SortBy.ToLower())
                    {
                        case "mastertypeid":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeId);
                            break;
                        case "mastertypecode":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MasterTypeCode).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.MasterTypeCode).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeCode).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "mastertypename":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MasterTypeName).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.MasterTypeName).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeName).OrderBy(x => x.MasterTypeId);
                            break;
                        case "mastertypedescription":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MasterTypeDescription).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.MasterTypeDescription).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeDescription).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "isactive":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.IsActive).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.IsActive).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.IsActive).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "isdelete":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.IsDeleted).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.IsDeleted).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.IsDeleted).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "createdate":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.CreateDate).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.CreateDate).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.CreateDate).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "updatedate":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.UpdateDate).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.UpdateDate).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.UpdateDate).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "createby":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.CreateBy).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.CreateBy).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.CreateBy).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "typename":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.TypeName).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.TypeName).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.TypeName).OrderByDescending(x => x.MasterTypeId);
                            break;
                        default:
                            orderBy = x => x.OrderBy(x => x.MasterTypeId);
                            break;
                    }
                }
                string includeProperties = "Criterias";
                var entities = await _unitOfWork.MasterTypeRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<MasterTypeModel>();
                pagin.List = _mapper.Map<IEnumerable<MasterTypeModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.MasterTypeRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    pagin.List.GroupBy(x => x.TypeName);
                    return new BusinessResult(Const.SUCCESS_GET_ALL_MASTER_TYPE_CODE, Const.SUCCESS_GET_ALL_MASTER_TYPE_MESSAGE, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG, new PageEntity<MasterTypeModel>());
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
        public async Task<BusinessResult> CreateCriteriaWithMasterType(CreateCriteriaMasterTypeRequest request)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var farmExistCheck = await _farmService.GetFarmByID(request.CreateMasTypeRequest.FarmId!.Value);
                    if (farmExistCheck.StatusCode != 200)
                        return farmExistCheck;

                    //var lastedId = await _unitOfWork.MasterTypeRepository.GetLastID();
                    string typename = request.CreateMasTypeRequest.TypeName!.ToString().ToUpper();
                    string code = CodeHelper.GenerateCode();
                    var newMasterType = new MasterType()
                    {
                        MasterTypeCode = $"{CodeAliasEntityConst.MASTER_TYPE}{code}-{DateTime.Now.ToString("ddMMyy")}-{typename}",
                        MasterTypeName = request.CreateMasTypeRequest.MasterTypeName,
                        MasterTypeDescription = request.CreateMasTypeRequest.MasterTypeDescription,
                        IsActive = request.CreateMasTypeRequest.IsActive,
                        IsDeleted = false,
                        IsDefault = false,
                        CreateBy = request.CreateMasTypeRequest.CreateBy,
                        CreateDate = DateTime.Now,
                        TypeName = TypeNameInMasterEnum.Criteria.ToString(),
                        Target = request.CreateMasTypeRequest.Target,
                        FarmID = request.CreateMasTypeRequest.FarmId,
                        BackgroundColor = request.CreateMasTypeRequest.BackgroundColor,
                        TextColor = request.CreateMasTypeRequest.TextColor,
                        Characteristic = request.CreateMasTypeRequest.Characteristic,
                    };
                    if (request.CriteriaCreateRequest?.Any() == true)
                    {
                        // kiem tra xem priority co bi trung nhau ko và lien tuc voi nhau ko
                        var checkPriorityOrder = ValidateCriteriaPriorities(request.CriteriaCreateRequest);

                        if (!checkPriorityOrder.IsValid)
                            return new BusinessResult(Const.FAIL_CREATE_CRITERIA_CODE, checkPriorityOrder.ErrorMessage);

                        foreach (var item in request.CriteriaCreateRequest)
                        {
                            var criteria = new Criteria()
                            {
                                CriteriaName = item.CriteriaName,
                                IsActive = true,
                                CriteriaDescription = item.CriteriaDescription,
                                Priority = item.Priority,
                                MinValue = item.MinValue,
                                MaxValue = item.MaxValue,
                                Unit = item.Unit,
                                IsDeleted = false,
                                CriteriaCode = $"{CodeAliasEntityConst.CRITERIA}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}",
                                MasterType = newMasterType,
                                FrequencyDate = item.FrequencyDate,
                            };
                            newMasterType.Criterias.Add(criteria);
                        }
                    }
                    await _unitOfWork.MasterTypeRepository.Insert(newMasterType);


                    var result = await _unitOfWork.SaveAsync();

                    await transaction.CommitAsync();

                    if (result > 0)
                    {
                        var mappedResult = _mapper.Map<MasterTypeModel>(newMasterType);
                        return new BusinessResult(Const.SUCCESS_CREATE_MASTER_TYPE_CODE, Const.SUCCESS_CREATE_MASTER_TYPE_MESSAGE, mappedResult);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_MASTER_TYPE_CODE, Const.FAIL_CREATE_MASTER_TYPE_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }

            }
        }

        public (bool IsValid, string ErrorMessage) ValidateCriteriaPriorities(List<CriteriaCreateRequest> criteriaList)
        {
            if (criteriaList == null || !criteriaList.Any())
            {
                return (false, "Criteria list is empty.");
            }

            // Lọc ra danh sách Priority hợp lệ (không null)
            var priorityList = criteriaList
                .Where(c => c.Priority.HasValue)
                .Select(c => c.Priority!.Value)
                .ToList();

            // Kiểm tra trùng lặp
            if (priorityList.Count != priorityList.Distinct().Count())
            {
                return (false, "Duplicate priority values found.");
            }

            // Kiểm tra tính liên tục của các giá trị Priority
            var minPriority = priorityList.Min();
            var maxPriority = priorityList.Max();

            var expectedRange = Enumerable.Range(minPriority, maxPriority - minPriority + 1);
            if (!expectedRange.SequenceEqual(priorityList.OrderBy(x => x)))
            {
                return (false, "Priority values must be sequential without gaps.");
            }

            return (true, "Valid priority values.");
        }

        public async Task<BusinessResult> GetCriteriasByMasterTypeId(int masterTypeId)
        {
            try
            {

                Expression<Func<MasterType, bool>> filter = x => x.MasterTypeId == masterTypeId
                                                                && x.IsDeleted != true
                                                                && x.TypeName.ToLower().Contains(TypeNameInMasterEnum.Criteria.ToString().ToLower());
                string includeProperties = "Criterias";
                var CriteriaSet = await _unitOfWork.MasterTypeRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (CriteriaSet == null)
                    return new BusinessResult(400, "Criteria set not exist");
                var mappedResult = _mapper.Map<MasterTypeModel>(CriteriaSet);
                return new BusinessResult(200, "Get criteria set success fully", mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //public async Task<string> CheckCriteriaSetExist(int? farmId, List<string> Targetlist)
        //{
        //    try
        //    {
        //        var criteriaSet = await _unitOfWork
        //            .MasterTypeRepository
        //            .CheckTypeIdInTypeName(x => x.FarmID == farmId 
        //            && x.IsDelete == false 
        //            && x.TypeName!.ToLower().Equals(TypeNameInMasterEnum.Criteria.ToString().ToLower())
        //            && x.)
        //    } catch (Exception ex)
        //    {
        //        return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //    }
        //}

        //public async Task<BusinessResult> GetCriteriaSetPlantLotNotApply(int plantlotId, int farmId, string target = null!)
        //{
        //    try
        //    {
        //        if (farmId <= 0)
        //            return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

        //        var checkPlantLotExist = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == plantlotId
        //                                                        && x.isDeleted == false);
        //        if (checkPlantLotExist == null)
        //            return new BusinessResult(400, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
        //        // get len list criteria cua farm do
        //        var listMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypeByName(TypeNameInMasterEnum.Criteria.ToString(), farmId, target: target);
        //        if (listMasterType == null)
        //        {
        //            return new BusinessResult(400, $"Farm has no criteria set in type: {target}");
        //        }
        //        var listCriteriaTargetApplied = _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantLotId: plantlotId);
        //        // group lai theo bo tieu chi
        //        var listCriteria
        //        var listMasterTypeModel = _mapper.Map<List<ForSelectedModels>>(listMasterType);
        //    }
        //    catch (Exception ex)
        //    {
        //        return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //    }
        //}

        public async Task<BusinessResult> GetCriteriaSetPlantLotNotApply(int plantLotId, int farmId, string target)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

                //  1. Kiểm tra PlantLot tồn tại
                var plantLotExist = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == plantLotId && x.IsDeleted == false);
                if (plantLotExist == null)
                    return new BusinessResult(400, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);

                //  2. Lấy tất cả bộ tiêu chí của Farm theo target
                var allCriteriaSets = await _unitOfWork.MasterTypeRepository
                    .GetMasterTypeByName(TypeNameInMasterEnum.Criteria.ToString(), farmId, target);

                if (allCriteriaSets == null || !allCriteriaSets.Any())
                {
                    return new BusinessResult(400, $"Farm has no criteria set in type: {target}");
                }

                // 🔹 3. Lấy danh sách tiêu chí đã áp dụng cho PlantLot
                var appliedCriteriaTargets = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantLotId: plantLotId);
                if (!appliedCriteriaTargets.Any())
                {
                    return new BusinessResult(200, "All criteria sets are not applied yet.", _mapper.Map<List<ForSelectedModels>>(allCriteriaSets));
                }
                // group criteriatarget lai theo mastertypeId (sau khi include criteria với masterType trong hàm GetAllCriteriaOfTargetNoPaging )
                var appliedMasterTypeIds = appliedCriteriaTargets
            .Where(x => x.Criteria != null && x.Criteria.MasterTypeID.HasValue && x.Criteria.MasterType.IsDeleted == false && x.Criteria.MasterType.IsActive == true)
            .Select(x => x.Criteria.MasterTypeID.Value)
            .Distinct() // 🔹 Tránh trùng lặp
            .ToList();


                // 🔹 5. Lọc ra danh sách bộ tiêu chí chưa được áp dụng
                var notAppliedCriteriaSets = allCriteriaSets
                    .Where(x => !appliedMasterTypeIds.Contains(x.MasterTypeId))
                    .ToList();

                if (!notAppliedCriteriaSets.Any())
                    return new BusinessResult(200, "All criteria sets have been applied.", new List<object>());

                // 🔹 6. Map dữ liệu & trả về danh sách bộ tiêu chí chưa được áp dụng
                var listMasterTypeModel = _mapper.Map<List<ForSelectedModels>>(notAppliedCriteriaSets);
                return new BusinessResult(200, "Criteria sets not applied retrieved successfully.", listMasterTypeModel);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetCriteriaSetGraftedNotApply(int graftedId, int farmId, string target)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

                // 1. Kiểm tra PlantLot tồn tại
                var graftedPlantExist = await _unitOfWork.GraftedPlantRepository.GetByCondition(x => x.GraftedPlantId == graftedId && x.IsDeleted == false);
                if (graftedPlantExist == null)
                    return new BusinessResult(400, "Grafted plant not exist");

                // 2. Lấy tất cả bộ tiêu chí của Farm theo target
                var allCriteriaSets = await _unitOfWork.MasterTypeRepository
                    .GetMasterTypeByName(TypeNameInMasterEnum.Criteria.ToString(), farmId, target);

                if (allCriteriaSets == null || !allCriteriaSets.Any())
                {
                    return new BusinessResult(400, $"Farm has no criteria set in type: {target}");
                }

                // 3. Lấy danh sách tiêu chí đã áp dụng cho PlantLot
                var appliedCriteriaTargets = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(graftedPlantId: graftedId);
                if (!appliedCriteriaTargets.Any())
                {
                    return new BusinessResult(200, "All criteria sets are not applied yet.", _mapper.Map<List<ForSelectedModels>>(allCriteriaSets));
                }
                // group criteriatarget lai theo mastertypeId (sau khi include criteria với masterType trong hàm GetAllCriteriaOfTargetNoPaging )
                var appliedMasterTypeIds = appliedCriteriaTargets
                    .Where(x => x.Criteria != null && x.Criteria.MasterTypeID.HasValue && x.Criteria.MasterType!.IsDeleted == false && x.Criteria.MasterType.IsActive == true)
                    .Select(x => x.Criteria!.MasterTypeID!.Value)
                    .Distinct() //  Tránh trùng lặp
                    .ToList();


                //  5. Lọc ra danh sách bộ tiêu chí chưa được áp dụng
                var notAppliedCriteriaSets = allCriteriaSets
                    .Where(x => !appliedMasterTypeIds.Contains(x.MasterTypeId))
                    .ToList();

                if (!notAppliedCriteriaSets.Any())
                    return new BusinessResult(200, "All criteria sets have been applied.", new List<object>());

                // 6. Map dữ liệu & trả về danh sách bộ tiêu chí chưa được áp dụng
                var listMasterTypeModel = _mapper.Map<List<ForSelectedModels>>(notAppliedCriteriaSets);
                return new BusinessResult(200, "Criteria sets not applied retrieved successfully.", listMasterTypeModel);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetCriteriaSetPlantNotApply(int plantId, int farmId, string target)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

                // 1. Kiểm tra PlantLot tồn tại
                var graftedPlantExist = await _unitOfWork.PlantRepository.GetByCondition(x => x.PlantId == plantId && x.IsDeleted == false);
                if (graftedPlantExist == null)
                    return new BusinessResult(400, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);

                // 2. Lấy tất cả bộ tiêu chí của Farm theo target
                var allCriteriaSets = await _unitOfWork.MasterTypeRepository
                    .GetMasterTypeByName(TypeNameInMasterEnum.Criteria.ToString(), farmId, target);

                if (allCriteriaSets == null || !allCriteriaSets.Any())
                {
                    return new BusinessResult(400, $"Farm has no criteria set in type: {target}");
                }

                // 3. Lấy danh sách tiêu chí đã áp dụng cho PlantLot
                var appliedCriteriaTargets = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId);
                if (!appliedCriteriaTargets.Any())
                {
                    return new BusinessResult(200, "All criteria sets are not applied yet.", _mapper.Map<List<ForSelectedModels>>(allCriteriaSets));
                }
                // group criteriatarget lai theo mastertypeId (sau khi include criteria với masterType trong hàm GetAllCriteriaOfTargetNoPaging )
                var appliedMasterTypeIds = appliedCriteriaTargets
                    .Where(x => x.Criteria != null && x.Criteria.MasterTypeID.HasValue && x.Criteria.MasterType!.IsDeleted == false && x.Criteria.MasterType.IsActive == true)
                    .Select(x => x.Criteria!.MasterTypeID!.Value)
                    .Distinct() //  Tránh trùng lặp
                    .ToList();


                //  5. Lọc ra danh sách bộ tiêu chí chưa được áp dụng
                var notAppliedCriteriaSets = allCriteriaSets
                    .Where(x => !appliedMasterTypeIds.Contains(x.MasterTypeId))
                    .ToList();

                if (!notAppliedCriteriaSets.Any())
                    return new BusinessResult(200, "All criteria sets have been applied.", new List<object>());

                // 6. Map dữ liệu & trả về danh sách bộ tiêu chí chưa được áp dụng
                var listMasterTypeModel = _mapper.Map<List<ForSelectedModels>>(notAppliedCriteriaSets);
                return new BusinessResult(200, "Criteria sets not applied retrieved successfully.", listMasterTypeModel);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
