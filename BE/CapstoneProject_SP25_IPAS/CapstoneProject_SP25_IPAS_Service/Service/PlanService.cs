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
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

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
            using(var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var newPlan = new Plan()
                    {
                        PlanCode = await GeneratePlanCode(createPlanModel.PlantId, createPlanModel.LandPlotId),
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
                        LandPlotId = createPlanModel?.LandPlotId,
                        MaxVolume = createPlanModel?.MaxVolume,
                        MinVolume = createPlanModel?.MinVolume,
                        Notes = createPlanModel?.Notes,
                        PesticideName = createPlanModel?.PesticideName,
                        ResponsibleBy = createPlanModel?.ResponsibleBy,
                        ProcessId = createPlanModel?.ProcessId,
                        Status = createPlanModel?.Status,
                        PlantLotId = createPlanModel?.PlantLotId,
                        PlantId = createPlanModel?.PlantId,
                        PlanDetail = createPlanModel?.PlanDetail,
                    };
                    await GeneratePlanSchedule(newPlan);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_PLAN_CODE, Const.SUCCESS_CREATE_PLAN_MSG,result > 0);
                    }
                    else
                    {
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
                        filter = filter.And(x => x.PlanId == validInt || x.PlantId == validInt 
                                            || x.PlantLotId == validInt || x.ProcessId == validInt 
                                            || x.LandPlotId == validInt || x.MasterTypeId == validInt
                                            || x.MinVolume == validInt || x.MaxVolume == validInt
                                            || x.AssignorId == validInt || x.CropId == validInt || x.GrowthStageId == validInt);
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = filter.And(x => x.CreateDate == validDate
                                      || x.UpdateDate == validDate);
                    }
                    else if (Boolean.TryParse(paginationParameter.Search, out validBool))
                    {
                        filter = filter.And(x => x.IsDelete == validBool || x.IsActive == validBool);
                    }
                    else
                    {
                        filter = filter.And(x => x.PlanCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.PlanDetail.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MasterType.MasterTypeName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.LandPlot.LandPlotName.ToLower().Contains(paginationParameter.Search.ToLower())
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
                    filter = filter.And(x => x.IsActive == planFilter.isActive);
                if (planFilter.isDelete != null)
                    filter = filter.And(x => x.IsDelete == planFilter.isDelete);
                if (planFilter.ResponsibleBy != null)
                {
                    filter = filter.And(x => x.ResponsibleBy.Contains(planFilter.ResponsibleBy));
                }

                if (planFilter.CropName != null)
                {
                    filter = filter.And(x => x.Crop.CropName.Contains(planFilter.CropName));
                }
                if (planFilter.PlanDetail != null)
                {
                    filter = filter.And(x => x.PlanDetail.Contains(planFilter.PlanDetail));
                }
                if (planFilter.AssignorName != null)
                {
                    filter = filter.And(x => x.User.FullName.Contains(planFilter.AssignorName));
                }

                switch (paginationParameter.SortBy)
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
                    case "plantlotname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantLot.PlantLotName)
                                   : x => x.OrderBy(x => x.PlantLot.PlantLotName)) : x => x.OrderBy(x => x.PlantLot.PlantLotName);
                        break;
                    case "plantname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Plant.PlantName)
                                   : x => x.OrderBy(x => x.Plant.PlantName)) : x => x.OrderBy(x => x.Plant.PlantName);
                        break;
                    case "landplotname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.LandPlot.LandPlotName)
                                   : x => x.OrderBy(x => x.LandPlot.LandPlotName)) : x => x.OrderBy(x => x.LandPlot.LandPlotName);
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
                string includeProperties = "LandPlot,PlantLot,MasterType,Process,GrowthStage,User,Crop,Plant";
                var entities = await _unitOfWork.PlanRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<PlanModel>();
                pagin.List = _mapper.Map<IEnumerable<PlanModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.ProcessRepository.Count();
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

        public Task<BusinessResult> GetPlanByID(int planId)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> GetPlanByName(string planName)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> PermanentlyDeletePlan(int planId)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> UpdatePlanInfo(UpdatePlanModel updateriteriaTypeModel)
        {
            throw new NotImplementedException();
        }

        private async Task<bool> GeneratePlanSchedule(Plan plan)
        {
            List<CarePlanSchedule> schedules = new List<CarePlanSchedule>();
            DateTime currentDate = (DateTime) plan.StartDate;

            while (currentDate <= plan.EndDate)
            {
                schedules.Add(new CarePlanSchedule
                {
                    CarePlanId = plan.PlanId,
                    DayOfWeek = currentDate.DayOfWeek.ToString(),
                    StarTime = currentDate,
                    EndTime = currentDate.AddHours(2)
                });

                // Xác định bước nhảy theo tần suất
                currentDate = plan.Frequency switch
                {
                    "Daily" => currentDate.AddDays(1),
                    "Weekly" => currentDate.AddDays(7),
                    _ => currentDate.AddDays(1) // Mặc định: hàng ngày
                };
            }
            await _unitOfWork.CarePlanScheduleRepository.InsertRangeAsync(schedules);
            var result = await _unitOfWork.SaveAsync();
            if(result > 0)
            {
                await GenerateWorkLogs(schedules);
                return true;
            }
            return false;
           
        }

        private async Task<bool> GenerateWorkLogs(List<CarePlanSchedule> schedules)
        {
            List<WorkLog> workLogs = schedules.Select(schedule => new WorkLog
            {
                WorkLogCode = $"WL-{schedule.ScheduleId}-{DateTime.UtcNow.Ticks}",
                Status = "Pending",
                Date = schedule.StarTime,
                ScheduleId = schedule.ScheduleId
            }).ToList();

            await _unitOfWork.WorkLogRepository.InsertRangeAsync(workLogs);
            var result = await _unitOfWork.SaveAsync();
            if (result > 0)
            {
                return true;
            }
            return false;
        }

        public async Task<string> GeneratePlanCode(int? plantId, int? landPlotId)
        {
            string datePart = DateTime.Now.ToString("ddMMyyyy");
            string sequence = await GetNextSequenceNumber(); // Hàm lấy số thứ tự
            return $"{CodeAliasEntityConst.PLAN}-{datePart}-{plantId}-{landPlotId}-{sequence}";
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
