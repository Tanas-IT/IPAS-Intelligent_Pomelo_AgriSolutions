﻿using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using MailKit.Search;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using ProjNet.CoordinateSystems;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel;
using GenerativeAI.Types;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandPlotRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlanService : IPlanService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IWebSocketService _webSocketService;
        private string warningAddMessage = string.Empty;
        private string warningUpdateMessage = string.Empty;
        private readonly IResponseCacheService _responseCacheService;

        public PlanService(IUnitOfWork unitOfWork, IMapper mapper, IWebSocketService webSocketService, IResponseCacheService responseCacheService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _webSocketService = webSocketService;
            _responseCacheService = responseCacheService;
        }

        public async Task<BusinessResult> CreatePlan(CreatePlanModel createPlanModel, int? farmId, bool useTransaction = true, string? keyGroup = null)
        {
            using (var transaction = useTransaction ? await _unitOfWork.BeginTransactionAsync() : null)
            {
                try
                {
                    if (farmId == null || farmId <= 0)
                    {
                        throw new Exception("Farm does not exist");
                    }
                    if (createPlanModel.MasterTypeId == null || createPlanModel.MasterTypeId <= 0)
                    {
                        throw new Exception("MasterType does not exist");
                    }
                    var checkExistProcess = await _unitOfWork.ProcessRepository.GetByCondition(x => x.ProcessId == createPlanModel.ProcessId);
                    if (checkExistProcess != null)
                    {
                        if (createPlanModel.StartDate < checkExistProcess.StartDate ||
                             createPlanModel.StartDate > checkExistProcess.EndDate ||
                             createPlanModel.EndDate < checkExistProcess.StartDate ||
                             createPlanModel.EndDate > checkExistProcess.EndDate)
                        {
                            throw new Exception($"StartDate and EndDate of plan must be within the duration of process from " +
                                $"{checkExistProcess.StartDate:dd/MM/yyyy} to {checkExistProcess.EndDate:dd/MM/yyyy}");

                        }
                    }
                    if (createPlanModel.StartDate < DateTime.Now.Date)
                    {
                        throw new Exception("StartDate must be today or a future date");
                    }
                    if (createPlanModel.StartTime != null && createPlanModel.EndTime != null)
                    {
                        var startTime = TimeSpan.Parse(createPlanModel.StartTime);
                        var endTime = TimeSpan.Parse(createPlanModel.EndTime);
                        var now = DateTime.Now;

                        // Check: StartTime phải trước EndTime
                        if (startTime >= endTime)
                            throw new Exception("Start time must be less than End Time");

                        var startDate = createPlanModel.StartDate.Date;
                        var endDate = createPlanModel.EndDate.Date;

                        // Nếu StartDate và EndDate là hôm nay
                        if (startDate == now.Date && endDate == now.Date)
                        {
                            if (startTime <= now.TimeOfDay)
                                throw new Exception("Start time must be later than the current time");

                            if (endTime <= startTime)
                                throw new Exception("End time must be greater than start time");
                        }

                        // Nếu chỉ StartDate là hôm nay
                        else if (startDate == now.Date)
                        {
                            if (startTime <= now.TimeOfDay)
                                throw new Exception("Start time must be later than the current time");
                        }

                        // Nếu chỉ EndDate là hôm nay
                        else if (endDate == now.Date)
                        {
                            if (endTime <= now.TimeOfDay)
                                throw new Exception("End time must be later than the current time");
                        }
                    }
                    if (createPlanModel.StartTime != null && createPlanModel.EndTime != null)
                    {
                        var parseStartTime = TimeSpan.Parse(createPlanModel.StartTime);
                        var parseEndTime = TimeSpan.Parse(createPlanModel.EndTime);
                        var checkTime = (int)(parseEndTime - parseStartTime).TotalMinutes; // Chuyển TimeSpan sang số phút

                        var masterType = await _unitOfWork.MasterTypeRepository
                            .GetByCondition(x => x.MasterTypeId == createPlanModel.MasterTypeId);

                        if (masterType != null)
                        {
                            var minTime = masterType.MinTime;
                            var maxTime = masterType.MaxTime;

                            if (checkTime < minTime || checkTime > maxTime)
                            {
                                return new BusinessResult(400, $"Time of work ({checkTime} minutes) does not valid! It must be in range {minTime} - {maxTime} minutes.");
                            }
                        }
                    }
                    if(keyGroup == null)
                    {
                        keyGroup = Guid.NewGuid().ToString();
                    }
                    var newPlan = new Plan()
                    {
                        PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                        PlanName = createPlanModel.PlanName,
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        IsSample = false,
                        AssignorId = createPlanModel.AssignorId,
                        CropId = createPlanModel.CropId,
                        EndDate = createPlanModel?.EndDate,
                        StartDate = createPlanModel?.StartDate,
                        Frequency = createPlanModel?.Frequency,
                        IsActive = createPlanModel?.IsActive,
                        IsDeleted = false,
                        MasterTypeId = createPlanModel?.MasterTypeId,
                        Notes = createPlanModel?.Notes,
                        KeyGroup = keyGroup,
                        ResponsibleBy = createPlanModel?.ResponsibleBy,
                        ProcessId = createPlanModel?.ProcessId,
                        SubProcessId = createPlanModel?.SubProcessId,
                        Status = "Active",
                        FarmID = farmId,
                        PlanDetail = createPlanModel?.PlanDetail,
                    };
                    if (createPlanModel.StartDate == createPlanModel.EndDate)
                    {
                        newPlan.StartDate = createPlanModel.StartDate.Add(TimeSpan.Parse(createPlanModel.StartTime));
                        newPlan.EndDate = createPlanModel.EndDate.Add(TimeSpan.Parse(createPlanModel.EndTime));
                    }
                    if (createPlanModel.Frequency != null && createPlanModel.Frequency.ToLower().Equals("none") && createPlanModel.CustomDates != null && createPlanModel.CustomDates.Count() == 1)
                    {
                        newPlan.StartDate = createPlanModel.CustomDates.First().Add(TimeSpan.Parse(createPlanModel.StartTime));
                        newPlan.EndDate = createPlanModel.CustomDates.First().Add(TimeSpan.Parse(createPlanModel.EndTime));
                    }


                    await _unitOfWork.PlanRepository.Insert(newPlan);

                    if (createPlanModel.CropId.HasValue && createPlanModel.ListLandPlotOfCrop != null)
                    {
                        var getCropToCheck = await _unitOfWork.CropRepository.GetByID(createPlanModel.CropId.Value);
                        if (getCropToCheck != null)
                        {
                            if (createPlanModel.StartDate < getCropToCheck.StartDate ||
                             createPlanModel.StartDate > getCropToCheck.EndDate ||
                             createPlanModel.EndDate < getCropToCheck.StartDate ||
                             createPlanModel.EndDate > getCropToCheck.EndDate)
                            {
                                throw new Exception($"StartDate and EndDate of plan must be within the duration of crop from " +
                                    $"{getCropToCheck.StartDate:dd/MM/yyyy} to {getCropToCheck.EndDate:dd/MM/yyyy}");
                            }
                        }
                        if (createPlanModel.ListLandPlotOfCrop.Any())
                        {
                            foreach (var landPlotOfCrop in createPlanModel.ListLandPlotOfCrop)
                            {
                                List<int> landRowOfLandPlotOfCropIDs = new List<int>();
                                HashSet<int> inputPlantIDsOfLandPlot = new HashSet<int>();

                                var rowsInLandPlotOfCrop = await _unitOfWork.LandRowRepository
                                   .GetRowsByLandPlotIdAsync(landPlotOfCrop);
                                landRowOfLandPlotOfCropIDs.AddRange(rowsInLandPlotOfCrop);


                                Dictionary<int, HashSet<int>> rowToPlantsOfLandPlotOfCrop = new Dictionary<int, HashSet<int>>();
                                foreach (var rowId in landRowOfLandPlotOfCropIDs)
                                {
                                    var plantsInRow = await _unitOfWork.PlantRepository.getPlantByRowId(rowId);

                                    if (!rowToPlantsOfLandPlotOfCrop.ContainsKey(rowId))
                                    {
                                        rowToPlantsOfLandPlotOfCrop[rowId] = new HashSet<int>();
                                    }

                                    rowToPlantsOfLandPlotOfCrop[rowId].UnionWith(plantsInRow);

                                }

                                foreach (var row in rowToPlantsOfLandPlotOfCrop)
                                {
                                    foreach (var plantId in row.Value)
                                    {
                                        var newPlantTarget = new PlanTarget()
                                        {
                                            LandPlotID = landPlotOfCrop,
                                            LandRowID = row.Key,
                                            PlantID = plantId,
                                            PlantLotID = null,
                                            Unit = "Land Plot",
                                            GraftedPlantID = null,
                                        };

                                        newPlan.PlanTargets.Add(newPlantTarget);

                                    }
                                }
                            }

                        }
                    }

                    if (createPlanModel.PlanTargetModel != null && createPlanModel.PlanTargetModel.Count > 0)
                    {
                        // HashSet để lưu các cặp (PlantID, LandPlotID, LandRowID) đã thêm vào tránh trùng lặp
                        HashSet<(int?, int?, int?)> addedPlanTargets = new HashSet<(int?, int?, int?)>();

                        foreach (var plantTarget in createPlanModel.PlanTargetModel)
                        {
                            List<int> landRowIDs = new List<int>();
                            HashSet<int> inputPlantIDs = new HashSet<int>(plantTarget.PlantID ?? new List<int>());

                            // Nếu có LandPlotID, lấy tất cả LandRowID thuộc LandPlot đó
                            if (plantTarget.LandPlotID.HasValue && (plantTarget.LandRowID == null || !plantTarget.LandRowID.Any()))
                            {
                                var rowsInPlot = await _unitOfWork.LandRowRepository
                                    .GetRowsByLandPlotIdAsync(plantTarget.LandPlotID.Value);
                                landRowIDs.AddRange(rowsInPlot);
                            }
                            // Nếu truyền LandRowID, thì chỉ dùng LandRowID
                            else if (plantTarget.LandRowID != null && plantTarget.LandRowID.Any())
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

                                            newPlan.PlanTargets.Add(newPlantTarget);
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

                                                newPlan.PlanTargets.Add(newPlantTarget);
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

                                        newPlan.PlanTargets.Add(newPlantTarget);
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

                                        newPlan.PlanTargets.Add(newPlantLotTarget);
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

                                        newPlan.PlanTargets.Add(newGraftedPlantTarget);
                                        addedPlanTargets.Add((null, null, graftedPlantId)); // Đánh dấu đã thêm
                                    }
                                }
                            }

                            await _unitOfWork.SaveAsync();
                        }
                    }


                    if (createPlanModel.GrowthStageId != null)
                    {
                        foreach (var growthStagePlanItem in createPlanModel.GrowthStageId)
                        {
                            var growthStagePlan = new GrowthStagePlan()
                            {
                                GrowthStageID = growthStagePlanItem,
                            };
                            newPlan.GrowthStagePlans.Add(growthStagePlan);
                        }
                    }

                    var getListMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypesByTypeName("notification");

                    var getMasterType = getListMasterType
                                    .FirstOrDefault(x => x.MasterTypeName?.ToLower().Contains("task assignment".ToLower()) == true);
                    var timeZoneNoti = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                    var todayNoti = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneNoti);
                    var addNotification = new Notification()
                    {
                        Content = "Plan " + createPlanModel.PlanName + " has just been created",
                        Title = "Plan",
                        MasterTypeId = getMasterType?.MasterTypeId,
                        IsRead = false,
                        CreateDate = todayNoti,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();
                    //if (createPlanModel.ListCriteria != null)
                    //{
                    //    var newCriteriaTargerRequest = new CriteriaTargerRequest()
                    //    {
                    //        PlanID = new List<int>() { newPlan.PlanId },
                    //        CriteriaData = createPlanModel.ListCriteria
                    //    };
                    //    await _criteriaTargetService.ApplyCriteriasForTarget(newCriteriaTargerRequest);
                    //}

                    foreach (var employee in createPlanModel.ListEmployee)
                    {
                        var addPlanNotification = new PlanNotification()
                        {
                            NotificationID = addNotification.NotificationId,
                            PlanID = newPlan.PlanId,
                            CreatedDate = DateTime.Now,
                            UserID = employee.UserId,
                            isRead = false,
                        };
                        await _unitOfWork.NotificationRepository.PushMessageFirebase(addNotification.Title, addNotification.Content, employee.UserId);

                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    }


                    await _unitOfWork.SaveAsync();

                    var getLastPlan = await _unitOfWork.PlanRepository.GetLastPlan();
                    var result = await GeneratePlanSchedule(getLastPlan, createPlanModel);
                    if (result)
                    {
                        if (useTransaction) await transaction.CommitAsync();
                        await _responseCacheService.RemoveCacheByGroupAsync($"{CacheKeyConst.GROUP_FARM_PLAN}:{getLastPlan.FarmID}");
                        if (createPlanModel.ListEmployee != null)
                        {
                            foreach (var employeeModel in createPlanModel.ListEmployee)
                            {
                                await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                            }
                        }
                        if (!string.IsNullOrEmpty(warningAddMessage))
                        {
                            return new BusinessResult(Const.SUCCESS_CREATE_PLAN_CODE, warningAddMessage, result);
                        }
                        else
                        {
                            return new BusinessResult(Const.SUCCESS_CREATE_PLAN_CODE, Const.SUCCESS_CREATE_PLAN_MSG, result);
                        }
                    }
                    else
                    {
                        if (useTransaction) await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_CREATE_PLAN_CODE, Const.FAIL_CREATE_PLAN_MESSAGE, false);
                    }
                }
                catch (Exception ex)
                {

                    if (useTransaction) await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> GetAllPlanPagination(PaginationParameter paginationParameter, PlanFilter planFilter, int farmId)
        {
            try
            {
                //string key = $"{CacheKeyConst.PLAN}:{CacheKeyConst.FARM}:{farmId}";

                //await _responseCacheService.RemoveCacheAsync(key);
                //var cachedData = await _responseCacheService.GetCacheObjectAsync<BusinessResult<PageEntity<PlanModel>>>(key);
                //if (cachedData != null && cachedData.Data != null)
                //{
                //    return new BusinessResult(cachedData.StatusCode, cachedData.Message, cachedData.Data);
                //}
                Expression<Func<Plan, bool>> filter = x =>
                           x.IsDeleted == false && x.IsSample == false && // Chỉ lấy các bản ghi chưa bị xóa
                          x.FarmID == farmId;

                Func<IQueryable<Plan>, IOrderedQueryable<Plan>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.PlanId == validInt);
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
                                      || x.Notes.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.ResponsibleBy.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Frequency.ToLower().Contains(paginationParameter.Search.ToLower()));
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
                    filter = filter.And(x => x.IsDeleted == planFilter.isDelete);
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

                if (!string.IsNullOrEmpty(planFilter.GrowStages))
                {
                    List<int> filterList = planFilter.GrowStages
                        .Split(',', StringSplitOptions.TrimEntries)
                        .Select(int.Parse) // Chuyển thành List<int>
                        .ToList();

                    filter = filter.And(x => x.GrowthStagePlans.Any(gsp => filterList.Contains(gsp.GrowthStageID.Value)));
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
                                   : x => x.OrderByDescending(x => x.PlanId)) : x => x.OrderByDescending(x => x.PlanId);
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
                    case "cropname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Crop.CropName)
                                   : x => x.OrderBy(x => x.Crop.CropName)) : x => x.OrderBy(x => x.Crop.CropName);
                        break;
                    case "isdelete":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.IsDeleted)
                                   : x => x.OrderBy(x => x.IsDeleted)) : x => x.OrderBy(x => x.IsDeleted);
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
                                   : x => x.OrderByDescending(x => x.CreateDate)) : x => x.OrderByDescending(x => x.CreateDate);
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
                        orderBy = x => x.OrderByDescending(x => x.PlanId);
                        break;
                }
                var entities = await _unitOfWork.PlanRepository.GetAllPlanWithPagination(filter, orderBy, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<PlanGetAllModel>();

                var listTemp = _mapper.Map<IEnumerable<PlanGetAllModel>>(entities).ToList();

                //foreach (var planTemp in listTemp)
                //{
                //    double calculateProgress = await _unitOfWork.WorkLogRepository.CalculatePlanProgress(planTemp.PlanId);
                //    planTemp.Progress = Math.Round(calculateProgress, 2).ToString();
                //}
                pagin.List = listTemp;
                pagin.TotalRecord = await _unitOfWork.PlanRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    //string groupKey = $"{CacheKeyConst.GROUP_FARM_PLAN}:{farmId}";
                    //var result = ;
                    //await _responseCacheService.AddCacheWithGroupAsync(groupKey.Trim(), key.Trim(), result, TimeSpan.FromMinutes(5));
                    return new BusinessResult(Const.SUCCESS_GET_ALL_PLAN_CODE, Const.SUCCESS_GET_ALL_PLAN_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(200, Const.WARNING_GET_PLAN_EMPTY_MSG, new PageEntity<PlanModel>());
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
                string key = CacheKeyConst.PLAN + $"{planId}";

                var getPlan = await _unitOfWork.PlanRepository.GetPlanByInclude(planId);
                var getStatusNotStarted = await _unitOfWork.SystemConfigRepository
                                     .GetConfigValue(SystemConfigConst.NOT_STARTED.Trim(), "Not Started");
                var getStatusInProgress = await _unitOfWork.SystemConfigRepository
                                    .GetConfigValue(SystemConfigConst.IN_PROGRESS.Trim(), "In Progress");
                var getStatusDone = await _unitOfWork.SystemConfigRepository
                                    .GetConfigValue(SystemConfigConst.DONE.Trim(), "Done");
                var getStatusOverdue = await _unitOfWork.SystemConfigRepository
                                    .GetConfigValue(SystemConfigConst.OVERDUE.Trim(), "Overdue");
              
               
                
                if (getPlan != null)
                {
                    double calculateProgress = await _unitOfWork.WorkLogRepository.CalculatePlanProgress(getPlan.PlanId);
                    string statusResult = "";
                    if (Math.Round(calculateProgress, 2) == 100)
                    {
                        statusResult = getStatusDone;
                    }
                    else if (getPlan.EndDate.Value.Date < DateTime.Now.Date)
                    {
                        statusResult = getStatusOverdue;
                    }
                    else if (getPlan.StartDate.Value.Date > DateTime.Now.Date)
                    {
                        statusResult = getStatusNotStarted;
                    }
                    else
                    {
                        statusResult = getStatusInProgress;
                    }

                    getPlan.Status = statusResult;
                    var result = _mapper.Map<PlanModel>(getPlan);
                    // Ánh xạ danh sách PlanTarget thành PlanTargetModels
                    var mappedPlanTargets = MapPlanTargets(getPlan.PlanTargets.ToList());
                    result.PlanTargetModels = mappedPlanTargets;
                    var plan = await _unitOfWork.PlanRepository.GetPlanWithEmployeeSkill(planId);

                    if (plan != null)
                    {
                        var userWorkLogs = plan?.CarePlanSchedule?
                                             .WorkLogs?
                                             .SelectMany(wl => wl.UserWorkLogs ?? new List<UserWorkLog>())
                                             .ToList() ?? new List<UserWorkLog>();

                        // Lấy Employee
                        var employeeUsers = userWorkLogs
                            .Where(uwl => uwl.IsReporter == false && uwl.User != null)
                            .Select(uwl => uwl.User)
                            .DistinctBy(u => u.UserId)
                            .ToList();

                        // Lấy Reporter
                        var reporterUsers = userWorkLogs
                            .Where(uwl => uwl.IsReporter == true && uwl.User != null)
                            .Select(uwl => uwl.User)
                            .DistinctBy(u => u.UserId)
                            .ToList();

                        // Hàm tạo EmployeeWithSkills
                        List<EmployeeWithSkills> MapToEmployeeWithSkills(List<User> users)
                        {
                            return users.Select(u => new EmployeeWithSkills
                            {
                                UserId = u.UserId,
                                FullName = u.FullName,
                                AvatarURL = u.AvatarURL,
                                SkillWithScore = u.UserFarms?
                                    .SelectMany(uf => uf.EmployeeSkills ?? new List<EmployeeSkill>())
                                    .Where(es => es.WorkTypeID != null)
                                    .Select(es => new SkillWithScore
                                    {
                                        SkillName = es.WorkType?.MasterTypeName,
                                        Score = es.ScoreOfSkill
                                    }).ToList()
                            }).ToList();
                        }

                        // Gán kết quả
                        result.ListEmployee = MapToEmployeeWithSkills(employeeUsers);
                        result.ListReporter = MapToEmployeeWithSkills(reporterUsers);
                    }

                    result.Progress = Math.Round(calculateProgress, 2).ToString();
                   
                    if (result != null)
                    {
                        //string groupKey = CacheKeyConst.GROUP_PLAN + $"{getPlan.PlanId}";
                        var finalResult = new BusinessResult(Const.SUCCESS_GET_PLAN_BY_ID_CODE, Const.SUCCESS_GET_PLAN_BY_ID_MSG, result);
                        //await _responseCacheService.AddCacheWithGroupAsync(groupKey.Trim(), key.Trim(), finalResult, TimeSpan.FromMinutes(5));
                        return finalResult;
                    }
                }
                return new BusinessResult(Const.WARNING_GET_PLAN_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLAN_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPlanByName(string planName, int? farmId)
        {
            try
            {

                var entities = await _unitOfWork.PlanRepository.GetPlanWithPagination();
                var getPlan = entities.FirstOrDefault(x => x.PlanName.ToLower().Contains(planName.ToLower()) && x.FarmID == farmId && x.IsDeleted == false);
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
        public async Task<BusinessResult> PermanentlyDeleteManyPlan(List<int> planIds)
        {
            try
            {
                foreach (var planId in planIds)
                {
                    string includeProperties = "CarePlanSchedule, PlanTargets";
                    var deletePlan = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == planId, includeProperties);
                    var deleteCarePlanSchedule = deletePlan.CarePlanSchedule;
                    var deletePlanTarget = deletePlan.PlanTargets;
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
                    if (deletePlanTarget != null)
                    {
                        foreach (var deletePlanTar in deletePlanTarget)
                        {
                            _unitOfWork.PlanTargetRepository.Delete(deletePlanTar);

                        }
                        await _unitOfWork.SaveAsync();
                    }
                    _unitOfWork.PlanRepository.Delete(deletePlan);
                }
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
        public async Task<BusinessResult> PermanentlyDeletePlan(int planId)
        {
            try
            {
                string includeProperties = "CarePlanSchedule";
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

                if (isFullMode || getPlanTarget.Unit?.ToLower() == "row")
                {
                    if (getPlanTarget.LandRow != null && rowIds.Add(getPlanTarget.LandRow.LandRowId))
                    {
                        var row = _mapper.Map<LandRowDisplayModel>(getPlanTarget.LandRow);
                        displayModel.Rows.Add(row);
                    }
                }
                if (isFullMode || getPlanTarget.Unit?.ToLower() == "plant")
                {
                    if (getPlanTarget.Plant != null && plantIds.Add(getPlanTarget.Plant.PlantId))
                    {
                        var plant = _mapper.Map<PlantDisplayModel>(getPlanTarget.Plant);
                        displayModel.Plants.Add(plant);
                    }
                }
                if (isFullMode || getPlanTarget.Unit?.ToLower() == "plantlot")
                {
                    if (getPlanTarget.PlantLot != null && plantLotIds.Add(getPlanTarget.PlantLot.PlantLotId))
                    {
                        var plantLot = _mapper.Map<PlantLotDisplayModel>(getPlanTarget.PlantLot);
                        displayModel.PlantLots.Add(plantLot);
                    }
                }
                if (isFullMode || getPlanTarget.Unit?.ToLower() == "graftedplant")
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



        public async Task<BusinessResult> UpdatePlanInfo(UpdatePlanModel updatePlanModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {

                    var validatePlan = new CreatePlanModel();
                    var checkProcessId = 0;
                    if (updatePlanModel.StartDate != null)
                    {
                        validatePlan.StartDate = updatePlanModel.StartDate.Value;
                    }
                    if (updatePlanModel.EndDate != null)
                    {
                        validatePlan.EndDate = updatePlanModel.EndDate.Value;
                    }
                    if (updatePlanModel.ProcessId != null)
                    {
                        validatePlan.ProcessId = updatePlanModel.ProcessId.Value;
                        checkProcessId = updatePlanModel.ProcessId.Value;
                    }
                    if (updatePlanModel.SubProcessId != null)
                    {
                        validatePlan.SubProcessId = updatePlanModel.SubProcessId.Value;
                        var getProcessBySub = await _unitOfWork.SubProcessRepository.GetProcessBySubProcessId(updatePlanModel.SubProcessId.Value);
                        checkProcessId = getProcessBySub.ProcessId;
                        var errors = await ValidatePlansAgainstTemplate(checkProcessId, new List<CreatePlanModel>() { validatePlan });
                        if (errors.Any())
                        {
                            return new BusinessResult(400, string.Join("\n", errors));
                        }
                    }
                    var checkExistPlan = await _unitOfWork.PlanRepository.GetPlanByInclude(updatePlanModel.PlanId);
                    if (updatePlanModel.StartTime != null && updatePlanModel.EndTime != null)
                    {
                        var parseStartTime = TimeSpan.Parse(updatePlanModel.StartTime);
                        var parseEndTime = TimeSpan.Parse(updatePlanModel.EndTime);
                        var checkTime = (int)(parseEndTime - parseStartTime).TotalMinutes; // Chuyển TimeSpan sang số phút

                        var masterType = await _unitOfWork.MasterTypeRepository
                            .GetByCondition(x => x.MasterTypeId == updatePlanModel.MasterTypeId);

                        if (masterType != null)
                        {
                            var minTime = masterType.MinTime;
                            var maxTime = masterType.MaxTime;

                            if (checkTime < minTime || checkTime > maxTime)
                            {
                                return new BusinessResult(400,$"Time of work ({checkTime} minutes) does not valid! It must be in range {minTime} - {maxTime} minutes.");
                            }
                        }
                    }
                    if (checkExistPlan != null)
                    {
                        if (checkExistPlan.StartDate <= DateTime.Now)
                        {
                            return new BusinessResult(Const.FAIL_UPDATE_PLANT_CODE, "Cannot update the plan because it has already started.");
                        }
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
                            checkExistPlan.IsDeleted = updatePlanModel.IsDelete;
                        }
                        if (updatePlanModel.Frequency != null)
                        {
                            checkExistPlan.Frequency = updatePlanModel.Frequency;
                        }
                        if (updatePlanModel.SubProcessId != null)
                        {
                            checkExistPlan.SubProcessId = updatePlanModel.SubProcessId;
                        }
                        if (updatePlanModel.CropId.HasValue && updatePlanModel.ListLandPlotOfCrop != null && updatePlanModel.PlanTargetModel == null)
                        {
                            var getCropToCheck = await _unitOfWork.CropRepository.GetByID(updatePlanModel.CropId.Value);
                            if (getCropToCheck != null)
                            {
                                if (updatePlanModel.StartDate < getCropToCheck.StartDate ||
                                 updatePlanModel.StartDate > getCropToCheck.EndDate ||
                                 updatePlanModel.EndDate < getCropToCheck.StartDate ||
                                 updatePlanModel.EndDate > getCropToCheck.EndDate)
                                {
                                    throw new Exception($"StartDate and EndDate of plan must be within the duration of crop from " +
                                        $"{getCropToCheck.StartDate:dd/MM/yyyy} to {getCropToCheck.EndDate:dd/MM/yyyy}");
                                }
                            }
                            checkExistPlan.CropId = updatePlanModel.CropId;
                            if (updatePlanModel.ListLandPlotOfCrop.Any())
                            {
                                var removePlanTargetOfPlan = await _unitOfWork.PlanTargetRepository.GetPlanTargetsByPlanId(checkExistPlan.PlanId);
                                if (removePlanTargetOfPlan != null)
                                {
                                    foreach (var removeOldPlanTarget in removePlanTargetOfPlan)
                                    {
                                        _unitOfWork.PlanTargetRepository.Delete(removeOldPlanTarget);
                                        await _unitOfWork.SaveAsync();
                                    }
                                }
                                foreach (var landPlotOfCrop in updatePlanModel.ListLandPlotOfCrop)
                                {
                                    List<int> landRowOfLandPlotOfCropIDs = new List<int>();
                                    HashSet<int> inputPlantIDsOfLandPlot = new HashSet<int>();

                                    var rowsInLandPlotOfCrop = await _unitOfWork.LandRowRepository
                                       .GetRowsByLandPlotIdAsync(landPlotOfCrop);
                                    landRowOfLandPlotOfCropIDs.AddRange(rowsInLandPlotOfCrop);


                                    Dictionary<int, HashSet<int>> rowToPlantsOfLandPlotOfCrop = new Dictionary<int, HashSet<int>>();
                                    foreach (var rowId in landRowOfLandPlotOfCropIDs)
                                    {
                                        var plantsInRow = await _unitOfWork.PlantRepository.getPlantByRowId(rowId);

                                        if (!rowToPlantsOfLandPlotOfCrop.ContainsKey(rowId))
                                        {
                                            rowToPlantsOfLandPlotOfCrop[rowId] = new HashSet<int>();
                                        }

                                        rowToPlantsOfLandPlotOfCrop[rowId].UnionWith(plantsInRow);

                                    }

                                    foreach (var row in rowToPlantsOfLandPlotOfCrop)
                                    {
                                        foreach (var plantId in row.Value)
                                        {
                                            var newPlantTarget = new PlanTarget()
                                            {
                                                LandPlotID = landPlotOfCrop,
                                                LandRowID = row.Key,
                                                PlantID = plantId,
                                                PlantLotID = null,
                                                Unit = "Land Plot",
                                                GraftedPlantID = null,
                                                PlanID = checkExistPlan.PlanId,
                                            };

                                            await _unitOfWork.PlanTargetRepository.Insert(newPlantTarget);
                                            await _unitOfWork.SaveAsync();

                                        }
                                    }
                                }
                                var deletePlanTargetOfPlan = await _unitOfWork.PlanTargetRepository.GetPlanTargetsByPlanId(checkExistPlan.PlanId);
                                if (deletePlanTargetOfPlan != null)
                                {
                                    foreach (var removeOldPlanTarget in deletePlanTargetOfPlan)
                                    {
                                        _unitOfWork.PlanTargetRepository.Delete(removeOldPlanTarget);
                                        await _unitOfWork.SaveAsync();
                                    }
                                }

                            }
                        }

                        if (updatePlanModel.MasterTypeId != null)
                        {
                            checkExistPlan.MasterTypeId = updatePlanModel.MasterTypeId;
                            if (updatePlanModel.ProcessId != null)
                            {
                                var getCheckExistProcess = await _unitOfWork.ProcessRepository.GetByID(updatePlanModel.ProcessId.Value);
                                if (getCheckExistProcess != null)
                                {
                                    if (getCheckExistProcess.MasterTypeId != null)
                                    {
                                        checkExistPlan.MasterTypeId = getCheckExistProcess.MasterTypeId;
                                    }
                                }
                            }
                        }
                        if (updatePlanModel.GrowthStageId != null && updatePlanModel.GrowthStageId.Any() && checkExistPlan.ProcessId == null)
                        {
                            // Lấy danh sách ID từ GrowthStagePlans hiện tại
                            var existingGrowthStageIds = checkExistPlan.GrowthStagePlans.Select(x => x.GrowthStageID).ToList();

                            // Xóa GrowthStagePlans không có trong danh sách mới
                            checkExistPlan.GrowthStagePlans.ToList().RemoveAll(x => !updatePlanModel.GrowthStageId.Contains(x.GrowthStageID.Value));

                            // Thêm các GrowthStageID mới nếu chưa có
                            foreach (var newId in updatePlanModel.GrowthStageId)
                            {
                                if (!existingGrowthStageIds.Contains(newId))
                                {
                                    var newGrowthStagePlan = new GrowthStagePlan()
                                    {
                                        GrowthStageID = newId,
                                        PlanID = checkExistPlan.PlanId
                                    };
                                    await _unitOfWork.GrowthStagePlanRepository.Insert(newGrowthStagePlan);
                                }
                            }
                            await _unitOfWork.SaveAsync();
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
                        if (updatePlanModel.Frequency != null)
                        {
                            checkExistPlan.Frequency = updatePlanModel.Frequency;
                        }
                        if (updatePlanModel.StartDate != null && updatePlanModel.EndDate != null)
                        {
                            if (updatePlanModel.StartDate == updatePlanModel.EndDate)
                            {
                                checkExistPlan.StartDate = updatePlanModel.StartDate.Value.Add(TimeSpan.Parse(updatePlanModel.StartTime));
                                checkExistPlan.EndDate = updatePlanModel.EndDate.Value.Add(TimeSpan.Parse(updatePlanModel.EndTime));
                            }
                        }
                        if ((updatePlanModel.Frequency != null && updatePlanModel.Frequency.ToLower().Equals("none") && updatePlanModel.CustomDates != null && updatePlanModel.CustomDates.Count < 2))
                        {
                            checkExistPlan.StartDate = updatePlanModel.CustomDates.First().Add(TimeSpan.Parse(updatePlanModel.StartTime));
                            checkExistPlan.EndDate = updatePlanModel.CustomDates.First().Add(TimeSpan.Parse(updatePlanModel.EndTime));
                        }

                        if (updatePlanModel.PlanTargetModel != null && updatePlanModel.PlanTargetModel.Count > 0 && !updatePlanModel.CropId.HasValue && updatePlanModel.ListLandPlotOfCrop == null)
                        {
                            checkExistPlan.CropId = null;
                            var removePlanTargetOfPlan = await _unitOfWork.PlanTargetRepository.GetPlanTargetsByPlanId(checkExistPlan.PlanId);
                            if (removePlanTargetOfPlan != null)
                            {
                                foreach (var removeOldPlanTarget in removePlanTargetOfPlan)
                                {
                                    _unitOfWork.PlanTargetRepository.Delete(removeOldPlanTarget);
                                    await _unitOfWork.SaveAsync();
                                }
                            }
                            // HashSet để lưu các cặp (PlantID, LandPlotID, LandRowID) đã thêm vào tránh trùng lặp
                            HashSet<(int?, int?, int?)> addedPlanTargets = new HashSet<(int?, int?, int?)>();

                            foreach (var plantTarget in updatePlanModel.PlanTargetModel)
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

                                if (plantTarget.LandPlotID.HasValue && plantTarget.LandRowID == null && plantTarget.PlantID == null)
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
                                                    PlanID = checkExistPlan.PlanId
                                                };
                                                await _unitOfWork.PlanTargetRepository.Insert(newPlantTarget);
                                                await _unitOfWork.SaveAsync();
                                                addedPlanTargets.Add((plantId, plantTarget.LandPlotID, row.Key)); // Đánh dấu đã thêm
                                            }
                                        }
                                    }
                                }
                                else
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
                                                    Unit = "Row",
                                                    GraftedPlantID = null,
                                                    PlanID = checkExistPlan.PlanId
                                                };

                                                await _unitOfWork.PlanTargetRepository.Insert(newPlantTarget);
                                                await _unitOfWork.SaveAsync();
                                                addedPlanTargets.Add((plantId, plantTarget.LandPlotID, row.Key)); // Đánh dấu đã thêm
                                            }
                                        }
                                    }

                                    // **Xử lý các PlantID từ input (chỉ insert nếu nó không có trong LandRows)**
                                    var plantsToInsert = inputPlantIDs.Except(existingPlantIDs).ToList();
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
                                                GraftedPlantID = null,
                                                PlanID = checkExistPlan.PlanId
                                            };

                                            await _unitOfWork.PlanTargetRepository.Insert(newPlantTarget);
                                            await _unitOfWork.SaveAsync();
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
                                                GraftedPlantID = null,
                                                PlanID = checkExistPlan.PlanId
                                            };
                                            await _unitOfWork.PlanTargetRepository.Insert(newPlantLotTarget);
                                            await _unitOfWork.SaveAsync();
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
                                                GraftedPlantID = graftedPlantId,
                                                PlanID = checkExistPlan.PlanId
                                            };

                                            await _unitOfWork.PlanTargetRepository.Insert(newGraftedPlantTarget);
                                            await _unitOfWork.SaveAsync();
                                            addedPlanTargets.Add((null, null, graftedPlantId)); // Đánh dấu đã thêm
                                        }
                                    }
                                }

                                await _unitOfWork.SaveAsync();
                            }
                        }
                        checkExistPlan.UpdateDate = DateTime.Now;
                        var checkDeleteDependenciesOfPlan = await _unitOfWork.CarePlanScheduleRepository.DeleteDependenciesOfPlan(checkExistPlan.PlanId);
                        if (checkDeleteDependenciesOfPlan)
                        {

                            var result = await UpdatePlanSchedule(checkExistPlan, updatePlanModel);
                            if (result)
                            {
                                var timeZoneNoti = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                                var todayNoti = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneNoti);
                                var addNotification = new Notification()
                                {
                                    Content = "Plan " + updatePlanModel.PlanName + " has just been created",
                                    Title = "Plan",
                                    MasterTypeId = 36,
                                    IsRead = false,
                                    CreateDate = todayNoti,
                                    NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                                };
                                await _unitOfWork.NotificationRepository.Insert(addNotification);
                                await _unitOfWork.PlanRepository.UpdatePlan(checkExistPlan);
                                await _unitOfWork.SaveAsync();
                                if (updatePlanModel.ListEmployee != null)
                                {
                                    foreach (var employeeModel in updatePlanModel.ListEmployee)
                                    {
                                        var addEmployeeNotification = new PlanNotification()
                                        {
                                            NotificationID = addNotification.NotificationId,
                                            CreatedDate = DateTime.Now,
                                            isRead = false,
                                            UserID = employeeModel.UserId
                                        };
                                        await _unitOfWork.PlanNotificationRepository.Insert(addEmployeeNotification);
                                        await _unitOfWork.NotificationRepository.PushMessageFirebase(addNotification.Title, addNotification.Content, employeeModel.UserId);
                                        await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                                    }
                                }
                                await _unitOfWork.SaveAsync();
                                await transaction.CommitAsync();
                                await _responseCacheService.RemoveCacheByGroupAsync($"{CacheKeyConst.GROUP_FARM_PLAN}:{checkExistPlan.FarmID}");
                                await _responseCacheService.RemoveCacheByGroupAsync(CacheKeyConst.GROUP_PLAN + checkExistPlan.PlanId.ToString());

                                if (!string.IsNullOrEmpty(warningUpdateMessage))
                                {
                                    return new BusinessResult(Const.SUCCESS_UPDATE_PLAN_CODE, warningUpdateMessage, result);
                                }
                                else
                                {
                                    return new BusinessResult(Const.SUCCESS_UPDATE_PLAN_CODE, Const.SUCCESS_UPDATE_PLAN_MSG, checkExistPlan);
                                }
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
            var result = 0;
            DateTime currentDate = createPlanModel.StartDate;
            if (createPlanModel.StartDate.Add(TimeSpan.Parse(createPlanModel.StartTime)) <= DateTime.Now)
            {
                throw new Exception("Start Time must be greater than or equal now");
            }
            if (TimeSpan.Parse(createPlanModel.StartTime) >= TimeSpan.Parse(createPlanModel.EndTime))
            {
                throw new Exception("Start time must be less than End Time");
            }
            if (plan.Frequency == null)
            {
                throw new Exception("Frequency can not be empty. It must be weekly, monthly, daily or none");
            }
            if (plan.Frequency.ToLower() == "none" && createPlanModel.CustomDates != null)
            {
                schedule = new CarePlanSchedule()
                {
                    Status = "Active",
                    DayOfWeek = null,
                    IsDeleted = false,
                    DayOfMonth = null,
                    CustomDates = JsonConvert.SerializeObject(createPlanModel.CustomDates.Select(x => x.ToString("yyyy/MM/dd"))),
                    StartTime = TimeSpan.Parse(createPlanModel.StartTime),
                    EndTime = TimeSpan.Parse(createPlanModel.EndTime),
                    FarmID = plan.FarmID,
                    CarePlanId = plan.PlanId
                };
                plan.CarePlanSchedule = schedule;
                await _unitOfWork.CarePlanScheduleRepository.Insert(schedule);
                result += await _unitOfWork.SaveAsync();
                List<DateTime> conflictCustomDates = new List<DateTime>();
                //foreach (var customeDate in createPlanModel.CustomDates)
                //{
                //    if (customeDate >= currentDate && customeDate <= plan.EndDate)
                //    {
                //        var checkConflictTimeOfWorkLog = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime), customeDate);
                //        if (checkConflictTimeOfWorkLog)
                //        {
                //            conflictCustomDates.Add(customeDate);
                //        }
                //    }

                //}

                //if (conflictCustomDates.Count > 5)
                //{
                //    throw new Exception("Schedule is conflicted");
                //}
                //if (conflictCustomDates.Count() > 0 && conflictCustomDates.Count() < 5)
                //{
                //    warningAddMessage = $"Warning: The schedule has conflicts on the following dates: {string.Join(", ", conflictCustomDates.Select(d => d.ToString("yyyy-MM-dd")))}. The plan has been created, but please review these conflicts.";
                //}
                await _unitOfWork.WorkLogRepository.CheckWorkLogAvailabilityWhenAddPlan(
                                                                       TimeSpan.Parse(createPlanModel.StartTime),
                                                                       TimeSpan.Parse(createPlanModel.EndTime),
                                                                       currentDate,
                                                                       createPlanModel.MasterTypeId,
                                                                       createPlanModel.ListEmployee.Select(x => x.UserId).ToList()
                                                                   );
                foreach (var customeDate in createPlanModel.CustomDates)
                {
                    if (customeDate.Date >= currentDate.Date && customeDate.Date <= plan.EndDate.Value.Date)
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
                    IsDeleted = false,
                    DayOfWeek = JsonConvert.SerializeObject(createPlanModel.DayOfWeek),
                    DayOfMonth = null,
                    CustomDates = null,
                    FarmID = plan.FarmID,
                    StartTime = TimeSpan.Parse(createPlanModel.StartTime),
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
                    IsDeleted = false,
                    FarmID = plan.FarmID,
                    DayOfMonth = JsonConvert.SerializeObject(createPlanModel.DayOfMonth),
                    CustomDates = null,
                    StartTime = TimeSpan.Parse(createPlanModel.StartTime),
                    EndTime = TimeSpan.Parse(createPlanModel.EndTime)
                };
            }
            else if (plan.Frequency != null && plan.Frequency.ToLower() == "daily")
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    IsDeleted = false,
                    FarmID = plan.FarmID,
                    DayOfWeek = null,
                    DayOfMonth = null,
                    CustomDates = null,
                    StartTime = TimeSpan.Parse(createPlanModel.StartTime),
                    EndTime = TimeSpan.Parse(createPlanModel.EndTime)
                };
            }
            //if (await _unitOfWork.CarePlanScheduleRepository.IsScheduleConflicted(plan.PlanId, createPlanModel.StartDate, createPlanModel.EndDate, TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime)))
            //{
            //    throw new Exception("The schedule is conflicted");
            //}
            //var landPlotIdCheck = createPlanModel.PlanTargetModel.Select(x => x.LandPlotID).ToList();
            //foreach (var planTarget in createPlanModel.PlanTargetModel)
            //{
            //    var conflictWorkLogs = await _unitOfWork.WorkLogRepository.GetConflictWorkLogsOnSameLocation(
            //                                                            TimeSpan.Parse(createPlanModel.StartTime),
            //                                                            TimeSpan.Parse(createPlanModel.EndTime),
            //                                                            currentDate,
            //                                                            planTarget.PlantID,
            //                                                            planTarget.LandRowID,
            //                                                            landPlotIdCheck
            //                                                        );
            //    if (conflictWorkLogs.Any())
            //    {
            //        var conflictDetails = string.Join("\n", conflictWorkLogs.Select(w =>
            //        {
            //            var planTarget = w.Schedule?.CarePlan?.PlanTargets?.FirstOrDefault();
            //            return $"- Tree: {planTarget?.Plant?.PlantName ?? "Unknown"}, Row: {planTarget?.LandRow?.RowIndex ?? 0}, Plot: {planTarget?.LandPlot?.LandPlotName ?? "Unknown"}, Time: {w.Schedule?.StartTime} - {w.Schedule?.EndTime}";
            //        }));

            //        throw new Exception($"WorkLog conflict detected at the same time:\n{conflictDetails}");
            //    }
            //}
            if (plan.Frequency.ToLower() != "none" || createPlanModel.CustomDates == null)
            {
                await _unitOfWork.WorkLogRepository.CheckWorkLogAvailabilityWhenAddPlan(
                                                                        TimeSpan.Parse(createPlanModel.StartTime),
                                                                        TimeSpan.Parse(createPlanModel.EndTime),
                                                                        currentDate,
                                                                        createPlanModel.MasterTypeId,
                                                                        createPlanModel.ListEmployee.Select(x => x.UserId).ToList()
                                                                    );
            }

            if (schedule.ScheduleId <= 0)
            {
                await _unitOfWork.CarePlanScheduleRepository.Insert(schedule);
            }
            result += await _unitOfWork.SaveAsync();
            while (currentDate.Date <= plan.EndDate!.Value.Date && plan.Frequency.ToLower() != "none")
            {
                if (plan.Frequency != null && plan.Frequency.ToLower() == "weekly" && createPlanModel.DayOfWeek != null)
                {
                    // Nếu là Weekly, duyệt qua từng ngày trong tuần
                    List<DateTime> conflictDatesInWeekly = new List<DateTime>();
                    //foreach (int day in createPlanModel.DayOfWeek)
                    //{
                    //    DateTime nextDay = GetNextDayOfWeek(currentDate, (DayOfWeek)day);
                    //    if (nextDay <= plan.EndDate)
                    //    {
                    //        var checkConflictTimeOfWorkLogWeekly = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime), nextDay);
                    //        if (checkConflictTimeOfWorkLogWeekly)
                    //        {
                    //            conflictDatesInWeekly.Add(nextDay);
                    //        }
                    //    }
                    //}
                    //if (conflictDatesInWeekly.Count > 5)
                    //{
                    //    throw new Exception("Schedule is conflicted");
                    //}
                    //if (conflictDatesInWeekly.Count() > 0 && conflictDatesInWeekly.Count() < 5)
                    //{
                    //    warningAddMessage = $"Warning: The schedule has conflicts on the following dates: {string.Join(", ", conflictDatesInWeekly.Select(d => d.ToString("yyyy-MM-dd")))}. The plan has been created, but please review these conflicts.";
                    //}
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
                    //foreach (int day in createPlanModel.DayOfMonth)
                    //{
                    //    int maxDays = DateTime.DaysInMonth(currentDate.Year, currentDate.Month);
                    //    int validDay = Math.Min(day, maxDays); // Nếu day > maxDays thì chọn ngày cuối tháng

                    //    DateTime nextMonthDate = new DateTime(currentDate.Year, currentDate.Month, validDay);
                    //    if (nextMonthDate <= plan.EndDate)
                    //    {
                    //        var checkConflictTimeOfWorkLogMonthly = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime), nextMonthDate);
                    //        if (checkConflictTimeOfWorkLogMonthly)
                    //        {
                    //            conflictDatesInMonthly.Add(nextMonthDate);
                    //        }
                    //    }
                    //}

                    //if (conflictDatesInMonthly.Count > 5)
                    //{
                    //    throw new Exception("Schedule is conflicted");
                    //}
                    //if (conflictDatesInMonthly.Count() > 0 && conflictDatesInMonthly.Count() < 5)
                    //{
                    //    warningAddMessage = $"Warning: The schedule has conflicts on the following dates: {string.Join(", ", conflictDatesInMonthly.Select(d => d.ToString("yyyy-MM-dd")))}. The plan has been created, but please review these conflicts.";
                    //}

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
                    //var checkConflictTimeOfWorkLogDaily = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(createPlanModel.StartTime), TimeSpan.Parse(createPlanModel.EndTime), currentDate);
                    //if (checkConflictTimeOfWorkLogDaily)
                    //{
                    //    conflictDatesInDaily.Add(currentDate);
                    //}

                    //if (conflictDatesInDaily.Count > 5)
                    //{
                    //    throw new Exception("Schedule is conflicted");
                    //}
                    //if (conflictDatesInDaily.Count() > 0 && conflictDatesInDaily.Count() < 5)
                    //{
                    //    warningAddMessage = $"Warning: The schedule has conflicts on the following dates: {string.Join(", ", conflictDatesInDaily.Select(d => d.ToString("yyyy-MM-dd")))}. The plan has been created, but please review these conflicts.";
                    //}

                    var tempModel = conflictDatesInDaily.Contains(currentDate)
                                ? new CreatePlanModel(createPlanModel) { ListEmployee = null }
                                : createPlanModel;
                    await GenerateWorkLogs(schedule, currentDate, createPlanModel);
                    currentDate = currentDate.AddDays(1);
                }
                else
                {
                    throw new Exception("Frequency must be weekly, monthly, daily or none");
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
            var result = 0;
            DateTime currentDate = updatePlanModel.StartDate.Value;
            if (updatePlanModel.StartDate.Value.Add(TimeSpan.Parse(updatePlanModel.StartTime)) <= DateTime.Now)
            {
                throw new Exception("Start Time must be greater than or equal now");
            }
            if (plan.Frequency == null)
            {
                throw new Exception("Frequency can not be empty. It must be weekly, monthly, daily or none");
            }
            if (plan.Frequency.ToLower() == "none" && updatePlanModel.CustomDates != null)
            {
                schedule = new CarePlanSchedule()
                {
                    Status = "Active",
                    DayOfWeek = null,
                    DayOfMonth = null,
                    FarmID = plan.FarmID,
                    IsDeleted = false,
                    CustomDates = JsonConvert.SerializeObject(updatePlanModel.CustomDates.Select(x => x.ToString("yyyy/MM/dd"))),
                    StartTime = TimeSpan.Parse(updatePlanModel.StartTime),
                    EndTime = TimeSpan.Parse(updatePlanModel.EndTime),
                    CarePlanId = plan.PlanId
                };

                plan.CarePlanSchedule = schedule;
                await _unitOfWork.CarePlanScheduleRepository.Insert(schedule);
                result += await _unitOfWork.SaveAsync();
                List<DateTime> conflictCustomDates = new List<DateTime>();
                //foreach (var customeDate in updatePlanModel.CustomDates)
                //{
                //    if (customeDate >= currentDate && customeDate <= plan.EndDate)
                //    {
                //        var checkConflictTimeOfWorkLog = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(updatePlanModel.StartTime), TimeSpan.Parse(updatePlanModel.EndTime), customeDate);
                //        if (checkConflictTimeOfWorkLog)
                //        {
                //            conflictCustomDates.Add(customeDate);
                //        }
                //    }

                //}


                //if (conflictCustomDates.Count > 5)
                //{
                //    throw new Exception("Schedule is conflicted");
                //}
                //if (conflictCustomDates.Count() > 0 && conflictCustomDates.Count() < 5)
                //{
                //    warningUpdateMessage = $"Warning: The schedule has conflicts on the following dates: {string.Join(", ", conflictCustomDates.Select(d => d.ToString("yyyy-MM-dd")))}. The plan has been created, but please review these conflicts.";
                //}


                foreach (var customeDate in updatePlanModel.CustomDates)
                {
                    if (customeDate.Date >= currentDate && customeDate.Date <= plan.EndDate.Value.Date)
                    {
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
                    FarmID = plan.FarmID,
                    IsDeleted = false,
                    DayOfWeek = JsonConvert.SerializeObject(updatePlanModel.DayOfWeek),
                    DayOfMonth = null,
                    CustomDates = null,
                    StartTime = TimeSpan.Parse(updatePlanModel.StartTime),
                    EndTime = TimeSpan.Parse(updatePlanModel.EndTime)
                };
            }
            else if (plan.Frequency != null && plan.Frequency.ToLower() == "monthly" && updatePlanModel.DayOfMonth != null)
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    FarmID = plan.FarmID,
                    DayOfWeek = null,
                    IsDeleted = false,
                    DayOfMonth = JsonConvert.SerializeObject(updatePlanModel.DayOfMonth),
                    CustomDates = null,
                    StartTime = TimeSpan.Parse(updatePlanModel.StartTime),
                    EndTime = TimeSpan.Parse(updatePlanModel.EndTime)
                };
            }
            else if (plan.Frequency != null && plan.Frequency.ToLower() == "daily")
            {
                schedule = new CarePlanSchedule()
                {
                    CarePlanId = plan.PlanId,
                    Status = "Active",
                    IsDeleted = false,
                    FarmID = plan.FarmID,
                    DayOfWeek = JsonConvert.SerializeObject(updatePlanModel.DayOfWeek),
                    DayOfMonth = null,
                    CustomDates = null,
                    StartTime = TimeSpan.Parse(updatePlanModel.StartTime),
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
            //var checkPlantLotIds = updatePlanModel.PlanTargetModel.Select(x => x.LandPlotID).ToList();
            //foreach (var planTarget in updatePlanModel.PlanTargetModel)
            //{
            //    var conflictWorkLogs = await _unitOfWork.WorkLogRepository.GetConflictWorkLogsOnSameLocation(
            //                                                            TimeSpan.Parse(updatePlanModel.StartTime),
            //                                                            TimeSpan.Parse(updatePlanModel.EndTime),
            //                                                            currentDate,
            //                                                            planTarget.PlantID,
            //                                                            planTarget.LandRowID,
            //                                                            checkPlantLotIds
            //                                                        );
            //    if (conflictWorkLogs.Any())
            //    {
            //        var conflictDetails = string.Join("\n", conflictWorkLogs.Select(w =>
            //        {
            //            var planTarget = w.Schedule?.CarePlan?.PlanTargets?.FirstOrDefault();
            //            return $"- Tree: {planTarget?.Plant.PlantName ?? "Unknown"}, Row: {planTarget?.LandRow.RowIndex ?? 0}, Plot: {planTarget?.LandPlot.LandPlotName ?? "Unknown"}, Time: {w.Schedule?.StartTime} - {w.Schedule?.EndTime}";
            //        }));

            //        throw new Exception($"WorkLog conflict detected at the same time:\n{conflictDetails}");
            //    }
            //}
            if (plan.Frequency.ToLower() != "none" || updatePlanModel.CustomDates == null)
            {
                await _unitOfWork.WorkLogRepository.CheckWorkLogAvailabilityWhenAddPlan(TimeSpan.Parse(updatePlanModel.StartTime),
                                                                       TimeSpan.Parse(updatePlanModel.EndTime),
                                                                       currentDate,
                                                                      updatePlanModel.MasterTypeId,
                                                                       updatePlanModel.ListEmployee.Select(x => x.UserId).ToList());
            }

            if (schedule.ScheduleId <= 0)
            {
                plan.CarePlanSchedule = schedule;
                await _unitOfWork.CarePlanScheduleRepository.Insert(schedule);
            }
            result += await _unitOfWork.SaveAsync();
            while (currentDate <= plan.EndDate && plan.Frequency.ToLower() != "none")
            {
                if (plan.Frequency != null && plan.Frequency.ToLower() == "weekly" && updatePlanModel.DayOfWeek != null)
                {
                    //// Nếu là Weekly, duyệt qua từng ngày trong tuần
                    List<DateTime> conflictDatesInWeekly = new List<DateTime>();
                    //foreach (int day in updatePlanModel.DayOfWeek)
                    //{
                    //    DateTime nextDay = GetNextDayOfWeek(currentDate, (DayOfWeek)day);
                    //    if (nextDay <= plan.EndDate)
                    //    {
                    //        var checkConflictTimeOfWorkLogWeekly = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(updatePlanModel.StartTime), TimeSpan.Parse(updatePlanModel.EndTime), nextDay);
                    //        if (checkConflictTimeOfWorkLogWeekly)
                    //        {
                    //            conflictDatesInWeekly.Add(nextDay);
                    //        }
                    //    }
                    //}

                    //if (conflictDatesInWeekly.Count > 5)
                    //{
                    //    throw new Exception("Schedule is conflicted");
                    //}
                    //if (conflictDatesInWeekly.Count() > 0 && conflictDatesInWeekly.Count() < 5)
                    //{
                    //    warningUpdateMessage = $"Warning: The schedule has conflicts on the following dates: {string.Join(", ", conflictDatesInWeekly.Select(d => d.ToString("yyyy-MM-dd")))}. The plan has been created, but please review these conflicts.";
                    //}

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
                    //// Nếu là Monthly, duyệt qua từng ngày cụ thể trong tháng
                    List<DateTime> conflictDates = new List<DateTime>();
                    //foreach (int day in updatePlanModel.DayOfMonth)
                    //{
                    //    int maxDays = DateTime.DaysInMonth(currentDate.Year, currentDate.Month);
                    //    int validDay = Math.Min(day, maxDays); // Nếu day > maxDays thì chọn ngày cuối tháng

                    //    DateTime nextMonthDate = new DateTime(currentDate.Year, currentDate.Month, validDay);
                    //    if (nextMonthDate <= plan.EndDate)
                    //    {
                    //        var checkConflictTimeOfWorkLogMonthly = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(updatePlanModel.StartTime), TimeSpan.Parse(updatePlanModel.EndTime), nextMonthDate);
                    //        if (checkConflictTimeOfWorkLogMonthly)
                    //        {
                    //            conflictDates.Add(nextMonthDate);
                    //        }
                    //    }
                    //}

                    //if (conflictDates.Count > 5)
                    //{
                    //    throw new Exception("Schedule is conflicted");
                    //}
                    //if(conflictDates.Count() > 0 && conflictDates.Count() < 5)
                    //{
                    //    warningUpdateMessage = $"Warning: The schedule has conflicts on the following dates: {string.Join(", ", conflictDates.Select(d => d.ToString("yyyy-MM-dd")))}. The plan has been created, but please review these conflicts.";
                    //}

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
                    //var checkConflictTimeOfWorkLogDaily = await _unitOfWork.WorkLogRepository.CheckConflictTimeOfWorkLog(TimeSpan.Parse(updatePlanModel.StartTime), TimeSpan.Parse(updatePlanModel.EndTime), currentDate);
                    //if (checkConflictTimeOfWorkLogDaily)
                    //{
                    //    conflictDatesDaily.Add(currentDate);
                    //}

                    //if (conflictDatesDaily.Count > 5)
                    //{
                    //    throw new Exception("Schedule is conflicted");
                    //}
                    //if (conflictDatesDaily.Count() > 0 && conflictDatesDaily.Count() < 5)
                    //{
                    //    warningUpdateMessage = $"Warning: The schedule has conflicts on the following dates: {string.Join(", ", conflictDatesDaily.Select(d => d.ToString("yyyy-MM-dd")))}. The plan has been created, but please review these conflicts.";
                    //}

                    // Nếu ngày này nằm trong danh sách bị conflict thì đặt ListEmployee = null
                    var tempModel = conflictDatesDaily.Contains(currentDate)
                        ? new UpdatePlanModel(updatePlanModel) { ListEmployee = null }
                        : updatePlanModel;

                    await GenerateWorkLogsForUpdate(schedule, currentDate, tempModel);

                    currentDate = currentDate.AddDays(1);
                }
                else
                {
                    throw new Exception("Frequency must be weekly, monthly, daily or none");

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
            int count = 0;
            if (createPlanModel.ListLandPlotOfCrop != null)
            {
                foreach (var landPlotId in createPlanModel.ListLandPlotOfCrop)
                {
                    var getLandPlot = await _unitOfWork.LandPlotRepository.GetByID(landPlotId);
                    if (count > 0)
                    {
                        plantLotName = plantLotName + "_" + getLandPlot.LandPlotName;
                    }
                    else
                    {
                        plantLotName = plantLotName + "_" + getLandPlot.LandPlotName;
                    }
                }
            }
            if (createPlanModel.PlanTargetModel != null)
            {
                foreach (var plantTarget in createPlanModel.PlanTargetModel)
                {
                    if (plantTarget.LandPlotID != null && plantTarget.LandPlotID > 0)
                    {
                        plantLotName = "LandPlot";
                    }

                    if (plantTarget.LandRowID != null && plantTarget.LandRowID.Count > 0)
                    {
                        plantLotName = "Row";

                    }

                    if (plantTarget.PlantID != null && plantTarget.PlantID.Count > 0)
                    {
                        plantLotName = "Plant";

                    }

                    if (plantTarget.GraftedPlantID != null && plantTarget.GraftedPlantID.Count > 0)
                    {
                        plantLotName = "Grafted_Plant";
                    }

                    if (plantTarget.PlantLotID != null && plantTarget.PlantLotID.Count > 0)
                    {
                        plantLotName = "Plant_Lot";

                    }
                    count++;
                }
            }

            // Tạo WorkLog mới
            var newWorkLog = new WorkLog
            {
                WorkLogCode = $"WL{DateTime.Now:yyMMddHHmmssfff}",
                Status = "Not Started",
                IsDeleted = false,
                ActualStartTime = schedule.StartTime,
                ActualEndTime = schedule.EndTime,
                WorkLogName = getTypePlan.MasterTypeName + "_on_" + plantLotName,
                Date = dateWork.Date.Add(schedule.StartTime.Value),
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
            string plantLotName = "";
            int count = 0;
            if (updatePlanModel.ListLandPlotOfCrop != null)
            {
                foreach (var landPlotId in updatePlanModel.ListLandPlotOfCrop)
                {
                    var getLandPlot = await _unitOfWork.LandPlotRepository.GetByID(landPlotId);
                    if (count > 0)
                    {
                        plantLotName = " & " + plantLotName + "_" + getLandPlot.LandPlotName;
                    }
                    else
                    {
                        plantLotName = plantLotName + "_" + getLandPlot.LandPlotName;
                    }
                }
            }
            if (updatePlanModel.PlanTargetModel != null)
            {
                foreach (var plantTarget in updatePlanModel.PlanTargetModel)
                {
                    if (plantTarget.LandPlotID != null && plantTarget.LandPlotID > 0)
                    {
                        plantLotName = "LandPlot";
                    }

                    if (plantTarget.LandRowID != null && plantTarget.LandRowID.Count > 0)
                    {
                        plantLotName = "Row";

                    }

                    if (plantTarget.PlantID != null && plantTarget.PlantID.Count > 0)
                    {
                        plantLotName = "Plant";

                    }

                    if (plantTarget.GraftedPlantID != null && plantTarget.GraftedPlantID.Count > 0)
                    {
                        plantLotName = "Grafted_Plant";
                    }

                    if (plantTarget.PlantLotID != null && plantTarget.PlantLotID.Count > 0)
                    {
                        plantLotName = "Plant_Lot";

                    }
                    count++;
                }
            }

            // Tạo WorkLog mới
            var newWorkLog = new WorkLog
            {
                WorkLogCode = $"WL{DateTime.Now:yyMMddHHmmssfff}",
                Status = "Not Started",
                IsDeleted = false,
                ActualStartTime = schedule.StartTime,
                ActualEndTime = schedule.EndTime,
                WorkLogName = getTypePlan.MasterTypeName + "_on_" + plantLotName,
                Date = dateWork.Date.Add(schedule.StartTime.Value),
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
            var conflictDetailsSet = new HashSet<string>();

            foreach (var workLog in savedWorkLogs)
            {
                var conflictedUsers = new List<string>();

                //foreach (var user in userIds)
                //{
                //    var conflictedUser = await _unitOfWork.UserWorkLogRepository.CheckUserConflictSchedule(user.UserId, workLog);

                //    if (conflictedUser != null)
                //    {
                //        conflictedUsers.AddRange(conflictedUser.Select(uwl => uwl.User.FullName));
                //    }
                //}

                //if (conflictedUsers.Any())
                //{
                //    var uniqueUsers = string.Join(", ", conflictedUsers.Distinct());
                //    conflictDetailsSet.Add($"{uniqueUsers} have scheduling conflicts on {workLog.Date.Value.ToString("dd/MM/yyyy")} from {workLog.ActualStartTime} to {workLog.ActualEndTime}");
                //}

                foreach (var user in userIds)
                {
                    userWorkLogs.Add(new UserWorkLog
                    {
                        WorkLogId = workLog.WorkLogId,
                        UserId = user.UserId,
                        CreateDate = DateTime.Now,
                        IsReporter = user.isReporter,
                        IsDeleted = false,
                    });
                }
            }

            if (conflictDetailsSet.Any())
            {
                throw new Exception(string.Join("\n", conflictDetailsSet));
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
            if (fromDate.DayOfWeek == targetDay)
                return fromDate; // Trả về chính ngày đó nếu trùng
            int daysToAdd = (int)targetDay - (int)fromDate.DayOfWeek;
            if (daysToAdd < 0) // Nếu ngày mục tiêu đã qua, dời tới tuần sau
            {
                daysToAdd += 7;
            }

            return fromDate.AddDays(daysToAdd);
        }



        public async Task<BusinessResult> SoftDeleteMultiplePlan(List<int> listPlanId)
        {
            try
            {
                foreach (var planId in listPlanId)
                {

                    var getPlanById = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == planId, "CarePlanSchedule");
                    if (getPlanById == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_PLAN_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLAN_DOES_NOT_EXIST_MSG);
                    }
                    getPlanById.IsDeleted = true;
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
                                await _unitOfWork.WorkLogRepository.DeleteWorkLogAndUserWorkLog(workLog);
                            }
                        }
                    }
                    _unitOfWork.PlanRepository.Update(getPlanById);
                    await _responseCacheService.RemoveCacheByGroupAsync($"{CacheKeyConst.GROUP_FARM_PLAN}:{getPlanById.FarmID}");
                    await _responseCacheService.RemoveCacheByGroupAsync(CacheKeyConst.GROUP_PLAN + getPlanById.PlanId.ToString());
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
                var getPlanById = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == planId, "CarePlanSchedule");
                if (getPlanById == null)
                {
                    return new BusinessResult(Const.WARNING_GET_PLAN_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLAN_DOES_NOT_EXIST_MSG);
                }
                getPlanById.IsDeleted = false;
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

        public async Task<BusinessResult> GetPlanByFarmId(int? farmId)
        {
            try
            {
                var getListPlanTarget = await _unitOfWork.PlanRepository.GetListPlanByFarmId(farmId);

                var listTemp = _mapper.Map<List<GetPlanForSelected>>(getListPlanTarget).ToList();
                //foreach (var planTemp in listTemp)
                //{
                //    double calculateProgress = await _unitOfWork.WorkLogRepository.CalculatePlanProgress(planTemp.PlanId);
                //    planTemp.Progress = Math.Round(calculateProgress, 2).ToString();
                //}
                if (listTemp != null)
                {
                    if (listTemp.Count > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_GET_PLAN_BY_FARM_ID_CODE, Const.SUCCESS_GET_PLAN_BY_FARM_ID_MSG, listTemp); ;
                    }
                    return new BusinessResult(Const.WARNING_GET_PLAN_EMPTY_CODE, Const.WARNING_GET_PLAN_EMPTY_MSG);
                }
                return new BusinessResult(Const.FAIL_GET_PLAN_BY_FARM_ID_CODE, Const.FAIL_GET_PLAN_BY_FARM_ID_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private async Task<List<LandPlotFilterModel>> GetPlantByListGrowthStage(List<int?> growthStageIds, int farmId, string unit)
        {
            try
            {
                // Lấy danh sách LandPlot theo farmId
                var landPlots = await _unitOfWork.LandPlotRepository.GetLandPlotIncludeByFarmId(farmId);

                // Danh sách kết quả
                var result = new List<LandPlotFilterModel>();

                // Lọc ra các Rows hợp lệ và lấy Plants hợp lệ trong từng Row
                // Nếu growthStageIds null hoặc không có phần tử, lấy tất cả
                bool getAllPlants = growthStageIds == null || !growthStageIds.Any();

                foreach (var landPlot in landPlots)
                {
                    var validRows = landPlot.LandRows
                    .Select(row => new LandRowFilterModel
                    {
                        LandRowId = row.LandRowId,
                        RowIndex = row.RowIndex,
                        Plants = row.Plants
                            .Where(plant => getAllPlants || growthStageIds.Contains(plant.GrowthStageID))
                            .Select(plant => new PlantFilterModel
                            {
                                PlantId = plant.PlantId,
                                PlantName = plant.PlantName,
                            })
                            .ToList()
                    })
                    .Where(row => getAllPlants || row.Plants.Any())
                    .ToList();

                    // Lọc trực tiếp các cây trồng trên LandPlot (nếu có)
                    var validPlants = landPlot.LandRows
                        .SelectMany(row => row.Plants)
                        .Where(plant => getAllPlants || growthStageIds.Contains(plant.GrowthStageID))
                        .Select(plant => new PlantFilterModel
                        {

                            PlantId = plant.PlantId,
                            PlantName = plant.PlantName
                        })
                        .ToList();
                    switch (unit.ToLower())
                    {
                        case "landplot":
                            if (validRows.Any() || validPlants.Any())
                            {
                                result.Add(new LandPlotFilterModel
                                {
                                    LandPlotId = landPlot.LandPlotId,
                                    LandPlotName = landPlot.LandPlotName,
                                    Unit = unit,
                                });

                            }
                            break;

                        case "row":
                            if (validRows.Any())
                            {
                                result.Add(new LandPlotFilterModel
                                {
                                    LandPlotId = landPlot.LandPlotId,
                                    LandPlotName = landPlot.LandPlotName,
                                    Unit = unit,
                                    Rows = validRows,
                                });
                            }
                            break;
                        case "plant":
                            if (validPlants.Any())
                            {
                                result.Add(new LandPlotFilterModel
                                {
                                    LandPlotId = landPlot.LandPlotId,
                                    LandPlotName = landPlot.LandPlotName,
                                    Unit = unit,
                                    Rows = validRows,
                                    Plants = validPlants
                                });
                            }
                            break;


                        case "plantlot":
                            var validPlantLotsTemp = await _unitOfWork.PlantLotRepository.GetAllNoPaging();
                            var validPlantLots = validPlantLotsTemp.Where(pl => pl.FarmID == farmId && (getAllPlants /*|| growthStageIds.Contains(pl.GrowthStageID)*/))
                                .ToList();

                            if (validPlantLots.Any())
                            {
                                result.Add(new LandPlotFilterModel
                                {
                                    FarmId = farmId,
                                    Unit = unit,
                                    PlantLots = validPlantLots.Select(pl => new PlantLotFilterModel { PlantLotId = pl.PlantLotId, PlantLotName = pl.PlantLotName }).ToList()
                                });
                                return result;
                            }
                            else
                            {
                                result.Add(new LandPlotFilterModel
                                {
                                    FarmId = farmId,
                                    Unit = unit,
                                });
                                return result;
                            }

                        //case "graftedplant":
                        //    var validGraftedPlantsTemp = await _unitOfWork.GraftedPlantRepository.GetAllNoPaging();
                        //    var validGraftedPlants = validGraftedPlantsTemp.Where(pl => pl.FarmId == farmId && (getAllPlants || growthStageIds.Contains(pl.GrowthStageID)))
                        //        .ToList();

                        //    if (validGraftedPlants.Any())
                        //    {
                        //        result.Add(new LandPlotFilterModel
                        //        {
                        //            FarmId = farmId,
                        //            Unit = unit,
                        //            GraftedPlants = validGraftedPlants.Select(gp => new GraftedPlantFilterModel { GraftedPlantId = gp.GraftedPlantId, GraftedPlantName = gp.GraftedPlantName }).ToList()
                        //        });
                        //        return result;
                        //    }
                        //    else
                        //    {
                        //        result.Add(new LandPlotFilterModel
                        //        {
                        //            FarmId = farmId,
                        //            Unit = unit,
                        //        });
                        //        return result;
                        //    }

                        default:
                            throw new ArgumentException("Unit is not valid.");
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Error when filter: " + ex.Message);
            }
        }

        public async Task<BusinessResult> GetListPlantByFilterGrowthStage(List<int?> growthStageId, int farmId, string unit)
        {
            try
            {
                var result = await GetPlantByListGrowthStage(growthStageId, farmId, unit);
                if (result != null)
                {
                    return new BusinessResult(Const.SUCCESS_FILTER_BY_GROWTHSTAGE_CODE, Const.SUCCESS_FILTER_BY_GROWTHSTAGE_MSG, result);
                }
                return new BusinessResult(Const.FAIL_FILTER_BY_GROWTHSTAGE_CODE, Const.FAIL_FILTER_BY_GROWTHSTAGE_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> FilterTypeOfWorkByGrowthStageIds(List<int?> growthStageIds)
        {
            //try
            //{
            //    var getMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypesByGrowthStages(growthStageIds);
            //    if (getMasterType != null && getMasterType.Any())
            //    {
            //        return new BusinessResult(200, "Filter type of work by growth stage id sucess", getMasterType);
            //    }
            //    return new BusinessResult(404, "Do not have any type of work");
            //}
            //catch (Exception ex)
            //{
            //    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            //}
            var getMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypesByTypeName("work");
            return new BusinessResult(200, "Filter type of work by growth stage id sucess");
        }


        public async Task<BusinessResult> FilterMasterTypeByGrowthStageIds(List<int?> growthStageIds, string typeName)
        {
            var getMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypesByTypeName("work");
            return new BusinessResult(200, "Filter type of work by growth stage id sucess");
        }

        public async Task<BusinessResult> CreateManyPlan(List<CreatePlanModel> createPlanModel, int? farmId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    int count = 0;
                    // Bước 1: gom tất cả ProcessId và SubProcessId
                    var processIds = createPlanModel
                        .Where(p => p.ProcessId.HasValue)
                        .Select(p => p.ProcessId != null ? p.ProcessId.Value : 0)
                        .ToHashSet();

                    var subProcessIds = createPlanModel
                        .Where(p => p.SubProcessId.HasValue)
                        .Select(p => p.SubProcessId != null ? p.SubProcessId.Value : 0)
                        .ToList();

                    // Bước 2: truy về các SubProcess để biết ProcessId cha
                    if (subProcessIds.Any())
                    {
                        foreach (var sp in subProcessIds)
                        {
                            var getProcess = await _unitOfWork.SubProcessRepository.GetProcessBySubProcessId(sp);
                            processIds.Add(getProcess.ProcessId); // lấy ProcessId từ SubProcess
                        }
                    }
                    var processId = processIds.FirstOrDefault();
                    var errors = await ValidatePlansAgainstTemplate(processId, createPlanModel);
                    if (errors.Any())
                    {
                        return new BusinessResult(400, string.Join("\n", errors));
                    }
                    var genereateKeyGroup = Guid.NewGuid().ToString();
                    foreach (var createPlan in createPlanModel)
                    {
                        var result = await CreatePlan(createPlan, farmId, false, genereateKeyGroup);
                        if (result.StatusCode == 200)
                        {
                            count++;
                        }
                        else
                        {
                            await transaction.RollbackAsync();
                            return new BusinessResult(400, $"{result.Message}");
                        }
                    }
                    if (count == createPlanModel.Count)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(200, "Create Many Plan Sucess");
                    }
                    return new BusinessResult(400, "Create Many Plan Failed");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(400, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> GetPlanByProcessID(int processId)
        {
            try
            {
                var process = await _unitOfWork.ProcessRepository.GetProcessByIdAsync(processId);
                if (process == null)
                    return new BusinessResult(400, "Do not find any process.");

                // Tạo map SubProcessID -> SubProcessDto
                var allSubProcessDtos = process.SubProcesses.Select(sp => new SubProcessDto
                {
                    SubProcessID = sp.SubProcessID,
                    SubProcessName = sp.SubProcessName,
                    Order = sp.Order,
                    StartDate = sp.StartDate,
                    EndDate = sp.EndDate,
                    ParentSubProcessID = sp.ParentSubProcessId,
                    Plans = sp.Plans.Select(p => new PlanDto
                    {
                        PlanId = p.PlanId,
                        PlanName = p.PlanName,
                        PlanNote = p.Notes,
                        PlanDetail = p.PlanDetail,
                        StartDate = p.StartDate,
                        EndDate = p.EndDate
                    }).ToList(),
                    Children = new List<SubProcessDto>()
                }).ToDictionary(x => x.SubProcessID);

                // Gắn cây SubProcess con
                foreach (var sp in allSubProcessDtos.Values)
                {
                    if (sp.ParentSubProcessID.HasValue && allSubProcessDtos.TryGetValue(sp.ParentSubProcessID.Value, out var parent))
                    {
                        parent.Children.Add(sp);
                    }
                }

                // Lọc các SubProcess gốc (root)
                var rootSubProcesses = allSubProcessDtos.Values
                    .Where(sp => sp.ParentSubProcessID == null)
                    .OrderBy(sp => sp.Order ?? int.MaxValue)
                    .ToList();

                // Đệ quy sắp xếp cây theo Order
                void SortSubProcessTree(List<SubProcessDto> subProcesses)
                {
                    foreach (var sp in subProcesses)
                    {
                        if (sp.Children?.Any() == true)
                        {
                            sp.Children = sp.Children.OrderBy(x => x.Order ?? int.MaxValue).ToList();
                            SortSubProcessTree(sp.Children);
                        }
                    }
                }
                SortSubProcessTree(rootSubProcesses);

                var getProcessToDisplay = await _unitOfWork.ProcessRepository.GetByCondition(x => x.ProcessId == processId, "Plans");

                var result = new ProcessWithDetailsDto
                {
                    ProcessId = process.ProcessId,
                    ProcessName = process.ProcessName,
                    StartDate = process.StartDate,
                    EndDate = process.EndDate,
                    Order = process.Order,
                    Plans = getProcessToDisplay.Plans.Where(x => x.IsSample == true).Select(p => new PlanDto
                    {
                        PlanId = p.PlanId,
                        PlanName = p.PlanName,
                        StartDate = p.StartDate,
                        PlanNote = p.Notes,
                        PlanDetail = p.PlanDetail,
                        EndDate = p.EndDate
                    }).ToList(),
                    SubProcesses = rootSubProcesses
                };

                if (result != null)
                {
                    return new BusinessResult(200, "Get Process with tree structure", result);
                }
                return new BusinessResult(Const.WARNING_GET_PLAN_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLAN_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPlanOfTarget(GetPlanOfTargetRequest filterRequest, PaginationParameter paginationParameter)
        {
            try
            {
                Expression<Func<Plan, bool>> filter = x =>
                           x.IsDeleted == false;
                Func<IQueryable<Plan>, IOrderedQueryable<Plan>> orderBy = null!;
                if (filterRequest.PlantId.HasValue)
                {
                    filter = filter.And(x => x.PlanTargets.Any(pt => pt.PlantID == filterRequest.PlantId.Value));
                }
                if (filterRequest.GraftedPlantId.HasValue)
                {
                    filter = filter.And(x => x.PlanTargets.Any(pt => pt.GraftedPlantID == filterRequest.GraftedPlantId.Value));
                }
                if (filterRequest.PlantLotId.HasValue)
                {
                    filter = filter.And(x => x.PlanTargets.Any(pt => pt.PlantLotID == filterRequest.PlantLotId.Value));
                }

                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {

                    filter = filter.And(x => x.PlanCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.PlanDetail.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.PlanName.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Status.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.MasterType.MasterTypeName.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Notes.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.ResponsibleBy.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Frequency.ToLower().Contains(paginationParameter.Search.ToLower()));

                }

                if (filterRequest.FromDate.HasValue || filterRequest.ToDate.HasValue)
                {
                    if (filterRequest.FromDate.Value > filterRequest.ToDate.Value)
                    {
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);
                    }
                    filter = filter.And(x => x.StartDate >= filterRequest.FromDate &&
                                             x.EndDate <= filterRequest.ToDate);
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
                    case "cropname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Crop.CropName)
                                   : x => x.OrderBy(x => x.Crop.CropName)) : x => x.OrderBy(x => x.Crop.CropName);
                        break;
                    case "isdelete":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.IsDeleted)
                                   : x => x.OrderBy(x => x.IsDeleted)) : x => x.OrderBy(x => x.IsDeleted);
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
                        orderBy = x => x.OrderByDescending(x => x.ProcessId);
                        break;
                }
                string includeProperties = "PlanTargets";
                var entities = await _unitOfWork.PlanRepository.GetPlanWithPagination(filter: filter, orderBy: orderBy, /*includeProperties:includeProperties ,*/ pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                var pagin = new PageEntity<PlanModel>();

                var listTemp = _mapper.Map<IEnumerable<PlanModel>>(entities).ToList();

                //foreach (var planTemp in listTemp)
                //{
                //    double calculateProgress = await _unitOfWork.WorkLogRepository.CalculatePlanProgress(planTemp.PlanId);
                //    planTemp.Progress = Math.Round(calculateProgress, 2).ToString();
                //}
                pagin.List = listTemp;
                pagin.TotalRecord = await _unitOfWork.PlanRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    //string groupKey = $"{CacheKeyConst.GROUP_FARM_PLAN}:{listTemp.}";
                    var result = new BusinessResult(Const.SUCCESS_GET_ALL_PLAN_CODE, Const.SUCCESS_GET_ALL_PLAN_MSG, pagin);
                    //await _responseCacheService.AddCacheWithGroupAsync(groupKey.Trim(), key.Trim(), result, TimeSpan.FromMinutes(5));
                    return result;
                }
                else
                {
                    return new BusinessResult(200, Const.WARNING_GET_PLAN_EMPTY_MSG, new PageEntity<PlanModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private async Task<List<string>> ValidatePlansAgainstTemplate(int processId, List<CreatePlanModel> newPlans)
        {
            var errors = new List<string>();
            var templateProcess = await _unitOfWork.ProcessRepository.GetByCondition(
                x => x.ProcessId == processId, "Plans,SubProcesses");

            if (templateProcess == null)
                return new List<string> { "Process does not exist" };

            // Build tree of SubProcess
            var allSubProcesses = templateProcess.SubProcesses.ToList();
            var subProcessDict = allSubProcesses.ToDictionary(sp => sp.SubProcessID);
            var rootSubProcesses = allSubProcesses.Where(sp => sp.ParentSubProcessId == null).ToList();

            foreach (var sp in allSubProcesses)
            {
                if (sp.ParentSubProcessId.HasValue && subProcessDict.TryGetValue(sp.ParentSubProcessId.Value, out var parent))
                {
                    parent.ChildSubProcesses ??= new List<SubProcess>();
                    parent.ChildSubProcesses.Add(sp);
                }
            }

            // Build order map by DFS
            var groupOrders = new Dictionary<int, int>();
            int currentOrder = 0;
            void AssignOrder(SubProcess sp)
            {
                groupOrders[sp.SubProcessID] = currentOrder++;
                foreach (var child in sp.ChildSubProcesses ?? new List<SubProcess>())
                {
                    AssignOrder(child);
                }
            }

            foreach (var root in rootSubProcesses)
                AssignOrder(root);

            groupOrders[0] = -1; // Process root

            // Group plans by SubProcessId (or 0 = root process)
            var planGroups = newPlans.GroupBy(p => p.SubProcessId ?? 0).ToList();

            // 1. Validate ngày nằm trong Process/SubProcess
            foreach (var plan in newPlans)
            {
                var parentName = "Process";
                DateTime? parentStart = templateProcess.StartDate;
                DateTime? parentEnd = templateProcess.EndDate;

                if (plan.SubProcessId.HasValue && subProcessDict.TryGetValue(plan.SubProcessId.Value, out var sub))
                {
                    parentName = $"SubProcess \"{sub.SubProcessName}\"";
                    parentStart = sub.StartDate;
                    parentEnd = sub.EndDate;
                }

                if (plan.StartDate == null || plan.EndDate == null)
                {
                    errors.Add($"- Plan {plan.PlanName ?? "Unknown"} does not have startDate and endDate.");
                    continue;
                }

                if (parentStart.HasValue && plan.StartDate < parentStart)
                {
                    errors.Add($"- Plan {plan.PlanName} has startDate before startDate of {parentName}.");
                }

                if (parentEnd.HasValue && plan.EndDate > parentEnd)
                {
                    errors.Add($"- Plan {plan.PlanName} has endDate after endDate of {parentName}.");
                }

                if (plan.StartDate > plan.EndDate)
                {
                    errors.Add($"- Plan {plan.PlanName} has startDate after endDate.");
                }
            }

            // 2. Validate thứ tự giữa các nhóm Plan
            var orderedGroups = planGroups.OrderBy(g =>
            {
                return groupOrders.TryGetValue(g.Key, out var ord) ? ord : int.MaxValue;
            }).ToList();

            for (int i = 0; i < orderedGroups.Count - 1; i++)
            {
                var currentGroup = orderedGroups[i];
                var nextGroup = orderedGroups[i + 1];

                var maxCurrentEnd = currentGroup.Where(p => p.EndDate != null).Max(p => p.EndDate);
                var minNextStart = nextGroup.Where(p => p.StartDate != null).Min(p => p.StartDate);

                string? currentGroupName = currentGroup.Key == 0
                    ? templateProcess.ProcessName
                    : subProcessDict.GetValueOrDefault(currentGroup.Key)?.SubProcessName ?? $"SubProcess {currentGroup.Key}";

                string? nextGroupName = nextGroup.Key == 0
                    ? templateProcess.ProcessName
                    : subProcessDict.GetValueOrDefault(nextGroup.Key)?.SubProcessName ?? $"SubProcess {nextGroup.Key}";

                foreach (var prevPlan in currentGroup)
                {
                    foreach (var nextPlan in nextGroup)
                    {
                        if (prevPlan.EndDate != null && nextPlan.StartDate != null && prevPlan.EndDate >= nextPlan.StartDate.Date)
                        {
                            errors.Add($"- Plan \"{prevPlan.PlanName}\" in \"{currentGroupName}\" ends at {prevPlan.EndDate:dd/MM/yyyy}, which overlaps with Plan \"{nextPlan.PlanName}\" in \"{nextGroupName}\" starting at {nextPlan.StartDate:dd/MM/yyyy}.\n");
                        }
                    }
                }
            }

            return errors;
        }

        public async Task<BusinessResult> GetProcessByPlanId(int planId, int farmId)
        {
            try
            {
                var plan = await _unitOfWork.PlanRepository.GetPlanByIdAsync(planId, farmId);
                if (plan == null)
                {
                    return new BusinessResult(400, $"Not found Plan with ID = {planId}");
                }
                var keyGroup = plan.KeyGroup;

                var process = await _unitOfWork.PlanRepository.GetProcessByPlan(plan);
                if (process == null)
                {
                    return new BusinessResult(400, "Do not find any process.");
                }

                // Dto cho Process
                var processDto = new ProcessDto
                {
                    ProcessId = process.ProcessId,
                    ProcessName = process.ProcessName,
                    StartDate = process.StartDate,
                    EndDate = process.EndDate,
                    Order = process.Order,
                    Plans = process.Plans
                                    .Where(p => p.KeyGroup == keyGroup)
                                    .Select(p => new PlanDto
                                    {
                                        PlanId = p.PlanId,
                                        PlanName = p.PlanName,
                                        StartDate = p.StartDate,
                                        EndDate = p.EndDate,
                                        IsSelected = p.PlanId == planId
                                    }).ToList()
                };

                // Map SubProcessId -> SubProcessDto
                var subProcessDtoMap = process.SubProcesses
                    .Select(sp => new SubProcessDto
                    {
                        SubProcessID = sp.SubProcessID,
                        SubProcessName = sp.SubProcessName,
                        Order = sp.Order,
                        StartDate = sp.StartDate,
                        EndDate = sp.EndDate,
                        Plans = sp.Plans
                                    .Where(p => p.KeyGroup == keyGroup)
                                    .Select(p => new PlanDto
                                    {
                                        PlanId = p.PlanId,
                                        PlanName = p.PlanName,
                                        StartDate = p.StartDate,
                                        EndDate = p.EndDate,
                                        IsSelected = p.PlanId == planId
                                    }).ToList(),
                        Children = new List<SubProcessDto>()
                    })
                    .ToDictionary(dto => dto.SubProcessID);

                // Gắn SubProcess con vào SubProcess cha
                foreach (var sp in process.SubProcesses)
                {
                    if (sp.ParentSubProcessId.HasValue && subProcessDtoMap.ContainsKey(sp.ParentSubProcessId.Value))
                    {
                        subProcessDtoMap[sp.ParentSubProcessId.Value].Children.Add(subProcessDtoMap[sp.SubProcessID]);
                    }
                }

                // Sắp xếp đệ quy Children theo Order
                void SortChildrenByOrder(SubProcessDto node)
                {
                    node.Children = node.Children
                        .OrderBy(child => child.Order ?? int.MaxValue)
                        .ToList();

                    foreach (var child in node.Children)
                    {
                        SortChildrenByOrder(child);
                    }
                }

                // Lấy danh sách SubProcess gốc và sắp xếp theo Order
                var rootSubProcesses = process.SubProcesses
                    .Where(sp => sp.ParentSubProcessId == null)
                    .Select(sp => subProcessDtoMap[sp.SubProcessID])
                    .OrderBy(sp => sp.Order ?? int.MaxValue)
                    .ToList();

                // Gọi đệ quy sắp xếp con
                foreach (var root in rootSubProcesses)
                {
                    SortChildrenByOrder(root);
                }

                processDto.SubProcesses = rootSubProcesses;

                return new BusinessResult(200, "Get Process by PlanId", processDto);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


    }
}
