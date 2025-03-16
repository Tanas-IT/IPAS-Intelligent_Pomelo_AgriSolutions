using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.GraftedModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
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
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlanService : IPlanService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IWebSocketService _webSocketService;

        public PlanService(IUnitOfWork unitOfWork, IMapper mapper, IWebSocketService webSocketService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _webSocketService = webSocketService;
        }

        public async Task<BusinessResult> CreatePlan(CreatePlanModel createPlanModel, int? farmId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
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
                    var newPlan = new Plan()
                    {
                        PlanCode = $"PLAN_{DateTime.Now:yyyyMMdd_HHmmss}_{createPlanModel.MasterTypeId}",
                        PlanName = createPlanModel.PlanName,
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        AssignorId = createPlanModel.AssignorId,
                        CropId = createPlanModel.CropId,
                        EndDate = createPlanModel?.EndDate,
                        StartDate = createPlanModel?.StartDate,
                        Frequency = createPlanModel?.Frequency,
                        IsActive = createPlanModel?.IsActive,
                        IsDelete = false,
                        MasterTypeId = createPlanModel?.MasterTypeId,
                        MaxVolume = createPlanModel?.MaxVolume,
                        MinVolume = createPlanModel?.MinVolume,
                        Notes = createPlanModel?.Notes,
                        PesticideName = createPlanModel?.PesticideName,
                        ResponsibleBy = createPlanModel?.ResponsibleBy,
                        ProcessId = createPlanModel?.ProcessId,
                        Status = "Active",
                        FarmID = farmId,
                        PlanDetail = createPlanModel?.PlanDetail,
                    };
                    if(checkExistProcess != null)
                    {
                        if(checkExistProcess.MasterTypeId != null)
                        {
                            newPlan.MasterTypeId = checkExistProcess.MasterTypeId;
                        }
                    }
                    if (createPlanModel.StartDate == createPlanModel.EndDate)
                    {
                        newPlan.StartDate = createPlanModel.StartDate.Add(TimeSpan.Parse(createPlanModel.StartTime));
                        newPlan.EndDate = createPlanModel.EndDate.Add(TimeSpan.Parse(createPlanModel.EndTime));
                    }
                    if (createPlanModel.Frequency != null && createPlanModel.Frequency.ToLower().Equals("none") && createPlanModel.CustomDates != null && createPlanModel.CustomDates.Count < 2)
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

                    var addNotification = new Notification()
                    {
                        Content = "Plan " + createPlanModel.PlanName + " has just been created",
                        Title = "Plan",
                        MasterTypeId = getMasterType?.MasterTypeId,
                        IsRead = false,
                        CreateDate = DateTime.Now,
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

                        await _unitOfWork.PlanNotificationRepository.Insert(addPlanNotification);
                    }


                    await _unitOfWork.SaveAsync();
                    if (createPlanModel.ListEmployee != null)
                    {
                        foreach (var employeeModel in createPlanModel.ListEmployee)
                        {
                            await _webSocketService.SendToUser(employeeModel.UserId, addNotification);
                        }
                    }

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

        public async Task<BusinessResult> GetAllPlanPagination(PaginationParameter paginationParameter, PlanFilter planFilter, int farmId)
        {
            try
            {
                Expression<Func<Plan, bool>> filter = x =>
                           x.IsDelete == false && // Chỉ lấy các bản ghi chưa bị xóa
                           (
                               (x.PlanTargets != null && x.PlanTargets.Any(pt =>
                                   (pt.GraftedPlant != null && pt.GraftedPlant.Plant != null && pt.GraftedPlant.Plant.FarmId == farmId)
                                   || (pt.Plant != null && pt.Plant.FarmId == farmId)
                                   || (pt.LandPlot != null && pt.LandPlot.FarmId == farmId)
                                   || (pt.LandRow != null && pt.LandRow.FarmId == farmId)
                               ))
                               || x.FarmID == farmId
                                 );
                Func<IQueryable<Plan>, IOrderedQueryable<Plan>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.PlanId == validInt || x.ProcessId == validInt
                                            || x.MasterTypeId == validInt
                                            || x.MinVolume == validInt || x.MaxVolume == validInt
                                            || x.AssignorId == validInt || x.CropId == validInt);
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
                        orderBy = x => x.OrderByDescending(x => x.ProcessId);
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
                pagin.TotalRecord = await _unitOfWork.PlanRepository.Count(filter);
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
                var getPlan = await _unitOfWork.PlanRepository.GetPlanByInclude(planId);
                if (getPlan != null)
                {
                    double calculateProgress = await _unitOfWork.WorkLogRepository.CalculatePlanProgress(getPlan.PlanId);
                    var result = _mapper.Map<PlanModel>(getPlan);
                    // Ánh xạ danh sách PlanTarget thành PlanTargetModels
                    var mappedPlanTargets = MapPlanTargets(getPlan.PlanTargets.ToList());
                    result.PlanTargetModels = mappedPlanTargets;


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

        public async Task<BusinessResult> GetPlanByName(string planName, int? farmId)
        {
            try
            {

                var entities = await _unitOfWork.PlanRepository.GetPlanWithPagination();
                var getPlan = entities.FirstOrDefault(x => x.PlanName.ToLower().Contains(planName.ToLower()) && x.FarmID == farmId && x.IsDelete == false);
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

                if (isFullMode || getPlanTarget.Unit == "Row")
                {
                    if (getPlanTarget.LandRow != null && rowIds.Add(getPlanTarget.LandRow.LandRowId))
                    {
                        var row = _mapper.Map<LandRowDisplayModel>(getPlanTarget.LandRow);
                        displayModel.Rows.Add(row);
                    }
                }
                if (isFullMode || getPlanTarget.Unit == "Plant")
                {
                    if (getPlanTarget.Plant != null && plantIds.Add(getPlanTarget.Plant.PlantId))
                    {
                        var plant = _mapper.Map<PlantDisplayModel>(getPlanTarget.Plant);
                        displayModel.Plants.Add(plant);
                    }
                }
                if (isFullMode || getPlanTarget.Unit == "PlantLot")
                {
                    if (getPlanTarget.PlantLot != null && plantLotIds.Add(getPlanTarget.PlantLot.PlantLotId))
                    {
                        var plantLot = _mapper.Map<PlantLotDisplayModel>(getPlanTarget.PlantLot);
                        displayModel.PlantLots.Add(plantLot);
                    }
                }
                if (isFullMode || getPlanTarget.Unit == "GraftedPlant")
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
                    var checkExistPlan = await _unitOfWork.PlanRepository.GetPlanByInclude(updatePlanModel.PlanId);
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
                            checkExistPlan.IsDelete = updatePlanModel.IsDelete;
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
                            if(updatePlanModel.ProcessId != null)
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
                                    checkExistPlan.GrowthStagePlans.Add(new GrowthStagePlan { GrowthStageID = newId });
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
                                _unitOfWork.PlanRepository.Update(checkExistPlan);
                                await _unitOfWork.SaveAsync();
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
            var result = 0;
            DateTime currentDate = createPlanModel.StartDate;
            if (currentDate <= DateTime.Now)
            {
                throw new Exception("Start Date must be greater than or equal now");
            }
            if (TimeSpan.Parse(createPlanModel.StartTime) >= TimeSpan.Parse(createPlanModel.EndTime))
            {
                throw new Exception("Start time must be less than End Time");
            }

            if (plan.Frequency.ToLower() == "none" && createPlanModel.CustomDates != null)
            {
                schedule = new CarePlanSchedule()
                {
                    Status = "Active",
                    DayOfWeek = null,
                    DayOfMonth = null,
                    CustomDates = JsonConvert.SerializeObject(createPlanModel.CustomDates.Select(x => x.ToString("yyyy/MM/dd"))),
                    StartTime = TimeSpan.Parse(createPlanModel.StartTime),
                    EndTime = TimeSpan.Parse(createPlanModel.EndTime),
                    CarePlanId = plan.PlanId
                };
                plan.CarePlanSchedule = schedule;
                await _unitOfWork.CarePlanScheduleRepository.Insert(schedule);
                result += await _unitOfWork.SaveAsync();
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
                    DayOfWeek = JsonConvert.SerializeObject(currentDate.DayOfWeek),
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
            await _unitOfWork.WorkLogRepository.CheckWorkLogAvailabilityWhenAddPlan(
                                                                        TimeSpan.Parse(createPlanModel.StartTime),
                                                                        TimeSpan.Parse(createPlanModel.EndTime),
                                                                        currentDate,
                                                                        createPlanModel.MasterTypeId,
                                                                        createPlanModel.ListEmployee.Select(x => x.UserId).ToList()
                                                                    );


            if (schedule.ScheduleId <= 0)
            {
                await _unitOfWork.CarePlanScheduleRepository.Insert(schedule);
            }
            result += await _unitOfWork.SaveAsync();
            while (currentDate <= plan.EndDate && plan.Frequency.ToLower() != "none")
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
            if (currentDate <= DateTime.Now)
            {
                throw new Exception("Start Date must be greater than or equal now");
            }

            if (plan.Frequency.ToLower() == "none" && updatePlanModel.CustomDates != null)
            {
                schedule = new CarePlanSchedule()
                {
                    Status = "Active",
                    DayOfWeek = null,
                    DayOfMonth = null,
                    CustomDates = JsonConvert.SerializeObject(updatePlanModel.CustomDates.Select(x => x.ToString("yyyy/MM/dd"))),
                    StartTime = TimeSpan.Parse(updatePlanModel.StartTime),
                    EndTime = TimeSpan.Parse(updatePlanModel.EndTime),
                    CarePlanId = plan.PlanId
                };

                plan.CarePlanSchedule = schedule;
                await _unitOfWork.CarePlanScheduleRepository.Insert(schedule);
                result += await _unitOfWork.SaveAsync();
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
                    DayOfWeek = null,
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
            await _unitOfWork.WorkLogRepository.CheckWorkLogAvailabilityWhenAddPlan(TimeSpan.Parse(updatePlanModel.StartTime),
                                                                        TimeSpan.Parse(updatePlanModel.EndTime),
                                                                        currentDate,
                                                                       updatePlanModel.MasterTypeId,
                                                                        updatePlanModel.ListEmployee.Select(x => x.UserId).ToList());
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
                        plantLotName = " & " + plantLotName + "_" + getLandPlot.LandPlotName;
                    }
                    else
                    {
                        plantLotName = plantLotName + "_" + getLandPlot.LandPlotName;
                    }
                }
            }
            if(createPlanModel.PlanTargetModel != null)
            {
                foreach (var plantTarget in createPlanModel.PlanTargetModel)
                {
                    if (plantTarget.LandPlotID != null && plantTarget.LandPlotID > 0)
                    {
                        var getLandPlot = await _unitOfWork.LandPlotRepository.GetByID(plantTarget.LandPlotID.Value);
                        if (count > 0)
                        {
                            plantLotName = " & " + plantLotName + "_" + getLandPlot.LandPlotName;
                        }
                        else
                        {
                            plantLotName = plantLotName + "_" + getLandPlot.LandPlotName;
                        }
                    }

                    if (plantTarget.LandRowID != null && plantTarget.LandRowID.Count > 0)
                    {
                        foreach (var landRowId in plantTarget.LandRowID)
                        {
                            var getLandRow = await _unitOfWork.LandRowRepository.GetByID(landRowId);
                            plantLotName = plantLotName + "_Row " + getLandRow.RowIndex;
                        }

                    }

                    if (plantTarget.PlantID != null && plantTarget.PlantID.Count > 0)
                    {
                        foreach (var plantId in plantTarget.PlantID)
                        {
                            var getPlant = await _unitOfWork.PlantRepository.GetByID(plantId);
                            plantLotName = plantLotName + "_" + getPlant.PlantName;
                        }

                    }

                    if (plantTarget.GraftedPlantID != null && plantTarget.GraftedPlantID.Count > 0)
                    {
                        foreach (var graftedPlantId in plantTarget.GraftedPlantID)
                        {
                            var graftedPlant = await _unitOfWork.GraftedPlantRepository.GetByID(graftedPlantId);
                            plantLotName = plantLotName + "_" + graftedPlant.GraftedPlantName;
                        }
                    }

                    if (plantTarget.PlantLotID != null && plantTarget.PlantLotID.Count > 0)
                    {
                        foreach (var plantLotID in plantTarget.PlantLotID)
                        {
                            var getPlantLot = await _unitOfWork.PlantLotRepository.GetByID(plantLotID);
                            plantLotName = plantLotName + "_" + getPlantLot.PlantLotName;
                        }

                    }
                    count++;
                }
            }
           
            // Tạo WorkLog mới
            var newWorkLog = new WorkLog
            {
                WorkLogCode = $"WL-{schedule.ScheduleId}-{DateTime.UtcNow.Ticks}",
                Status = "Not Started",
                ActualStartTime = schedule.StartTime,
                ActualEndTime = schedule.EndTime,
                WorkLogName = getTypePlan.MasterTypeName + " on " + plantLotName,
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
                        var getLandPlot = await _unitOfWork.LandPlotRepository.GetByID(plantTarget.LandPlotID.Value);
                        if (count > 0)
                        {
                            plantLotName = " & " + plantLotName + "_" + getLandPlot.LandPlotName;
                        }
                        else
                        {
                            plantLotName = plantLotName + "_" + getLandPlot.LandPlotName;
                        }
                    }

                    if (plantTarget.LandRowID != null && plantTarget.LandRowID.Count > 0)
                    {
                        foreach (var landRowId in plantTarget.LandRowID)
                        {
                            var getLandRow = await _unitOfWork.LandRowRepository.GetByID(landRowId);
                            plantLotName = plantLotName + "_Row " + getLandRow.RowIndex;
                        }

                    }

                    if (plantTarget.PlantID != null && plantTarget.PlantID.Count > 0)
                    {
                        foreach (var plantId in plantTarget.PlantID)
                        {
                            var getPlant = await _unitOfWork.PlantRepository.GetByID(plantId);
                            plantLotName = plantLotName + "_" + getPlant.PlantName;
                        }

                    }

                    if (plantTarget.GraftedPlantID != null && plantTarget.GraftedPlantID.Count > 0)
                    {
                        foreach (var graftedPlantId in plantTarget.GraftedPlantID)
                        {
                            var graftedPlant = await _unitOfWork.GraftedPlantRepository.GetByID(graftedPlantId);
                            plantLotName = plantLotName + "_" + graftedPlant.GraftedPlantName;
                        }
                    }

                    if (plantTarget.PlantLotID != null && plantTarget.PlantLotID.Count > 0)
                    {
                        foreach (var plantLotID in plantTarget.PlantLotID)
                        {
                            var getPlantLot = await _unitOfWork.PlantLotRepository.GetByID(plantLotID);
                            plantLotName = plantLotName + "_" + getPlantLot.PlantLotName;
                        }

                    }
                    count++;
                }
            }

            // Tạo WorkLog mới
            var newWorkLog = new WorkLog
            {
                WorkLogCode = $"WL-{schedule.ScheduleId}-{DateTime.UtcNow.Ticks}",
                Status = "In Progress",
                ActualStartTime = schedule.StartTime,
                ActualEndTime = schedule.EndTime,
                WorkLogName = getTypePlan.MasterTypeName + " on " + plantLotName,
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
                                await _unitOfWork.WorkLogRepository.DeleteWorkLogAndUserWorkLog(workLog);
                            }
                        }
                    }
                    _unitOfWork.PlanRepository.Update(getPlanById);
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

        public async Task<BusinessResult> GetPlanByFarmId(int? farmId)
        {
            try
            {
                var getListPlanTarget = await _unitOfWork.PlanRepository.GetListPlanByFarmId(farmId);
                var getListPlan = new List<Plan>();
                foreach (var planTarget in getListPlanTarget)
                {
                    if (planTarget.PlanID != null)
                    {
                        var getPlan = await _unitOfWork.PlanRepository.GetByID(planTarget.PlanID.Value);
                        if (getPlan != null && getPlan.IsDelete == false)
                        {
                            getListPlan.Add(getPlan);
                        }
                    }
                }
                var listTemp = _mapper.Map<List<ForSelectedModels>>(getListPlan).ToList();
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
                            //break;

                        //case "graftedplant":
                        //    var validGraftedPlantsTemp = await _unitOfWork.GraftedPlantRepository.GetAllNoPaging();
                        //    var validGraftedPlants = validGraftedPlantsTemp.Where(pl => pl.FarmId == farmId && (getAllPlants /*|| growthStageIds.Contains(pl.GrowthStageID)*/))
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
            try
            {
                var getMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypesByGrowthStages(growthStageIds);
                if (getMasterType != null && getMasterType.Any())
                {
                    return new BusinessResult(200, "Filter type of work by growth stage id sucess", getMasterType);
                }
                return new BusinessResult(404, "Do not have any type of work");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> FilterMasterTypeByGrowthStageIds(List<int?> growthStageIds, string typeName)
        {
            try
            {
                var getMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypesWithTypeNameByGrowthStages(growthStageIds, typeName);
                if (getMasterType != null && getMasterType.Any())
                {
                    return new BusinessResult(200, "Filter type of work by growth stage id sucess", getMasterType);
                }
                return new BusinessResult(404, "Do not have any type of work");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
