using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using MailKit.Search;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlanService : IPlanService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PlanService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CreatePlan(CreatePlanModel createPlanModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var newPlan = new Plan()
                    {
                        PlanCode = "PLAN" + "_" + DateTime.Now.ToString("ddMMyyyy") + "_" + createPlanModel.MasterTypeId.Value,
                        PlanName = createPlanModel.PlanName,
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        AssignorId = createPlanModel.AssignorId,
                        CropId = createPlanModel.CropId,
                        EndDate = createPlanModel?.EndDate,
                        StartDate = createPlanModel?.StartDate,
                        Frequency = createPlanModel?.Frequency,
                        GrowthStageId = createPlanModel?.GrowthStageId,
                        IsActive = createPlanModel?.IsActive,
                        IsDelete = createPlanModel?.IsDelete,
                        MasterTypeId = createPlanModel?.MasterTypeId,
                        MaxVolume = createPlanModel?.MaxVolume,
                        MinVolume = createPlanModel?.MinVolume,
                        Notes = createPlanModel?.Notes,
                        PesticideName = createPlanModel?.PesticideName,
                        ResponsibleBy = createPlanModel?.ResponsibleBy,
                        ProcessId = createPlanModel?.ProcessId,
                        Status = "Active",
                        PlanDetail = createPlanModel?.PlanDetail,
                    };

                    await _unitOfWork.PlanRepository.Insert(newPlan);
                    if (createPlanModel.PlanTargetModel != null && createPlanModel.PlanTargetModel.Count > 0)
                    {
                        foreach (var plantTarget in createPlanModel.PlanTargetModel)
                        {
                            var newPlantTarget = new PlanTarget()
                            {
                                LandPlotID = plantTarget.LandPlotID,
                                LandRowID = plantTarget.LandRowID,
                                GraftedPlantID = plantTarget.GraftedPlantID,
                                PlantID = plantTarget.PlantID,
                                PlantLotID = plantTarget.PlantLotID
                            };
                            newPlan.PlanTargets.Add(newPlantTarget);
                            await _unitOfWork.SaveAsync();
                        }
                    }
                    var getListMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypesByTypeName("notification");
                    var getMasterType = getListMasterType.FirstOrDefault(x => x.MasterTypeName.ToLower().Contains("taskAssigned".ToLower()));
                    var addNotification = new Notification()
                    {
                        Content = "Plan " + createPlanModel.PlanName + " has just been created",
                        Title = "Plan",
                        MasterTypeId = getMasterType.MasterTypeId,
                        CreateDate = DateTime.Now,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();

                    var addPlanNotification = new PlanNotification()
                    {
                        NotificationID = addNotification.NotificationId,
                        PlanID = newPlan.PlanId,
                        CreatedDate = DateTime.Now,
                        isRead = false,
                    };

                    await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    await _unitOfWork.SaveAsync();

                    var getLastPlan = await _unitOfWork.PlanRepository.GetLastPlan();
                    var result = await GeneratePlanSchedule(getLastPlan, createPlanModel);
                    if (result)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_CREATE_PLAN_CODE, Const.SUCCESS_CREATE_PLAN_MSG, result);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_CREATE_PLAN_CODE, Const.FAIL_CREATE_PLAN_MESSAGE, false);
                    }
                }
                catch (Exception ex)
                {

                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> GetAllPlanPagination(PaginationParameter paginationParameter, PlanFilter planFilter)
        {
            try
            {
                Expression<Func<Plan, bool>> filter = null!;
                Func<IQueryable<Plan>, IOrderedQueryable<Plan>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.PlanId == validInt  || x.ProcessId == validInt
                                            || x.MasterTypeId == validInt
                                            || x.MinVolume == validInt || x.MaxVolume == validInt
                                            || x.AssignorId == validInt || x.CropId == validInt || x.GrowthStageId == validInt);
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = filter.And(x => x.CreateDate == validDate
                                      || x.UpdateDate == validDate);
                    }
                    else if (bool.TryParse(paginationParameter.Search, out validBool))
                    {
                        filter = filter.And(x => x.IsActive == validBool);
                    }
                    else
                    {
                        filter = filter.And(x => x.PlanCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.PlanDetail.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.PlanName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Status.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MasterType.MasterTypeName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.PesticideName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Notes.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.ResponsibleBy.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Frequency.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.GrowthStage.GrowthStageName.ToLower().Contains(paginationParameter.Search.ToLower()));
                    }
                }

                if (planFilter.createDateFrom.HasValue || planFilter.createDateTo.HasValue)
                {
                    if (!planFilter.createDateFrom.HasValue || !planFilter.createDateTo.HasValue)
                    {
                        return new BusinessResult(Const.WARNING_MISSING_DATE_FILTER_CODE, Const.WARNING_MISSING_DATE_FILTER_MSG);
                    }

                    if (planFilter.createDateFrom.Value > planFilter.createDateTo.Value)
                    {
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);
                    }
                    filter = filter.And(x => x.CreateDate >= planFilter.createDateFrom &&
                                             x.CreateDate <= planFilter.createDateTo);
                }

                if (planFilter.isActive != null)
                {
                    filter = filter.And(x => x.IsActive == planFilter.isActive);

                }
                if (planFilter.isDelete != null)
                    filter = filter.And(x => x.IsDelete == planFilter.isDelete);
                if (planFilter.ResponsibleBy != null)
                {
                    List<string> filterList = planFilter.ResponsibleBy.Split(',', StringSplitOptions.TrimEntries)
                                   .Select(f => f.ToLower()) // Chuyển về chữ thường
                                   .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.ResponsibleBy.ToLower().Equals(item));
                    }
                }
                if (planFilter.Status != null)
                {
                    List<string> filterList = planFilter.Status.Split(',', StringSplitOptions.TrimEntries)
                                   .Select(f => f.ToLower()) // Chuyển về chữ thường
                                   .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.Status.ToLower().Equals(item));
                    }
                }

                if (planFilter.CropName != null)
                {
                    List<string> filterList = planFilter.CropName.Split(',', StringSplitOptions.TrimEntries)
                                   .Select(f => f.ToLower()) // Chuyển về chữ thường
                                   .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.Crop.CropName.ToLower().Equals(item));
                    }
                }
                if (planFilter.PlanDetail != null)
                {
                    List<string> filterList = planFilter.PlanDetail.Split(',', StringSplitOptions.TrimEntries)
                                  .Select(f => f.ToLower()) // Chuyển về chữ thường
                                  .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.PlanDetail.ToLower().Contains(item));
                    }
                }
                if (planFilter.AssignorName != null)
                {
                    List<string> filterList = planFilter.AssignorName.Split(',', StringSplitOptions.TrimEntries)
                                 .Select(f => f.ToLower()) // Chuyển về chữ thường
                                 .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.User.FullName.ToLower().Equals(item));
                    }
                }
                if (planFilter.PlanName != null)
                {
                    List<string> filterList = planFilter.PlanName.Split(',', StringSplitOptions.TrimEntries)
                                .Select(f => f.ToLower()) // Chuyển về chữ thường
                                .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.PlanName.ToLower().Equals(item));
                    }
                }

                if (planFilter.GrowStages != null)
                {
                    List<string> filterList = planFilter.GrowStages.Split(',', StringSplitOptions.TrimEntries)
                                .Select(f => f.ToLower()) // Chuyển về chữ thường
                                .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.GrowthStage.GrowthStageName.ToLower().Equals(item));
                    }
                }
                if (planFilter.ProcessTypes != null)
                {
                    List<string> filterList = planFilter.ProcessTypes.Split(',', StringSplitOptions.TrimEntries)
                                .Select(f => f.ToLower()) // Chuyển về chữ thường
                                .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.Process.MasterType.MasterTypeName.ToLower().Equals(item));
                    }
                }

                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "planid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlanId)
                                   : x => x.OrderBy(x => x.PlanId)) : x => x.OrderBy(x => x.PlanId);
                        break;
                    case "plancode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlanCode)
                                   : x => x.OrderBy(x => x.PlanCode)) : x => x.OrderBy(x => x.PlanCode);
                        break;
                    case "plandetail":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlanDetail)
                                   : x => x.OrderBy(x => x.PlanDetail)) : x => x.OrderBy(x => x.PlanDetail);
                        break;
                    case "planname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlanName)
                                   : x => x.OrderBy(x => x.PlanName)) : x => x.OrderBy(x => x.PlanName);
                        break;
                    case "masterstylename":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MasterType.MasterTypeName)
                                   : x => x.OrderBy(x => x.MasterType.MasterTypeName)) : x => x.OrderBy(x => x.MasterType.MasterTypeName);
                        break;
                    case "growthstagename":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.GrowthStage.GrowthStageName)
                                   : x => x.OrderBy(x => x.GrowthStage.GrowthStageName)) : x => x.OrderBy(x => x.GrowthStage.GrowthStageName);
                        break;
                    case "cropname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Crop.CropName)
                                   : x => x.OrderBy(x => x.Crop.CropName)) : x => x.OrderBy(x => x.Crop.CropName);
                        break;
                    case "isdelete":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.IsDelete)
                                   : x => x.OrderBy(x => x.IsDelete)) : x => x.OrderBy(x => x.IsDelete);
                        break;
                    case "pesticidename":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PesticideName)
                                   : x => x.OrderBy(x => x.PesticideName)) : x => x.OrderBy(x => x.PesticideName);
                        break;
                    case "isactive":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.IsActive)
                                   : x => x.OrderBy(x => x.IsActive)) : x => x.OrderBy(x => x.IsActive);
                        break;
                  
                    case "processname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Process.ProcessName)
                                   : x => x.OrderBy(x => x.Process.ProcessName)) : x => x.OrderBy(x => x.Process.ProcessName);
                        break;
                    case "frequency":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Frequency)
                                   : x => x.OrderBy(x => x.Frequency)) : x => x.OrderBy(x => x.Frequency);
                        break;
                    case "responsibleby":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ResponsibleBy)
                                   : x => x.OrderBy(x => x.ResponsibleBy)) : x => x.OrderBy(x => x.ResponsibleBy);
                        break;
                    case "assignorname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.User.FullName)
                                   : x => x.OrderBy(x => x.User.FullName)) : x => x.OrderBy(x => x.User.FullName);
                        break;
                    case "note":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Notes)
                                   : x => x.OrderBy(x => x.Notes)) : x => x.OrderBy(x => x.Notes);
                        break;
                    case "minVolume":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MinVolume)
                                   : x => x.OrderBy(x => x.MinVolume)) : x => x.OrderBy(x => x.MinVolume);
                        break;
                    case "maxVolume":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MaxVolume)
                                   : x => x.OrderBy(x => x.MaxVolume)) : x => x.OrderBy(x => x.MaxVolume);
                        break;
                    case "status":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Status)
                                   : x => x.OrderBy(x => x.Status)) : x => x.OrderBy(x => x.Status);
                        break;
                    case "createdate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.CreateDate)
                                   : x => x.OrderBy(x => x.CreateDate)) : x => x.OrderBy(x => x.CreateDate);
                        break;
                    case "updatedate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.UpdateDate)
                                   : x => x.OrderBy(x => x.UpdateDate)) : x => x.OrderBy(x => x.UpdateDate);
                        break;
                    case "startdate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.StartDate)
                                   : x => x.OrderBy(x => x.StartDate)) : x => x.OrderBy(x => x.StartDate);
                        break;
                    case "enddate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.EndDate)
                                   : x => x.OrderBy(x => x.EndDate)) : x => x.OrderBy(x => x.EndDate);
                        break;
                    default:
                        orderBy = x => x.OrderBy(x => x.ProcessId);
                        break;
                }
                var entities = await _unitOfWork.PlanRepository.GetPlanWithPagination(filter, orderBy, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<PlanModel>();

                var listTemp = _mapper.Map<IEnumerable<PlanModel>>(entities).ToList();
                foreach (var planTemp in listTemp)
                {
                    double calculateProgress = await _unitOfWork.WorkLogRepository.CalculatePlanProgress(planTemp.PlanId);
                    planTemp.Progress = Math.Round(calculateProgress, 2).ToString();
                }
                pagin.List = listTemp;
                pagin.TotalRecord = await _unitOfWork.PlanRepository.Count(x => x.IsDelete == false);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_PLAN_CODE, Const.SUCCESS_GET_ALL_PLAN_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_PLAN_EMPTY_CODE, Const.WARNING_GET_PLAN_EMPTY_MSG, new PageEntity<PlanModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPlanByID(int planId)
        {
            try
            {
                var entities = await _unitOfWork.PlanRepository.GetPlanWithPagination();
                var getPlan = entities.FirstOrDefault(x => x.PlanId == planId);
                if (getPlan != null)
                {
                    double calculateProgress = await _unitOfWork.WorkLogRepository.CalculatePlanProgress(getPlan.PlanId);
                    var result = _mapper.Map<PlanModel>(getPlan);
                    result.Progress = Math.Round(calculateProgress, 2).ToString();
                    return new BusinessResult(Const.SUCCESS_GET_PLAN_BY_ID_CODE, Const.SUCCESS_GET_PLAN_BY_ID_MSG, result);
                }
                return new BusinessResult(Const.WARNING_GET_PLAN_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLAN_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPlanByName(string planName)
        {
            try
            {

                var entities = await _unitOfWork.PlanRepository.GetPlanWithPagination();
                var getPlan = entities.FirstOrDefault(x => x.PlanName.ToLower().Contains(planName.ToLower()));
                if (getPlan != null)
                {
                    double calculateProgress = await _unitOfWork.WorkLogRepository.CalculatePlanProgress(getPlan.PlanId);
                    var result = _mapper.Map<PlanModel>(getPlan);
                    result.Progress = Math.Round(calculateProgress, 2).ToString();
                    return new BusinessResult(Const.SUCCESS_GET_PLAN_BY_NAME_CODE, Const.SUCCESS_GET_PLAN_BY_NAME_MSG, result);
                }
                return new BusinessResult(Const.WARNING_GET_PLAN_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLAN_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PermanentlyDeletePlan(int planId)
        {
            try
            {
                string includeProperties = "CarePlanSchedules";
                var deletePlan = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == planId, includeProperties);
                var deleteCarePlanSchedule = deletePlan.CarePlanSchedule;
                if (deleteCarePlanSchedule != null)
                {
                    var getListWorkLogDelete = await _unitOfWork.WorkLogRepository.GetListWorkLogByScheduelId(deleteCarePlanSchedule.ScheduleId);
                    foreach (var workLog in getListWorkLogDelete)
                    {
                        await _unitOfWork.WorkLogRepository.DeleteWorkLogAndUserWorkLog(workLog);

                    }
                    _unitOfWork.CarePlanScheduleRepository.Delete(deleteCarePlanSchedule);
                    await _unitOfWork.SaveAsync();
                }
                _unitOfWork.PlanRepository.Delete(deletePlan);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(Const.SUCCESS_DELETE_PLANT_CODE, Const.SUCCESS_DELETE_PLAN_MSG, true);
                }
                return new BusinessResult(Const.FAIL_DELETE_PLAN_CODE, Const.FAIL_DELETE_PLAN_MESSAGE, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdatePlanInfo(UpdatePlanModel updatePlanModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkExistPlan = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == updatePlanModel.PlanId, "CarePlanSchedules");
                    if (checkExistPlan != null)
                    {
                        if (updatePlanModel.PlanName != null)
                        {
                            checkExistPlan.PlanName = updatePlanModel.PlanName;
                        }
                        if (updatePlanModel.IsActive != null)
                        {
                            checkExistPlan.IsActive = updatePlanModel.IsActive;
                        }
                        if (updatePlanModel.Status != null)
                        {
                            checkExistPlan.Status = updatePlanModel.Status;
                        }
                        if (updatePlanModel.IsDelete != null)
                        {
                            checkExistPlan.IsDelete = updatePlanModel.IsDelete;
                        }
                        if (updatePlanModel.CropId != null)
                        {
                            checkExistPlan.CropId = updatePlanModel.CropId;
                        }
                       
                        if (updatePlanModel.MasterTypeId != null)
                        {
                            checkExistPlan.MasterTypeId = updatePlanModel.MasterTypeId;
                        }
                        if (updatePlanModel.GrowthStageId != null)
                        {
                            checkExistPlan.GrowthStageId = updatePlanModel.GrowthStageId;
                        }
                        if (updatePlanModel.AssignorId != null)
                        {
                            checkExistPlan.AssignorId = updatePlanModel.AssignorId;
                        }
                        if (updatePlanModel.ProcessId != null)
                        {
                            checkExistPlan.ProcessId = updatePlanModel.ProcessId;
                        }
                       
                        if (updatePlanModel.Status != null)
                        {
                            checkExistPlan.Status = updatePlanModel.Status;
                        }
                        if (updatePlanModel.PlanDetail != null)
                        {
                            checkExistPlan.PlanDetail = updatePlanModel.PlanDetail;
                        }
                        if (updatePlanModel.ResponsibleBy != null)
                        {
                            checkExistPlan.ResponsibleBy = updatePlanModel.ResponsibleBy;
                        }
                        if (updatePlanModel.Notes != null)
                        {
                            checkExistPlan.Notes = updatePlanModel.Notes;
                        }
                        if (updatePlanModel.StartDate != null)
                        {
                            checkExistPlan.StartDate = updatePlanModel.StartDate;
                        }
                        if (updatePlanModel.EndDate != null)
                        {
                            checkExistPlan.EndDate = updatePlanModel.EndDate;
                        }
                        if (updatePlanModel.PesticideName != null)
                        {
                            checkExistPlan.PesticideName = updatePlanModel.PesticideName;
                        }
                        if (updatePlanModel.MinVolume != null)
                        {
                            checkExistPlan.MinVolume = updatePlanModel.MinVolume;
                        }
                        if (updatePlanModel.MaxVolume != null)
                        {
                            checkExistPlan.MaxVolume = updatePlanModel.MaxVolume;
                        }
                       
                        if (updatePlanModel.Frequency != null)
                        {
                            checkExistPlan.Frequency = updatePlanModel.Frequency;
                        }
                        if(updatePlanModel.UpdatePlanTargetModels != null)
                        {
                            foreach(var updatePlanTarget in  updatePlanModel.UpdatePlanTargetModels)
                            {
                                var getUpdatePlanTarget = await _unitOfWork.PlanTargetRepository.GetByCondition(x => x.PlanID == updatePlanTarget.PlanID);
                                if (getUpdatePlanTarget != null)
                                {
                                    if(updatePlanTarget.PlantLotID != null)
                                    {
                                        getUpdatePlanTarget.PlantLotID = updatePlanTarget.PlantLotID;
                                    }
                                    if(updatePlanTarget.LandPlotID != null)
                                    {
                                        getUpdatePlanTarget.LandPlotID = updatePlanTarget.LandPlotID;
                                    }
                                    if(updatePlanTarget.LandRowID != null)
                                    {
                                        getUpdatePlanTarget.LandRowID = updatePlanTarget.LandRowID;
                                    }
                                    if(updatePlanTarget.PlantID != null)
                                    {
                                        getUpdatePlanTarget.PlantID = updatePlanTarget.PlantID;
                                    }
                                    if(updatePlanTarget.GraftedPlantID != null)
                                    {
                                        getUpdatePlanTarget.GraftedPlantID = updatePlanTarget.GraftedPlantID;
                                    }
                                    await _unitOfWork.SaveAsync();
                                }
                            }
                        }
                        checkExistPlan.UpdateDate = DateTime.Now;
                        var checkDeleteDependenciesOfPlan = await _unitOfWork.CarePlanScheduleRepository.DeleteDependenciesOfPlan(checkExistPlan.PlanId);
                        if (checkDeleteDependenciesOfPlan)
                        {
                            var result = await UpdatePlanSchedule(checkExistPlan, updatePlanModel);
                            if (result)
                            {
                                await transaction.CommitAsync();
                                return new BusinessResult(Const.SUCCESS_UPDATE_PLAN_CODE, Const.SUCCESS_UPDATE_PLAN_MSG, checkExistPlan);
                            }
                            else
                            {
                                await transaction.RollbackAsync();
                                return new BusinessResult(Const.FAIL_UPDATE_PLAN_CODE, Const.FAIL_UPDATE_PLAN_MESSAGE, false);
                            }
                        }
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_UPDATE_PLAN_CODE, Const.FAIL_UPDATE_PLAN_MESSAGE, false);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.WARNING_GET_PLAN_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLAN_DOES_NOT_EXIST_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }

        }

        private async Task<bool> GeneratePlanSchedule(Plan plan, CreatePlanModel createPlanModel)
        {
            CarePlanSchedule schedule = new CarePlanSchedule();

            DateTime currentDate = createPlanModel.StartDate;
            if (currentDate <= DateTime.Now)
            {
                throw new Exception("Start Date must be greater than or equal now");
            }
            if (TimeSpan.Parse(createPlanModel.StartTime) >= TimeSpan.Parse(createPlanModel.EndTime))
            {
                throw new Exception("Start time must be less than End Time");
            }

            if (plan.Frequency == null && createPlanModel.CustomDates != null)
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    DayOfWeek = null,
                    DayOfMonth = null,
                    CustomDates = createPlanModel.CustomDates.Select(x => x.Date.ToString("dd/MM/yyyy")).ToString(),
                    StarTime = TimeSpan.Parse(createPlanModel.StartTime),
                    EndTime = TimeSpan.Parse(createPlanModel.EndTime)
                };
                List<DateTime> conflictCustomDates = new List<DateTime>();
                foreach (var customeDate in createPlanModel.CustomDates)
                {
                    if (customeDate >= currentDate && customeDate <= plan.EndDate)
                    {
                        var checkConflictTimeOfWorkLog = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime), customeDate);
                        if (checkConflictTimeOfWorkLog)
                        {
                            conflictCustomDates.Add(customeDate);
                        }
                    }

                }
                if (conflictCustomDates.Count > 5)
                {
                    throw new Exception("The schedule is conflicted");
                }

                foreach (var customeDate in createPlanModel.CustomDates)
                {
                    if (customeDate >= currentDate && customeDate <= plan.EndDate)
                    {
                        var tempModel = conflictCustomDates.Contains(customeDate)
                            ? new CreatePlanModel(createPlanModel) { ListEmployee = null }
                            : createPlanModel;
                        await GenerateWorkLogs(schedule, customeDate, createPlanModel);
                    }

                }
            }
            else if (plan.Frequency != null && plan.Frequency.ToLower() == "weekly" && createPlanModel.DayOfWeek != null)
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    DayOfWeek = JsonConvert.SerializeObject(createPlanModel.DayOfWeek),
                    DayOfMonth = null,
                    CustomDates = null,
                    StarTime = TimeSpan.Parse(createPlanModel.StartTime),
                    EndTime = TimeSpan.Parse(createPlanModel.EndTime)
                };
            }
            else if (plan.Frequency != null && plan.Frequency.ToLower() == "monthly" && createPlanModel.DayOfMonth != null)
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    DayOfWeek = null,
                    DayOfMonth = JsonConvert.SerializeObject(createPlanModel.DayOfMonth),
                    CustomDates = null,
                    StarTime = TimeSpan.Parse(createPlanModel.StartTime),
                    EndTime = TimeSpan.Parse(createPlanModel.EndTime)
                };
            }
            else if (plan.Frequency != null && plan.Frequency.ToLower() == "daily")
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    DayOfWeek = JsonConvert.SerializeObject(currentDate.DayOfWeek),
                    DayOfMonth = null,
                    CustomDates = null,
                    StarTime = TimeSpan.Parse(createPlanModel.StartTime),
                    EndTime = TimeSpan.Parse(createPlanModel.EndTime)
                };
            }
            //if (await _unitOfWork.CarePlanScheduleRepository.IsScheduleConflicted(plan.PlanId, createPlanModel.StartDate, createPlanModel.EndDate, TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime)))
            //{
            //    throw new Exception("The schedule is conflicted");
            //}
            foreach (var planTarget in createPlanModel.PlanTargetModel)
            {
                var conflictWorkLogs = await _unitOfWork.WorkLogRepository.GetConflictWorkLogsOnSameLocation(
                                                                        TimeSpan.Parse(createPlanModel.StartTime),
                                                                        TimeSpan.Parse(createPlanModel.EndTime),
                                                                        currentDate,
                                                                        planTarget.PlantID,
                                                                        planTarget.LandRowID,
                                                                        planTarget.LandPlotID
                                                                    );
                if (conflictWorkLogs.Any())
                {
                    var conflictDetails = string.Join("\n", conflictWorkLogs.Select(w =>
                    {
                        var planTarget = w.Schedule?.CarePlan?.PlanTargets?.FirstOrDefault();
                        return $"- Tree: {planTarget?.Plant.PlantName ?? "Unknown"}, Row: {planTarget?.LandRow.RowIndex ?? 0}, Plot: {planTarget?.LandPlot.LandPlotName ?? "Unknown"}, Time: {w.Schedule?.StarTime} - {w.Schedule?.EndTime}";
                    }));

                    throw new Exception($"WorkLog conflict detected at the same time:\n{conflictDetails}");
                }
            }
            await _unitOfWork.CarePlanScheduleRepository.Insert(schedule);
            var result = await _unitOfWork.SaveAsync();
            while (currentDate <= plan.EndDate)
            {
                if (plan.Frequency != null && plan.Frequency.ToLower() == "weekly" && createPlanModel.DayOfWeek != null)
                {
                    // Nếu là Weekly, duyệt qua từng ngày trong tuần
                    List<DateTime> conflictDatesInWeekly = new List<DateTime>();
                    foreach (int day in createPlanModel.DayOfWeek)
                    {
                        DateTime nextDay = GetNextDayOfWeek(currentDate, (DayOfWeek)day);
                        if (nextDay <= plan.EndDate)
                        {
                            var checkConflictTimeOfWorkLogWeekly = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime), nextDay);
                            if (checkConflictTimeOfWorkLogWeekly)
                            {
                                conflictDatesInWeekly.Add(nextDay);
                            }
                        }
                    }
                    if (conflictDatesInWeekly.Count > 5)
                    {
                        throw new Exception("The schedule is conflicted");
                    }
                    foreach (int day in createPlanModel.DayOfWeek)
                    {
                        DateTime nextDay = GetNextDayOfWeek(currentDate, (DayOfWeek)day);
                        if (nextDay <= plan.EndDate)
                        {
                            // Nếu ngày này nằm trong danh sách bị conflict thì đặt ListEmployee = null
                            var tempModel = conflictDatesInWeekly.Contains(nextDay)
                                ? new CreatePlanModel(createPlanModel) { ListEmployee = null }
                                : createPlanModel;
                            await GenerateWorkLogs(schedule, nextDay, tempModel);
                        }
                    }

                    // Nhảy sang tuần tiếp theo
                    currentDate = currentDate.AddDays(7);
                }
                else if (plan.Frequency != null && plan.Frequency.ToLower() == "monthly" && createPlanModel.DayOfMonth != null)
                {
                    // Nếu là Monthly, duyệt qua từng ngày cụ thể trong tháng
                    List<DateTime> conflictDatesInMonthly = new List<DateTime>();
                    foreach (int day in createPlanModel.DayOfMonth)
                    {
                        int maxDays = DateTime.DaysInMonth(currentDate.Year, currentDate.Month);
                        int validDay = Math.Min(day, maxDays); // Nếu day > maxDays thì chọn ngày cuối tháng

                        DateTime nextMonthDate = new DateTime(currentDate.Year, currentDate.Month, validDay);
                        if (nextMonthDate <= plan.EndDate)
                        {
                            var checkConflictTimeOfWorkLogMonthly = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime), nextMonthDate);
                            if (checkConflictTimeOfWorkLogMonthly)
                            {
                                conflictDatesInMonthly.Add(nextMonthDate);
                            }
                        }
                    }
                    if (conflictDatesInMonthly.Count > 5)
                    {
                        throw new Exception("The schedule is conflicted");
                    }

                    foreach (int day in createPlanModel.DayOfMonth)
                    {
                        int maxDays = DateTime.DaysInMonth(currentDate.Year, currentDate.Month);
                        int validDay = Math.Min(day, maxDays); // Nếu day > maxDays thì chọn ngày cuối tháng

                        DateTime nextMonthDate = new DateTime(currentDate.Year, currentDate.Month, validDay);
                        if (nextMonthDate <= plan.EndDate)
                        {
                            // Nếu ngày này nằm trong danh sách bị conflict thì đặt ListEmployee = null
                            var tempModel = conflictDatesInMonthly.Contains(nextMonthDate)
                                ? new CreatePlanModel(createPlanModel) { ListEmployee = null }
                                : createPlanModel;
                            await GenerateWorkLogs(schedule, nextMonthDate, createPlanModel);
                        }
                    }
                    // Nhảy sang tháng tiếp theo
                    currentDate = currentDate.AddMonths(1);
                }
                else if (plan.Frequency != null && plan.Frequency.ToLower() == "daily")
                {
                    List<DateTime> conflictDatesInDaily = new List<DateTime>();
                    var checkConflictTimeOfWorkLogDaily = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime), currentDate);
                    if (checkConflictTimeOfWorkLogDaily)
                    {
                        conflictDatesInDaily.Add(currentDate);
                    }
                    if (conflictDatesInDaily.Count > 5)
                    {
                        throw new Exception("The schedule is conflicted");
                    }

                    var tempModel = conflictDatesInDaily.Contains(currentDate)
                                ? new CreatePlanModel(createPlanModel) { ListEmployee = null }
                                : createPlanModel;
                    await GenerateWorkLogs(schedule, currentDate, createPlanModel);
                    currentDate = currentDate.AddDays(1);
                }
            }
            if (result > 0)
            {
                return true;
            }
            return false;
        }

        private async Task<bool> UpdatePlanSchedule(Plan plan, UpdatePlanModel updatePlanModel)
        {
            CarePlanSchedule schedule = new CarePlanSchedule();

            DateTime currentDate = updatePlanModel.StartDate.Value;
            if (currentDate <= DateTime.Now)
            {
                throw new Exception("Start Date must be greater than or equal now");
            }

            if (plan.Frequency == null && updatePlanModel.CustomDates != null)
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    DayOfWeek = null,
                    DayOfMonth = null,
                    CustomDates = updatePlanModel.CustomDates.ToString(),
                    StarTime = TimeSpan.Parse(updatePlanModel.StartTime),
                    EndTime = TimeSpan.Parse(updatePlanModel.EndTime)
                };
                List<DateTime> conflictCustomDates = new List<DateTime>();
                foreach (var customeDate in updatePlanModel.CustomDates)
                {
                    if (customeDate >= currentDate && customeDate <= plan.EndDate)
                    {
                        var checkConflictTimeOfWorkLog = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(updatePlanModel.StartTime), TimeSpan.Parse(updatePlanModel.EndTime), customeDate);
                        if (checkConflictTimeOfWorkLog)
                        {
                            conflictCustomDates.Add(customeDate);
                        }
                    }
                }

                if (conflictCustomDates.Count > 5)
                {
                    throw new Exception("The schedule is conflicted");
                }

                foreach (var customeDate in updatePlanModel.CustomDates)
                {
                    if (customeDate >= currentDate && customeDate <= plan.EndDate)
                    {
                        // Nếu ngày này nằm trong danh sách bị conflict thì đặt ListEmployee = null
                        var tempModel = conflictCustomDates.Contains(customeDate)
                            ? new UpdatePlanModel(updatePlanModel) { ListEmployee = null }
                            : updatePlanModel;
                        await GenerateWorkLogsForUpdate(schedule, customeDate, tempModel);

                    }

                }
            }
            else if (plan.Frequency != null && plan.Frequency.ToLower() == "weekly" && updatePlanModel.DayOfWeek != null)
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    DayOfWeek = JsonConvert.SerializeObject(updatePlanModel.DayOfWeek),
                    DayOfMonth = null,
                    CustomDates = null,
                    StarTime = TimeSpan.Parse(updatePlanModel.StartTime),
                    EndTime = TimeSpan.Parse(updatePlanModel.EndTime)
                };
            }
            else if (plan.Frequency != null && plan.Frequency.ToLower() == "monthly" && updatePlanModel.DayOfMonth != null)
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    DayOfWeek = null,
                    DayOfMonth = JsonConvert.SerializeObject(updatePlanModel.DayOfMonth),
                    CustomDates = null,
                    StarTime = TimeSpan.Parse(updatePlanModel.StartTime),
                    EndTime = TimeSpan.Parse(updatePlanModel.EndTime)
                };
            }
            else if (plan.Frequency != null && plan.Frequency.ToLower() == "daily")
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    DayOfWeek = JsonConvert.SerializeObject(updatePlanModel.DayOfWeek),
                    DayOfMonth = null,
                    CustomDates = null,
                    StarTime = TimeSpan.Parse(updatePlanModel.StartTime),
                    EndTime = TimeSpan.Parse(updatePlanModel.EndTime)
                };
            }
            //if (updatePlanModel.StartDate != null && updatePlanModel.EndDate != null &&
            //        updatePlanModel.StartTime != null && updatePlanModel.EndTime != null)
            //{
            //    if (await _unitOfWork.CarePlanScheduleRepository.IsScheduleConflicted(plan.PlanId, updatePlanModel.StartDate.Value, updatePlanModel.EndDate.Value, TimeSpan.Parse(updatePlanModel.StartTime), TimeSpan.Parse(updatePlanModel.EndTime)))
            //    {
            //        throw new Exception("The schedule is conflicted");
            //    }
            //}
            foreach (var planTarget in updatePlanModel.PlanTargetModel)
            {
                var conflictWorkLogs = await _unitOfWork.WorkLogRepository.GetConflictWorkLogsOnSameLocation(
                                                                        TimeSpan.Parse(updatePlanModel.StartTime),
                                                                        TimeSpan.Parse(updatePlanModel.EndTime),
                                                                        currentDate,
                                                                        planTarget.PlantID,
                                                                        planTarget.LandRowID,
                                                                        planTarget.LandPlotID
                                                                    );
                if (conflictWorkLogs.Any())
                {
                    var conflictDetails = string.Join("\n", conflictWorkLogs.Select(w =>
                    {
                        var planTarget = w.Schedule?.CarePlan?.PlanTargets?.FirstOrDefault();
                        return $"- Tree: {planTarget?.Plant.PlantName ?? "Unknown"}, Row: {planTarget?.LandRow.RowIndex ?? 0}, Plot: {planTarget?.LandPlot.LandPlotName ?? "Unknown"}, Time: {w.Schedule?.StarTime} - {w.Schedule?.EndTime}";
                    }));

                    throw new Exception($"WorkLog conflict detected at the same time:\n{conflictDetails}");
                }
            }
            await _unitOfWork.CarePlanScheduleRepository.Insert(schedule);
            var result = await _unitOfWork.SaveAsync();
            while (currentDate <= plan.EndDate)
            {
                if (plan.Frequency != null && plan.Frequency.ToLower() == "weekly" && updatePlanModel.DayOfWeek != null)
                {
                    // Nếu là Weekly, duyệt qua từng ngày trong tuần
                    List<DateTime> conflictDatesInWeekly = new List<DateTime>();
                    foreach (int day in updatePlanModel.DayOfWeek)
                    {
                        DateTime nextDay = GetNextDayOfWeek(currentDate, (DayOfWeek)day);
                        if (nextDay <= plan.EndDate)
                        {
                            var checkConflictTimeOfWorkLogWeekly = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(updatePlanModel.StartTime), TimeSpan.Parse(updatePlanModel.EndTime), nextDay);
                            if (checkConflictTimeOfWorkLogWeekly)
                            {
                                conflictDatesInWeekly.Add(nextDay);
                            }
                        }
                    }
                    if (conflictDatesInWeekly.Count > 5)
                    {
                        throw new Exception("Schedule is conflicted");
                    }

                    foreach (int day in updatePlanModel.DayOfWeek)
                    {
                        DateTime nextDay = GetNextDayOfWeek(currentDate, (DayOfWeek)day);
                        if (nextDay <= plan.EndDate)
                        {
                            // Nếu ngày này nằm trong danh sách bị conflict thì đặt ListEmployee = null
                            var tempModel = conflictDatesInWeekly.Contains(nextDay)
                                ? new UpdatePlanModel(updatePlanModel) { ListEmployee = null }
                                : updatePlanModel;
                            await GenerateWorkLogsForUpdate(schedule, nextDay, tempModel);
                        }
                    }
                    // Nhảy sang tuần tiếp theo
                    currentDate = currentDate.AddDays(7);
                }
                else if (plan.Frequency != null && plan.Frequency.ToLower() == "monthly" && updatePlanModel.DayOfMonth != null)
                {
                    // Nếu là Monthly, duyệt qua từng ngày cụ thể trong tháng
                    List<DateTime> conflictDates = new List<DateTime>();
                    foreach (int day in updatePlanModel.DayOfMonth)
                    {
                        int maxDays = DateTime.DaysInMonth(currentDate.Year, currentDate.Month);
                        int validDay = Math.Min(day, maxDays); // Nếu day > maxDays thì chọn ngày cuối tháng

                        DateTime nextMonthDate = new DateTime(currentDate.Year, currentDate.Month, validDay);
                        if (nextMonthDate <= plan.EndDate)
                        {
                            var checkConflictTimeOfWorkLogMonthly = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(updatePlanModel.StartTime), TimeSpan.Parse(updatePlanModel.EndTime), nextMonthDate);
                            if (checkConflictTimeOfWorkLogMonthly)
                            {
                                conflictDates.Add(nextMonthDate);
                            }
                        }
                    }

                    if (conflictDates.Count > 5)
                    {
                        throw new Exception("Schedule is conflicted");
                    }

                    // Duyệt lại để tạo WorkLogs
                    foreach (int day in updatePlanModel.DayOfMonth)
                    {
                        int maxDays = DateTime.DaysInMonth(currentDate.Year, currentDate.Month);
                        int validDay = Math.Min(day, maxDays); // Nếu day > maxDays thì chọn ngày cuối tháng

                        DateTime nextMonthDate = new DateTime(currentDate.Year, currentDate.Month, validDay);
                        if (nextMonthDate <= plan.EndDate)
                        {
                            // Nếu ngày này nằm trong danh sách bị conflict thì đặt ListEmployee = null
                            var tempModel = conflictDates.Contains(nextMonthDate)
                                ? new UpdatePlanModel(updatePlanModel) { ListEmployee = null }
                                : updatePlanModel;

                            await GenerateWorkLogsForUpdate(schedule, nextMonthDate, tempModel);
                        }
                    }
                    // Nhảy sang tháng tiếp theo
                    currentDate = currentDate.AddMonths(1);
                }
                else if (plan.Frequency != null && plan.Frequency.ToLower() == "daily")
                {
                    List<DateTime> conflictDatesDaily = new List<DateTime>();
                    var checkConflictTimeOfWorkLogDaily = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(updatePlanModel.StartTime), TimeSpan.Parse(updatePlanModel.EndTime), currentDate);
                    if (checkConflictTimeOfWorkLogDaily)
                    {
                        conflictDatesDaily.Add(currentDate);
                    }
                    if (conflictDatesDaily.Count > 5)
                    {
                        throw new Exception("Schedule is conflicted");

                    }

                    // Nếu ngày này nằm trong danh sách bị conflict thì đặt ListEmployee = null
                    var tempModel = conflictDatesDaily.Contains(currentDate)
                        ? new UpdatePlanModel(updatePlanModel) { ListEmployee = null }
                        : updatePlanModel;

                    await GenerateWorkLogsForUpdate(schedule, currentDate, tempModel);

                    currentDate = currentDate.AddDays(1);
                }
            }
            if (result > 0)
            {
                return true;
            }
            return false;

        }

        private async Task<bool> GenerateWorkLogs(CarePlanSchedule schedule, DateTime dateWork, CreatePlanModel createPlanModel)
        {

            if (schedule == null) return false;
            var getTypePlan = await _unitOfWork.MasterTypeRepository.GetByID(createPlanModel.MasterTypeId.Value);
            string plantLotName = "";
            foreach (var plantTarget in createPlanModel.PlanTargetModel)
            {
                if (plantTarget.LandPlotID != null)
                {
                    var getLandPlot = await _unitOfWork.LandPlotRepository.GetByID(plantTarget.LandPlotID.Value);
                    plantLotName = plantLotName + "_" + getLandPlot.LandPlotName;
                }

                if (plantTarget.LandRowID != null)
                {
                    var getLandRow = await _unitOfWork.LandRowRepository.GetByID(plantTarget.LandRowID.Value);
                    plantLotName = plantLotName + "_Row " + getLandRow.RowIndex;
                }

                if (plantTarget.PlantID != null)
                {
                    var getPlant = await _unitOfWork.PlantRepository.GetByID(plantTarget.PlantID.Value);
                    plantLotName = plantLotName + "_" + getPlant.PlantName;
                }

                if (plantTarget.GraftedPlantID != null)
                {
                    var graftedPlant = await _unitOfWork.GraftedPlantRepository.GetByID(plantTarget.GraftedPlantID.Value);
                    plantLotName = plantLotName + "_" + graftedPlant.GraftedPlantName;
                }

                if (plantTarget.PlantLotID != null)
                {
                    var getPlantLot = await _unitOfWork.PlantLotRepository.GetByID(plantTarget.PlantLotID.Value);
                    plantLotName = plantLotName + "_" + getPlantLot.PlantLotName;
                }

            }
            // Tạo WorkLog mới
            var newWorkLog = new WorkLog
            {
                WorkLogCode = $"WL-{schedule.ScheduleId}-{DateTime.UtcNow.Ticks}",
                Status = "Not Started",
                WorkLogName = getTypePlan.MasterTypeName + " on " + plantLotName,
                Date = dateWork.Date.Add(schedule.StarTime.Value),
                IsConfirm = false,
                ScheduleId = schedule.ScheduleId
            };

            // 🔹 Lưu WorkLogs vào DB trước để lấy WorkLogID
            await _unitOfWork.WorkLogRepository.Insert(newWorkLog);
            var result = await _unitOfWork.SaveAsync();
            if (createPlanModel.ListEmployee != null && createPlanModel.ListEmployee.Count > 0)
            {
                await GenerateUserWorkLog(createPlanModel.ListEmployee, newWorkLog);
            }
            return result > 0;
        }

        private async Task<bool> GenerateWorkLogsForUpdate(CarePlanSchedule schedule, DateTime dateWork, UpdatePlanModel updatePlanModel)
        {

            if (schedule == null) return false;
            var getTypePlan = await _unitOfWork.MasterTypeRepository.GetByID(updatePlanModel.MasterTypeId.Value);
            var getLandPlot = await _unitOfWork.LandPlotRepository.GetByID(updatePlanModel.LandPlotId.Value);
            // Tạo WorkLog mới
            var newWorkLog = new WorkLog
            {
                WorkLogCode = $"WL-{schedule.ScheduleId}-{DateTime.UtcNow.Ticks}",
                Status = "Not Started",
                WorkLogName = getTypePlan.MasterTypeName + " on " + getLandPlot.LandPlotName,
                Date = dateWork.Date.Add(schedule.StarTime.Value),
                IsConfirm = false,
                ScheduleId = schedule.ScheduleId
            };

            // 🔹 Lưu WorkLogs vào DB trước để lấy WorkLogID
            await _unitOfWork.WorkLogRepository.Insert(newWorkLog);
            var result = await _unitOfWork.SaveAsync();
            if (updatePlanModel.ListEmployee != null && updatePlanModel.ListEmployee.Count > 0)
            {
                await GenerateUserWorkLog(updatePlanModel.ListEmployee, newWorkLog);
            }
            return result > 0;
        }

        private async Task<bool> GenerateUserWorkLog(List<EmployeeModel> userIds, WorkLog newWorkLog)
        {
            List<UserWorkLog> userWorkLogs = new List<UserWorkLog>();
            // 🔹 Lấy lại danh sách WorkLogs đã lưu (để lấy WorkLogID)
            var savedWorkLogs = await _unitOfWork.WorkLogRepository.GetListWorkLogByWorkLogDate(newWorkLog);

            // 🔹 Duyệt qua từng WorkLog để tạo UserWorkLog
            foreach (var workLog in savedWorkLogs)
            {
                foreach (EmployeeModel user in userIds)
                {
                    // Kiểm tra User có bị trùng lịch không?
                    bool isConflicted = await _unitOfWork.UserWorkLogRepository.CheckUserConflictSchedule(user.UserId, workLog);

                    if (isConflicted)
                    {
                        throw new Exception($"User {user.UserId} had task in {workLog.Date}.");
                    }

                    // Thêm vào danh sách UserWorkLog
                    userWorkLogs.Add(new UserWorkLog
                    {
                        WorkLogId = workLog.WorkLogId,
                        UserId = user.UserId,
                        IsReporter = user.isReporter
                    });
                }
            }

            // 🔹 Lưu UserWorkLogs vào DB
            await _unitOfWork.UserWorkLogRepository.InsertRangeAsync(userWorkLogs);
            var result = await _unitOfWork.SaveAsync();
            return result > 0;
        }

        public async Task<string> GeneratePlanCode(int? plantId, int? landPlotId, int masterTypeId)
        {
            string datePart = DateTime.Now.ToString("ddMMyyyy");
            string sequence = await GetNextSequenceNumber(); // Hàm lấy số thứ tự
            var getTypePlan = await _unitOfWork.MasterTypeRepository.GetByID(masterTypeId);

            if (plantId == null && landPlotId != null)
            {
                var landPlot = await _unitOfWork.LandPlotRepository.GetByID(landPlotId.Value);
                return $"{CodeAliasEntityConst.PLAN}-{datePart}-{getTypePlan.MasterTypeName}-{landPlot.LandPlotName}-{sequence}";
            }
            if (landPlotId == null && plantId != null)
            {
                var getPlant = await _unitOfWork.PlantRepository.GetByID(plantId.Value);
                return $"{CodeAliasEntityConst.PLAN}-{datePart}-{getTypePlan.MasterTypeName}-{getPlant.PlantName}-{sequence}";
            }
            if (plantId == null && landPlotId == null)
            {
                return $"{CodeAliasEntityConst.PLAN}-{datePart}-{getTypePlan.MasterTypeName}-{sequence}";
            }
            var landPlotLast = await _unitOfWork.LandPlotRepository.GetByID(landPlotId.Value);
            var getPlantLast = await _unitOfWork.PlantRepository.GetByID(plantId.Value);
            return $"{CodeAliasEntityConst.PLAN}-{datePart}-{getTypePlan.MasterTypeName}-{landPlotLast.LandPlotName}-{getPlantLast.PlantName}-{sequence}";
        }
        private async Task<string> GetNextSequenceNumber()
        {
            int lastNumber = await _unitOfWork.PlanRepository.GetLastPlanSequence(); // Hàm lấy số thứ tự gần nhất từ DB
            int nextPlanId = lastNumber + 1;

            // Xác định số chữ số cần hiển thị
            int digitCount = nextPlanId.ToString().Length; // Số chữ số thực tế
            string sequence = nextPlanId.ToString($"D{digitCount}");
            return sequence;
        }

        private DateTime GetNextDayOfWeek(DateTime fromDate, DayOfWeek targetDay)
        {
            int daysToAdd = ((int)targetDay - (int)fromDate.DayOfWeek + 7) % 7;
            return fromDate.AddDays(daysToAdd == 0 ? 7 : daysToAdd);
        }

        public async Task<BusinessResult> SoftDeletePlan(int planId)
        {
            try
            {
                var getPlanById = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == planId, "CarePlanSchedules");
                if (getPlanById == null)
                {
                    return new BusinessResult(Const.WARNING_GET_PLAN_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLAN_DOES_NOT_EXIST_MSG);
                }
                getPlanById.IsDelete = true;
                getPlanById.Status = "Stopped";
                var schedule = getPlanById.CarePlanSchedule;
                if (schedule != null)
                {
                    schedule.Status = "Stopped";
                    var softDeleteWorkLog = await _unitOfWork.WorkLogRepository.GetListWorkLogByScheduelId(schedule.ScheduleId);
                    foreach (var workLog in softDeleteWorkLog)
                    {
                        if (workLog.Date > DateTime.Now)
                        {
                            workLog.Status = "Stopped";
                        }
                    }
                }
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(Const.SUCCESS_SOFT_DELETE_PLAN_CODE, Const.SUCCESS_SOFT_DELETE_PLAN_MSG, result > 0);
                }
                return new BusinessResult(Const.FAIL_SOFT_DELETE_PLAN_CODE, Const.FAIL_SOFT_DELETE_PLAN_MESSAGE, false);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UnSoftDeletePlan(int planId)
        {
            try
            {
                var getPlanById = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == planId, "CarePlanSchedules");
                if (getPlanById == null)
                {
                    return new BusinessResult(Const.WARNING_GET_PLAN_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLAN_DOES_NOT_EXIST_MSG);
                }
                getPlanById.IsDelete = false;
                getPlanById.Status = "Active";
                var schedule = getPlanById.CarePlanSchedule;
                if (schedule != null)
                {
                    schedule.Status = "Active";
                    var softDeleteWorkLog = await _unitOfWork.WorkLogRepository.GetListWorkLogByScheduelId(schedule.ScheduleId);
                    foreach (var workLog in softDeleteWorkLog)
                    {
                        if (workLog.Date > DateTime.Now)
                        {
                            workLog.Status = "Not Started";
                        }
                    }
                }
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(Const.SUCCESS_UN_SOFT_DELETE_PLAN_CODE, Const.SUCCESS_UN_SOFT_DELETE_PLAN_MSG, result > 0);
                }
                return new BusinessResult(Const.FAIL_UN_SOFT_DELETE_PLAN_CODE, Const.FAIL_UN_SOFT_DELETE_PLAN_MESSAGE, false);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
