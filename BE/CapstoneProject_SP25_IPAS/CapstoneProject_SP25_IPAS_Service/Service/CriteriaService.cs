using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.IService;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class CriteriaService : ICriteriaService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CriteriaService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> UpdateListCriteriaInType(ListCriteriaUpdateRequest listUpdate)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    var masterType = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.MasterTypeId == listUpdate.MasterTypeId, "Criteria");

                    if (masterType == null)
                        return new BusinessResult(Const.FAIL_GET_MASTER_TYPE_CODE, Const.FAIL_GET_MASTER_TYPE_DETAIL_MESSAGE);

                    // Chuyển danh sách hiện có thành Dictionary để tra cứu nhanh**
                    var existingCriteriaDict = masterType.Criteria.ToDictionary(c => c.CriteriaId);

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
                                MasterTypeId = listUpdate.MasterTypeId
                            };
                            criteriaToAdd.Add(newCriteria);
                        }
                    }

                    // Tìm các phần tử cần xóa (không có trong danh sách cập nhật
                    var criteriaToRemove = masterType.Criteria.Where(c => !receivedCriteriaIds.Contains(c.CriteriaId)).ToList();

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

        public async Task<BusinessResult> GetCriteriaOfPlant(int plantId)
        {
            try
            {
                if (plantId <= 0)
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                var criteriaByType = await _unitOfWork.PlantCriteriaRepository.GetAllCriteriaOfPlantNoPaging(plantId);
                if (!criteriaByType.Any())
                {
                    return new BusinessResult(Const.WARNING_GET_CRITERIA_OF_PLANT_EMPTY_CODE, Const.WARNING_GET_CRITERIA_OF_PLANT_EMPTY_MSG);
                }
                var groupedData = criteriaByType
                       .Where(pc => pc.Criteria.MasterType != null) // Lọc các tiêu chí có MasterType
                       .GroupBy(pc => pc.Criteria.MasterType) // Nhóm theo MasterType
                       .Select(group => new 
                       {
                           MasterTypeId = group.Key.MasterTypeId,
                           MasterTypeName = group.Key.MasterTypeName,
                           CriteriaList = group.Select(pc => new
                           {
                               PlantId = pc.PlantId,
                               Priority = pc.Priority,
                               CriteriaId = pc.Criteria.CriteriaId,
                               CriteriaName = pc.Criteria.CriteriaName,
                               IsChecked = pc.IsChecked
                           }).ToList()
                       })
                       .ToList();

                //var mappedResult = _mapper.Map<List<PlantCriteriaModel>>(groupedData);
                return new BusinessResult(Const.SUCCES_GET_PLANT_CRITERIA_CODE, Const.SUCCES_GET_PLANT_CRITERIA_MSG, groupedData);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
