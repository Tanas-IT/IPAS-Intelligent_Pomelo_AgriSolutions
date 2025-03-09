using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class WorkLogService : IWorkLogService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;

        public WorkLogService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<BusinessResult> AddNewTask(AddNewTaskModel addNewTaskModel, int? farmId)
        {
            using(var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if(addNewTaskModel.DateWork <= DateTime.Now)
                    {
                        throw new Exception("Date Work must be greater than or equal now");
                    }
                    if (TimeSpan.Parse(addNewTaskModel.StartTime) >= TimeSpan.Parse(addNewTaskModel.EndTime))
                    {
                        throw new Exception("Start time must be less than End Time");
                    }
                    var checkExistProcess = await _unitOfWork.ProcessRepository.GetByCondition(x => x.ProcessId == addNewTaskModel.ProcessId);
                    var checkStartDateOfProcess = addNewTaskModel?.DateWork.Value.Date.Add(TimeSpan.Parse(addNewTaskModel.StartTime));
                    var checkEndDateOfProcess = addNewTaskModel?.DateWork.Value.Date.Add(TimeSpan.Parse(addNewTaskModel.StartTime));
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
                    var newPlan = new Plan()
                    {
                        PlanCode = "PLAN" + "_" + DateTime.Now.ToString("ddMMyyyy") + "_" + addNewTaskModel.MasterTypeId.Value,
                        PlanName = addNewTaskModel.TaskName,
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        AssignorId = addNewTaskModel.AssignorId,
                        CropId = addNewTaskModel.CropId,
                        EndDate = addNewTaskModel?.DateWork.Value.Date.Add(TimeSpan.Parse(addNewTaskModel.EndTime)),
                        StartDate = addNewTaskModel?.DateWork.Value.Date.Add(TimeSpan.Parse(addNewTaskModel.StartTime)),
                        Frequency = null,
                        IsActive = true,
                        IsDelete = false,
                        MasterTypeId = addNewTaskModel?.MasterTypeId,
                        ProcessId = addNewTaskModel?.ProcessId,
                        Status = "Active",
                        FarmID = farmId,
                    };
                    var getLastPlan = await _unitOfWork.PlanRepository.GetLastPlan();
                    if (addNewTaskModel.PlanTargetModel != null && addNewTaskModel.PlanTargetModel.Count > 0)
                    {
                        foreach (var plantTarget in addNewTaskModel.PlanTargetModel)
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
                                var plantsInRow = await _unitOfWork.PlantRepository
                                    .getPlantByRowId(rowId);

                                if (!rowToPlants.ContainsKey(rowId))
                                {
                                    rowToPlants[rowId] = new HashSet<int>();
                                }

                                // Thêm plants từ DB vào row
                                rowToPlants[rowId].UnionWith(plantsInRow);

                                // Lưu lại tất cả PlantID đã có trong các LandRow để loại bỏ khỏi ListPlant bên ngoài
                                existingPlantIDs.UnionWith(plantsInRow);
                            }

                            // **Insert dữ liệu cho từng LandRow**
                            foreach (var row in rowToPlants)
                            {
                                foreach (var plantId in row.Value)
                                {
                                    var newPlantTarget = new PlanTarget()
                                    {
                                        LandPlotID = plantTarget.LandPlotID,
                                        LandRowID = row.Key,
                                        PlantID = plantId,
                                        PlantLotID = null,
                                        GraftedPlantID = null,
                                    };

                                    newPlan.PlanTargets.Add(newPlantTarget);
                                }
                            }

                            // **Xử lý các PlantID từ input (chỉ insert nếu nó không có trong LandRows)**
                            var plantsToInsert = inputPlantIDs.Except(existingPlantIDs).ToList();
                            foreach (var plantId in plantsToInsert)
                            {
                                var newPlantTarget = new PlanTarget()
                                {
                                    PlantID = plantId, // Chỉ insert PlantID nếu nó chưa có trong các LandRow
                                    LandPlotID = null,
                                    LandRowID = null,
                                    PlantLotID = null,
                                    GraftedPlantID = null
                                };

                                newPlan.PlanTargets.Add(newPlantTarget);
                            }

                            // **Insert mỗi PlantLotID một dòng riêng**
                           if(plantTarget.PlantLotID != null)
                            {
                                foreach (var plantLotId in plantTarget.PlantLotID)
                                {
                                    var newPlantLotTarget = new PlanTarget()
                                    {
                                        LandPlotID = null,
                                        LandRowID = null,
                                        PlantID = null,
                                        PlantLotID = plantLotId,
                                        GraftedPlantID = null
                                    };

                                    newPlan.PlanTargets.Add(newPlantLotTarget);
                                }

                            }
                            // **Insert mỗi GraftedPlantID một dòng riêng**
                            if(plantTarget.GraftedPlantID != null)
                            {
                                foreach (var graftedPlantId in plantTarget.GraftedPlantID)
                                {
                                    var newGraftedPlantTarget = new PlanTarget()
                                    {
                                        LandPlotID = null,
                                        LandRowID = null,
                                        PlantID = null,
                                        PlantLotID = null,
                                        GraftedPlantID = graftedPlantId
                                    };

                                    newPlan.PlanTargets.Add(newGraftedPlantTarget);
                                }

                            }
                            await _unitOfWork.SaveAsync();
                        }
                    }
                    foreach (var growthStagePlanItem in addNewTaskModel.GrowthStageIds)
                    {
                        var growthStagePlan = new GrowthStagePlan()
                        {
                            GrowthStageID = growthStagePlanItem,
                        };
                        newPlan.GrowthStagePlans.Add(growthStagePlan);
                    }
                    var newSchedule = new CarePlanSchedule()
                    {
                        CustomDates = addNewTaskModel.DateWork.Value.Date.ToString("dd/MM/yyyy"),
                        StartTime = TimeSpan.Parse(addNewTaskModel.StartTime),
                        EndTime = TimeSpan.Parse(addNewTaskModel.EndTime),
                        FarmID = farmId,
                        Status = "Active",
                    };


                    await _unitOfWork.CarePlanScheduleRepository.Insert(newSchedule);
                    
                    var checkConflict = await _unitOfWork.CarePlanScheduleRepository.IsScheduleConflictedForWorkLog(farmId, addNewTaskModel.DateWork.Value, addNewTaskModel.DateWork.Value, TimeSpan.Parse(addNewTaskModel.StartTime), TimeSpan.Parse(addNewTaskModel.EndTime));
                    if(checkConflict)
                    {
                        throw new Exception($"The date {addNewTaskModel.DateWork.Value.Date.ToString("dd/MM/yyyy")} with StartTime: {addNewTaskModel.StartTime} and EndTime: {addNewTaskModel.EndTime} is conflicted. Please try another");
                    }
                    await _unitOfWork.SaveAsync();
                    var newWorkLog = new WorkLog()
                    {
                        WorkLogCode = $"WL-{newSchedule.ScheduleId}-{DateTime.UtcNow.Ticks}",
                        ScheduleId = newSchedule.ScheduleId,
                        Status = "Not Started",
                        ActualStartTime = newSchedule.StartTime,
                        ActualEndTime = newSchedule.EndTime,
                        Date = addNewTaskModel.DateWork,
                        WorkLogName = addNewTaskModel.TaskName,
                        IsConfirm = false,
                    };
                    await _unitOfWork.WorkLogRepository.Insert(newWorkLog);
                    await _unitOfWork.SaveAsync();

                    foreach(var employee in addNewTaskModel.listEmployee)
                    {
                        var newUserWorkLog = new UserWorkLog()
                        {
                            WorkLogId = newWorkLog.WorkLogId,
                            UserId = employee.UserId,
                            IsReporter = employee.isReporter,
                        };
                        await _unitOfWork.UserWorkLogRepository.Insert(newUserWorkLog);
                    }
                    var result = await _unitOfWork.SaveAsync();
                    if(result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_ADD_NEW_TASK_CODE, Const.SUCCESS_ADD_NEW_TASK_MSG, result);
                    }
                    return new BusinessResult(Const.FAIL_ADD_NEW_TASK_CODE, Const.FAIL_ADD_NEW_TASK_MESSAGE,false);

                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> AssignTaskForEmployee(int employeeId, int worklogId)
        {
            try
            {
                var result = await _unitOfWork.WorkLogRepository.AssignTaskForUser(employeeId, worklogId);
                if(result)
                {
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
                var getDetailWorkLog = await _unitOfWork.WorkLogRepository.GetWorkLogIncludeById(workLogId);
                var result =  _mapper.Map<WorkLogDetailModel>(getDetailWorkLog);
                if(result != null)
                {
                    return new BusinessResult(200, "Get Detail WorkLog Sucesss", result);
                }
                return new BusinessResult(400, "Get Detail WorkLog Failed");

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetScheduleEvents(ParamScheduleModel paramCalendarModel)
        {
            try
            {
                var calendar = await _unitOfWork.WorkLogRepository.GetCalendarEvents(paramCalendarModel.UserId, paramCalendarModel.PlanId, paramCalendarModel.StartDate, paramCalendarModel.EndDate, paramCalendarModel.FarmId.Value);
                var result =  calendar
                        .Select(wl => new ScheduleModel()
                        {
                            WorkLogId = wl.WorkLogId,
                            WorkLogName = wl.WorkLogName,
                            WorkLogCode = wl.WorkLogCode,
                            Date = wl.Date,
                            Status = wl.Status,
                            ScheduleId = wl.ScheduleId,
                            StartTime = wl.Schedule.StartTime,
                            EndTime = wl.Schedule.EndTime,
                            PlanId = wl.Schedule.CarePlan.PlanId,
                            PlanName = wl.Schedule.CarePlan.PlanName,
                            StartDate = wl.Schedule.CarePlan.StartDate,
                            EndDate = wl.Schedule.CarePlan.EndDate,
                            Users = wl.UserWorkLogs.Select(uwl => new UserScheduleModel()
                            {
                                UserId = uwl.UserId,
                                FullName = uwl.User.FullName,
                                IsReporter = uwl.IsReporter,
                                Notes = uwl.Notes,
                                Issue = uwl.Issue,
                            }).ToList() // Danh sách user thực hiện công việc
                        }).ToList();
                if(result != null && result.Count > 0)
                {
                    return new BusinessResult(Const.SUCCESS_HAS_SCHEDULE_CODE, Const.SUCCESS_HAS_SCHEDULE_MSG, result);
                }
                return new BusinessResult(Const.WARNING_NO_SCHEDULE_CODE, Const.WARNING_NO_SCHEDULE_MSG, new ScheduleModel());
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
                Expression<Func<WorkLog, bool>> filter = x => x.Schedule.CarePlan.IsDelete == false && x.Schedule.CarePlan.FarmID == farmId!;
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
                    filter = filter.And(x => x.Schedule.CarePlan.StartDate >= scheduleFilter.FromDate &&
                                             x.Schedule.CarePlan.EndDate <= scheduleFilter.ToDate);
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

                    filter = filter.And(x => x.Schedule.StartTime.Value.Hours == TimeSpan.Parse(scheduleFilter.FromTime).Hours &&
                                             x.Schedule.StartTime.Value.Minutes == TimeSpan.Parse(scheduleFilter.FromTime).Minutes &&
                                             x.Schedule.EndTime.Value.Hours == TimeSpan.Parse(scheduleFilter.ToTime).Hours &&
                                             x.Schedule.EndTime.Value.Minutes == TimeSpan.Parse(scheduleFilter.ToTime).Minutes);
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
                        foreach(var user in users)
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

               
                var entities = await _unitOfWork.WorkLogRepository.GetWorkLog(filter, orderBy);
                var result = entities
                       .Select(wl => new ScheduleModel()
                       {
                           WorkLogId = wl.WorkLogId,
                           WorkLogName = wl.WorkLogName,
                           WorkLogCode = wl.WorkLogCode,
                           Date = wl.Date,
                           Status = wl.Status,
                           ScheduleId = wl.ScheduleId,
                           StartTime = wl.Schedule.StartTime,
                           EndTime = wl.Schedule.EndTime,
                           PlanId = wl.Schedule.CarePlan.PlanId,
                           PlanName = wl.Schedule.CarePlan.PlanName,
                           StartDate = wl.Schedule.CarePlan.StartDate,
                           EndDate = wl.Schedule.CarePlan.EndDate,
                           Users = wl.UserWorkLogs.Select(uwl => new UserScheduleModel()
                           {
                               UserId = uwl.UserId,
                               FullName = uwl.User.FullName,
                               IsReporter = uwl.IsReporter,
                               Issue = uwl.Issue,
                               Notes = uwl.Notes
                           }).ToList() // Danh sách user thực hiện công việc
                       }).ToList();
               
                if (result.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_SCHEDULE_CODE, Const.SUCCESS_GET_ALL_SCHEDULE_MSG, result);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_NO_SCHEDULE_CODE, Const.WARNING_NO_SCHEDULE_MSG, new PageEntity<ScheduleModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> NoteForWorkLog(CreateNoteModel createNoteModel)
        {
            try
            {
                var findWorkLog = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == createNoteModel.WorkLogId && x.UserId == createNoteModel.UserId);
                if(findWorkLog != null)
                {
                    findWorkLog.Notes = createNoteModel.Note;
                    findWorkLog.Issue = createNoteModel.Issue;
                    findWorkLog.CreateDate = DateTime.Now;
                    foreach(var fileNote in createNoteModel.Resources)
                    {
                        var getLink = "";
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

        public Task<BusinessResult> UpdateWorkLog(UpdateWorkLogModel updateWorkLogModel, int? farmId)
        {
            try
            {
                return null;
            }
            catch (Exception ex)
            {

                throw;
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

    }
}
