using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.Extensions.Logging;
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

        public WorkLogService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> AddNewTask(AddNewTaskModel addNewTaskModel)
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
                    var newPlan = new Plan()
                    {
                        PlanCode = await GeneratePlanCode(null, addNewTaskModel.LandPlotId, addNewTaskModel.TypeOfPlan.Value),
                        CropId = addNewTaskModel.CropId,
                        PlanName = addNewTaskModel.TaskName,
                        MasterTypeId = addNewTaskModel.TypeOfPlan,
                        LandPlotId = addNewTaskModel.LandPlotId,
                        ProcessId = addNewTaskModel.ProcessId,
                        AssignorId = addNewTaskModel.AssignorId,
                        StartDate = addNewTaskModel.DateWork,
                        EndDate = addNewTaskModel.DateWork,
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                    };
                    await _unitOfWork.PlanRepository.Insert(newPlan);
                    await _unitOfWork.SaveAsync();
                    var getLastPlan = await _unitOfWork.PlanRepository.GetLastPlan();

                    var newSchedule = new CarePlanSchedule()
                    {
                        CarePlanId = getLastPlan.PlanId,
                        CustomDates = addNewTaskModel.DateWork.Value.Date.ToString("dd/MM/yyyy"),
                        StarTime = TimeSpan.Parse(addNewTaskModel.StartTime),
                        EndTime = TimeSpan.Parse(addNewTaskModel.EndTime),
                        Status = "Active",
                    };
                    await _unitOfWork.CarePlanScheduleRepository.Insert(newSchedule);
                    
                    var checkConflict = await _unitOfWork.CarePlanScheduleRepository.IsScheduleConflicted(newPlan.PlanId, addNewTaskModel.DateWork.Value, addNewTaskModel.DateWork.Value, TimeSpan.Parse(addNewTaskModel.StartTime), TimeSpan.Parse(addNewTaskModel.EndTime));
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

        public async Task<BusinessResult> GetScheduleEvents(ParamScheduleModel paramCalendarModel)
        {
            try
            {
                var calendar = await _unitOfWork.WorkLogRepository.GetCalendarEvents(paramCalendarModel.UserId, paramCalendarModel.PlanId, paramCalendarModel.StartDate, paramCalendarModel.EndDate);
                var result =  calendar
                        .Select(wl => new ScheduleModel()
                        {
                            WorkLogId = wl.WorkLogId,
                            WorkLogName = wl.WorkLogName,
                            WorkLogCode = wl.WorkLogCode,
                            Date = wl.Date,
                            Status = wl.Status,
                            Notes = wl.Notes,
                            ScheduleId = wl.ScheduleId,
                            StartTime = wl.Schedule.StarTime,
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

        public async Task<BusinessResult> GetScheduleWithFilters(PaginationParameter paginationParameter, ScheduleFilter scheduleFilter)
        {
            try
            {
                Expression<Func<WorkLog, bool>> filter = null!;
                Func<IQueryable<WorkLog>, IOrderedQueryable<WorkLog>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.WorkLogId == validInt);
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = filter.And(x => x.Date == validDate);
                    }
                    else if (bool.TryParse(paginationParameter.Search, out validBool))
                    {
                        filter = filter.And(x => x.IsConfirm == validBool || x.IsConfirm == validBool);
                    }
                    else
                    {
                        filter = filter.And(x => x.WorkLogCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.WorkLogName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Status.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.ReasonDelay.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Notes.ToLower().Contains(paginationParameter.Search.ToLower()));
                    }
                }

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

                    filter = filter.And(x => x.Schedule.StarTime.Value.Hours == TimeSpan.Parse(scheduleFilter.FromTime).Hours &&
                                             x.Schedule.StarTime.Value.Minutes == TimeSpan.Parse(scheduleFilter.FromTime).Minutes &&
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

                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "startdate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Schedule.CarePlan.StartDate)
                                   : x => x.OrderBy(x => x.Schedule.CarePlan.StartDate)) : x => x.OrderBy(x => x.Schedule.CarePlan.StartDate);
                        break;
                    case "enddate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Schedule.CarePlan.EndDate)
                                   : x => x.OrderBy(x => x.Schedule.CarePlan.EndDate)) : x => x.OrderBy(x => x.Schedule.CarePlan.EndDate);
                        break;
                    case "starttime":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Schedule.StarTime)
                                   : x => x.OrderBy(x => x.Schedule.StarTime)) : x => x.OrderBy(x => x.Schedule.StarTime);
                        break;
                    case "endtime":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Schedule.EndTime)
                                   : x => x.OrderBy(x => x.Schedule.EndTime)) : x => x.OrderBy(x => x.Schedule.EndTime);
                        break;
                    case "masterstylename":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Schedule.CarePlan.MasterType.MasterTypeName)
                                   : x => x.OrderBy(x => x.Schedule.CarePlan.MasterType.MasterTypeName)) : x => x.OrderBy(x => x.Schedule.CarePlan.MasterType.MasterTypeName);
                        break;
                    case "status":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Status)
                                   : x => x.OrderBy(x => x.Status)) : x => x.OrderBy(x => x.Status);
                        break;

                    default:
                        orderBy = x => x.OrderBy(x => x.WorkLogId);
                        break;
                }
                var entities = await _unitOfWork.WorkLogRepository.GetWorkLog(filter, orderBy, paginationParameter.PageIndex, paginationParameter.PageSize);
                var result = entities
                       .Select(wl => new ScheduleModel()
                       {
                           WorkLogId = wl.WorkLogId,
                           WorkLogName = wl.WorkLogName,
                           WorkLogCode = wl.WorkLogCode,
                           Date = wl.Date,
                           Status = wl.Status,
                           Notes = wl.Notes,
                           ScheduleId = wl.ScheduleId,
                           StartTime = wl.Schedule.StarTime,
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
                           }).ToList() // Danh sách user thực hiện công việc
                       }).ToList();
                var pagin = new PageEntity<ScheduleModel>();
                pagin.List = result;
                pagin.TotalRecord = result.Count();
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_SCHEDULE_CODE, Const.SUCCESS_GET_ALL_SCHEDULE_MSG, pagin);
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
    }
}
