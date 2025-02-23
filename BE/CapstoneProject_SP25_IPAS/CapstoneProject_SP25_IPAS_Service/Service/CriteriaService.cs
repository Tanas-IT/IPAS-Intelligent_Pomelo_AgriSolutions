using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.CriteriaModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.IService;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class CriteriaService : ICriteriaService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private IFarmService _farmService;
        public CriteriaService(IUnitOfWork unitOfWork, IMapper mapper, IFarmService farmService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _farmService = farmService;
        }

        public async Task<BusinessResult> UpdateListCriteriaInType(ListCriteriaUpdateRequest listUpdate)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    var masterType = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.MasterTypeId == listUpdate.MasterTypeId, "CriteriaMasterTypes");

                    if (masterType == null)
                        return new BusinessResult(Const.FAIL_GET_MASTER_TYPE_CODE, Const.FAIL_GET_MASTER_TYPE_DETAIL_MESSAGE);

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
                            var existingCriteria = await _unitOfWork.CriteriaRepository.GetByID(int.Parse(existingCriteriaDict[request.CriteriaId.Value].ToString()));
                            existingCriteria.CriteriaName = request.CriteriaName;
                            existingCriteria.CriteriaDescription = request.CriteriaDescription;
                            existingCriteria.Priority = request.Priority;
                            criteriaToUpdate.Add(existingCriteria);
                            receivedCriteriaIds.Add(request.CriteriaId.Value);
                        }
                        else
                        {
                            // Thêm mới
                            var newCriteria = new Criteria
                            {
                                CriteriaName = request.CriteriaName,
                                CriteriaDescription = request.CriteriaDescription,
                                Priority = request.Priority,
                                IsActive = true,
                            };
                            criteriaToAdd.Add(newCriteria);
                        }
                    }

                    // Tìm các phần tử cần xóa (không có trong danh sách cập nhật
                    var criteriaToRemove = masterType.Criterias.Where(c => !receivedCriteriaIds.Contains(c.CriteriaId)).ToList();


                    // Thực hiện các thao tác với EF
                    if (criteriaToUpdate.Any()) _unitOfWork.CriteriaRepository.UpdateRange(criteriaToUpdate);
                    if (criteriaToAdd.Any()) await _unitOfWork.CriteriaRepository.InsertRangeAsync(criteriaToAdd);
                    if (criteriaToRemove.Any()) _unitOfWork.CriteriaRepository.RemoveRange(criteriaToRemove);

                    // Luu thay đổi
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var criteriaOfterUpdate = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.MasterTypeId == listUpdate.MasterTypeId, "Criteria");
                        var afterUpdate = _mapper.Map<MasterTypeModel>(criteriaOfterUpdate);
                        return new BusinessResult(Const.SUCCESS_UPDATE_CRITERIA_CODE, Const.SUCCESS_UPDATE_CRITERIA_MSG, afterUpdate);
                    }
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

                    var criteria = await _unitOfWork.CriteriaRepository.GetByCondition(x => x.CriteriaId == criteriaUpdateRequests.CriteriaId);
                    if (criteria == null) return new BusinessResult(Const.FAIL_GET_CRITERIA_BY_ID_CODE, Const.FAIL_GET_CRITERIA_BY_ID_MSG);
                    criteria.CriteriaName = criteriaUpdateRequests.CriteriaName;
                    criteria.CriteriaDescription = criteriaUpdateRequests.CriteriaDescription;
                    criteria.Priority = criteriaUpdateRequests.Priority;
                    criteria.IsActive = criteriaUpdateRequests.IsActive;

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
                    return new BusinessResult(Const.WARNING_GET_CRITERIA_OF_PLANT_EMPTY_CODE, Const.WARNING_GET_CRITERIA_OF_PLANT_EMPTY_MSG);
                }

                var groupedData = criteriaByType
                    .Where(pc => pc.Criteria?.MasterType != null) // Lọc các tiêu chí có MasterType
                    .GroupBy(pc => pc.Criteria!.MasterType!.MasterTypeId) // Nhóm theo MasterTypeId
                    .Select(group => new GroupedCriteriaModel
                    {
                        MasterTypeId = group.Key,
                        MasterTypeName = group.First().Criteria!.MasterType!.MasterTypeName!,
                        CriteriaList = group.Select(pc => new CriteriaInfoModel
                        {
                            PlantId = pc.PlantID,
                            GraftedPlantId = pc.GraftedPlantID,
                            PlantLotId = pc.PlantLotID,
                            Priority = pc.Priority,
                            CriteriaId = pc.Criteria!.CriteriaId,
                            CriteriaName = pc.Criteria!.CriteriaName!,
                            IsChecked = pc.isChecked
                        }).ToList()
                    })
                    .ToList();

                return new BusinessResult(Const.SUCCES_GET_PLANT_CRITERIA_CODE, Const.SUCCES_GET_PLANT_CRITERIA_MSG, groupedData);
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

                    var lastedId = await _unitOfWork.MasterTypeRepository.GetLastID();
                    string typename = request.CreateMasTypeRequest.TypeName!.ToString().ToUpper();
                    string code = CodeHelper.GenerateCode();
                    var newMasterType = new MasterType()
                    {
                        MasterTypeCode = $"{CodeAliasEntityConst.MASTER_TYPE}-{DateTime.Now.ToString("ddMMyy")}-{typename}-{code}",
                        MasterTypeName = request.CreateMasTypeRequest.MasterTypeName,
                        MasterTypeDescription = request.CreateMasTypeRequest.MasterTypeDescription,
                        IsActive = request.CreateMasTypeRequest.IsActive,
                        IsDelete = false,
                        IsDefault = false,
                        CreateBy = request.CreateMasTypeRequest.CreateBy,
                        CreateDate = DateTime.Now,
                        TypeName = TypeNameInMasterEnum.Criteria.ToString(),
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
                                IsActive = item.IsActive,
                                CriteriaDescription = item.CriteriaDescription,
                                Priority = item.Priority,
                                IsDefault = false,
                                CriteriaCode = $"{CodeAliasEntityConst.CRITERIA}-{DateTime.Now.ToString("ddMMyy")}-{CodeAliasEntityConst.MASTER_TYPE}{lastedId}-{CodeHelper.GenerateCode}",
                                MasterType = newMasterType,
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

    }
}
