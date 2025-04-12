using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using System.Linq.Expressions;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class CriteriaTargetService : ICriteriaTargetService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CriteriaTargetService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        //public async Task<BusinessResult> ApplyCriteriasForTarget(CriteriaTargerRequest request)
        //{
        //    using (var transaction = await _unitOfWork.BeginTransactionAsync())
        //    {
        //        try
        //        {
        //            var plantIds = request.PlantID ?? new List<int>();
        //            var graftedPlantIds = request.GraftedPlantID ?? new List<int>();
        //            var plantLotIds = request.PlantLotID ?? new List<int>();

        //            if (!plantIds.Any() && !graftedPlantIds.Any() && !plantLotIds.Any() || !request.CriteriaData.Any())
        //            {
        //                return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
        //            }

        //            // Lấy dữ liệu hiện có để tránh trùng lặp
        //            var existingCriteriaTargets = await _unitOfWork.CriteriaTargetRepository
        //                .GetAllNoPaging(x =>
        //                    (x.PlantID != null && plantIds.Contains(x.PlantID!.Value) ) ||
        //                    (x.GraftedPlantID != null && graftedPlantIds.Contains(x.GraftedPlantID!.Value) ) ||
        //                    (x.PlantLotID != null && plantLotIds.Contains(x.PlantLotID!.Value))
        //                );

        //            var newCriteriaTargets = request.CriteriaData
        //                .SelectMany(criteria =>
        //                    plantIds.Select(targetId => new CriteriaTarget
        //                    {
        //                        PlantID = targetId,
        //                        CriteriaID = criteria.CriteriaId,
        //                        isChecked = criteria.IsChecked,
        //                        Priority = criteria.Priority
        //                    })
        //                    .Concat(graftedPlantIds.Select(targetId => new CriteriaTarget
        //                    {
        //                        GraftedPlantID = targetId,
        //                        CriteriaID = criteria.CriteriaId,
        //                        isChecked = criteria.IsChecked,
        //                        Priority = criteria.Priority
        //                    }))
        //                    .Concat(plantLotIds.Select(targetId => new CriteriaTarget
        //                    {
        //                        PlantLotID = targetId,
        //                        CriteriaID = criteria.CriteriaId,
        //                        isChecked = criteria.IsChecked,
        //                        Priority = criteria.Priority
        //                    }))
        //                )
        //                .Where(x => !existingCriteriaTargets.Any(e =>
        //                    (e.PlantID == x.PlantID && x.PlantID != null) ||
        //                    (e.GraftedPlantID == x.GraftedPlantID && x.GraftedPlantID != null) ||
        //                    (e.PlantLotID == x.PlantLotID && x.PlantLotID != null) &&
        //                    e.CriteriaID == x.CriteriaID
        //                ))
        //                .ToList();

        //            if (newCriteriaTargets.Any())
        //            {
        //                await _unitOfWork.CriteriaTargetRepository.InsertRangeAsync(newCriteriaTargets);
        //                var resultSave = await _unitOfWork.SaveAsync();
        //                if (resultSave > 0)
        //                {
        //                    await transaction.CommitAsync();
        //                    return new BusinessResult(Const.SUCCESS_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_CODE, $"Apply {request.CriteriaData.Count()} criteria for selected {newCriteriaTargets.Count} objects success", new { success = true });
        //                }
        //            }

        //            await transaction.RollbackAsync();
        //            return new BusinessResult(Const.FAIL_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_CODE, Const.FAIL_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_MSG, new { success = false });
        //        }
        //        catch (Exception ex)
        //        {
        //            await transaction.RollbackAsync();
        //            return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //        }
        //    }
        //}

        public async Task<BusinessResult> ApplyCriteriasForTarget(ApplyCriteriaForTargetRequest request)
        {
            //using (var transaction = await _unitOfWork.BeginTransactionAsync())
            //{
            try
            {
                //var (plantIds, graftedPlantIds, plantLotIds) = ExtractTargetIds(request);
                var (graftedPlantIds, plantLotIds) = await ExtractTargetIds(request);

                if (/*!plantIds.Any() &&*/ !graftedPlantIds.Any() && !plantLotIds.Any() || !request.CriteriaData.Any())
                {
                    return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, "You no select any object or All of them can not apply more criteria");
                }

                //var existingCriteriaTargets = await GetExistingCriteriaTargets(plantIds, graftedPlantIds, plantLotIds);
                var existingCriteriaTargets = await GetExistingCriteriaTargets(null, graftedPlantIds, plantLotIds);

                var newCriteriaTargets = GenerateNewCriteriaTargets(request.CriteriaData, null!, graftedPlantIds, plantLotIds, existingCriteriaTargets);

                if (newCriteriaTargets.Any())
                {
                    await _unitOfWork.CriteriaTargetRepository.InsertRangeAsync(newCriteriaTargets);
                    var resultSave = await _unitOfWork.SaveAsync();
                    if (resultSave > 0)
                    {
                        int numberObjectHasApply = 0;
                        //numberObjectHasApply = request.PlantId!.Any() ? request.PlantId!.Count() : numberObjectHasApply;
                        numberObjectHasApply = plantLotIds.Any() ? plantLotIds.Count() : numberObjectHasApply;
                        numberObjectHasApply = graftedPlantIds.Any() ? graftedPlantIds.Count() : numberObjectHasApply;

                        //await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_CODE,
                            $"Apply {request.CriteriaData.Count()} criteria for selected {numberObjectHasApply} objects success", new { success = true });
                    }
                }

                //await transaction.RollbackAsync();
                return new BusinessResult(Const.FAIL_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_CODE, Const.FAIL_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_MSG, new { success = false });
            }
            catch (Exception ex)
            {
                //await transaction.RollbackAsync();
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
            //}
        }


        public async Task<BusinessResult> UpdateCriteriaMultipleTarget(UpdateCriteriaTargerRequest updateRequest, bool allowOverride)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // Kiểm tra đầu vào hợp lệ
                    if (!updateRequest.PlantId!.Any() && !updateRequest.GraftedPlantId!.Any() && !updateRequest.PlantLotId!.Any())
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_CRITERIA_CODE, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                    }
                    int countTarget = 0;
                    // Cập nhật tiêu chí cho từng nhóm đối tượng (Plant / GraftedPlant / PlantLot)
                    if (updateRequest.PlantId.Any())
                    {
                        foreach (var plantId in updateRequest.PlantId)
                        {
                            await UpdateCriteria(plantId, null, null, updateRequest.CriteriaData, allowOverride);
                            countTarget++;
                        }
                    }

                    if (updateRequest.GraftedPlantId.Any())
                    {
                        foreach (var graftedPlantId in updateRequest.GraftedPlantId)
                        {
                            await UpdateCriteria(null, graftedPlantId, null, updateRequest.CriteriaData, allowOverride);
                            countTarget++;
                        }
                    }

                    if (updateRequest.PlantLotId.Any())
                    {
                        foreach (var plantLotId in updateRequest.PlantLotId)
                        {
                            await UpdateCriteria(null, null, plantLotId, updateRequest.CriteriaData, allowOverride);
                            countTarget++;
                        }
                    }

                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_UPDATE_CRITERIA_CODE, $"Success update {updateRequest.CriteriaData.Count()} for {countTarget} row", new { success = true });
                    }
                    else return new BusinessResult(Const.FAIL_UPDATE_CRITERIA_CODE, Const.FAIL_UPDATE_CRITERIA_MSG, new { success = false });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }



        //public async Task<BusinessResult> CheckCriteriaForPlant(CheckPlantCriteriaRequest checkPlantCriteriaRequest)
        //{
        //    using (var transaction = await _unitOfWork.BeginTransactionAsync())
        //    {
        //        try
        //        {
        //            foreach (var criteria in checkPlantCriteriaRequest.criteriaDatas)
        //            {
        //                Expression<Func<CriteriaTarget, bool>> filter = x => x.CriteriaID == criteria.CriteriaId && x.PlantID == checkPlantCriteriaRequest.PlantId;
        //                var plantCriteria = await _unitOfWork.CriteriaTargetRepository.GetByCondition(filter);
        //                // neu khong co doi tuong thi bo qua luon, khoi update
        //                if (plantCriteria != null)
        //                {
        //                    plantCriteria.isChecked = criteria.IsChecked;
        //                }
        //                _unitOfWork.CriteriaTargetRepository.Update(plantCriteria!);
        //            }
        //            int result = await _unitOfWork.SaveAsync();
        //            if (result > 0)
        //            {
        //                await transaction.CommitAsync();
        //                var newPlantCriteria = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfPlantNoPaging(checkPlantCriteriaRequest.PlantId);
        //                return new BusinessResult(Const.SUCCES_CHECK_PLANT_CRITERIA_CODE, Const.SUCCES_CHECK_PLANT_CRITERIA_MSG, newPlantCriteria);
        //            }
        //            else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE, new { success = false });
        //        }
        //        catch (Exception ex)
        //        {
        //            return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //        }
        //    }
        //}

        public async Task<BusinessResult> CheckingCriteriaForGrafted(CheckGraftedCriteriaRequest request)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if ((/*!request.PlantID.Any() &&*/ !request.GraftedPlantID.Any() /*&& !request.PlantLotID.Any()*/) || !request.criteriaDatas.Any())
                    {
                        return new BusinessResult(500, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                    }

                    // Lấy danh sách CriteriaTarget phù hợp với danh sách đầu vào
                    var CriteriaTargetList = new List<CriteriaTarget>();
                    var listCheckId = request.criteriaDatas.Select(x => x.CriteriaId).ToList();
                    if (request.GraftedPlantID!.Any())
                    {
                        CriteriaTargetList = (await _unitOfWork.CriteriaTargetRepository
                        .GetAllNoPaging(filter: x => request.GraftedPlantID!.Contains(x.GraftedPlantID.Value) && listCheckId.Contains(x.CriteriaID!.Value), includeProperties: "Criteria")).ToList();
                    }

                    if (!CriteriaTargetList.Any())
                    {
                        return new BusinessResult(Const.FAIL_GET_CRITERIA_CODE, "Don't have criteria to complete task");
                    }

                    var criteriaDict = request.criteriaDatas.ToDictionary(c => c.CriteriaId);

                    foreach (var plantCriteria in CriteriaTargetList)
                    {
                        if (plantCriteria.CriteriaID.HasValue && criteriaDict.TryGetValue(plantCriteria.CriteriaID.Value, out var criteriaData))
                        {
                            // Cập nhật trạng thái `IsChecked`
                            //if (criteriaData.IsChecked.HasValue)
                            if (criteriaData.ValueChecked.HasValue)
                            {
                                plantCriteria.ValueChecked = criteriaData.ValueChecked;
                                plantCriteria.CheckedDate = DateTime.Now;
                            }

                            if (plantCriteria.Criteria!.MinValue.HasValue && plantCriteria.Criteria.MaxValue.HasValue)
                            {
                                if (criteriaData.ValueChecked >= plantCriteria.Criteria!.MinValue && criteriaData.ValueChecked <= plantCriteria.Criteria.MaxValue)
                                {
                                    plantCriteria.IsPassed = true;
                                }
                                if (criteriaData.ValueChecked < plantCriteria.Criteria!.MinValue || criteriaData.ValueChecked > plantCriteria.Criteria.MaxValue)
                                {
                                    plantCriteria.IsPassed = false;
                                }
                            }
                            //else
                            //{
                            //    plantCriteria.IsPassed = criteriaData.IsPassed;
                            //}
                        }
                        plantCriteria.Criteria = null;
                    }
                    // Cập nhật danh sách CriteriaTarget 
                    _unitOfWork.CriteriaTargetRepository.UpdateRange(CriteriaTargetList);

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

        public async Task<BusinessResult> UpdateCriteriaForSingleTarget(UpdateCriteriaTargetRequest updateRequest, bool allowOverride)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // Xác định loại đối tượng duy nhất (Plant, GraftedPlant hoặc PlantLot)
                    if (updateRequest.PlantID.HasValue)
                    {
                        await UpdateCriteria(updateRequest.PlantID, null, null, updateRequest.CriteriaData, allowOverride);
                    }
                    else if (updateRequest.GraftedPlantID.HasValue)
                    {
                        await UpdateCriteria(null, updateRequest.GraftedPlantID, null, updateRequest.CriteriaData, allowOverride);
                    }
                    else if (updateRequest.PlantLotID.HasValue)
                    {
                        await UpdateCriteria(null, null, updateRequest.PlantLotID, updateRequest.CriteriaData, allowOverride);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_CRITERIA_CODE, "Không có ID hợp lệ!");
                    }

                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_UPDATE_CRITERIA_CODE, $"Success update {updateRequest.CriteriaData.Count()} criteria of object", new { success = true });
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_CRITERIA_CODE, Const.FAIL_UPDATE_CRITERIA_MSG, new { success = false });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        private async Task UpdateCriteria(int? plantId, int? graftedPlantId, int? plantLotId, List<CriteriaData> criteriaData, bool allowOverride)
        {
            // Lấy danh sách tiêu chí hiện tại của đối tượng (Plant, GraftedPlant hoặc PlantLot)
            var existingCriteria = await _unitOfWork.CriteriaTargetRepository.GetAllNoPaging(x =>
                (plantId.HasValue && x.PlantID == plantId) ||
                (graftedPlantId.HasValue && x.GraftedPlantID == graftedPlantId) ||
                (plantLotId.HasValue && x.PlantLotID == plantLotId)
            );

            // Lấy danh sách CriteriaId mới từ request
            var newCriteriaIds = criteriaData.Select(c => c.CriteriaId).ToList();

            // XÓA các tiêu chí cũ không còn trong danh sách mới
            var criteriaToRemove = existingCriteria.Where(x => !newCriteriaIds.Contains(x.CriteriaID!.Value)).ToList();
            if (criteriaToRemove.Any())
            {
                _unitOfWork.CriteriaTargetRepository.RemoveRange(criteriaToRemove);
            }

            // Danh sách tiêu chí mới để thêm
            var criteriaToAdd = new List<CriteriaTarget>();

            foreach (var criteria in criteriaData)
            {
                var existing = existingCriteria.FirstOrDefault(x => x.CriteriaID == criteria.CriteriaId);

                if (existing != null)
                {
                    if (!allowOverride && /*existing.IsChecked.HasValue*/ existing.ValueChecked.HasValue)
                        continue;

                    //existing.IsChecked = criteria.IsChecked;
                    existing.ValueChecked = criteria.ValueChecked;
                    existing.Priority = criteria.Priority;
                    _unitOfWork.CriteriaTargetRepository.Update(existing);
                }
                else
                {
                    criteriaToAdd.Add(new CriteriaTarget
                    {
                        CriteriaID = criteria.CriteriaId,
                        //IsChecked = criteria.IsChecked,
                        ValueChecked = criteria.ValueChecked,
                        Priority = criteria.Priority,
                        PlantID = plantId,
                        GraftedPlantID = graftedPlantId,
                        PlantLotID = plantLotId,
                    });
                }
            }

            // Thêm mới tiêu chí vào DB
            if (criteriaToAdd.Any())
            {
                await _unitOfWork.CriteriaTargetRepository.InsertRangeAsync(criteriaToAdd);
            }
        }

        public async Task<BusinessResult> DelteteCriteriaForMultipleTarget(DeleteCriteriaTargetRequest deleteRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // Kiểm tra đầu vào hợp lệ
                    if (!deleteRequest.PlantId!.Any() && !deleteRequest.GraftedPlantId!.Any() && !deleteRequest.PlantLotId!.Any())
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_CRITERIA_CODE, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                    }
                    if (!deleteRequest.CriteriaSetId.Any())
                    {
                        return new BusinessResult(400, "Can not found any criteria to delete");
                    }
                    var existingCriteriaTargets = await _unitOfWork.CriteriaTargetRepository
                               .GetWithMasterType(x =>
                                   (deleteRequest.PlantId!.Contains(x.PlantID) ||
                                    deleteRequest.GraftedPlantId!.Contains(x.GraftedPlantID) ||
                                    deleteRequest.PlantLotId!.Contains(x.PlantLotID))
                               );
                    if (!existingCriteriaTargets.Any())
                    {
                        return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, "Cannot find any criteria to delete.");
                    }
                    if (deleteRequest.clearAllCriteria)
                    {
                        _unitOfWork.CriteriaTargetRepository.RemoveRange(existingCriteriaTargets);
                        int result1 = await _unitOfWork.SaveAsync();
                        if (result1 > 0)
                        {
                            await transaction.CommitAsync();
                            int numberObjectHasApply = 0;
                            numberObjectHasApply = deleteRequest.PlantId!.Any() ? deleteRequest.PlantId!.Count() : numberObjectHasApply;
                            numberObjectHasApply = deleteRequest.PlantLotId!.Any() ? deleteRequest.PlantLotId!.Count() : numberObjectHasApply;
                            numberObjectHasApply = deleteRequest.GraftedPlantId!.Any() ? deleteRequest.GraftedPlantId!.Count() : numberObjectHasApply;
                            return new BusinessResult(Const.SUCCES_DELETE_CRITERIA_TARGET_CODE, $"Clear all criteria of {numberObjectHasApply} success");
                        }
                        else
                        {
                            return new BusinessResult(Const.FAIL_DELETE_CRITERIA_CODE, Const.FAIL_DELETE_CRITERIA_MSG);
                        }
                    }
                    existingCriteriaTargets = existingCriteriaTargets.Where(x =>
                    deleteRequest.CriteriaSetId.Contains(x.Criteria!.MasterTypeID!.Value)).ToList();
                    foreach (var existingCriteriaTarget in existingCriteriaTargets)
                    {
                        existingCriteriaTarget.Criteria = null!;
                    }
                    // Xoá các tiêu chí
                    _unitOfWork.CriteriaTargetRepository.RemoveRange(existingCriteriaTargets);

                    // Lưu thay đổi vào database
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCES_DELETE_CRITERIA_TARGET_CODE, $"Delete {deleteRequest.CriteriaSetId.Count()} criteria set success.");
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_DELETE_CRITERIA_CODE, Const.FAIL_DELETE_CRITERIA_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }
        //public async Task<BusinessResult> DelteteCriteriaForMultipleTarget(DeleteCriteriaTargetRequest request)
        //{
        //    using (var transaction = await _unitOfWork.BeginTransactionAsync())
        //    {
        //        try
        //        {
        //            // Đảm bảo chỉ có một danh sách được truyền vào
        //            //var targetList = request.PlantID?.Cast<int?>().ToList() ??
        //            //                 request.GraftedPlantID?.Cast<int?>().ToList() ??
        //            //                 request.PlantLotID?.Cast<int?>().ToList();
        //            var targetList = request.PlantLotID?.Any() == true ? request.PlantLotID.Cast<int?>().ToList()
        //        : request.GraftedPlantID?.Any() == true ? request.GraftedPlantID.Cast<int?>().ToList()
        //        : request.PlantID?.Any() == true ? request.PlantID.Cast<int?>().ToList()
        //        : new List<int?>();

        //            if (targetList.IsNullOrEmpty() || request.CriteriaList.IsNullOrEmpty())
        //            {
        //                return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
        //            }

        //            // Lấy dữ liệu hiện có trong database để tránh thêm trùng lặp
        //            var existingCriteriaTargets = await _unitOfWork.CriteriaTargetRepository
        //                .GetAllNoPaging(x => targetList!.Contains(x.PlantID) ||
        //                                targetList.Contains(x.GraftedPlantID) ||
        //                                targetList.Contains(x.PlantLotID));

        //            // Nếu không tìm thấy tiêu chí nào để xoá
        //            if (!existingCriteriaTargets.Any())
        //            {
        //                return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, "Can not found any criteria to delete");
        //            }
        //            else if (request.clearAllCriteria == false)
        //            {
        //                // new ko can clear tat ca criteria cua list object thi xoa tung cai criteria duoc truyen xuong
        //                existingCriteriaTargets = existingCriteriaTargets.Where(x => request.CriteriaList.Contains(x.CriteriaID!.Value));
        //            }

        //            // Xoá các tiêu chí
        //            _unitOfWork.CriteriaTargetRepository.RemoveRange(existingCriteriaTargets);

        //            // Lưu thay đổi vào database
        //            int result = await _unitOfWork.SaveAsync();
        //            if (result > 0)
        //            {
        //                await transaction.CommitAsync();
        //                return new BusinessResult(Const.SUCCES_DELETE_CRITERIA_TARGET_CODE, Const.SUCCES_DELETE_CRITERIA_TARGET_MSG);
        //            }
        //            else
        //            {
        //                return new BusinessResult(Const.FAIL_DELETE_CRITERIA_CODE, Const.FAIL_DELETE_CRITERIA_MSG);
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            await transaction.RollbackAsync();
        //            return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //        }
        //    }
        //}

        public async Task<(bool enable, string ErrorMessage)> CheckCriteriaComplete(int? plantId, int? graftedId, int? plantLotId, List<string> TargetsList)
        {
            try
            {
                // Lấy danh sách tiêu chí hiện tại của đối tượng (Plant, GraftedPlant hoặc PlantLot)
                var existingCriteria = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId, graftedPlantId: graftedId, plantLotId: plantLotId);
                if (!existingCriteria.Any())
                    return (false, $"You must apply criteriaSet before: {string.Join(", ", TargetsList)}");
                //var targetSplit = Util.SplitByComma(TargetsList);
                existingCriteria = existingCriteria.Where(x => TargetsList.Contains(x.Criteria!.MasterType!.Target!) && x.IsPassed == false);
                if (existingCriteria.Any())
                    return (false, $"You must completed all criteria of '{string.Join(", ", TargetsList)}' before.");
                return (true, "All of criteria is complete");
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        private async Task<(/*List<int> plantIds,*/ List<int> graftedPlantIds, List<int> plantLotIds)> ExtractTargetIds(ApplyCriteriaForTargetRequest request)
        {

            //return (
            //    //request.PlantId ?? new List<int>(),
            //    request.GraftedPlantId ?? new List<int>(),
            //    request.PlantLotId ?? new List<int>()
            //);
            var graftedPlantIds = request.GraftedPlantId ?? new List<int>();
            var plantLotIds = request.PlantLotId ?? new List<int>();
            if (graftedPlantIds.Any())
            {
                var graftedPlants = await _unitOfWork.GraftedPlantRepository
                    .GetAllNoPaging(gp => graftedPlantIds.Contains(gp.GraftedPlantId) && (gp.IsCompleted == null || gp.IsCompleted == false));
                graftedPlantIds = graftedPlants.Select(gp => gp.GraftedPlantId).ToList();
            }
            if (plantLotIds.Any())
            {
                var plantLots = await _unitOfWork.PlantLotRepository
                    .GetAllNoPaging(pl => plantLotIds.Contains(pl.PlantLotId) && (pl.IsPassed == null || pl.IsPassed == false));
                plantLotIds = plantLots.Select(pl => pl.PlantLotId).ToList();
            }

            return (graftedPlantIds, plantLotIds);
        }

        private async Task<List<CriteriaTarget>> GetExistingCriteriaTargets(List<int>? plantIds, List<int>? graftedPlantIds, List<int>? plantLotIds)
        {
            plantIds ??= new List<int>();
            graftedPlantIds ??= new List<int>();
            plantLotIds ??= new List<int>();

            var existingCriteriaTargets = await _unitOfWork.CriteriaTargetRepository
                .GetAllNoPaging(x =>
                    (x.PlantID.HasValue && plantIds.Count > 0 && plantIds.Contains(x.PlantID.Value)) ||
                    (x.GraftedPlantID.HasValue && graftedPlantIds.Count > 0 && graftedPlantIds.Contains(x.GraftedPlantID.Value)) ||
                    (x.PlantLotID.HasValue && plantLotIds.Count > 0 && plantLotIds.Contains(x.PlantLotID.Value))
                );

            return existingCriteriaTargets.ToList();
        }
        /// <summary>
        /// tu criteria truyen vao - criteria da co - bo nhung cai da trung voi nhau --> Add criteria vao
        /// </summary>
        /// <param name="criteriaData">Criteria se add vao tu ben ngoai</param>
        /// <param name="plantIds"></param>
        /// <param name="graftedPlantIds"></param>
        /// <param name="plantLotIds"></param>
        /// <param name="existingCriteriaTargets">Cac criteria da duoc add vao tu truoc</param>
        /// <returns></returns>
        private List<CriteriaTarget> GenerateNewCriteriaTargets(List<CriteriaData> criteriaData, List<int> plantIds, List<int> graftedPlantIds, List<int> plantLotIds, List<CriteriaTarget> existingCriteriaTargets)
        {
            plantIds ??= new List<int>();
            graftedPlantIds ??= new List<int>();
            plantLotIds ??= new List<int>();

            return criteriaData
                .SelectMany(criteria =>
                    plantIds.Select(targetId => CreateCriteriaTarget(targetId, null, null, criteria))
                    .Concat(graftedPlantIds.Select(targetId => CreateCriteriaTarget(null, targetId, null, criteria)))
                    .Concat(plantLotIds.Select(targetId => CreateCriteriaTarget(null, null, targetId, criteria)))
                )
                .Where(x => !IsDuplicate(x, existingCriteriaTargets))
                .ToList();
        }
        private CriteriaTarget CreateCriteriaTarget(int? plantId, int? graftedPlantId, int? plantLotId, CriteriaData criteria)
        {
            var newCriteriaTarget = new CriteriaTarget
            {
                PlantID = plantId,
                GraftedPlantID = graftedPlantId,
                PlantLotID = plantLotId,
                CriteriaID = criteria.CriteriaId,
                //IsChecked = false,
                ValueChecked = null,
                Priority = criteria.Priority,
                CreateDate = DateTime.Now,
                IsPassed = false,
            };
            return newCriteriaTarget;
        }
        private bool IsDuplicate(CriteriaTarget newTarget, List<CriteriaTarget> existingTargets)
        // kiem tra xem criteria do da dc ap dung cho cay do chua
        {
            var result = existingTargets.Any(e =>
             ((e.PlantID == newTarget.PlantID && newTarget.PlantID != null) ||
             (e.GraftedPlantID == newTarget.GraftedPlantID && newTarget.GraftedPlantID != null) ||
             (e.PlantLotID == newTarget.PlantLotID && newTarget.PlantLotID != null)) &&
             e.CriteriaID == newTarget.CriteriaID
         );
            return result;
        }

        /// <summary>
        /// Apply cho plant neu co cai condition nao trong grafted condition thi phai reset lai cai ispass của chiết cành
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public async Task<BusinessResult> ApplyCriteriasForPlant(ApplyCriteriaForPlantRequest request)
        {
            try
            {
                if (!request.CriteriaData.Any())
                {
                    return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                }

                #region kiem tra xem neu co cai nao la condition check pass thi update IsPass cua Plant lai
                // kiem tra xem neu co bat ki critera nao la condition grafted thi Tra ve not pass hết
                var flag = false;
                var requiredCondition = await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x => x.ConfigGroup.ToLower().Equals(SystemConfigConst.GRAFTED_CONDITION_APPLY.ToLower()));
                var ConditionList = requiredCondition.Any() ? requiredCondition.Select(x => x.ConfigKey.ToLower()!).ToList() : new List<string>();
                var insertedCriteriaID = request.CriteriaData.Select(x => x.CriteriaId);
                Expression<Func<Criteria, bool>> filter = x => insertedCriteriaID.Contains(x.CriteriaId) &&
                                                            ConditionList.Contains(x.MasterType!.Target!.ToLower());

                var criteriaGraftedInsert = await _unitOfWork.CriteriaRepository.GetAllNoPaging(filter: filter, includeProperties: "MasterType");
                var plants = await _unitOfWork.PlantRepository.GetAllNoPaging(x => request.PlantIds.Contains(x.PlantId), includeProperties: "GrowthStage");

                if (criteriaGraftedInsert.Any())
                {
                    flag = true; // neu co bat kia tieu chi nao la chiet canh
                    foreach (var plant in plants)
                    {
                        List<string> ActFunction = Util.SplitByComma(plant.GrowthStage!.ActiveFunction!);
                        if (!ActFunction.Any())
                        {
                            return new BusinessResult(400, $"Plant code:{plant.PlantCode} not in stage can Grafted to apply ");
                        }
                        bool checkPlantInGrafted = ActFunction.Contains(ActFunctionGrStageEnum.Grafted.ToString().ToLower());
                        if (!checkPlantInGrafted)
                            return new BusinessResult(400, $"Plant code: {plant.PlantCode} not in stage can Grafted to apply ");
                        plant.GrowthStage = null!;
                    }
                }
                #endregion

                var existingCriteriaTargets = await GetExistingCriteriaTargets(request.PlantIds, null!, null!);

                var newCriteriaTargets = GenerateNewCriteriaTargets(request.CriteriaData, request.PlantIds, null!, null!, existingCriteriaTargets);
                if (newCriteriaTargets.Any())
                {
                    await _unitOfWork.CriteriaTargetRepository.InsertRangeAsync(newCriteriaTargets);


                    if (criteriaGraftedInsert.Any())
                    {
                        plants.ToList().ForEach(p => p.IsPassed = false);
                        _unitOfWork.PlantRepository.UpdateRange(plants);
                    }

                    var resultSave = await _unitOfWork.SaveAsync();
                    if (resultSave > 0)
                    {
                        int numberObjectHasApply = 0;
                        numberObjectHasApply = request.PlantIds!.Count();

                        //await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_CODE,
                            $"Apply {request.CriteriaData.Count()} criteria for selected {numberObjectHasApply} plant success", new { success = true });
                    }
                }

                return new BusinessResult(Const.FAIL_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_CODE, Const.FAIL_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_MSG, new { success = false });
            }
            catch (Exception ex)
            {
                //await transaction.RollbackAsync();
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
            //}
        }

        public async Task<BusinessResult> ResetPlantCriteria(ResetPlantCriteriaRequest request)
        {
            try
            {
                var checkPlantExist = await _unitOfWork.PlantRepository.GetByID(request.PlantId);
                if (checkPlantExist == null)
                    return new BusinessResult(400, "Plant not exist");
                var checkMsTypeExist = await _unitOfWork.MasterTypeRepository.GetByID(request.MasterTypeId);
                if (checkMsTypeExist == null)
                    return new BusinessResult(400, "Criteria set not exist");
                var criteriaTargetList = (await _unitOfWork.CriteriaTargetRepository
                        .GetWithMasterType(filter: x => x.Criteria!.MasterTypeID == request.MasterTypeId && x.PlantID == request.PlantId)).ToList();

                if (!criteriaTargetList.Any())
                    return new BusinessResult(400, "No criteria was found to reset");

                foreach (var criTarget in criteriaTargetList)
                {
                    criTarget.CheckedDate = null;
                    criTarget.ValueChecked = null;
                    criTarget.IsPassed = false;
                    criTarget.CreateDate = DateTime.Now;
                    criTarget.Criteria = null;
                }
                _unitOfWork.CriteriaTargetRepository.UpdateRange(criteriaTargetList);

                var requiredCondition = await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x => x.ConfigGroup.ToLower().Equals(SystemConfigConst.GRAFTED_CONDITION_APPLY.ToLower()));
                var ConditionList = requiredCondition.Any() ? requiredCondition.Select(x => x.ConfigKey.ToLower()!).ToList() : new List<string>();
                bool isGraftedConditionReset = ConditionList.Contains(checkMsTypeExist.Target!.ToLower());
                if (isGraftedConditionReset)
                {
                    checkPlantExist.IsPassed = false;
                    _unitOfWork.PlantRepository.Update(checkPlantExist);
                }
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    var mappedResult = _mapper.Map<PlantModel>(checkPlantExist);
                    return new BusinessResult(200, $"Reset {criteriaTargetList.Count()} criteria success", mappedResult);
                }
                return new BusinessResult(400, "Reset Criteria fail");
            }
            catch (Exception)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, "Server have some error");
            }
        }

        public async Task<BusinessResult> CheckingCriteriaForPlant(CheckPlantCriteriaRequest request)
        {
            //using (var transaction = await _unitOfWork.BeginTransactionAsync())
            //{
            try
            {
                if (!request.PlantIds.Any() || !request.criteriaDatas.Any())
                {
                    return new BusinessResult(500, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                }

                // Lấy danh sách CriteriaTarget phù hợp với danh sách đầu vào
                var CriteriaTargetList = new List<CriteriaTarget>();
                var criteriaList = request.criteriaDatas.Select(x => x.CriteriaId).ToList();
                if (request.PlantIds!.Any())
                {
                    CriteriaTargetList = (await _unitOfWork.CriteriaTargetRepository
                    .GetAllNoPaging(filter: x => request.PlantIds.Contains(x.PlantID!.Value) && criteriaList.Contains(x.CriteriaID!.Value), includeProperties: "Criteria")).ToList();
                }

                if (!CriteriaTargetList.Any())
                {
                    return new BusinessResult(Const.FAIL_GET_CRITERIA_CODE, "Don't have criteria to complete task");
                }

                var criteriaDict = request.criteriaDatas.ToDictionary(c => c.CriteriaId);

                foreach (var plantCriteria in CriteriaTargetList)
                {
                    if (plantCriteria.CriteriaID.HasValue && criteriaDict.TryGetValue(plantCriteria.CriteriaID.Value, out var criteriaData))
                    {
                        if (criteriaData.ValueChecked.HasValue)
                        {
                            plantCriteria.ValueChecked = criteriaData.ValueChecked;
                            plantCriteria.CheckedDate = DateTime.Now;
                        }

                        if (plantCriteria.Criteria!.MinValue.HasValue && plantCriteria.Criteria.MaxValue.HasValue)
                        {
                            if (criteriaData.ValueChecked >= plantCriteria.Criteria!.MinValue && criteriaData.ValueChecked <= plantCriteria.Criteria.MaxValue)
                            {
                                plantCriteria.IsPassed = true;
                            }
                            if (criteriaData.ValueChecked < plantCriteria.Criteria!.MinValue && criteriaData.ValueChecked > plantCriteria.Criteria.MaxValue)
                            {
                                plantCriteria.IsPassed = true;
                            }
                        }
                    }
                    plantCriteria.Criteria = null;
                }
                // Cập nhật danh sách CriteriaTarget 
                _unitOfWork.CriteriaTargetRepository.UpdateRange(CriteriaTargetList);
                int result = await _unitOfWork.SaveAsync();
                #region update plant pass
                var requiredCondition = await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x => x.ConfigGroup.Trim().ToLower().Equals(SystemConfigConst.GRAFTED_CONDITION_APPLY.Trim().ToLower()));
                var requiredList = requiredCondition.Any() ? requiredCondition.Select(x => x.ConfigKey).ToList() : new List<string>();
                var plants = await _unitOfWork.PlantRepository.GetAllNoPaging(x => request.PlantIds.Contains(x.PlantId) && x.IsDead == false, includeProperties: null!);
                foreach (var pl in plants)
                {
                    var checkResult = await CheckPlantHasCheckCriteriaAsync(plantId: pl.PlantId, requiredList);
                    if (checkResult.StatusCode == 200)
                    {
                        pl.IsPassed = true;
                        pl.PassedDate = DateTime.Now;
                    }
                    else if (checkResult.StatusCode == 250)
                    {
                        pl.IsPassed = false;
                    }
                }
                _unitOfWork.PlantRepository.UpdateRange(plants);
                result += await _unitOfWork.SaveAsync();
                #endregion

                if (result > 0)
                {
                    if (plants.Count() == 1)
                    {
                        var mappedResult = _mapper.Map<PlantModel>(plants.FirstOrDefault());
                        return new BusinessResult(Const.SUCCES_CHECK_PLANT_CRITERIA_CODE, Const.SUCCES_CHECK_PLANT_CRITERIA_MSG, mappedResult);
                    }
                    return new BusinessResult(Const.SUCCES_CHECK_PLANT_CRITERIA_CODE, Const.SUCCES_CHECK_PLANT_CRITERIA_MSG, new { success = true });
                }

                return new BusinessResult(Const.FAIL_CHECK_CRITERIA_TARGET_CODE, Const.FAIL_CHECK_CRITERIA_TARGET_MSG, new { success = false });
            }
            catch (Exception ex)
            {
                //await transaction.RollbackAsync();
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
            //}
        }
        private async Task<BusinessResult> CheckPlantHasCheckCriteriaAsync(int plantId, List<string> criteriaRequireCheck)
        {
            var appliedCriterias = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId);

            // Kiểm tra xem tất cả các tiêu chí phải được check và pass thì mới trả về true 
            // vì có chỉ cần bắt trường hợp tất cả được check nhưng có 1 cái nào đó ko pass để handle
            // có value --> là được check rồi nhưng ko pass
            bool allChecked = appliedCriterias
       .Where(x => criteriaRequireCheck.Contains(x.Criteria!.MasterType!.Target, StringComparer.OrdinalIgnoreCase))
       .All(x => x.ValueChecked.HasValue);

            if (!allChecked)
            {
                return new BusinessResult(250, "The plant lot has not been fully checked.");
            }

            // Kiểm tra xem tất cả các tiêu chí đã check có pass hết hay không
            bool hasCompletedEvaluation = appliedCriterias
                .Where(x => criteriaRequireCheck.Contains(x.Criteria!.MasterType!.Target, StringComparer.OrdinalIgnoreCase))
                .All(x => x.IsPassed == true);
            // neu co cai nao check ma ko pass thi tra loi 300 de handle
            if (!hasCompletedEvaluation)
            {
                return new BusinessResult(300, "The plant lot has not passed all required.");
            }

            return new BusinessResult(200, "The plant lot has successfully completed all required.");
        }
    }
}
