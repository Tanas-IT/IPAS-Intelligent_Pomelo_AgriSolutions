using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AuthensRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CloudinaryDotNet;
using CsvHelper.Configuration;
using GenerativeAI.Types;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.Json;
using Microsoft.Extensions.Logging;
using MimeKit;
using Newtonsoft.Json;
using Org.BouncyCastle.Asn1.Pkcs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Numerics;
using System.Reflection;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class WorkLogService : IWorkLogService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IWebSocketService _webSocketService;
        private readonly IResponseCacheService _responseCacheService;

        public WorkLogService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService, IWebSocketService webSocketService, IResponseCacheService responseCacheService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _webSocketService = webSocketService;
            _responseCacheService = responseCacheService;
        }

        public async Task<BusinessResult> AddNewTask(AddNewTaskModel addNewTaskModel, int? farmId)
        {
            //using (var transaction = await _unitOfWork.BeginTransactionAsync())
            //{
            try
            {
                if (addNewTaskModel.DateWork <= DateTime.Now)
                {
                    throw new Exception("Date Work must be greater than or equal now");
                }
                if (addNewTaskModel.StartTime != null && addNewTaskModel.EndTime != null)
                {
                    if (TimeSpan.Parse(addNewTaskModel.StartTime) >= TimeSpan.Parse(addNewTaskModel.EndTime))
                    {
                        throw new Exception("Start time must be less than End Time");
                    }
                }
                //var checkExistProcess = await _unitOfWork.ProcessRepository.GetByCondition(x => x.ProcessId == addNewTaskModel.ProcessId);
                //var checkStartDateOfProcess = addNewTaskModel.StartTime != null ? addNewTaskModel?.DateWork?.Date.Add(TimeSpan.Parse(addNewTaskModel.StartTime)) : null;
                //var checkEndDateOfProcess = addNewTaskModel?.EndTime != null ? addNewTaskModel?.DateWork?.Date.Add(TimeSpan.Parse(addNewTaskModel.EndTime)) : null;
                //if (checkExistProcess != null)
                //{
                //    if (checkStartDateOfProcess < checkExistProcess.StartDate ||
                //         checkStartDateOfProcess > checkExistProcess.EndDate ||
                //        checkEndDateOfProcess < checkExistProcess.StartDate ||
                //         checkEndDateOfProcess > checkExistProcess.EndDate)
                //    {
                //        throw new Exception($"StartDate and EndDate of plan must be within the duration of process from " +
                //            $"{checkExistProcess.StartDate:dd/MM/yyyy} to {checkExistProcess.EndDate:dd/MM/yyyy}");
                //    }
                //}

                //if (addNewTaskModel!.CropId.HasValue && addNewTaskModel.ListLandPlotOfCrop != null)
                //{
                //    var getCropToCheck = await _unitOfWork.CropRepository.GetByID(addNewTaskModel.CropId.Value);
                //    if (getCropToCheck != null)
                //    {
                //        if (addNewTaskModel.StartTime != null && addNewTaskModel.EndTime != null && addNewTaskModel.DateWork != null)
                //        {
                //            if (addNewTaskModel?.DateWork!.Value.Date.Add(TimeSpan.Parse(addNewTaskModel.StartTime)) < getCropToCheck.StartDate ||
                //        addNewTaskModel?.DateWork.Value.Date.Add(TimeSpan.Parse(addNewTaskModel.StartTime)) > getCropToCheck.EndDate ||
                //        addNewTaskModel?.DateWork.Value.Date.Add(TimeSpan.Parse(addNewTaskModel.EndTime)) < getCropToCheck.StartDate ||
                //        addNewTaskModel?.DateWork.Value.Date.Add(TimeSpan.Parse(addNewTaskModel.EndTime)) > getCropToCheck.EndDate)
                //            {
                //                throw new Exception($"StartDate and EndDate of plan must be within the duration of crop from " +
                //                    $"{getCropToCheck.StartDate:dd/MM/yyyy} to {getCropToCheck.EndDate:dd/MM/yyyy}");
                //            }
                //        }

                //    }

                //}
                var getMasterType = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.TypeName.ToLower().Equals(TypeNameInMasterEnum.Work.ToString().ToLower()) && x.MasterTypeName.Equals("Harvesting"));

                //var newPlan = new Plan()
                //{
                //    PlanCode = $"PLAN_{DateTime.Now:yyyyMMdd_HHmmss}_{getMasterType.MasterTypeId}",
                //    PlanName = addNewTaskModel.TaskName,
                //    CreateDate = DateTime.Now,
                //    UpdateDate = DateTime.Now,
                //    IsSample = false,
                //    StartDate = addNewTaskModel.DateWork.Value.Add(TimeSpan.Parse(addNewTaskModel.StartTime)),
                //    EndDate = addNewTaskModel.DateWork.Value.Add(TimeSpan.Parse(addNewTaskModel.EndTime)),
                //    Frequency = "None",
                //    MasterTypeId = getMasterType.MasterTypeId,
                //    IsActive = true,
                //    IsDeleted = false,
                //    Status = "Active",
                //    FarmID = farmId,
                //};
                //await _unitOfWork.PlanRepository.Insert(newPlan);
                //await _unitOfWork.SaveAsync();

                var newSchedule = new CarePlanSchedule()
                {
                    CustomDates = "[" + JsonConvert.SerializeObject(addNewTaskModel.DateWork.Value.ToString("yyyy/MM/dd")) + "]",
                    StartTime = TimeSpan.Parse(addNewTaskModel.StartTime),
                    EndTime = TimeSpan.Parse(addNewTaskModel.EndTime),
                    FarmID = farmId,
                    IsDeleted = false,
                    Status = "Active",
                    HarvestHistoryID = addNewTaskModel.HarvestHistoryId
                };

                //newPlan.CarePlanSchedule = newSchedule;
                await _unitOfWork.CarePlanScheduleRepository.Insert(newSchedule);
                await _unitOfWork.SaveAsync();

                var getListEmployeeId = addNewTaskModel.listEmployee.Select(x => x.UserId).ToList();
                //await _unitOfWork.WorkLogRepository.CheckWorkLogAvailabilityWhenAddPlan(TimeSpan.Parse(addNewTaskModel.StartTime), TimeSpan.Parse(addNewTaskModel.EndTime), addNewTaskModel.DateWork.Value, getMasterType.MasterTypeId, getListEmployeeId);

                var newWorkLog = new WorkLog()
                {
                    WorkLogCode = $"WL{DateTime.Now:yyMMddHHmmssfff}",
                    ScheduleId = newSchedule.ScheduleId,
                    Status = "Not Started",
                    ActualStartTime = newSchedule.StartTime,
                    ActualEndTime = newSchedule.EndTime,
                    Date = addNewTaskModel.DateWork,
                    IsDeleted = false,
                    WorkLogName = addNewTaskModel.TaskName,
                    IsConfirm = false,
                };
                await _unitOfWork.WorkLogRepository.Insert(newWorkLog);
                await _unitOfWork.SaveAsync();
                var conflictDetailsSet = new HashSet<string>();
                if (addNewTaskModel.listEmployee != null)
                {
                    List<UserWorkLog> userWorkLogs = new List<UserWorkLog>();
                    //var savedWorkLogs = await _unitOfWork.WorkLogRepository.GetListWorkLogByWorkLogDate(newWorkLog);

                    //foreach (var workLog in savedWorkLogs)
                    //{
                    //    var conflictedUsers = new List<string>();
                    //    foreach (EmployeeModel user in addNewTaskModel.listEmployee)
                    //    {
                    //        // Kiểm tra User có bị trùng lịch không?
                    //        var conflictedUser = await _unitOfWork.UserWorkLogRepository.CheckUserConflictSchedule(user.UserId, workLog);
                    //        if (conflictedUser != null)
                    //        {
                    //            conflictedUsers.AddRange(conflictedUser.Select(uwl => uwl.User.FullName));
                    //        }
                    //    }

                    //    if (conflictedUsers.Any())
                    //    {
                    //        var uniqueUsers = string.Join(", ", conflictedUsers.Distinct());
                    //        conflictDetailsSet.Add($"{uniqueUsers} have scheduling conflicts on {workLog.Date}");

                    //    }
                    //}
                    //if (conflictDetailsSet.Any())
                    //    return new BusinessResult(400, string.Join("/n", conflictDetailsSet), false);

                    foreach (EmployeeModel user in addNewTaskModel.listEmployee)
                    {
                        userWorkLogs.Add(new UserWorkLog
                        {
                            WorkLogId = newWorkLog.WorkLogId,
                            UserId = user.UserId,
                            IsReporter = user.isReporter,
                            IsDeleted = false,
                            CreateDate = DateTime.Now
                        });

                    }


                    // 🔹 Lưu UserWorkLogs vào DB
                    await _unitOfWork.UserWorkLogRepository.InsertRangeAsync(userWorkLogs);

                    var addNotification = new Notification()
                    {
                        Content = "Work " + addNewTaskModel.TaskName + " has just been created",
                        Title = NotifitationConst.WORKLOG,
                        IsRead = false,
                        MasterTypeId = 36,
                        CreateDate = DateTime.Now,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();
                    foreach (var employee in addNewTaskModel.listEmployee)
                    {
                        var addPlanNotification = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };

                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    }
                    foreach (var employeeModel in addNewTaskModel.listEmployee)
                    {
                        await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                    }
                    var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                    foreach (var employee in getListManagerOfFarm)
                    {
                        var addPlanNotification = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };
                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                        await _webSocketService.SendToUser(employee.UserId, addNotification);

                    }
                }
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    //await transaction.CommitAsync();
                    await _responseCacheService.RemoveCacheByGroupAsync($"{CacheKeyConst.GROUP_FARM_WORKLOG}:{farmId}");
                    return new BusinessResult(Const.SUCCESS_ADD_NEW_TASK_CODE, Const.SUCCESS_ADD_NEW_TASK_MSG, result);
                }
                return new BusinessResult(Const.FAIL_ADD_NEW_TASK_CODE, Const.FAIL_ADD_NEW_TASK_MESSAGE, false);

            }
            catch (Exception ex)
            {
                //await transaction.RollbackAsync();
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
            //}
        }

        public async Task<BusinessResult> AssignTaskForEmployee(int employeeId, int worklogId, int farmId, bool? isRepoter)
        {
            try
            {
                var newListEmployee = new List<int> { employeeId };
                var getWorkLog = await _unitOfWork.WorkLogRepository.GetByID(worklogId);
                await _unitOfWork.WorkLogRepository.CheckConflictTaskOfEmployee(getWorkLog.ActualStartTime.Value, getWorkLog.ActualEndTime.Value, getWorkLog.Date.Value, newListEmployee);
                var result = await _unitOfWork.WorkLogRepository.AssignTaskForUser(employeeId, worklogId, isRepoter);
                var addNotification = new Notification()
                {
                    Content = getWorkLog.WorkLogName + " has changed employee. Please check schedule",
                    Title = NotifitationConst.WORKLOG,
                    IsRead = false,
                    MasterTypeId = 36,
                    CreateDate = DateTime.Now,
                    NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                };
                await _unitOfWork.NotificationRepository.Insert(addNotification);
                await _unitOfWork.SaveAsync();
                var addNotificationForNewEmployee = new PlanNotification()
                {
                    NotificationID = addNotification.NotificationId,
                    CreatedDate = DateTime.Now,
                    isRead = false,
                    UserID = employeeId
                };
                await _unitOfWork.PlanNotificationRepository.Insert(addNotificationForNewEmployee);
                await _webSocketService.SendToUser(employeeId, addNotification);
                var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                foreach (var employee in getListManagerOfFarm)
                {
                    var addNotificationForManager = new PlanNotification()
                    {
                        NotificationID = addNotification.NotificationId,
                        CreatedDate = DateTime.Now,
                        isRead = false,
                        UserID = employee.UserId
                    };
                    await _unitOfWork.PlanNotificationRepository.Insert(addNotificationForManager);
                    await _webSocketService.SendToUser(employee.UserId, addNotification);

                }
                await _unitOfWork.SaveAsync();
                if (result)
                {
                    await _responseCacheService.RemoveCacheByGroupAsync(CacheKeyConst.GROUP_WORKLOG + worklogId.ToString());
                    return new BusinessResult(Const.SUCCESS_ASSIGN_TASK_CODE, Const.SUCCESS_ASSIGN_TASK_MSG, result);
                }
                return new BusinessResult(Const.FAIL_ASSIGN_TASK_CODE, Const.FAIL_ASSIGN_TASK_MESSAGE, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetDetailWorkLog(int workLogId)
        {
            try
            {
                //string key = CacheKeyConst.WORKLOG + $"{workLogId}";
                //var cachedData = await _responseCacheService.GetCacheObjectAsync<BusinessResult<WorkLogDetailModel>>(key);
                //if (cachedData != null)
                //{
                //    return new BusinessResult(cachedData.StatusCode, cachedData.Message, cachedData.Data);
                //}
                var getDetailWorkLog = await _unitOfWork.WorkLogRepository.GetWorkLogIncludeById(workLogId);
                if(getDetailWorkLog == null)
                {
                    return new BusinessResult(400, "Worklog does not exist", null);
                }
                var getStatusNotStarted = await _unitOfWork.SystemConfigRepository
                                      .GetConfigValue(SystemConfigConst.NOT_STARTED.Trim(), "Not Started");
                var getStatusInProgress = await _unitOfWork.SystemConfigRepository
                                       .GetConfigValue(SystemConfigConst.IN_PROGRESS.Trim(), "In Progress");
                var getStatusOverdue = await _unitOfWork.SystemConfigRepository
                                       .GetConfigValue(SystemConfigConst.OVERDUE.Trim(), "Overdue");
                if (getDetailWorkLog.Date != null)
                {
                    if (getDetailWorkLog.Date.Value.Date == DateTime.Now.Date)
                    {
                        if (getDetailWorkLog.Status!.Equals(getStatusNotStarted))
                        {
                            if (getDetailWorkLog.ActualStartTime <= DateTime.Now.TimeOfDay)
                            {
                                getDetailWorkLog.Status = getStatusInProgress;
                                _unitOfWork.WorkLogRepository.Update(getDetailWorkLog);
                                await _unitOfWork.SaveAsync();
                            }
                            if (getDetailWorkLog.ActualEndTime <= DateTime.Now.TimeOfDay)
                            {
                                getDetailWorkLog.Status = getStatusOverdue;
                                _unitOfWork.WorkLogRepository.Update(getDetailWorkLog);
                                await _unitOfWork.SaveAsync();
                            }

                        }
                    }
                }
                var result = _mapper.Map<WorkLogDetailModel>(getDetailWorkLog);
                var assignorId = getDetailWorkLog?.Schedule?.CarePlan?.AssignorId;

                User? getAssignor = null;
                if (assignorId != null)
                {
                    getAssignor = await _unitOfWork.UserRepository
                        .GetByCondition(x => x.UserId == assignorId);
                }
                if (getAssignor != null)
                {
                    result.AssignorName = getAssignor.FullName;
                    result.AssignorId = getAssignor.UserId;
                    result.AssignorAvatarURL = getAssignor.AvatarURL;
                }

                if (getDetailWorkLog.Schedule != null)
                {
                    if (getDetailWorkLog.Schedule.CarePlan != null)
                    {
                        if (getDetailWorkLog.Schedule.CarePlan.PlanTargets != null)
                        {
                            var mappedPlanTargets = MapPlanTargets(getDetailWorkLog.Schedule.CarePlan.PlanTargets.ToList());
                            result.PlanTargetModels = mappedPlanTargets;
                        }
                    }
                }

                var redoWorkLog = getDetailWorkLog.RedoWorkLogID.HasValue
                    ? await _unitOfWork.WorkLogRepository.GetByCondition(x => x.WorkLogId == getDetailWorkLog.RedoWorkLogID)
                    : null;

                var originalRedo = await _unitOfWork.WorkLogRepository.GetByCondition(x => x.RedoWorkLogID == getDetailWorkLog.WorkLogId);
                result.RedoWorkLog = redoWorkLog != null
                   ? new WorkLogBasicModel
                   {
                       WorkLogId = redoWorkLog.WorkLogId,
                       WorkLogName = redoWorkLog.WorkLogName,
                       Date = redoWorkLog.Date,
                       ReasonDelay = redoWorkLog.ReasonDelay,
                       Status = redoWorkLog.Status
                   }
                   : null;
                result.OriginalWorkLog = originalRedo != null
                   ? new WorkLogBasicModel
                   {
                       WorkLogId = originalRedo.WorkLogId,
                       WorkLogName = originalRedo.WorkLogName,
                       Date = originalRedo.Date,
                       ReasonDelay = originalRedo.ReasonDelay,
                       Status = originalRedo.Status
                   }
                   : null;

                if (result != null)
                {
                    string groupKey = CacheKeyConst.GROUP_WORKLOG + $"{getDetailWorkLog.WorkLogId}";
                    var finalResult = new BusinessResult(200, "Get Detail WorkLog Sucesss", result);
                    //await _responseCacheService.RemoveCacheByGroupAsync(CacheKeyConst.GROUP_WORKLOG + getDetailWorkLog.WorkLogId.ToString());
                    //await _responseCacheService.AddCacheWithGroupAsync(groupKey.Trim(), key.Trim(), finalResult, TimeSpan.FromMinutes(5));
                    return finalResult;
                }
                return new BusinessResult(400, "Get Detail WorkLog Failed");

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public List<PlanTargetDisplayModel> MapPlanTargets(List<PlanTarget> planTargets)
        {
            var displayModels = new Dictionary<int, PlanTargetDisplayModel>();

            foreach (var getPlanTarget in planTargets)
            {
                // Tìm hoặc tạo mới displayModel theo LandPlotId
                if (!displayModels.TryGetValue(getPlanTarget.LandPlotID ?? 0, out var displayModel))
                {
                    displayModel = new PlanTargetDisplayModel
                    {
                        LandPlotId = getPlanTarget.LandPlotID,
                        LandPlotName = getPlanTarget.LandPlot?.LandPlotName,
                        Rows = new List<LandRowDisplayModel>(),
                        Plants = new List<PlantDisplayModel>(),
                        PlantLots = new List<PlantLotDisplayModel>(),
                        GraftedPlants = new List<GraftedPlantDisplayModel>()
                    };
                    displayModels[getPlanTarget.LandPlotID ?? 0] = displayModel;
                }

                // HashSet để tránh trùng lặp

                var rowIds = new HashSet<int>(displayModel.Rows.Select(r => r.LandRowId != null ? r.LandRowId.Value : 0));
                var plantIds = new HashSet<int>(displayModel.Plants.Select(p => p.PlantId != null ? p.PlantId.Value : 0));
                var plantLotIds = new HashSet<int>(displayModel.PlantLots.Select(p => p.PlantLotId != null ? p.PlantLotId.Value : 0));
                var graftedPlantIds = new HashSet<int>(displayModel.GraftedPlants.Select(g => g.GraftedPlantId != null ? g.GraftedPlantId.Value : 0));

                bool isFullMode = string.IsNullOrEmpty(getPlanTarget.Unit);

                if (isFullMode || getPlanTarget.Unit == PlanConst.ROW_UNIT)
                {
                    if (getPlanTarget.LandRow != null && rowIds.Add(getPlanTarget.LandRow.LandRowId))
                    {
                        var row = _mapper.Map<LandRowDisplayModel>(getPlanTarget.LandRow);
                        displayModel.Rows.Add(row);
                    }
                }
                if (isFullMode || getPlanTarget.Unit == PlanConst.PLANT_UNIT)
                {
                    if (getPlanTarget.Plant != null && plantIds.Add(getPlanTarget.Plant.PlantId))
                    {
                        var plant = _mapper.Map<PlantDisplayModel>(getPlanTarget.Plant);
                        displayModel.Plants.Add(plant);
                    }
                }
                if (isFullMode || getPlanTarget.Unit == PlanConst.PLANT_LOT_UNIT)
                {
                    if (getPlanTarget.PlantLot != null && plantLotIds.Add(getPlanTarget.PlantLot.PlantLotId))
                    {
                        var plantLot = _mapper.Map<PlantLotDisplayModel>(getPlanTarget.PlantLot);
                        displayModel.PlantLots.Add(plantLot);
                    }
                }
                if (isFullMode || getPlanTarget.Unit == PlanConst.GRAFTED_UNIT)
                {
                    if (getPlanTarget.GraftedPlant != null && graftedPlantIds.Add(getPlanTarget.GraftedPlant.GraftedPlantId))
                    {
                        var graftedPlant = _mapper.Map<GraftedPlantDisplayModel>(getPlanTarget.GraftedPlant);
                        displayModel.GraftedPlants.Add(graftedPlant);
                    }
                }
            }

            return displayModels.Values.ToList();
        }

        public async Task<BusinessResult> GetScheduleEvents(ParamScheduleModel paramCalendarModel)
        {
            try
            {
                var calendar = await _unitOfWork.WorkLogRepository.GetCalendarEvents(paramCalendarModel.UserId, paramCalendarModel.PlanId, paramCalendarModel.StartDate, paramCalendarModel.EndDate, paramCalendarModel.FarmId.Value);
                foreach (var getDetailWorkLog in calendar)
                {
                    var getStatusNotStarted = await _unitOfWork.SystemConfigRepository
                                      .GetConfigValue(SystemConfigConst.NOT_STARTED.Trim(), "Not Started");
                    var getStatusInProgress = await _unitOfWork.SystemConfigRepository
                                           .GetConfigValue(SystemConfigConst.IN_PROGRESS.Trim(), "In Progress");
                    if (getDetailWorkLog.Date != null)
                    {
                        if (getDetailWorkLog.Date.Value.Date == DateTime.Now.Date)
                        {
                            if (getDetailWorkLog.Status!.Equals(getStatusNotStarted))
                            {
                                if (getDetailWorkLog.ActualStartTime <= DateTime.Now.TimeOfDay)
                                {
                                    getDetailWorkLog.Status = getStatusInProgress;
                                    _unitOfWork.WorkLogRepository.Update(getDetailWorkLog);
                                    await _unitOfWork.SaveAsync();
                                }

                            }
                        }
                    }
                }
                var result = calendar
                        .Where(x => x.IsDeleted == false)
                        .Select(wl => new ScheduleModel()
                        {
                            WorkLogId = wl.WorkLogId,
                            WorkLogName = wl.WorkLogName,
                            WorkLogCode = wl.WorkLogCode,
                            Date = wl.Date,
                            Status = wl.Status,
                            ScheduleId = wl.ScheduleId,
                            StartTime = wl.ActualStartTime,
                            EndTime = wl.ActualEndTime,
                            PlanId = wl.Schedule.CarePlan != null ? wl.Schedule.CarePlan.PlanId : null,
                            PlanName = wl.Schedule.CarePlan != null ? wl.Schedule.CarePlan.PlanName : null,
                            StartDate = wl.Schedule.CarePlan != null ? wl.Schedule.CarePlan.StartDate : null,
                            EndDate = wl.Schedule.CarePlan != null ? wl.Schedule.CarePlan.EndDate : null,
                            Users = wl.UserWorkLogs.Select(uwl => new UserScheduleModel()
                            {
                                UserId = uwl.UserId,
                                FullName = uwl.User.FullName,
                                AvatarURL = uwl.User.AvatarURL,
                                IsReporter = uwl.IsReporter,
                                Notes = uwl.Notes,
                                Issue = uwl.Issue,
                            }).ToList() // Danh sách user thực hiện công việc
                        }).ToList();
                if (result != null && result.Count > 0)
                {
                    return new BusinessResult(Const.SUCCESS_HAS_SCHEDULE_CODE, Const.SUCCESS_HAS_SCHEDULE_MSG, result);
                }
                return new BusinessResult(Const.WARNING_NO_SCHEDULE_CODE, Const.WARNING_NO_SCHEDULE_MSG, new List<WorkLog>());
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetScheduleWithFilters(ScheduleFilter scheduleFilter, int? farmId)
        {
            try
            {
                string key = $"{CacheKeyConst.WORKLOG}:{CacheKeyConst.FARM}:{farmId}";

                //await _responseCacheService.RemoveCacheAsync(key);
                //var cachedData = await _responseCacheService.GetCacheObjectAsync<BusinessResult<List<ScheduleModel>>>(key);
                //if (cachedData != null && cachedData.Data != null)
                //{
                //    return new BusinessResult(cachedData.StatusCode, cachedData.Message, cachedData.Data);
                //}
                Expression<Func<WorkLog, bool>> filter = x => x.Schedule.IsDeleted == false || x.IsDeleted == false && x.Schedule.CarePlan.FarmID == farmId;
                Func<IQueryable<WorkLog>, IOrderedQueryable<WorkLog>> orderBy = null!;


                if (scheduleFilter.FromDate.HasValue || scheduleFilter.ToDate.HasValue)
                {
                    if (!scheduleFilter.FromDate.HasValue || !scheduleFilter.ToDate.HasValue)
                    {
                        return new BusinessResult(Const.WARNING_MISSING_DATE_FILTER_CODE, Const.WARNING_MISSING_SCHEDULE_DATE_FILTER_MSG);
                    }

                    if (scheduleFilter.FromDate.Value > scheduleFilter.ToDate.Value)
                    {
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);
                    }
                    filter = filter.And(x => x.Date >= scheduleFilter.FromDate &&
                                             x.Date <= scheduleFilter.ToDate);
                }

                if (!string.IsNullOrEmpty(scheduleFilter.FromTime) || !string.IsNullOrEmpty(scheduleFilter.ToTime))
                {
                    if (string.IsNullOrEmpty(scheduleFilter.FromTime) || string.IsNullOrEmpty(scheduleFilter.ToTime))
                    {
                        return new BusinessResult(Const.WARNING_MISSING_TIME_FILTER_CODE, Const.WARNING_MISSING_TIME_FILTER_MSG);
                    }

                    if (TimeSpan.Parse(scheduleFilter.FromTime) > TimeSpan.Parse(scheduleFilter.ToTime))
                    {
                        return new BusinessResult(Const.WARNING_INVALID_TIME_FILTER_CODE, Const.WARNING_INVALID_TIME_FILTER_MSG);
                    }

                    filter = filter.And(x => x.ActualStartTime.Value.Hours == TimeSpan.Parse(scheduleFilter.FromTime).Hours &&
                                             x.ActualStartTime.Value.Minutes == TimeSpan.Parse(scheduleFilter.FromTime).Minutes &&
                                             x.ActualEndTime.Value.Hours == TimeSpan.Parse(scheduleFilter.ToTime).Hours &&
                                             x.ActualEndTime.Value.Minutes == TimeSpan.Parse(scheduleFilter.ToTime).Minutes);
                }

                if (scheduleFilter.TypePlan != null)
                {
                    List<string> filterList = scheduleFilter.TypePlan.Split(',', StringSplitOptions.TrimEntries)
                                  .Select(f => f.ToLower()) // Chuyển về chữ thường
                                  .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.Schedule.CarePlan.MasterType.MasterTypeName.ToLower().Equals(item));
                    }
                }
                if (scheduleFilter.Assignee != null)
                {
                    List<string> filterList = scheduleFilter.Assignee.Split(',', StringSplitOptions.TrimEntries)
                                  .Select(f => f.ToLower()) // Chuyển về chữ thường
                                  .ToList();

                    var users = await _unitOfWork.UserRepository.GetAllNoPaging();

                    foreach (var item in filterList)
                    {
                        foreach (var user in users)
                        {
                            filter = filter.And(x => x.UserWorkLogs.Any(y => y.User.FullName.ToLower().Equals(item)));
                        }
                    }
                }
                if (scheduleFilter.Status != null)
                {
                    List<string> filterList = scheduleFilter.Status.Split(',', StringSplitOptions.TrimEntries)
                                   .Select(f => f.ToLower()) // Chuyển về chữ thường
                                   .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.Status.ToLower().Equals(item));
                    }
                }

                if (scheduleFilter.GrowthStage != null)
                {
                    List<string> filterList = scheduleFilter.GrowthStage.Split(',', StringSplitOptions.TrimEntries)
                                   .Select(f => f.ToLower()) // Chuyển về chữ thường
                                   .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.Schedule.CarePlan.GrowthStagePlans.Any(y => y.GrowthStage.GrowthStageName.ToLower().Equals(item)));
                    }
                }

                var getAllWorkLog = await _unitOfWork.WorkLogRepository.GetAllNoPaging();
                var entities = await _unitOfWork.WorkLogRepository.GetWorkLog(filter, orderBy);
                foreach (var getDetailWorkLog in entities)
                {
                    var getStatusNotStarted = await _unitOfWork.SystemConfigRepository
                                      .GetConfigValue(SystemConfigConst.NOT_STARTED.Trim(), "Not Started");
                    var getStatusInProgress = await _unitOfWork.SystemConfigRepository
                                           .GetConfigValue(SystemConfigConst.IN_PROGRESS.Trim(), "In Progress");
                    if (getDetailWorkLog.Date != null)
                    {
                        if (getDetailWorkLog.Date.Value.Date == DateTime.Now.Date)
                        {
                            if (getDetailWorkLog.Status != null && getDetailWorkLog.Status!.Equals(getStatusNotStarted))
                            {
                                if (getDetailWorkLog.ActualStartTime <= DateTime.Now.TimeOfDay)
                                {
                                    getDetailWorkLog.Status = getStatusInProgress;
                                    _unitOfWork.WorkLogRepository.Update(getDetailWorkLog);
                                    await _unitOfWork.SaveAsync();
                                }

                            }
                        }
                    }
                }
                var getStatusReceived = await _unitOfWork.SystemConfigRepository
                                        .GetConfigValue(SystemConfigConst.RECEIVED.Trim(), "Received");
                var result = entities
                       .Select(wl => new ScheduleModel()
                       {
                           WorkLogId = wl.WorkLogId,
                           WorkLogName = wl.WorkLogName,
                           WorkLogCode = wl.WorkLogCode,
                           Date = wl.Date,
                           Status = wl.Status,
                           ScheduleId = wl.ScheduleId,
                           StartTime = wl.ActualStartTime,
                           IsTakeAttendance = wl.UserWorkLogs.Any(uwl => uwl.StatusOfUserWorkLog == getStatusReceived),
                           EndTime = wl.ActualEndTime,
                           PlanId = wl.Schedule?.CarePlan?.PlanId,
                           PlanName = wl.Schedule?.CarePlan?.PlanName,
                           StartDate = wl.Schedule?.CarePlan?.StartDate,
                           EndDate = wl.Schedule?.CarePlan?.EndDate,
                           Users = wl.UserWorkLogs.Select(uwl => new UserScheduleModel()
                           {
                               UserId = uwl.UserId,
                               FullName = uwl.User.FullName,
                               AvatarURL = uwl.User.AvatarURL,
                               IsReporter = uwl.IsReporter,
                               Issue = uwl.Issue,
                               Notes = uwl.Notes
                           }).ToList() // Danh sách user thực hiện công việc
                       }).ToList();

                if (result.Any())
                {
                    string groupKey = $"{CacheKeyConst.GROUP_FARM_WORKLOG}:{farmId}";
                    var finalResult = new BusinessResult(Const.SUCCESS_GET_ALL_SCHEDULE_CODE, Const.SUCCESS_GET_ALL_SCHEDULE_MSG, result);
                    await _responseCacheService.AddCacheWithGroupAsync(groupKey.Trim(), key.Trim(), finalResult, TimeSpan.FromMinutes(5));
                    return finalResult;
                }
                else
                {
                    return new BusinessResult(200, Const.WARNING_NO_SCHEDULE_MSG, new List<ScheduleModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> NoteForWorkLog(CreateNoteModel createNoteModel, int farmId)
        {
            try
            {
                var findWorkLog = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == createNoteModel.WorkLogId && x.UserId == createNoteModel.UserId);
                var getWorklog = await _unitOfWork.WorkLogRepository.GetByID(createNoteModel.WorkLogId);
                var getUser = await _unitOfWork.UserRepository.GetByID(createNoteModel.UserId.Value);
                if (findWorkLog != null)
                {
                    findWorkLog.Notes = createNoteModel.Note;
                    findWorkLog.Issue = createNoteModel.Issue;
                    findWorkLog.CreateDate = DateTime.Now;

                    // Khởi tạo đối tượng Resource


                    // Xử lý tài nguyên (hình ảnh/video) nếu có
                    if (createNoteModel.Resources?.Any() == true)
                    {
                        foreach (var resource in createNoteModel.Resources)
                        {
                            if (resource.File != null)
                            {
                                var cloudinaryUrl = await _cloudinaryService.UploadResourceAsync(resource.File, CloudinaryPath.PLANT_GROWTH_HISTORY);
                                if (cloudinaryUrl.Data == null) continue;
                                if (Util.IsVideo(Path.GetExtension(resource.File.FileName)?.TrimStart('.').ToLower()))
                                    resource.FileFormat = FileFormatConst.VIDEO.ToLower();
                                else resource.FileFormat = FileFormatConst.IMAGE.ToLower();
                                var newResource = new Resource()
                                {
                                    ResourceCode = CodeAliasEntityConst.RESOURCE + CodeHelper.GenerateCode(),
                                    ResourceURL = (string)cloudinaryUrl.Data,
                                    ResourceType = ResourceTypeConst.PLANT_GROWTH_HISTORY,
                                    FileFormat = resource.FileFormat,
                                    CreateDate = DateTime.Now,
                                    Description = resource.Description,
                                };
                                findWorkLog.Resources.Add(newResource);
                            }
                        }
                    }
                    _unitOfWork.UserWorkLogRepository.Update(findWorkLog);
                    await _unitOfWork.SaveAsync();
                    var addNotification = new Notification()
                    {
                        Content = getUser.FullName + " has create note on " + getWorklog.WorkLogName + ". Please check it",
                        Title = "WorkLog",
                        IsRead = false,
                        MasterTypeId = 36,
                        CreateDate = DateTime.Now,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();
                    var addNotificationForNote = new PlanNotification()
                    {
                        CreatedDate = DateTime.Now,
                        isRead = false,
                        NotificationID = addNotification.NotificationId,
                        UserID = createNoteModel.UserId
                    };
                    await _unitOfWork.PlanNotificationRepository.Insert(addNotificationForNote);
                    await _webSocketService.SendToUser(createNoteModel.UserId.Value, addNotification);
                    var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                    foreach (var employee in getListManagerOfFarm)
                    {
                        var addNotificationManagerForNote = new PlanNotification()
                        {
                            CreatedDate = DateTime.Now,
                            isRead = false,
                            NotificationID = addNotification.NotificationId,
                            UserID = employee.UserId
                        };
                        await _unitOfWork.PlanNotificationRepository.Insert(addNotificationManagerForNote);
                        await _webSocketService.SendToUser(employee.UserId, addNotification);

                    }
                    await _webSocketService.SendToUser(createNoteModel.UserId.Value, addNotification);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(200, "Take note success", findWorkLog);
                    }
                    else
                    {
                        return new BusinessResult(400, "Take note failed");
                    }

                }
                else
                {
                    return new BusinessResult(404, "Can not find any workLog for take note");
                }

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateWorkLog(UpdateWorkLogModel updateWorkLogModel, int? farmId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if (updateWorkLogModel == null)
                    {
                        throw new Exception("Update failed because nothing was process");
                    }
                    var findWorkLog = await _unitOfWork.WorkLogRepository.GetWorkLogForUpdateById(updateWorkLogModel.WorkLogId);
                    var getStatusNotStarted = await _unitOfWork.SystemConfigRepository
                                        .GetConfigValue(SystemConfigConst.NOT_STARTED.Trim(), "Not Started");
                    if (!findWorkLog.Status.ToLower().Equals(getStatusNotStarted.ToLower()))
                    {
                        throw new Exception("WorkLog is happended. Can not update");
                    }
                    if (updateWorkLogModel.DateWork.Value.Date < DateTime.Now.Date)
                    {
                        throw new Exception("Date Work must be today or a future date");
                    }


                    if (updateWorkLogModel.StartTime != null && updateWorkLogModel.EndTime != null)
                    {
                        if (TimeSpan.Parse(updateWorkLogModel.StartTime) >= TimeSpan.Parse(updateWorkLogModel.EndTime))
                        {
                            throw new Exception("Start time must be less than End Time");
                        }
                        if (updateWorkLogModel.DateWork.Value.Date == DateTime.Now.Date)
                        {
                            if (TimeSpan.Parse(updateWorkLogModel.StartTime) <= DateTime.Now.TimeOfDay)
                            {
                                throw new Exception("Start time must be later than the current time");
                            }

                            if (TimeSpan.Parse(updateWorkLogModel.EndTime) <= TimeSpan.Parse(updateWorkLogModel.StartTime))
                            {
                                throw new Exception("End time must be greater than start time");
                            }
                        }
                    }
                    if (updateWorkLogModel.StartTime != null && updateWorkLogModel.EndTime != null)
                    {
                        var parseStartTime = TimeSpan.Parse(updateWorkLogModel.StartTime);
                        var parseEndTime = TimeSpan.Parse(updateWorkLogModel.EndTime);

                        var checkTime = (int)(parseEndTime - parseStartTime).TotalMinutes; // Chuyển TimeSpan sang số phút

                        var masterType = await _unitOfWork.MasterTypeRepository
                            .GetByCondition(x => x.MasterTypeId == updateWorkLogModel.MasterTypeId);

                        if (masterType != null)
                        {
                            var minTime = masterType.MinTime;
                            var maxTime = masterType.MaxTime;

                            if (checkTime < minTime || checkTime > maxTime)
                            {
                                throw new Exception($"Time of work ({checkTime} minutes) does not valid! It must be in range {minTime} - {maxTime} minutes.");
                            }
                        }
                        if (findWorkLog.Schedule.CarePlan != null)
                        {
                            await _unitOfWork.WorkLogRepository.CheckWorkLogAvailabilityWhenAddPlan(parseStartTime, parseEndTime, updateWorkLogModel.DateWork.Value, findWorkLog.Schedule.CarePlan.MasterTypeId, updateWorkLogModel.listEmployee.Select(x => x.UserId).ToList());
                        }

                    }
                    var checkExistProcess = await _unitOfWork.ProcessRepository.GetByCondition(x => x.ProcessId == updateWorkLogModel.ProcessId);
                    if (updateWorkLogModel.DateWork != null)
                    {
                        DateTime? checkStartDateOfProcess = DateTime.Now;
                        DateTime? checkEndDateOfProcess = DateTime.Now;
                        if (updateWorkLogModel.StartTime != null)
                        {
                            checkStartDateOfProcess = updateWorkLogModel?.DateWork?.Date.Add(TimeSpan.Parse(updateWorkLogModel.StartTime));
                            if (findWorkLog.Schedule != null && findWorkLog.Schedule.CarePlan != null)
                            {
                                findWorkLog.Schedule.CarePlan.StartDate = updateWorkLogModel?.DateWork?.Date.Add(TimeSpan.Parse(updateWorkLogModel.StartTime));
                                findWorkLog.ActualStartTime = TimeSpan.Parse(updateWorkLogModel.StartTime);
                            }

                        }
                        if (updateWorkLogModel != null && updateWorkLogModel.EndTime != null)
                        {
                            checkEndDateOfProcess = updateWorkLogModel?.DateWork?.Date.Add(TimeSpan.Parse(updateWorkLogModel.EndTime));
                            if (findWorkLog.Schedule != null && findWorkLog.Schedule.CarePlan != null)
                            {
                                findWorkLog.Schedule.CarePlan.EndDate = updateWorkLogModel?.DateWork?.Date.Add(TimeSpan.Parse(updateWorkLogModel.EndTime));
                                findWorkLog.ActualEndTime = TimeSpan.Parse(updateWorkLogModel.EndTime);
                            }

                        }
                        if (checkExistProcess != null)
                        {
                            if (checkStartDateOfProcess < checkExistProcess.StartDate ||
                                 checkStartDateOfProcess > checkExistProcess.EndDate ||
                                checkEndDateOfProcess < checkExistProcess.StartDate ||
                                 checkEndDateOfProcess > checkExistProcess.EndDate)
                            {
                                throw new Exception($"StartDate and EndDate of plan must be within the duration of process from " +
                                    $"{checkExistProcess.StartDate:dd/MM/yyyy} to {checkExistProcess.EndDate:dd/MM/yyyy}");
                            }
                        }

                    }
                    if (findWorkLog.Schedule != null && findWorkLog.Schedule.CarePlan != null)
                    {
                        findWorkLog.Schedule.CarePlan.UpdateDate = DateTime.Now;
                        findWorkLog.Schedule.CarePlan.CropId = updateWorkLogModel.CropId;
                        findWorkLog.Schedule.CarePlan.MasterTypeId = updateWorkLogModel.MasterTypeId;
                        findWorkLog.Schedule.CarePlan.ProcessId = updateWorkLogModel.ProcessId;
                        if (findWorkLog.Schedule.CarePlan.PlanTargets != null)
                        {
                            if (updateWorkLogModel.PlanTargetModel != null && updateWorkLogModel.PlanTargetModel.Count > 0)
                            {
                                var removePlanTargetOfPlan = await _unitOfWork.PlanTargetRepository.GetPlanTargetsByPlanId(findWorkLog.Schedule.CarePlan.PlanId);
                                if (removePlanTargetOfPlan != null)
                                {
                                    foreach (var removeOldPlanTarget in removePlanTargetOfPlan)
                                    {
                                        findWorkLog.Schedule.CarePlan.PlanTargets.Remove(removeOldPlanTarget);
                                    }
                                }
                                await _unitOfWork.SaveAsync();
                                // HashSet để lưu các cặp (PlantID, LandPlotID, LandRowID) đã thêm vào tránh trùng lặp
                                HashSet<(int?, int?, int?)> addedPlanTargets = new HashSet<(int?, int?, int?)>();

                                foreach (var plantTarget in updateWorkLogModel.PlanTargetModel)
                                {
                                    List<int> landRowIDs = new List<int>();
                                    HashSet<int> inputPlantIDs = new HashSet<int>(plantTarget.PlantID ?? new List<int>());

                                    // Nếu có LandPlotID, lấy tất cả LandRowID thuộc LandPlot đó
                                    if (plantTarget.LandPlotID.HasValue)
                                    {
                                        var rowsInPlot = await _unitOfWork.LandRowRepository
                                            .GetRowsByLandPlotIdAsync(plantTarget.LandPlotID.Value);
                                        landRowIDs.AddRange(rowsInPlot);
                                    }

                                    // Nếu có LandRowID từ input, thêm vào danh sách
                                    if (plantTarget.LandRowID != null)
                                    {
                                        landRowIDs.AddRange(plantTarget.LandRowID);
                                    }

                                    // Xử lý danh sách không bị trùng LandRowID
                                    landRowIDs = landRowIDs.Distinct().ToList();

                                    // Tạo danh sách chứa tất cả các Plant đã có trong LandRows
                                    HashSet<int> existingPlantIDs = new HashSet<int>();

                                    // Dictionary để lưu danh sách Plant theo từng Row
                                    Dictionary<int, HashSet<int>> rowToPlants = new Dictionary<int, HashSet<int>>();

                                    foreach (var rowId in landRowIDs)
                                    {
                                        // Lấy danh sách plants có sẵn trong row này
                                        var plantsInRow = await _unitOfWork.PlantRepository.getPlantByRowId(rowId);

                                        if (!rowToPlants.ContainsKey(rowId))
                                        {
                                            rowToPlants[rowId] = new HashSet<int>();
                                        }

                                        // Thêm plants từ DB vào row
                                        rowToPlants[rowId].UnionWith(plantsInRow);

                                        // Lưu lại tất cả PlantID đã có trong các LandRow để loại bỏ khỏi ListPlant bên ngoài
                                        existingPlantIDs.UnionWith(plantsInRow);
                                    }

                                    if (plantTarget.LandPlotID.HasValue && plantTarget.Unit.ToLower().Equals("landplot"))
                                    {
                                        // **Insert dữ liệu cho từng LandRow (tránh trùng lặp)**
                                        foreach (var row in rowToPlants)
                                        {
                                            foreach (var plantId in row.Value)
                                            {
                                                if (!addedPlanTargets.Contains((plantId, plantTarget.LandPlotID, row.Key)))
                                                {
                                                    var newPlantTarget = new PlanTarget()
                                                    {
                                                        LandPlotID = plantTarget.LandPlotID,
                                                        LandRowID = row.Key,
                                                        PlantID = plantId,
                                                        PlantLotID = null,
                                                        Unit = "Land Plot",
                                                        GraftedPlantID = null,
                                                    };

                                                    findWorkLog.Schedule.CarePlan.PlanTargets.Add(newPlantTarget);
                                                    addedPlanTargets.Add((plantId, plantTarget.LandPlotID, row.Key)); // Đánh dấu đã thêm
                                                }
                                            }
                                        }
                                    }
                                    else
                                    {
                                        // **Insert dữ liệu cho từng LandRow (tránh trùng lặp)**
                                        if (plantTarget.Unit.ToLower().Equals("row"))
                                        {
                                            foreach (var row in rowToPlants)
                                            {
                                                foreach (var plantId in row.Value)
                                                {
                                                    if (!addedPlanTargets.Contains((plantId, plantTarget.LandPlotID, row.Key)))
                                                    {
                                                        var newPlantTarget = new PlanTarget()
                                                        {
                                                            LandPlotID = plantTarget.LandPlotID,
                                                            LandRowID = row.Key,
                                                            PlantID = plantId,
                                                            PlantLotID = null,
                                                            Unit = "Row",
                                                            GraftedPlantID = null,
                                                        };

                                                        findWorkLog.Schedule.CarePlan.PlanTargets.Add(newPlantTarget);
                                                        addedPlanTargets.Add((plantId, plantTarget.LandPlotID, row.Key)); // Đánh dấu đã thêm
                                                    }
                                                }
                                            }
                                        }

                                        // **Xử lý các PlantID từ input (chỉ insert nếu nó không có trong LandRows)**
                                        var plantsToInsert = inputPlantIDs.Except(existingPlantIDs).ToList();
                                        if (plantTarget.Unit.ToLower().Equals("plant"))
                                        {
                                            plantsToInsert = inputPlantIDs
                                                    .Where(id => !addedPlanTargets.Any(t => t.Item1 == id))
                                                    .ToList();
                                        }
                                        foreach (var plantId in plantsToInsert)
                                        {
                                            if (!addedPlanTargets.Contains((plantId, null, null)))
                                            {
                                                var newPlantTarget = new PlanTarget()
                                                {
                                                    PlantID = plantId, // Chỉ insert PlantID nếu nó chưa có trong các LandRow
                                                    LandPlotID = null,
                                                    LandRowID = null,
                                                    PlantLotID = null,
                                                    Unit = "Plant",
                                                    GraftedPlantID = null
                                                };

                                                findWorkLog.Schedule.CarePlan.PlanTargets.Add(newPlantTarget);
                                                addedPlanTargets.Add((plantId, null, null)); // Đánh dấu đã thêm
                                            }
                                        }

                                    }
                                    // **Insert mỗi PlantLotID một dòng riêng**
                                    if (plantTarget.PlantLotID != null)
                                    {
                                        foreach (var plantLotId in plantTarget.PlantLotID)
                                        {
                                            if (!addedPlanTargets.Contains((null, null, plantLotId)))
                                            {
                                                var newPlantLotTarget = new PlanTarget()
                                                {
                                                    LandPlotID = null,
                                                    LandRowID = null,
                                                    PlantID = null,
                                                    Unit = plantTarget.Unit,
                                                    PlantLotID = plantLotId,
                                                    GraftedPlantID = null
                                                };

                                                findWorkLog.Schedule.CarePlan.PlanTargets.Add(newPlantLotTarget);
                                                addedPlanTargets.Add((null, null, plantLotId)); // Đánh dấu đã thêm
                                            }
                                        }
                                    }

                                    // **Insert mỗi GraftedPlantID một dòng riêng**
                                    if (plantTarget.GraftedPlantID != null)
                                    {
                                        foreach (var graftedPlantId in plantTarget.GraftedPlantID)
                                        {
                                            if (!addedPlanTargets.Contains((null, null, graftedPlantId)))
                                            {
                                                var newGraftedPlantTarget = new PlanTarget()
                                                {
                                                    LandPlotID = null,
                                                    LandRowID = null,
                                                    PlantID = null,
                                                    Unit = plantTarget.Unit,
                                                    PlantLotID = null,
                                                    GraftedPlantID = graftedPlantId
                                                };

                                                findWorkLog.Schedule.CarePlan.PlanTargets.Add(newGraftedPlantTarget);
                                                addedPlanTargets.Add((null, null, graftedPlantId)); // Đánh dấu đã thêm
                                            }
                                        }
                                    }

                                    await _unitOfWork.SaveAsync();
                                }
                            }
                            if (updateWorkLogModel.GrowthStageIds != null)
                            {
                                foreach (var growthStagePlanItem in updateWorkLogModel.GrowthStageIds)
                                {
                                    var growthStagePlan = new GrowthStagePlan()
                                    {
                                        GrowthStageID = growthStagePlanItem,
                                    };
                                    findWorkLog.Schedule.CarePlan.GrowthStagePlans.Add(growthStagePlan);
                                }
                            }
                        }
                        if (updateWorkLogModel.StartTime != null)
                        {
                            findWorkLog.Schedule.StartTime = TimeSpan.Parse(updateWorkLogModel.StartTime);
                            findWorkLog.ActualStartTime = TimeSpan.Parse(updateWorkLogModel.StartTime);
                        }
                        if (updateWorkLogModel.EndTime != null)
                        {
                            findWorkLog.Schedule.EndTime = TimeSpan.Parse(updateWorkLogModel.EndTime);
                            findWorkLog.ActualEndTime = TimeSpan.Parse(updateWorkLogModel.EndTime);
                        }
                        if (updateWorkLogModel.DateWork != null)
                        {
                            findWorkLog.Schedule.CustomDates = updateWorkLogModel.DateWork.Value.Date.ToString("dd/MM/yyyy");
                        }
                        if (updateWorkLogModel.StartTime != null && updateWorkLogModel.EndTime != null && updateWorkLogModel.DateWork != null)
                        {
                            await _unitOfWork.WorkLogRepository.CheckConflictTaskOfEmployee(TimeSpan.Parse(updateWorkLogModel.StartTime), TimeSpan.Parse(updateWorkLogModel.EndTime), updateWorkLogModel.DateWork.Value, updateWorkLogModel.listEmployee.Select(x => x.UserId).ToList());
                        }

                    }
                    findWorkLog.Status = updateWorkLogModel.Status;
                    findWorkLog.Date = updateWorkLogModel.DateWork;
                    findWorkLog.WorkLogName = updateWorkLogModel.WorkLogName;
                    findWorkLog.IsConfirm = updateWorkLogModel.IsConfirm;
                    _unitOfWork.WorkLogRepository.Update(findWorkLog);
                    await _unitOfWork.SaveAsync();
                    if (updateWorkLogModel.listEmployee != null)
                    {
                        var deleteUserWorkLog = await _unitOfWork.UserWorkLogRepository.DeleteUserWorkLogByWorkLogId(updateWorkLogModel.WorkLogId);
                        if (deleteUserWorkLog)
                        {
                            foreach (var employee in updateWorkLogModel.listEmployee)
                            {
                                var newUserWorkLog = new UserWorkLog()
                                {
                                    WorkLogId = findWorkLog.WorkLogId,
                                    UserId = employee.UserId,
                                    IsReporter = employee.isReporter,
                                    IsDeleted = false
                                };
                                await _unitOfWork.UserWorkLogRepository.Insert(newUserWorkLog);
                            }
                        }
                        await _unitOfWork.SaveAsync();
                        var addNotification = new Notification()
                        {
                            Content = "WorkLog " + findWorkLog.WorkLogName + " has been updated. Please check schedule",
                            Title = "WorkLog",
                            IsRead = false,
                            MasterTypeId = 36,
                            CreateDate = DateTime.Now,
                            NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                        };
                        await _unitOfWork.NotificationRepository.Insert(addNotification);
                        await _unitOfWork.SaveAsync();
                        foreach (var employeeModel in updateWorkLogModel.listEmployee)
                        {
                            var addEmployeeNotification = new PlanNotification()
                            {
                                NotificationID = addNotification.NotificationId,
                                CreatedDate = DateTime.Now,
                                isRead = false,
                                UserID = employeeModel.UserId,
                            };
                            await _unitOfWork.PlanNotificationRepository.Insert(addEmployeeNotification);
                            await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                        }
                        var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                        foreach (var employee in getListManagerOfFarm)
                        {
                            var addNotificationForManager = new PlanNotification()
                            {
                                NotificationID = addNotification.NotificationId,
                                CreatedDate = DateTime.Now,
                                isRead = false,
                                UserID = employee.UserId,
                            };
                            await _unitOfWork.PlanNotificationRepository.Insert(addNotificationForManager);
                            await _webSocketService.SendToUser(employee.UserId, addNotification);

                        }
                    }

                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_ADD_NEW_TASK_CODE, "Update WorkLog Success", result);
                    }
                    return new BusinessResult(Const.FAIL_ADD_NEW_TASK_CODE, "Update WorkLog Failed", false);

                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        private async Task<string> GeneratePlanCode(int? plantId, int? landPlotId, int masterTypeId)
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
        public bool IsImageFile(IFormFile file)
        {
            string[] validImageTypes = { "image/jpeg", "image/png", "image/gif" };
            string[] validImageExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

            string contentType = file.ContentType.ToLower();
            string extension = Path.GetExtension(file.FileName)?.ToLower();

            return validImageTypes.Contains(contentType) && validImageExtensions.Contains(extension);
        }
        public bool IsImageLink(string url)
        {
            string[] validImageExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
            return url.Contains("/image/") && validImageExtensions.Contains(Path.GetExtension(url).ToLower());
        }

        public async Task<BusinessResult> DeleteWorkLog(int workLogId)
        {
            try
            {
                // Lấy WorkLog và include các bảng liên quan
                var getWorkLog = await _unitOfWork.WorkLogRepository.GetWorkLogByIdForDelete(
                    workLogId
                );

                if (getWorkLog == null)
                {
                    return new BusinessResult(404, "Cannot find any WorkLog");
                }

                // Nếu WorkLog đã quá hạn, không cho phép xóa
                if (getWorkLog.Date <= DateTime.Now)
                {
                    return new BusinessResult(404, "This WorkLog is overdue. Cannot delete");
                }

                int result = 0;



                // Xóa danh sách UserWorkLogs (nếu có)
                if (getWorkLog.UserWorkLogs?.Any() == true)
                {
                    _unitOfWork.UserWorkLogRepository.RemoveRange(getWorkLog.UserWorkLogs);
                    await _unitOfWork.SaveAsync();
                }

                // Xóa danh sách TaskFeedbacks (nếu có)
                if (getWorkLog.TaskFeedbacks?.Any() == true)
                {
                    _unitOfWork.TaskFeedbackRepository.RemoveRange(getWorkLog.TaskFeedbacks);
                    await _unitOfWork.SaveAsync();
                }

                if (getWorkLog.Date.HasValue)
                {
                    if (getWorkLog.Schedule.CarePlan != null)
                    {
                        var getPlanOfWorkLog = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == getWorkLog.Schedule.CarePlan.PlanId);
                        if (getPlanOfWorkLog != null && getWorkLog.Date.Value.Date == getPlanOfWorkLog.EndDate.Value.Date)
                        {
                            getPlanOfWorkLog.EndDate = getPlanOfWorkLog.EndDate.Value.AddDays(-1);
                            await _unitOfWork.SaveAsync();
                        }
                    }
                }
                // Xóa chính WorkLog
                _unitOfWork.WorkLogRepository.Delete(getWorkLog);

                // Lưu tất cả thay đổi trong một lần
                result = await _unitOfWork.SaveAsync();

                if (result > 0)
                {
                    await _responseCacheService.RemoveCacheByGroupAsync(CacheKeyConst.GROUP_WORKLOG + getWorkLog.WorkLogId.ToString());
                    return new BusinessResult(200, "Delete WorkLog Success", result);
                }
                else
                {
                    return new BusinessResult(400, "Delete WorkLog Failed");
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> AddNewWorkLog(AddWorkLogModel addNewTaskModel, int? farmId)
        {
            try
            {
                var parseStartTime = TimeSpan.TryParse(addNewTaskModel.StartTime, out var startTime);
                var parseEndTime = TimeSpan.TryParse(addNewTaskModel.EndTime, out var endTime);


                var getExistPlan = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == addNewTaskModel.PlanId && x.FarmID == farmId);

                if (addNewTaskModel.StartTime != null && addNewTaskModel.EndTime != null)
                {
                    var checkTime = (int)(endTime - startTime).TotalMinutes; // Chuyển TimeSpan sang số phút

                    var masterType = await _unitOfWork.MasterTypeRepository
                        .GetByCondition(x => x.MasterTypeId == getExistPlan.MasterTypeId);

                    if (masterType != null)
                    {
                        var minTime = masterType.MinTime;
                        var maxTime = masterType.MaxTime;

                        if (checkTime < minTime || checkTime > maxTime)
                        {
                            throw new Exception($"Time of work ({checkTime} minutes) does not valid! It must be in range {minTime} - {maxTime} minutes.");
                        }
                    }
                }

                await _unitOfWork.WorkLogRepository.CheckWorkLogAvailabilityWhenAddPlan(
                                                                      startTime,
                                                                       endTime,
                                                                       addNewTaskModel.DateWork,
                                                                       getExistPlan.MasterTypeId,
                                                                        addNewTaskModel.listEmployee.Select(x => x.UserId).ToList()
                                                                   );
                var newSchedule = new CarePlanSchedule()
                {
                    Status = "Active",
                    CarePlanId = addNewTaskModel.PlanId,
                    StartTime = startTime,
                    EndTime = endTime,
                    IsDeleted = false,
                    CustomDates = "[" + JsonConvert.SerializeObject(addNewTaskModel.DateWork.ToString("yyyy/MM/dd")) + "]",
                    FarmID = farmId,
                };

                if (getExistPlan != null)
                {
                    getExistPlan.CarePlanSchedule = newSchedule;
                }
                await _unitOfWork.CarePlanScheduleRepository.Insert(newSchedule);
                await _unitOfWork.SaveAsync();
                var getStatusNotStarted = await _unitOfWork.SystemConfigRepository
                        .GetConfigValue(SystemConfigConst.NOT_STARTED.Trim(), "Not Started");
                var addNewWorkLog = new WorkLog()
                {
                    WorkLogCode = $"WL{DateTime.Now:yyMMddHHmmssfff}",
                    Date = addNewTaskModel.DateWork,
                    WorkLogName = addNewTaskModel.WorkLogName,
                    ActualStartTime = startTime,
                    ActualEndTime = endTime,
                    IsDeleted = false,
                    Status = getStatusNotStarted,
                    ScheduleId = newSchedule.ScheduleId
                };
                newSchedule.WorkLogs.Add(addNewWorkLog);
                await _unitOfWork.WorkLogRepository.Insert(addNewWorkLog);
                await _unitOfWork.SaveAsync();

                var conflictDetailsSet = new HashSet<string>();
                if (addNewTaskModel.listEmployee != null)
                {
                    List<UserWorkLog> userWorkLogs = new List<UserWorkLog>();
                    var savedWorkLogs = await _unitOfWork.WorkLogRepository.GetListWorkLogByWorkLogDate(addNewWorkLog);

                    foreach (var workLog in savedWorkLogs)
                    {
                        var conflictedUsers = new List<string>();
                        foreach (EmployeeModel user in addNewTaskModel.listEmployee)
                        {
                            // Kiểm tra User có bị trùng lịch không?
                            var conflictedUser = await _unitOfWork.UserWorkLogRepository.CheckUserConflictSchedule(user.UserId, workLog);
                            if (conflictedUser != null)
                            {
                                conflictedUsers.AddRange(conflictedUser.Select(uwl => uwl.User.FullName));
                            }
                        }

                        if (conflictedUsers.Any())
                        {
                            var uniqueUsers = string.Join(", ", conflictedUsers.Distinct());
                            conflictDetailsSet.Add($"{uniqueUsers} have scheduling conflicts on {workLog.Date}");
                        }
                    }


                    foreach (EmployeeModel user in addNewTaskModel.listEmployee)
                    {
                        userWorkLogs.Add(new UserWorkLog
                        {
                            WorkLogId = addNewWorkLog.WorkLogId,
                            UserId = user.UserId,
                            IsReporter = user.isReporter,
                            IsDeleted = false
                        });

                    }


                    // 🔹 Lưu UserWorkLogs vào DB
                    await _unitOfWork.UserWorkLogRepository.InsertRangeAsync(userWorkLogs);

                    var addNotification = new Notification()
                    {
                        Content = "Work " + addNewTaskModel.WorkLogName + " has just been created",
                        Title = "WorkLog",
                        IsRead = false,
                        MasterTypeId = 36,
                        CreateDate = DateTime.Now,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();
                    foreach (var employee in addNewTaskModel.listEmployee)
                    {
                        var addPlanNotification = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };

                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    }

                    var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                    foreach (var employee in getListManagerOfFarm)
                    {
                        var addPlanNotificationForManager = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };
                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotificationForManager);
                        await _webSocketService.SendToUser(employee.UserId, addNotification);

                    }
                    foreach (var employeeModel in addNewTaskModel.listEmployee)
                    {
                        await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                    }
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await _responseCacheService.RemoveCacheByGroupAsync($"{CacheKeyConst.GROUP_FARM_WORKLOG}:{farmId}");
                        return new BusinessResult(200, "Add WorkLog Success", result > 0);
                    }
                    return new BusinessResult(400, "Add WorkLog Failed");
                }
                else
                {
                    return new BusinessResult(400, "List Employee is empty");
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateStatusWorkLog(UpdateStatusWorkLogModel updateStatusWorkLogModel, int? farmId)
        {
            try
            {
                var getWorkLogToUpdate = await _unitOfWork.WorkLogRepository.GetByCondition(x => x.WorkLogId == updateStatusWorkLogModel.WorkLogId, "UserWorkLogs");
                if (getWorkLogToUpdate == null)
                {
                    return new BusinessResult(404, "WorkLog does not exist");

                }


                var validStatuses = typeof(WorkLogStatusConst)
                    .GetFields(BindingFlags.Public | BindingFlags.Static)
                    .Select(f => f.GetValue(null)?.ToString().ToLower()) // Chuyển tất cả về chữ thường
                    .ToList();
                if (!validStatuses.Contains(updateStatusWorkLogModel.Status.ToLower()))
                {
                    return new BusinessResult(400, "Status does not valid");
                }
                getWorkLogToUpdate.Status = updateStatusWorkLogModel.Status;


                var parseStartTime = TimeSpan.TryParse(updateStatusWorkLogModel.StartTime, out var startTime);
                var parseEndTime = TimeSpan.TryParse(updateStatusWorkLogModel.EndTime, out var endTime);

                if (parseStartTime)
                {
                    getWorkLogToUpdate.ActualStartTime = startTime;
                }
                if (parseEndTime)
                {
                    getWorkLogToUpdate.ActualEndTime = endTime;
                }
                if (updateStatusWorkLogModel.DateWork != null)
                {
                    getWorkLogToUpdate.Date = updateStatusWorkLogModel.DateWork;
                }


                _unitOfWork.WorkLogRepository.Update(getWorkLogToUpdate);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {

                    var addNotification = new Notification()
                    {
                        Content = "Status of " + getWorkLogToUpdate.WorkLogName + " has adjusted. Please check it",
                        Title = "WorkLog",
                        IsRead = false,
                        MasterTypeId = 36,
                        CreateDate = DateTime.Now,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();
                    var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                    foreach (var employee in getListManagerOfFarm)
                    {
                        var addPlanNotification = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };
                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    }

                    foreach (var employee in getWorkLogToUpdate.UserWorkLogs)
                    {
                        var addPlanNotification = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };

                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    }

                    await _unitOfWork.SaveAsync();

                    foreach (var employeeModel in getListManagerOfFarm)
                    {
                        await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                    }

                    foreach (var employeeModel in getWorkLogToUpdate.UserWorkLogs)
                    {
                        await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                    }
                    await _responseCacheService.RemoveCacheByGroupAsync($"{CacheKeyConst.GROUP_FARM_WORKLOG}:{farmId}");
                    await _responseCacheService.RemoveCacheByGroupAsync(CacheKeyConst.GROUP_WORKLOG + getWorkLogToUpdate.WorkLogId.ToString());

                    return new BusinessResult(200, "Update Status of WorkLog Success");
                }
                else
                {
                    return new BusinessResult(400, "Update Status of WorkLog Failed");
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ReAssignEmployeeForWorkLog(int workLogId, List<EmployeeModel> employeeModels, int? farmId)
        {
            try
            {
                var getWorkLogToReAssign = await _unitOfWork.WorkLogRepository.GetByCondition(X => X.WorkLogId == workLogId, "UserWorkLogs,TaskFeedbacks");
                if (getWorkLogToReAssign != null)
                {
                    if (getWorkLogToReAssign.UserWorkLogs != null)
                    {
                        foreach (var employee in getWorkLogToReAssign.UserWorkLogs)
                        {
                            _unitOfWork.UserWorkLogRepository.Delete(employee);
                            await _unitOfWork.SaveAsync();
                        }
                    }
                    if (getWorkLogToReAssign.TaskFeedbacks != null)
                    {
                        foreach (var taskFeedback in getWorkLogToReAssign.TaskFeedbacks)
                        {
                            _unitOfWork.TaskFeedbackRepository.Delete(taskFeedback);
                            await _unitOfWork.SaveAsync();
                        }
                    }

                    var conflictDetailsSet = new HashSet<string>();

                    if (employeeModels != null)
                    {
                        List<UserWorkLog> userWorkLogs = new List<UserWorkLog>();
                        var savedWorkLogs = await _unitOfWork.WorkLogRepository.GetListWorkLogByWorkLogDate(getWorkLogToReAssign);

                        foreach (var workLog in savedWorkLogs)
                        {
                            var conflictedUsers = new List<string>();
                            foreach (EmployeeModel user in employeeModels)
                            {
                                // Kiểm tra User có bị trùng lịch không?
                                var conflictedUser = await _unitOfWork.UserWorkLogRepository.CheckUserConflictSchedule(user.UserId, workLog);
                                if (conflictedUser != null)
                                {
                                    conflictedUsers.AddRange(conflictedUser.Select(uwl => uwl.User.FullName));
                                }
                            }

                            if (conflictedUsers.Any())
                            {
                                var uniqueUsers = string.Join(", ", conflictedUsers.Distinct());
                                conflictDetailsSet.Add($"{uniqueUsers} have scheduling conflicts on {workLog.Date}");
                            }

                            foreach (EmployeeModel user in employeeModels)
                            {
                                userWorkLogs.Add(new UserWorkLog
                                {
                                    WorkLogId = workLog.WorkLogId,
                                    UserId = user.UserId,
                                    IsReporter = user.isReporter,
                                    IsDeleted = false
                                });

                            }
                        }

                        // 🔹 Lưu UserWorkLogs vào DB
                        await _unitOfWork.UserWorkLogRepository.InsertRangeAsync(userWorkLogs);


                        var addNotification = new Notification()
                        {
                            Content = "Work " + getWorkLogToReAssign.WorkLogName + " has adjusted. Please check schedule",
                            Title = "WorkLog",
                            IsRead = false,
                            MasterTypeId = 36,
                            CreateDate = DateTime.Now,
                            NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                        };
                        await _unitOfWork.NotificationRepository.Insert(addNotification);
                        var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                        foreach (var employee in getListManagerOfFarm)
                        {
                            var addPlanNotification = new PlanNotification()
                            {
                                NotificationID = addNotification.NotificationId,
                                CreatedDate = DateTime.Now,
                                UserID = employee.UserId,
                                isRead = false,
                            };
                            await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                            await _webSocketService.SendToUser(employee.UserId, addNotification);

                        }

                        foreach (var employee in getWorkLogToReAssign.UserWorkLogs)
                        {
                            var addPlanNotification = new PlanNotification()
                            {
                                NotificationID = addNotification.NotificationId,
                                CreatedDate = DateTime.Now,
                                UserID = employee.UserId,
                                isRead = false,
                            };

                            await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                        }

                        await _unitOfWork.SaveAsync();
                        _unitOfWork.WorkLogRepository.Update(getWorkLogToReAssign);
                        var result = await _unitOfWork.SaveAsync();
                        if (result > 0)
                        {
                            foreach (var employeeModel in employeeModels)
                            {
                                await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                            }

                            foreach (var employeeModel in getWorkLogToReAssign.UserWorkLogs)
                            {
                                await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                            }
                            return new BusinessResult(200, "Re assign WorkLog Success", getWorkLogToReAssign);
                        }
                        return new BusinessResult(400, "ReAssign WorkLog Failed");
                    }
                    else
                    {
                        return new BusinessResult(400, "List Employee to re assign is empty");
                    }
                }

                else
                {
                    return new BusinessResult(404, "Can not find any workLog");
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ChangeEmployeeOfWorkLog(ChangeEmployeeOfWorkLog changeEmployeeOfWorkLog)
        {
            try
            {
                var getWorkLog = await _unitOfWork.WorkLogRepository.GetByCondition(x => x.WorkLogId == changeEmployeeOfWorkLog.WorkLogId);
                var getStatusRejected = await _unitOfWork.SystemConfigRepository
                        .GetConfigValue(SystemConfigConst.REJECTED.Trim(), "Rejected");
                var getStatusReplaced = await _unitOfWork.SystemConfigRepository
                        .GetConfigValue(SystemConfigConst.REPLACED.Trim(), "Replaced");
                var getStatusBeReplaced = await _unitOfWork.SystemConfigRepository
                        .GetConfigValue(SystemConfigConst.BEREPLACED.Trim(), "BeReplaced");
                if (getWorkLog == null)
                {
                    return new BusinessResult(404, "Can not find any worklog");
                }

                if (changeEmployeeOfWorkLog.StartTime != null)
                {
                    getWorkLog.ActualStartTime = TimeSpan.Parse(changeEmployeeOfWorkLog.StartTime);
                }
                if (changeEmployeeOfWorkLog.EndTime != null)
                {
                    getWorkLog.ActualEndTime = TimeSpan.Parse(changeEmployeeOfWorkLog.EndTime);
                }
                if (changeEmployeeOfWorkLog.DateWork != null && changeEmployeeOfWorkLog.StartTime != null && changeEmployeeOfWorkLog.EndTime != null)
                {
                    if (TimeSpan.Parse(changeEmployeeOfWorkLog.StartTime) >= TimeSpan.Parse(changeEmployeeOfWorkLog.EndTime))
                    {
                        throw new Exception("Start time must be less than End Time");
                    }
                    if (changeEmployeeOfWorkLog.DateWork.Value.Date == DateTime.Now.Date)
                    {
                        if (TimeSpan.Parse(changeEmployeeOfWorkLog.StartTime) <= DateTime.Now.TimeOfDay)
                        {
                            throw new Exception("Start time must be later than the current time");
                        }

                        if (TimeSpan.Parse(changeEmployeeOfWorkLog.EndTime) <= TimeSpan.Parse(changeEmployeeOfWorkLog.StartTime))
                        {
                            throw new Exception("End time must be greater than start time");
                        }
                    }
                    getWorkLog.Date = changeEmployeeOfWorkLog.DateWork;
                }
                _unitOfWork.WorkLogRepository.Update(getWorkLog);
                var addNotification = new Notification()
                {
                    Content = $"Worklog has changed. You will assigned on worklog at {getWorkLog.Date}. Please check schedule",
                    Title = "WorkLog",
                    IsRead = false,
                    MasterTypeId = 37,
                    CreateDate = DateTime.Now,
                    NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()
                };
                await _unitOfWork.NotificationRepository.Insert(addNotification);
                await _unitOfWork.SaveAsync();
                foreach (var changeEmployee in changeEmployeeOfWorkLog.ListEmployeeUpdate)
                {
                    var getUserToUpdate = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == changeEmployeeOfWorkLog.WorkLogId && x.UserId == changeEmployee.OldUserId);
                    if (getUserToUpdate == null)
                        return new BusinessResult(400, "WorkLog does not exist");
                    if (changeEmployee.OldUserId == changeEmployee.NewUserId)
                    {
                        return new BusinessResult(400, "Old UserId must be different New UserId");
                    }
                    if (changeEmployee.Status != null)
                    {
                        if (changeEmployee.Status.ToLower().Equals("add"))
                        {
                            // Nếu đã có người thay thế trước đó, cập nhật người mới thay vì insert liên tục
                            if (getUserToUpdate.ReplaceUserId != null)
                            {
                                // Xóa user thay thế trước đó để tránh dư thừa dữ liệu
                                var existingReplacement = await _unitOfWork.UserWorkLogRepository
                                    .GetByCondition(x => x.UserId == getUserToUpdate.ReplaceUserId
                                                         && x.WorkLogId == getUserToUpdate.WorkLogId);

                                if (existingReplacement != null)
                                {
                                    _unitOfWork.UserWorkLogRepository.Delete(existingReplacement);
                                    await _unitOfWork.SaveAsync();
                                }

                                // Cập nhật lại ReplaceUserId thành người mới
                                getUserToUpdate.ReplaceUserId = changeEmployee.NewUserId;
                            }
                            else
                            {
                                getUserToUpdate.StatusOfUserWorkLog = getStatusRejected;
                                getUserToUpdate.ReplaceUserId = changeEmployee.NewUserId;
                            }

                            _unitOfWork.UserWorkLogRepository.Update(getUserToUpdate);
                            await _unitOfWork.SaveAsync();

                            // Chỉ tạo mới người cuối cùng
                            var newUserWorkLog = new UserWorkLog()
                            {
                                CreateDate = DateTime.Now,
                                UserId = changeEmployee.NewUserId,
                                IsReporter = changeEmployee.IsReporter,
                                WorkLogId = getUserToUpdate.WorkLogId,
                                IsDeleted = false,
                                StatusOfUserWorkLog = getStatusReplaced,
                            };

                            var addNewUserNotification = new PlanNotification()
                            {
                                NotificationID = addNotification.NotificationId,
                                CreatedDate = DateTime.Now,
                                isRead = false,
                                UserID = changeEmployee.NewUserId
                            };
                            var addOldUserNotification = new PlanNotification()
                            {
                                NotificationID = addNotification.NotificationId,
                                CreatedDate = DateTime.Now,
                                isRead = false,
                                UserID = changeEmployee.OldUserId
                            };
                            await _unitOfWork.PlanNotificationRepository.Insert(addNewUserNotification);
                            await _unitOfWork.PlanNotificationRepository.Insert(addOldUserNotification);
                            await _webSocketService.SendToUser(changeEmployee.NewUserId, addNotification);
                            await _webSocketService.SendToUser(changeEmployee.OldUserId, addNotification);
                            await _unitOfWork.UserWorkLogRepository.Insert(newUserWorkLog);
                        }

                        else if (changeEmployee.Status.ToLower().Equals("update"))
                        {
                            // Nếu đổi rồi nhưng cuối cùng chọn lại người cũ thì không cần thay đổi
                            if (changeEmployee.NewUserId == getUserToUpdate.UserId)
                            {
                                continue; // Không làm gì cả
                            }

                            // Nếu thực sự đổi người mới
                            getUserToUpdate.StatusOfUserWorkLog = getStatusBeReplaced;
                            getUserToUpdate.ReplaceUserId = changeEmployee.NewUserId;
                            getUserToUpdate.IsDeleted = true;
                            _unitOfWork.UserWorkLogRepository.Update(getUserToUpdate);
                            await _unitOfWork.SaveAsync();

                            var newUserWorkLog = new UserWorkLog()
                            {
                                CreateDate = DateTime.Now,
                                UserId = changeEmployee.NewUserId,
                                IsReporter = changeEmployee.IsReporter,
                                WorkLogId = getUserToUpdate.WorkLogId,
                                IsDeleted = false,
                                StatusOfUserWorkLog = getStatusReplaced,
                            };
                            var addNewUserNotification = new PlanNotification()
                            {
                                NotificationID = addNotification.NotificationId,
                                CreatedDate = DateTime.Now,
                                isRead = false,
                                UserID = changeEmployee.NewUserId
                            };
                            var addOldUserNotification = new PlanNotification()
                            {
                                NotificationID = addNotification.NotificationId,
                                CreatedDate = DateTime.Now,
                                isRead = false,
                                UserID = changeEmployee.OldUserId
                            };
                            await _unitOfWork.PlanNotificationRepository.Insert(addNewUserNotification);
                            await _unitOfWork.PlanNotificationRepository.Insert(addOldUserNotification);
                            await _webSocketService.SendToUser(changeEmployee.NewUserId, addNotification);
                            await _webSocketService.SendToUser(changeEmployee.OldUserId, addNotification);
                            await _unitOfWork.UserWorkLogRepository.Insert(newUserWorkLog);
                        }

                    }
                    else
                    {
                        return new BusinessResult(400, "Status can not be empty");
                    }
                }

                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(200, "Change Employee Success");
                }
                else
                {
                    return new BusinessResult(400, "Change Employee Failed");
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> CanceledWorkLogByEmployee(int workLogId, int userId, int farmId)
        {
            try
            {
                var getWorkLogToCancelled = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == workLogId && x.UserId == userId);
                var getStatusRejected = await _unitOfWork.SystemConfigRepository
                       .GetConfigValue(SystemConfigConst.REJECTED.Trim(), "Rejected");
                if (getWorkLogToCancelled != null)
                {
                    if (getWorkLogToCancelled.StatusOfUserWorkLog != null)
                    {
                        if (getWorkLogToCancelled.StatusOfUserWorkLog.Equals(getStatusRejected) && getWorkLogToCancelled.IsDeleted == true)
                        {
                            getWorkLogToCancelled.StatusOfUserWorkLog = null;
                            getWorkLogToCancelled.IsDeleted = false;
                        }
                    }
                    else
                    {
                        getWorkLogToCancelled.StatusOfUserWorkLog = getStatusRejected;
                        getWorkLogToCancelled.IsDeleted = true;
                    }
                    _unitOfWork.UserWorkLogRepository.Update(getWorkLogToCancelled);
                }
                var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);
                var getUser = await _unitOfWork.UserRepository.GetByID(userId);
                var getWorkLog = await _unitOfWork.WorkLogRepository.GetByID(workLogId);
                var addNotification = new Notification()
                {
                    Content = getUser.FullName + " has cancelled " + getWorkLog.WorkLogName,
                    Title = "WorkLog",
                    IsRead = false,
                    MasterTypeId = 36,
                    CreateDate = DateTime.Now,
                    NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()
                };
                await _unitOfWork.NotificationRepository.Insert(addNotification);
                await _unitOfWork.SaveAsync();
                foreach (var employee in getListManagerOfFarm)
                {
                    var addNewUserNotification = new PlanNotification()
                    {
                        NotificationID = addNotification.NotificationId,
                        CreatedDate = DateTime.Now,
                        isRead = false,
                        UserID = employee.UserId
                    };
                    await _unitOfWork.PlanNotificationRepository.Insert(addNewUserNotification);
                    await _webSocketService.SendToUser(employee.UserId, addNotification);

                }
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(200, "Rejected WorkLog Success", result > 0);
                }
                return new BusinessResult(400, "Rejected WorkLog Failed", false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> CheckAttendance(CheckAttendanceModel checkAttendanceModel, int farmId)
        {
            try
            {
                var result = 0;
                var getWorkLog = await _unitOfWork.WorkLogRepository.GetByCondition(x => x.WorkLogId == checkAttendanceModel.WorkLogId, "UserWorkLogs");
                foreach (var employeeModel in checkAttendanceModel.ListEmployeeCheckAttendance)
                {
                    var getUserWorkLogToCheckAttendance = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == checkAttendanceModel.WorkLogId && x.UserId == employeeModel.UserId);
                    if (getUserWorkLogToCheckAttendance != null)
                    {
                        getUserWorkLogToCheckAttendance.StatusOfUserWorkLog = employeeModel.Status;
                        _unitOfWork.UserWorkLogRepository.Update(getUserWorkLogToCheckAttendance);
                    }
                }
                var addNotification = new Notification()
                {
                    Content = "Work " + getWorkLog.WorkLogName + " has taked attendance",
                    Title = "WorkLog",
                    IsRead = false,
                    MasterTypeId = 36,
                    CreateDate = DateTime.Now,
                    NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                };
                await _unitOfWork.NotificationRepository.Insert(addNotification);
                await _unitOfWork.SaveAsync();
                foreach (var employee in getWorkLog.UserWorkLogs)
                {
                    var addPlanNotification = new PlanNotification()
                    {
                        NotificationID = addNotification.NotificationId,
                        CreatedDate = DateTime.Now,
                        UserID = employee.UserId,
                        isRead = false,
                    };

                    await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                }
                foreach (var employeeModel in getWorkLog.UserWorkLogs)
                {
                    await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                }

                var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                foreach (var employee in getListManagerOfFarm)
                {
                    var addPlanNotification = new PlanNotification()
                    {
                        NotificationID = addNotification.NotificationId,
                        CreatedDate = DateTime.Now,
                        UserID = employee.UserId,
                        isRead = false,
                    };
                    await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    await _webSocketService.SendToUser(employee.UserId, addNotification);

                }
                result += await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(200, "Check Attendance Success", true);
                }
                return new BusinessResult(400, "Check Attendance Failed", false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateNoteForWorkLog(CreateNoteModel updateNoteModel, int farmId)
        {
            try
            {
                var findWorkLog = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == updateNoteModel.WorkLogId && x.UserId == updateNoteModel.UserId);
                var getWorkLog = await _unitOfWork.WorkLogRepository.GetByCondition(x => x.WorkLogId == updateNoteModel.WorkLogId, "UserWorkLogs");
                if (findWorkLog != null)
                {
                    if (updateNoteModel.Note != null)
                    {
                        findWorkLog.Notes = updateNoteModel.Note;
                    }
                    if (updateNoteModel.Issue != null)
                    {
                        findWorkLog.Issue = updateNoteModel.Issue;
                    }
                    if (updateNoteModel.Resources != null)
                    {
                        foreach (var fileNote in updateNoteModel.Resources)
                        {
                            if (fileNote.ResourceID != null)
                            {
                                var findOldResource = await _unitOfWork.ResourceRepository.GetByID(fileNote.ResourceID.Value);
                                var getLink = "";
                                if (fileNote.File != null)
                                {
                                    if (IsImageFile(fileNote.File))
                                    {
                                        getLink = await _cloudinaryService.UploadImageAsync(fileNote.File, "worklog/note");
                                        findOldResource.ResourceURL = getLink;
                                        findOldResource.UpdateDate = DateTime.Now;

                                        _unitOfWork.ResourceRepository.Update(findOldResource);

                                    }
                                    else
                                    {
                                        getLink = await _cloudinaryService.UploadVideoAsync(fileNote.File, "worklog/note");
                                        findOldResource.ResourceURL = getLink;
                                        findOldResource.UpdateDate = DateTime.Now;

                                        _unitOfWork.ResourceRepository.Update(findOldResource);
                                    }
                                }
                                if (fileNote.ResourceURL != null)
                                {
                                    findOldResource.ResourceURL = fileNote.ResourceURL;
                                    findOldResource.UpdateDate = DateTime.Now;
                                    _unitOfWork.ResourceRepository.Update(findOldResource);
                                }
                            }


                        }
                    }
                    var addNotification = new Notification()
                    {
                        Content = "Work " + getWorkLog.WorkLogName + " has just been created",
                        Title = "WorkLog",
                        IsRead = false,
                        MasterTypeId = 36,
                        CreateDate = DateTime.Now,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();
                    foreach (var employee in getWorkLog.UserWorkLogs)
                    {
                        var addPlanNotification = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };

                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    }
                    foreach (var employeeModel in getWorkLog.UserWorkLogs)
                    {
                        await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                    }

                    var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                    foreach (var employee in getListManagerOfFarm)
                    {
                        var addPlanNotification = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };
                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                        await _webSocketService.SendToUser(employee.UserId, addNotification);

                    }

                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(200, "Update note success", findWorkLog);
                    }
                    else
                    {
                        return new BusinessResult(400, "Update note failed");
                    }

                }
                else
                {
                    return new BusinessResult(404, "Can not find any workLog for take note");
                }

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> TaskStatics(int farmId)
        {
            try
            {
                var getWorklogByfarmId = await _unitOfWork.WorkLogRepository.GetListWorkLogByFarmId(farmId);
                var statusCounts = getWorklogByfarmId
                       .GroupBy(wl => string.IsNullOrEmpty(wl.Status) ? "unknown" : wl.Status.ToLower())
                       .ToDictionary(g => g.Key, g => g.Count());

                statusCounts["total"] = getWorklogByfarmId.Count;

                if (statusCounts != null && getWorklogByfarmId.Count > 0)
                {
                    var result = new WorkLogSummaryModel()
                    {
                        StatusCounts = statusCounts
                    };
                    return new BusinessResult(200, "Get statistic of workLog success", result);
                }
                return new BusinessResult(400, "Get statistic of workLog failed");

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetWorkLogbyStatus(GetWorkLogByStatusParam getWorkLogByStatusModel)
        {
            try
            {
                if (getWorkLogByStatusModel.UserId == 0)
                {
                    return new BusinessResult(400, "UserId can not be empty");
                }
                var getWorkLogByStatusAndUser = await _unitOfWork.WorkLogRepository.GetWorkLogByStatusAndUserId(getWorkLogByStatusModel.Status, getWorkLogByStatusModel.UserId);
                var result = getWorkLogByStatusAndUser.Select(wl => new GetWorkLogByStatusModel
                {
                    WorkLogId = wl.WorkLogId,
                    WorkLogName = wl.WorkLogName,
                    Date = wl.Date,
                    Time = wl.ActualStartTime + " - " + wl.ActualEndTime,
                    Status = wl.Status ?? "unknown", // Nếu null thì hiển thị "unknown"
                    avatarEmployees = wl.UserWorkLogs.Select(uwl => uwl.User.AvatarURL ?? "").ToList()
                }).ToList();
                if (result.Count > 0)
                {
                    return new BusinessResult(200, "Get workLog by status success", result);
                }
                return new BusinessResult(404, "Do not have any workLog");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetAttendanceList(int workLogId)
        {
            try
            {
                var getListUserWorkLog = await _unitOfWork.UserWorkLogRepository.GetListUserWorkLogByWorkLogId(workLogId);
                var result = new List<GetListEmployeeToCheckAttendance>();
                // Group theo UserId chính
                foreach (var uwl in getListUserWorkLog)
                {
                    // Bỏ qua trường hợp bị hủy trước điểm danh (Trường hợp 1)
                    if (uwl.IsDeleted == true)
                        continue;

                    // Tìm người thay thế cho bản ghi này (nếu có ai khác ReplaceUserId = uwl.UserId)
                    var replacement = getListUserWorkLog
                        .FirstOrDefault(x => x.ReplaceUserId == uwl.UserId && x.IsDeleted != true);

                    // Nếu bản ghi hiện tại là người thay thế, và người bị thay đã bị hủy trước điểm danh
                    // => bản ghi người bị thay đã bị loại (trường hợp 1), nên chỉ hiển thị người thay
                    if (uwl.ReplaceUserId != null)
                    {
                        var replacedUser = getListUserWorkLog
                            .FirstOrDefault(x => x.UserId == uwl.ReplaceUserId && x.WorkLogId == uwl.WorkLogId);

                        result.Add(new GetListEmployeeToCheckAttendance
                        {
                            UserWorkLogId = uwl.UserWorkLogID,
                            UserId = uwl.UserId,
                            FullName = uwl.User.FullName,
                            StatusOfUser = uwl.StatusOfUserWorkLog,
                            AvatarURL = uwl.User.AvatarURL,
                            IsReporter = uwl.IsReporter,
                        });

                        continue;
                    }

                    // Nếu có người thay thế mình sau khi điểm danh => trường hợp 2
                    if (replacement == null)
                    {
                        result.Add(new GetListEmployeeToCheckAttendance
                        {
                            UserWorkLogId = uwl.UserWorkLogID,
                            UserId = uwl.UserId,
                            FullName = uwl.User.FullName,
                            StatusOfUser = uwl.StatusOfUserWorkLog,
                            AvatarURL = uwl.User.AvatarURL,
                            IsReporter = uwl.IsReporter,
                        });
                    }
                }
                if (result.Count() > 0)
                {
                    return new BusinessResult(200, "Get attedance list success", result);
                }
                return new BusinessResult(404, "Attedance list is empty");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> CancelReplacement(CancelledWorkLogModel cancelledWorkLogModel)
        {
            try
            {
                var getUserWorkLog = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == cancelledWorkLogModel.WorkLogId && x.UserId == cancelledWorkLogModel.UserId);
                var getStatusRejected = await _unitOfWork.SystemConfigRepository
        .GetConfigValue(SystemConfigConst.REJECTED.Trim(), "Rejected");
                var getStatusReceived = await _unitOfWork.SystemConfigRepository
       .GetConfigValue(SystemConfigConst.RECEIVED.Trim(), "Received");
                var getStatusFailed = await _unitOfWork.SystemConfigRepository
       .GetConfigValue(SystemConfigConst.FAILED.Trim(), "Failed");
                var getStatusRedo = await _unitOfWork.SystemConfigRepository
      .GetConfigValue(SystemConfigConst.REDO.Trim(), "Redo");
                if (getUserWorkLog != null)
                {
                    if (getUserWorkLog.StatusOfUserWorkLog != null)
                    {
                        if (getUserWorkLog.StatusOfUserWorkLog.Equals(getStatusFailed) || getUserWorkLog.StatusOfUserWorkLog.Equals(getStatusRedo))
                        {
                            return new BusinessResult(400, "WorkLog has status failed or redo. Can not cancelled");
                        }
                    }
                    var getReplacementWorkLog = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == cancelledWorkLogModel.WorkLogId && x.UserId == getUserWorkLog.ReplaceUserId);
                    if (getReplacementWorkLog != null)
                    {
                        _unitOfWork.UserWorkLogRepository.Delete(getReplacementWorkLog);
                    }
                    getUserWorkLog.ReplaceUserId = null;
                    if (getUserWorkLog.IsDeleted == true)
                    {
                        getUserWorkLog.StatusOfUserWorkLog = getStatusReceived;
                    }
                    else
                    {
                        getUserWorkLog.StatusOfUserWorkLog = getStatusRejected;
                    }
                    getUserWorkLog.IsDeleted = false;
                    _unitOfWork.UserWorkLogRepository.Update(getUserWorkLog);
                }
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(200, "Cancel Replacement Success", result > 0);
                }
                return new BusinessResult(400, "Cancel Replacement Failed");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetListEmployeeToUpdateWorkLog(int workLogId)
        {
            try
            {
                var getListUserWorkLog = await _unitOfWork.UserWorkLogRepository.GetListUserWorkLogByWorkLogId(workLogId);
                var result = new List<GetListEmployeeToCheckAttendance>();
                var getUserCancelled = getListUserWorkLog.Where(x => x.IsDeleted == true && x.ReplaceUserId == null).ToList();
                foreach(var userCancelled in getUserCancelled)
                {
                    result.Add(new GetListEmployeeToCheckAttendance
                    {
                        UserWorkLogId = userCancelled.UserWorkLogID,
                        UserId = userCancelled.UserId,
                        FullName = userCancelled.User.FullName,
                        StatusOfUser = userCancelled.StatusOfUserWorkLog,
                        AvatarURL = userCancelled.User.AvatarURL,
                        IsReporter = userCancelled.IsReporter,
                    });
                }
                // Group theo UserId chính
                foreach (var uwl in getListUserWorkLog)
                {

                    // Tìm người thay thế cho bản ghi này (nếu có ai khác ReplaceUserId = uwl.UserId)
                    var replacement = getListUserWorkLog
                        .FirstOrDefault(x => x.UserWorkLogID == uwl.UserWorkLogID && x.ReplaceUserId == null && x.IsDeleted != true);
                    
                    // Nếu bản ghi hiện tại là người thay thế, và người bị thay đã bị hủy trước điểm danh
                    // => bản ghi người bị thay đã bị loại (trường hợp 1), nên chỉ hiển thị người thay
                    //if (uwl.ReplaceUserId != null)
                    //{
                    //    var replacedUser = getListUserWorkLog
                    //        .FirstOrDefault(x => x.UserId == uwl.ReplaceUserId && x.WorkLogId == uwl.WorkLogId);

                    //    result.Add(new GetListEmployeeToCheckAttendance
                    //    {
                    //        UserWorkLogId = uwl.UserWorkLogID,
                    //        UserId = uwl.UserId,
                    //        FullName = uwl.User.FullName,
                    //        StatusOfUser = uwl.StatusOfUserWorkLog,
                    //        AvatarURL = uwl.User.AvatarURL,
                    //        IsReporter = uwl.IsReporter,
                    //    });


                    //}

                    // Nếu có người thay thế mình sau khi điểm danh => trường hợp 2
                    if (replacement != null)
                    {
                        result.Add(new GetListEmployeeToCheckAttendance
                        {
                            UserWorkLogId = uwl.UserWorkLogID,
                            UserId = uwl.UserId,
                            FullName = uwl.User.FullName,
                            StatusOfUser = uwl.StatusOfUserWorkLog,
                            AvatarURL = uwl.User.AvatarURL,
                            IsReporter = uwl.IsReporter,
                        });
                    }

                }
                result = result.DistinctBy(x => x.UserWorkLogId).ToList();
                if (result.Count() > 0)
                {
                    return new BusinessResult(200, "Get attedance list success", result);
                }
                return new BusinessResult(404, "Attedance list is empty");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> CanTakeAttendance(int workLogId)
        {
            try
            {
                var timeToTakeAttendance = await _unitOfWork.SystemConfigRepository
                                        .GetConfigValue(SystemConfigConst.TIME_TO_TAKE_ATTEDANCE.Trim(), (double)120);
                var getWorkLog = await _unitOfWork.WorkLogRepository.GetByID(workLogId);
                var workStart = getWorkLog.Date.Value.Date + getWorkLog.ActualStartTime.Value;

                var minCheckIn = workStart.AddMinutes(-timeToTakeAttendance);
                var result = DateTime.Now >= minCheckIn;
                if (result)
                {
                    return new BusinessResult(200, "Can check attendance", true);
                }
                return new BusinessResult(200, $"Can not check attendance. Please waiting to {minCheckIn}", false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> RedoAssignWorkLog(RedoWorkLogModel addNewTaskModel, int? farmId)
        {
            try
            {
                var getFailedOrRedoWorkLog = await _unitOfWork.WorkLogRepository.GetWorkLogByIdWithPlan(addNewTaskModel.FailedOrRedoWorkLogId);
                if (getFailedOrRedoWorkLog == null)
                {
                    return new BusinessResult(400, "Do not find any workLog");
                }


                var parseStartTime = TimeSpan.TryParse(addNewTaskModel.NewStartTime, out var startTime);
                var parseEndTime = TimeSpan.TryParse(addNewTaskModel.NewEndTime, out var endTime);


                var getExistPlan = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == getFailedOrRedoWorkLog.Schedule.CarePlanId && x.FarmID == farmId, "PlanTargets");
                if (getExistPlan == null)
                {
                    return new BusinessResult(400, "Plan does not exist");
                }
                if (addNewTaskModel.NewStartTime != null && addNewTaskModel.NewEndTime != null)
                {
                    var checkTime = (int)(endTime - startTime).TotalMinutes; // Chuyển TimeSpan sang số phút

                    var masterType = await _unitOfWork.MasterTypeRepository
                        .GetByCondition(x => x.MasterTypeId == getExistPlan.MasterTypeId);

                    if (masterType != null)
                    {
                        var minTime = masterType.MinTime;
                        var maxTime = masterType.MaxTime;

                        if (checkTime < minTime || checkTime > maxTime)
                        {
                            throw new Exception($"Time of work ({checkTime} minutes) does not valid! It must be in range {minTime} - {maxTime} minutes.");
                        }
                    }
                }

                if (addNewTaskModel.NewDateWork.Date == DateTime.Now.Date)
                {
                    if (startTime <= DateTime.Now.TimeOfDay)
                    {
                        throw new Exception("StartTime must be greater than now");
                    }

                    if (endTime <= DateTime.Now.TimeOfDay)
                    {
                        throw new Exception("EndTime must be greater than now");
                    }

                }
                if (endTime <= startTime)
                {
                    throw new Exception("EndTime must be greater than startTime");
                }
                await _unitOfWork.WorkLogRepository.CheckWorkLogAvailabilityWhenAddPlan(
                                                                      startTime,
                                                                       endTime,
                                                                       addNewTaskModel.NewDateWork,
                                                                       getExistPlan.MasterTypeId,
                                                                        addNewTaskModel.NewListEmployee.Select(x => x.UserId).ToList()
                                                                   );
                var createNewPlan = new Plan()
                {
                    PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                    PlanName = getExistPlan.PlanName,
                    CreateDate = DateTime.Now,
                    UpdateDate = DateTime.Now,
                    IsSample = true,
                    AssignorId = getExistPlan.AssignorId,
                    CropId = getExistPlan.CropId,
                    EndDate = addNewTaskModel?.NewDateWork.Date.Add(endTime),
                    StartDate = addNewTaskModel?.NewDateWork.Date.Add(startTime),
                    Frequency = getExistPlan?.Frequency,
                    IsActive = getExistPlan?.IsActive,
                    IsDeleted = false,
                    MasterTypeId = getExistPlan?.MasterTypeId,
                    MaxVolume = getExistPlan?.MaxVolume,
                    MinVolume = getExistPlan?.MinVolume,
                    Notes = getExistPlan?.Notes,
                    PesticideName = getExistPlan?.PesticideName,
                    ResponsibleBy = getExistPlan?.ResponsibleBy,
                    ProcessId = getExistPlan?.ProcessId,
                    Status = "Active",
                    FarmID = farmId,
                    PlanDetail = getExistPlan?.PlanDetail,
                };
                if (getExistPlan.PlanTargets != null)
                {
                    foreach (var planTarget in getExistPlan.PlanTargets)
                    {
                        var newPlanTarget = new PlanTarget()
                        {
                            LandPlotID = planTarget.LandPlotID,
                            LandRowID = planTarget.LandRowID,
                            PlantID = planTarget.PlantID,
                            PlantLotID = planTarget.PlantLotID,
                            Unit = planTarget.Unit,
                            GraftedPlantID = planTarget.GraftedPlantID,
                        };
                        createNewPlan.PlanTargets.Add(newPlanTarget);
                    }
                }

                await _unitOfWork.PlanRepository.Insert(createNewPlan);
                await _unitOfWork.SaveAsync();
                var newSchedule = new CarePlanSchedule()
                {
                    Status = "Active",
                    CarePlanId = getExistPlan.PlanId,
                    StartTime = startTime,
                    EndTime = endTime,
                    IsDeleted = false,
                    CustomDates = "[" + JsonConvert.SerializeObject(addNewTaskModel.NewDateWork.ToString("yyyy/MM/dd")) + "]",
                    FarmID = farmId,
                };
                createNewPlan.CarePlanSchedule = newSchedule;

                await _unitOfWork.CarePlanScheduleRepository.Insert(newSchedule);
                await _unitOfWork.SaveAsync();
                var getStatusNotStarted = await _unitOfWork.SystemConfigRepository
                        .GetConfigValue(SystemConfigConst.NOT_STARTED.Trim(), "Not Started");
                var addNewWorkLog = new WorkLog()
                {
                    WorkLogCode = $"WL{DateTime.Now:yyMMddHHmmssfff}",
                    Date = addNewTaskModel.NewDateWork,
                    WorkLogName = addNewTaskModel.NewWorkLogName,
                    ActualStartTime = startTime,
                    ActualEndTime = endTime,
                    IsDeleted = false,
                    Status = getStatusNotStarted,
                    ScheduleId = newSchedule.ScheduleId,
                };
                newSchedule.WorkLogs.Add(addNewWorkLog);
                await _unitOfWork.WorkLogRepository.Insert(addNewWorkLog);
                await _unitOfWork.SaveAsync();

                getFailedOrRedoWorkLog.RedoWorkLogID = addNewWorkLog.WorkLogId;
                _unitOfWork.WorkLogRepository.Update(getFailedOrRedoWorkLog);
                await _unitOfWork.SaveAsync();

                var conflictDetailsSet = new HashSet<string>();
                if (addNewTaskModel.NewListEmployee != null)
                {
                    List<UserWorkLog> userWorkLogs = new List<UserWorkLog>();

                    foreach (EmployeeModel user in addNewTaskModel.NewListEmployee)
                    {
                        userWorkLogs.Add(new UserWorkLog
                        {
                            WorkLogId = addNewWorkLog.WorkLogId,
                            UserId = user.UserId,
                            IsReporter = user.isReporter,
                            CreateDate = DateTime.Now,
                            IsDeleted = false
                        });

                    }


                    // 🔹 Lưu UserWorkLogs vào DB
                    await _unitOfWork.UserWorkLogRepository.InsertRangeAsync(userWorkLogs);
                    await _unitOfWork.SaveAsync();
                    //  Nếu thời gian làm bù vượt quá EndDate cũ của kế hoạch => dời các worklog phụ thuộc
                    if (getExistPlan.EndDate.HasValue && addNewTaskModel.NewDateWork.Date > getExistPlan.EndDate.Value.Date)
                    {
                        var subProcesses = await _unitOfWork.SubProcessRepository
                            .GetAllByProcessOrParentForRedoAsync(getExistPlan.ProcessId, getExistPlan.SubProcessId);

                        var subProcessMap = subProcesses.ToDictionary(x => x.SubProcessID);

                        await ShiftDependentWorkLogsAsync(
                            getExistPlan.PlanId,
                            getExistPlan.SubProcessId,
                            getExistPlan.EndDate.Value,
                            addNewTaskModel.NewDateWork.Date,
                            subProcessMap);
                    }


                    var addNotification = new Notification()
                    {
                        Content = "Work " + addNewTaskModel.NewWorkLogName + " has just been created",
                        Title = "WorkLog",
                        IsRead = false,
                        MasterTypeId = 36,
                        CreateDate = DateTime.Now,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();
                    foreach (var employee in addNewTaskModel.NewListEmployee)
                    {
                        var addPlanNotification = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };

                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    }

                    var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                    foreach (var employee in getListManagerOfFarm)
                    {
                        var addPlanNotificationForManager = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };
                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotificationForManager);
                        await _webSocketService.SendToUser(employee.UserId, addNotification);

                    }
                    foreach (var employeeModel in addNewTaskModel.NewListEmployee)
                    {
                        await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                    }
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await _responseCacheService.RemoveCacheByGroupAsync($"{CacheKeyConst.GROUP_FARM_WORKLOG}:{farmId}");
                        return new BusinessResult(200, "Add WorkLog Success", result > 0);
                    }
                    return new BusinessResult(400, "Add WorkLog Failed");
                }
                else
                {
                    return new BusinessResult(400, "List Employee is empty");
                }

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetStatusOfWorkLogForManager()
        {
            try
            {
                var getStatusOfWorkLogForManager = await _unitOfWork.SystemConfigRepository
                        .GetAllConfigsByGroupNameAsync(SystemConfigConst.WORKLOGFORMANAGER.Trim());
                if (getStatusOfWorkLogForManager != null)
                {
                    var result = new GetStatusOfWorkLogForManagerModel()
                    {
                        Status = getStatusOfWorkLogForManager.Select(x => x.ConfigValue).ToList()
                    };
                    return new BusinessResult(200, "Get status of workLog for manager success", result);
                }
                return new BusinessResult(404, "Do not have any status of worklog for manager");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> StatisticWorkLog(int farmId, int? userId, string? groupBy, DateTime? fromDate, DateTime? toDate)
        {
            try
            {
                if (string.IsNullOrEmpty(groupBy)) groupBy = "day";
                var getForStatistic = await _unitOfWork.UserWorkLogRepository.GetListUserWorkLogToStatistic(farmId);
                if (userId.HasValue)
                    getForStatistic = getForStatistic.Where(x => x.UserId == userId.Value).ToList();
                if (fromDate.HasValue && toDate.HasValue)
                    getForStatistic = getForStatistic.Where(x => x.WorkLog.Date >= fromDate && x.WorkLog.Date <= toDate).ToList();

                var grouped = groupBy switch
                {
                    "day" => getForStatistic.GroupBy(x => new StatisticByDateYear()
                    {
                        UserId = x.UserId,
                        FullName = x.User.FullName,
                        Date = x.WorkLog.Date!.Value.Date,
                        Year = x.WorkLog.Date!.Value.Year
                    }),

                    "month" => getForStatistic.GroupBy(x => new StatisticByDateYear()
                    {
                        UserId = x.UserId,
                        FullName = x.User.FullName,
                        Month = x.WorkLog.Date!.Value.Month,
                        Year = x.WorkLog.Date!.Value.Year
                    }),
                    _ => getForStatistic.GroupBy(x => new StatisticByDateYear()
                    {
                        UserId = x.UserId,
                        FullName = x.User.FullName,
                        Date = x.WorkLog.Date!.Value.Date
                    })
                };

                var getStatusDone = await _unitOfWork.SystemConfigRepository
                        .GetConfigValue(SystemConfigConst.DONE.Trim(), "Done");
                var result = grouped.Select(g => new EmployeeProductivityTimeDto
                {
                    UserId = g.Key.UserId.Value,
                    FullName = g.Key.FullName,

                    Date = groupBy == "day" ? g.Key.Date : null,
                    Month = groupBy == "month" ? (int?)g.Key.Month : null,
                    Year = groupBy == "year" ? (int?)g.Key.Year : null,

                    TotalWorkLogs = g.Count(),
                    CompletedWorkLogs = g.Count(x => x.WorkLog.Status == getStatusDone),
                    CompletionRate = g.Count(x => x.WorkLog.Status == getStatusDone) * 100.0 / g.Count(),

                    TotalWorkingTime = TimeSpan.FromMinutes(
            g.Where(x => x.WorkLog.ActualStartTime != null && x.WorkLog.ActualEndTime != null)
             .Sum(x => (x.WorkLog.ActualEndTime.Value - x.WorkLog.ActualStartTime.Value).TotalMinutes)
        )
                }).ToList();
                var getAllUserWorkLog = await _unitOfWork.UserWorkLogRepository.GetAllNoPaging(includeProperties: "WorkLog");
                var userReplacements = getAllUserWorkLog.Where(x => x.IsDeleted == false)
                                .GroupBy(x => x.UserId)
                                .Select(g => new
                                {
                                    UserId = g.Key,
                                    ReplaceOthersCount = g.Count(x => x.ReplaceUserId == g.Key),
                                    ReplacedByOthersCount = g.Count(x => x.ReplaceUserId != null)
                                }).ToList();

                var redoWorkLogIds = await _unitOfWork.WorkLogRepository.GetWorkLogInclude();
                var checkWorkLog = redoWorkLogIds.Where(x => x.RedoWorkLogID != null && x.IsDeleted == false)
                                .Select(x => x.RedoWorkLogID.Value)
                                .Distinct()
                                .ToList();
                var redoWorkLogs = getAllUserWorkLog
                                    .Where(x => x.IsDeleted == false && x.WorkLog.RedoWorkLogID != null && x.ReplaceUserId == null)
                                    .Where(x => checkWorkLog.Contains(x.WorkLogId))
                                    .GroupBy(x => x.UserId)
                                    .Select(g => new
                                    {
                                        UserId = g.Key,
                                        RedoWorkCount = g.Count(),
                                        RedoWorkCompletionRate = g.Count(x => x.WorkLog.Status == getStatusDone) * 100.0 / g.Count()
                                    }).ToList();


                foreach (var item in result)
                {
                    var replace = userReplacements.FirstOrDefault(x => x.UserId == item.UserId);
                    if (replace != null)
                    {
                        item.ReplaceOthersCount = replace.ReplaceOthersCount;
                        item.ReplacedByOthersCount = replace.ReplacedByOthersCount;
                    }

                    var redo = redoWorkLogs.FirstOrDefault(x => x.UserId == item.UserId);
                    if (redo != null)
                    {
                        item.RedoWorkCount = redo.RedoWorkCount;
                        item.RedoWorkCompletionRate = redo.RedoWorkCompletionRate;
                    }
                }
                if (result != null && result.Any())
                {
                    return new BusinessResult(200, "Get Statistic Employee Success", result);
                }
                return new BusinessResult(400, "Get Statistic Employee Failed");

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> FilterEmployeeByWorkSkill(int workTypeId, int farmId)
        {
            try
            {
                var getEmployeeSkill = await _unitOfWork.EmployeeSkillRepository.GetListEmployeeByWorkTypeId(workTypeId, farmId);
                var result = getEmployeeSkill.Select(u => new EmployeeSkillModel
                {
                    UserId = u.User.UserId,
                    FullName = u.User.FullName,
                    AvatarURL = u.User.AvatarURL,
                    WorkSkillName = u.EmployeeSkills
                        .Where(s => s.WorkTypeID == workTypeId)
                        .Select(s => s.WorkType.Target) // hoặc s.WorkType.Name nếu tên khác
                        .FirstOrDefault() ?? "",
                    ScoreOfSkill = u.EmployeeSkills
                     .Where(s => s.WorkTypeID == workTypeId)
                     .Select(s => (double?)s.ScoreOfSkill)
                     .FirstOrDefault() ?? 0
                }).ToList();
                if (getEmployeeSkill.Count() > 0)
                {
                    return new BusinessResult(200, "Filter Employee By Work Skill", result);
                }
                return new BusinessResult(404, "Do not have any employee");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetDependentWorkLog(int workLogID)
        {
            try
            {
                var targetWorkLog = await _unitOfWork.WorkLogRepository.GetCurrentWorkLog(workLogID);
                if (targetWorkLog == null)
                    return new BusinessResult(400, "WorkLog does not exist.");

                var plan = targetWorkLog.Schedule?.CarePlan;
                if (plan == null)
                    return new BusinessResult(200, "WorkLog does not have associated plan.");

                var subProcess = plan.SubProcess;
                var processId = plan.ProcessId ?? subProcess?.ProcessId;
                if (processId == null)
                    return new BusinessResult(200, "WorkLog does not belong to any process.");

                // Lấy toàn bộ SubProcess liên quan
                var allSubProcesses = await _unitOfWork.SubProcessRepository.GetAllByProcessOrParentAsync(processId.Value);
                if (allSubProcesses == null || !allSubProcesses.Any())
                    return new BusinessResult(200, "No SubProcess found.");

                var subProcessMap = allSubProcesses.ToDictionary(sp => sp.SubProcessID, sp => sp);

                // Hàm đệ quy lấy danh sách tất cả ID con
                List<int> GetAllChildSubProcessIds(int parentId)
                {
                    var result = new List<int> { parentId };
                    foreach (var child in allSubProcesses.Where(sp => sp.ParentSubProcessId == parentId))
                    {
                        result.AddRange(GetAllChildSubProcessIds(child.SubProcessID));
                    }
                    return result;
                }

                // Lấy toàn bộ ID bắt đầu từ những SubProcess gốc (có ProcessId)
                var rootSubProcessIds = allSubProcesses
                    .Where(sp => sp.ProcessId == processId)
                    .Select(sp => sp.SubProcessID)
                    .ToList();

                var relatedSubProcessIds = new HashSet<int>();
                foreach (var rootId in rootSubProcessIds)
                {
                    var ids = GetAllChildSubProcessIds(rootId);
                    foreach (var id in ids)
                        relatedSubProcessIds.Add(id);
                }

                // Lấy tất cả Plan thuộc các SubProcess này
                var allPlans = await _unitOfWork.PlanRepository.GetPlansBySubProcessIds(relatedSubProcessIds.ToList());
                if (allPlans == null || !allPlans.Any())
                    return new BusinessResult(200, "No Plans found under the process.");

                var planMap = allPlans.ToDictionary(p => p.PlanId, p => p);

                // Hàm tính order dạng "1.2.3"
                string GetOrderString(SubProcess sp)
                {
                    var orderList = new List<int>();
                    while (sp != null)
                    {
                        orderList.Insert(0, sp.Order ?? 1);
                        sp = sp.ParentSubProcessId.HasValue && subProcessMap.TryGetValue(sp.ParentSubProcessId.Value, out var parent) ? parent : null;
                    }
                    return string.Join(".", orderList);
                }

                // Tính order của WorkLog hiện tại
                string currentOrderStr = "";
                if (plan.SubProcessId.HasValue && subProcessMap.TryGetValue(plan.SubProcessId.Value, out var currentSp))
                {
                    currentOrderStr = GetOrderString(currentSp);
                }

                // Lấy WorkLogs
                var planIds = allPlans.Select(p => p.PlanId).ToList();
                var allWorkLogs = await _unitOfWork.WorkLogRepository.GetWorkLogsByPlanIdsAsync(planIds);

                // Tìm WorkLog phụ thuộc
                var dependentWorkLogs = allWorkLogs
                    .Where(w => w.WorkLogId != workLogID)
                    .Select(w =>
                    {
                        var planOfWorkLog = w.Schedule?.CarePlanId != null && planMap.TryGetValue(w.Schedule.CarePlanId.Value, out var p) ? p : null;
                        string order = "";

                        if (planOfWorkLog?.SubProcessId != null &&
                            subProcessMap.TryGetValue(planOfWorkLog.SubProcessId.Value, out var sp))
                        {
                            order = GetOrderString(sp);
                        }

                        return new
                        {
                            WorkLogId = w.WorkLogId,
                            PlanId = planOfWorkLog?.PlanId,
                            PlanName = planOfWorkLog?.PlanName ?? "N/A",
                            StartDate = planOfWorkLog?.StartDate,
                            EndDate = planOfWorkLog?.EndDate,
                            StartTime = w.ActualStartTime,
                            EndTime = w.ActualEndTime,
                            Status = w.Status,
                            Order = order,
                            Date = w.Date?.ToString("yyyy-MM-dd")
                        };
                    })
                    .Where(x => string.Compare(x.Order, currentOrderStr, StringComparison.Ordinal) > 0)
                    .OrderBy(x => x.Order)
                    .ThenBy(x => x.StartTime)
                    .ToList();

                return dependentWorkLogs.Any()
                    ? new BusinessResult(200, "Get Dependency WorkLog Success", dependentWorkLogs)
                    : new BusinessResult(200, "No workLog dependency.");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private async Task ShiftDependentWorkLogsAsync(
                                    int currentPlanId,
                                    int? currentSubProcessId,
                                    DateTime originalEndDate,
                                    DateTime newWorkDate,
                                    Dictionary<int, SubProcess> subProcessMap)
        {
            if (currentSubProcessId == null) return;

            int shiftDays = (newWorkDate.Date - originalEndDate.Date).Days;
            if (shiftDays <= 0) return;
            var getOriginalPlan = await _unitOfWork.PlanRepository.GetByID(currentPlanId);
            if (getOriginalPlan.EndDate.HasValue == true)
            {
                getOriginalPlan.EndDate = getOriginalPlan.EndDate.Value.AddDays(shiftDays);
                await _unitOfWork.SaveAsync();
            }

            // Tính chuỗi Order đầy đủ dạng "1.2.3"
            string GetFullOrderString(SubProcess sp)
            {
                var orderParts = new List<string>();
                while (sp != null)
                {
                    orderParts.Insert(0, (sp.Order ?? 0).ToString());
                    sp = sp.ParentSubProcessId.HasValue && subProcessMap.TryGetValue(sp.ParentSubProcessId.Value, out var parent)
                        ? parent
                        : null;
                }

                return string.Join(".", orderParts);
            }

            // Lấy toàn bộ SubProcess con/cháu
            List<int> GetAllChildSubProcessIds(int parentId)
            {
                var result = new List<int>();
                var stack = new Stack<int>();
                stack.Push(parentId);

                while (stack.Any())
                {
                    var current = stack.Pop();
                    var children = subProcessMap.Values
                        .Where(sp => sp.ParentSubProcessId == current)
                        .Select(sp => sp.SubProcessID);

                    foreach (var childId in children)
                    {
                        result.Add(childId);
                        stack.Push(childId);
                    }
                }

                return result;
            }

            // Các subprocess theo thứ tự phía sau
            var currentSubProcess = subProcessMap[currentSubProcessId.Value];
            var currentOrderValue = currentSubProcess.Order ?? 0;
            var currentParentId = currentSubProcess.ParentSubProcessId;
            var currentProcessId = currentSubProcess.ProcessId;
            var currentOrder = GetFullOrderString(currentSubProcess);

            // 1. SubProcess cùng parent → so sánh theo Order
            var sameParentHigherOrder = subProcessMap.Values
                .Where(sp =>
                    sp.SubProcessID != currentSubProcess.SubProcessID &&
                    sp.ParentSubProcessId == currentParentId &&
                    (sp.Order ?? 0) > currentOrderValue)
                .Select(sp => sp.SubProcessID);

            // 2. Cùng Process và cả hai không có parent (top-level) → so sánh Order
            var sameProcessTopLevel = subProcessMap.Values
                .Where(sp =>
                    sp.SubProcessID != currentSubProcess.SubProcessID &&
                    sp.ParentSubProcessId == null &&
                    currentParentId == null &&
                    sp.ProcessId == currentProcessId &&
                    (sp.Order ?? 0) > currentOrderValue)
                .Select(sp => sp.SubProcessID);

            // 3. Các subprocess có FullOrderString đứng sau → để xử lý trường hợp con cháu sâu hơn
            var deeperOrder = subProcessMap.Values
                .Where(sp =>
                    sp.SubProcessID != currentSubProcess.SubProcessID &&
                    string.Compare(GetFullOrderString(sp), currentOrder, StringComparison.Ordinal) > 0)
                .Select(sp => sp.SubProcessID);

            // Gộp tất cả
            var subprocessByOrder = sameParentHigherOrder
                .Union(sameProcessTopLevel)
                .Union(deeperOrder)
                .Distinct()
                .ToList();
            // Các subprocess con/cháu
            var subprocessByHierarchy = GetAllChildSubProcessIds(currentSubProcessId.Value);

            // Gộp cả 2 loại và loại trùng
            var allDependentSubProcessIds = subprocessByOrder
                .Union(subprocessByHierarchy)
                .Distinct()
                .ToList();

            if (!allDependentSubProcessIds.Any()) return;

            var dependentSubProcessList = subProcessMap.Values
                .Where(sp => allDependentSubProcessIds.Contains(sp.SubProcessID))
                .ToList();

            var dependentPlans = await _unitOfWork.PlanRepository.GetPlansBySubProcessIds(allDependentSubProcessIds);
            var dependentPlanIds = dependentPlans.Select(p => p.PlanId).ToList();
            var allWorkLogs = await _unitOfWork.WorkLogRepository.GetWorkLogsByPlanIdsAsync(dependentPlanIds);

            // Dời các WorkLog
            foreach (var workLog in allWorkLogs)
            {
                if (workLog.Date.HasValue)
                    workLog.Date = workLog.Date.Value.AddDays(shiftDays);

                if (workLog.ActualStartTime.HasValue)
                    workLog.ActualStartTime = workLog.ActualStartTime.Value;

                if (workLog.ActualEndTime.HasValue)
                    workLog.ActualEndTime = workLog.ActualEndTime.Value;

                _unitOfWork.WorkLogRepository.Update(workLog);
            }

            // Cập nhật StartDate, EndDate cho Plan
            foreach (var plan in dependentPlans)
            {
                var existing = await _unitOfWork.PlanRepository.GetByID(plan.PlanId);
                if (existing != null)
                {
                    if (existing.StartDate.HasValue == true)
                    {
                        existing.StartDate = existing.StartDate.Value.AddDays(shiftDays);
                    }
                    if (existing.EndDate.HasValue == true)
                    {
                        existing.EndDate = existing.EndDate.Value.AddDays(shiftDays);
                    }
                    _unitOfWork.PlanRepository.Update(existing);
                }
            }

            // Cập nhật EndDate cho SubProcess
            foreach (var subprocess in dependentSubProcessList)
            {
                var existing = await _unitOfWork.SubProcessRepository.GetByID(subprocess.SubProcessID);
                if (existing != null)
                {
                    if (existing.StartDate.HasValue == true)
                    {
                        existing.StartDate = existing.StartDate.Value.AddDays(shiftDays);
                    }
                    if (existing.EndDate.HasValue == true)
                    {
                        existing.EndDate = existing.EndDate.Value.AddDays(shiftDays);
                    }
                    _unitOfWork.SubProcessRepository.Update(existing);
                }

            }

            // Cập nhật EndDate cho Process nếu có
            var processId = subProcessMap[currentSubProcessId.Value].ProcessId;
            if (processId.HasValue)
            {
                var process = await _unitOfWork.ProcessRepository.GetByID(processId.Value);
                if (process != null)
                {
                    if (process.StartDate.HasValue == true)
                    {
                        process.StartDate = process.StartDate.Value.AddDays(shiftDays);
                    }
                    if (process.EndDate.HasValue == true)
                    {
                        process.EndDate = process.EndDate.Value.AddDays(shiftDays);
                    }
                    _unitOfWork.ProcessRepository.Update(process);
                }

            }

            await _unitOfWork.SaveAsync();
        }

        public async Task<BusinessResult> NoteForWorkLogUseResourceFile(CreateNoteModelUseFile createNoteModel, int farmId)
        {
            try
            {
                var findWorkLog = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == createNoteModel.WorkLogId && x.UserId == createNoteModel.UserId);
                var getWorklog = await _unitOfWork.WorkLogRepository.GetByID(createNoteModel.WorkLogId);
                var getUser = await _unitOfWork.UserRepository.GetByID(createNoteModel.UserId.Value);
                if (findWorkLog != null)
                {
                    findWorkLog.Notes = createNoteModel.Note;
                    findWorkLog.Issue = createNoteModel.Issue;
                    findWorkLog.CreateDate = DateTime.Now;
                    if (createNoteModel.Resources != null)
                    {
                        foreach (var fileNote in createNoteModel.Resources)
                        {
                            var getLink = "";
                            if (fileNote.Length > 0)
                            {
                                if (IsImageFile(fileNote))
                                {
                                    getLink = await _cloudinaryService.UploadImageAsync(fileNote, "worklog/note");
                                    var newResource = new Resource()
                                    {
                                        CreateDate = DateTime.Now,
                                        FileFormat = "image",
                                        ResourceURL = getLink,
                                        Description = "note for worklog",
                                        UpdateDate = DateTime.Now,
                                        UserWorkLogID = findWorkLog.UserWorkLogID
                                    };
                                    await _unitOfWork.ResourceRepository.Insert(newResource);

                                }
                                else
                                {
                                    getLink = await _cloudinaryService.UploadVideoAsync(fileNote, "worklog/note");
                                    var newResourceVideo = new Resource()
                                    {
                                        CreateDate = DateTime.Now,
                                        FileFormat = "image",
                                        ResourceURL = getLink,
                                        Description = "note for worklog",
                                        UpdateDate = DateTime.Now,
                                        UserWorkLogID = findWorkLog.UserWorkLogID
                                    };
                                    await _unitOfWork.ResourceRepository.Insert(newResourceVideo);
                                }
                            }
                        }
                    }
                    var addNotification = new Notification()
                    {
                        Content = getUser.FullName + " has create note on " + getWorklog.WorkLogName + ". Please check it",
                        Title = "WorkLog",
                        IsRead = false,
                        MasterTypeId = 36,
                        CreateDate = DateTime.Now,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();
                    var addNotificationForNote = new PlanNotification()
                    {
                        CreatedDate = DateTime.Now,
                        isRead = false,
                        NotificationID = addNotification.NotificationId,
                        UserID = createNoteModel.UserId
                    };
                    await _unitOfWork.PlanNotificationRepository.Insert(addNotificationForNote);
                    await _webSocketService.SendToUser(createNoteModel.UserId.Value, addNotification);
                    var getListManagerOfFarm = await _unitOfWork.UserFarmRepository.GetManagerOffarm(farmId);

                    foreach (var employee in getListManagerOfFarm)
                    {
                        var addNotificationManagerForNote = new PlanNotification()
                        {
                            CreatedDate = DateTime.Now,
                            isRead = false,
                            NotificationID = addNotification.NotificationId,
                            UserID = employee.UserId
                        };
                        await _unitOfWork.PlanNotificationRepository.Insert(addNotificationManagerForNote);
                        await _webSocketService.SendToUser(employee.UserId, addNotification);

                    }
                    await _webSocketService.SendToUser(createNoteModel.UserId.Value, addNotification);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(200, "Take note success", findWorkLog);
                    }
                    else
                    {
                        return new BusinessResult(400, "Take note failed");
                    }

                }
                else
                {
                    return new BusinessResult(404, "Can not find any workLog for take note");
                }

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
