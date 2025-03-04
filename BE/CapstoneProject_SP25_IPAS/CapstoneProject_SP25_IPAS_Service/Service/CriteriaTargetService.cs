using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

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

        public async Task<BusinessResult> ApplyCriteriasForTarget(CriteriaTargerRequest request)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var (plantIds, graftedPlantIds, plantLotIds) = ExtractTargetIds(request);

                    if (!plantIds.Any() && !graftedPlantIds.Any() && !plantLotIds.Any() || !request.CriteriaData.Any())
                    {
                        return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                    }

                    var existingCriteriaTargets = await GetExistingCriteriaTargets(plantIds, graftedPlantIds, plantLotIds);

                    var newCriteriaTargets = GenerateNewCriteriaTargets(request.CriteriaData, plantIds, graftedPlantIds, plantLotIds, existingCriteriaTargets);

                    if (newCriteriaTargets.Any())
                    {
                        await _unitOfWork.CriteriaTargetRepository.InsertRangeAsync(newCriteriaTargets);
                        var resultSave = await _unitOfWork.SaveAsync();
                        if (resultSave > 0)
                        {
                            await transaction.CommitAsync();
                            return new BusinessResult(Const.SUCCESS_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_CODE,
                                $"Apply {request.CriteriaData.Count()} criteria for selected {newCriteriaTargets.Count} objects success", new { success = true });
                        }
                    }

                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_CODE, Const.FAIL_APPLY_LIST_CRITERIA_FOR_TARGER_LIST_MSG, new { success = false });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }


        public async Task<BusinessResult> UpdateCriteriaMultipleTarget(CriteriaTargerRequest updateRequest, bool allowOverride)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // Kiểm tra đầu vào hợp lệ
                    if (!updateRequest.PlantID!.Any() && !updateRequest.GraftedPlantID!.Any() && !updateRequest.PlantLotID!.Any())
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_CRITERIA_CODE, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                    }
                    int countTarget = 0;
                    // Cập nhật tiêu chí cho từng nhóm đối tượng (Plant / GraftedPlant / PlantLot)
                    if (updateRequest.PlantID.Any())
                    {
                        foreach (var plantId in updateRequest.PlantID)
                        {
                            await UpdateCriteria(plantId, null, null, updateRequest.CriteriaData, allowOverride);
                            countTarget++;
                        }
                    }

                    if (updateRequest.GraftedPlantID.Any())
                    {
                        foreach (var graftedPlantId in updateRequest.GraftedPlantID)
                        {
                            await UpdateCriteria(null, graftedPlantId, null, updateRequest.CriteriaData, allowOverride);
                            countTarget++;
                        }
                    }

                    if (updateRequest.PlantLotID.Any())
                    {
                        foreach (var plantLotId in updateRequest.PlantLotID)
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

        public async Task<BusinessResult> CheckingCriteriaForTarget(CheckPlantCriteriaRequest request)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // Xác định danh sách mục tiêu (chỉ lấy một danh sách được truyền vào)
                    var targetList = request.PlantID?.Cast<int?>().ToList() ??
                                     request.GraftedPlantID?.Cast<int?>().ToList() ??
                                     request.PlantLotID?.Cast<int?>().ToList();

                    if (targetList.IsNullOrEmpty() || request.criteriaDatas.IsNullOrEmpty())
                    {
                        return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                    }

                    // Lấy danh sách CriteriaTarget phù hợp với danh sách đầu vào
                    var plantCriteriaList = await _unitOfWork.CriteriaTargetRepository
                        .GetAllNoPaging(x => targetList.Contains(x.PlantID) ||
                                        targetList.Contains(x.GraftedPlantID) ||
                                        targetList.Contains(x.PlantLotID));

                    if (!plantCriteriaList.Any())
                    {
                        return new BusinessResult(Const.FAIL_GET_CRITERIA_CODE, Const.FAIL_GET_CRITERIA_MSG);
                    }

                    // Duyệt qua danh sách request và cập nhật trạng thái isChecked
                    var criteriaDict = request.criteriaDatas.ToDictionary(c => c.CriteriaId, c => c.IsChecked);
                    foreach (var plantCriteria in plantCriteriaList)
                    {
                        if (plantCriteria.CriteriaID.HasValue && criteriaDict.TryGetValue(plantCriteria.CriteriaID.Value, out var isChecked))
                        {
                            plantCriteria.isChecked = isChecked;
                        }
                    }

                    // Cập nhật danh sách CriteriaTarget trong 1 lần thay vì gọi nhiều lần
                    _unitOfWork.CriteriaTargetRepository.UpdateRange(plantCriteriaList);

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
                    if (!allowOverride && existing.isChecked.HasValue)
                        continue;

                    existing.isChecked = criteria.IsChecked;
                    existing.Priority = criteria.Priority;
                    _unitOfWork.CriteriaTargetRepository.Update(existing);
                }
                else
                {
                    criteriaToAdd.Add(new CriteriaTarget
                    {
                        CriteriaID = criteria.CriteriaId,
                        isChecked = criteria.IsChecked,
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


        public async Task<BusinessResult> DelteteCriteriaForMultipleTarget(DeleteCriteriaTargetRequest request)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // Đảm bảo chỉ có một danh sách được truyền vào
                    var targetList = request.PlantID?.Cast<int?>().ToList() ??
                                     request.GraftedPlantID?.Cast<int?>().ToList() ??
                                     request.PlantLotID?.Cast<int?>().ToList();

                    if (targetList.IsNullOrEmpty() || request.CriteriaList.IsNullOrEmpty())
                    {
                        return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                    }

                    // Lấy dữ liệu hiện có trong database để tránh thêm trùng lặp
                    var existingCriteriaTargets = await _unitOfWork.CriteriaTargetRepository
                        .GetAllNoPaging(x => targetList!.Contains(x.PlantID) ||
                                        targetList.Contains(x.GraftedPlantID) ||
                                        targetList.Contains(x.PlantLotID));

                    // Nếu không tìm thấy tiêu chí nào để xoá
                    if (!existingCriteriaTargets.Any())
                    {
                        return new BusinessResult(Const.WARING_OBJECT_REQUEST_EMPTY_CODE, "Can not found any criteria to delete");
                    }
                    else if (request.clearAllCriteria == false)
                    {
                        // new ko can clear tat ca criteria cua list object thi xoa tung cai criteria duoc truyen xuong
                        existingCriteriaTargets = existingCriteriaTargets.Where(x => request.CriteriaList.Contains(x.CriteriaID!.Value));
                    }

                    // Xoá các tiêu chí
                    _unitOfWork.CriteriaTargetRepository.RemoveRange(existingCriteriaTargets);

                    // Lưu thay đổi vào database
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCES_DELETE_CRITERIA_TARGET_CODE, Const.SUCCES_DELETE_CRITERIA_TARGET_MSG);
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

        public async Task<(bool enable, string ErrorMessage)> CheckCriteriaComplete(int? plantId, int? graftedId, int? plantLotId, List<string> TargetsList)
        {
            try
            {
                // Lấy danh sách tiêu chí hiện tại của đối tượng (Plant, GraftedPlant hoặc PlantLot)
                var existingCriteria = await _unitOfWork.CriteriaTargetRepository.GetAllCriteriaOfTargetNoPaging(plantId: plantId, graftedPlantId: graftedId, plantLotId: plantLotId);
                if (existingCriteria.Any())
                    return (false, "You must apply criteria before.");
                //var targetSplit = Util.SplitByComma(TargetsList);
                existingCriteria = existingCriteria.Where(x => TargetsList.Contains(x.Criteria!.MasterType!.Target!) && x.isChecked != true);
                if (!existingCriteria.Any())
                    return (false, $"You must completed all criteria of {string.Join(", ", TargetsList)} before.");
                return (true, "All of criteria is complete");
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        private (List<int> plantIds, List<int> graftedPlantIds, List<int> plantLotIds) ExtractTargetIds(CriteriaTargerRequest request)
        {
            return (
                request.PlantID ?? new List<int>(),
                request.GraftedPlantID ?? new List<int>(),
                request.PlantLotID ?? new List<int>()
            );
        }

        private async Task<List<CriteriaTarget>> GetExistingCriteriaTargets(List<int> plantIds, List<int> graftedPlantIds, List<int> plantLotIds)
        {
            var existingCriteriaTargets = await _unitOfWork.CriteriaTargetRepository
                        .GetAllNoPaging(x =>
                            (x.PlantID != null && plantIds.Contains(x.PlantID!.Value)) ||
                            (x.GraftedPlantID != null && graftedPlantIds.Contains(x.GraftedPlantID!.Value)) ||
                            (x.PlantLotID != null && plantLotIds.Contains(x.PlantLotID!.Value))
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
        private List<CriteriaTarget> GenerateNewCriteriaTargets( List<CriteriaData> criteriaData, List<int> plantIds, List<int> graftedPlantIds, List<int> plantLotIds, List<CriteriaTarget> existingCriteriaTargets)
        {
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
            return new CriteriaTarget
            {
                PlantID = plantId,
                GraftedPlantID = graftedPlantId,
                PlantLotID = plantLotId,
                CriteriaID = criteria.CriteriaId,
                isChecked = criteria.IsChecked,
                Priority = criteria.Priority
            };
        }
        private bool IsDuplicate(CriteriaTarget newTarget, List<CriteriaTarget> existingTargets)
        // kiem tra xem criteria do da dc ap dung cho cay do chua
        {
            return existingTargets.Any(e =>
                (e.PlantID == newTarget.PlantID && newTarget.PlantID != null) ||
                (e.GraftedPlantID == newTarget.GraftedPlantID && newTarget.GraftedPlantID != null) ||
                (e.PlantLotID == newTarget.PlantLotID && newTarget.PlantLotID != null) &&
                e.CriteriaID == newTarget.CriteriaID
            );
        }

    }
}
