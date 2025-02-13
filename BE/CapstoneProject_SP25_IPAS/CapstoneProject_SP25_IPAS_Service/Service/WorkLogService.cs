using AutoMapper;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<BusinessResult> GetCalendarEvents(ParamCalendarModel paramCalendarModel)
        {
            try
            {
                var calendar = await _unitOfWork.WorkLogRepository.GetCalendarEvents(paramCalendarModel.UserId, paramCalendarModel.PlanId, paramCalendarModel.StartDate, paramCalendarModel.EndDate);
                var result =  calendar
                        .Select(wl => new CalendarModel()
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
                            Users = wl.UserWorkLogs.Select(uwl => new UserCalendarModel()
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
                return new BusinessResult(Const.WARNING_NO_SCHEDULE_CODE, Const.WARNING_NO_SCHEDULE_MSG, new CalendarModel());
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public Task<BusinessResult> GetScheduleFilters(PaginationParameter paginationParameter, ScheduleFilter scheduleFilter)
        {
            throw new NotImplementedException();
        }
    }
}
