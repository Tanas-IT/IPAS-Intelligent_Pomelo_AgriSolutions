using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserWorkLogModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class UserWorkLogService : IUserWorkLogService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserWorkLogService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CheckUserConflictByStartDateAndEndDate(CheckConflictScheduleByStartDateAndEndDateModel checkConflictScheduleByStartDateAndEndDate)
        {
            try
            {
                var startTimeConvert = TimeSpan.Parse(checkConflictScheduleByStartDateAndEndDate.StartTime);
                var endTimeConvert = TimeSpan.Parse(checkConflictScheduleByStartDateAndEndDate.EndTime);
                var checkConflict = await _unitOfWork.UserWorkLogRepository.CheckUserConflictByStartDateAndEndDate(checkConflictScheduleByStartDateAndEndDate.UserId, startTimeConvert, endTimeConvert, checkConflictScheduleByStartDateAndEndDate.StartDate, checkConflictScheduleByStartDateAndEndDate.EndDate);
                if (!checkConflict)
                {
                    return new BusinessResult(Const.SUCCESS_USER_NO_CONFLICT_SCHEDULE_CODE, Const.SUCCESS_USER_NO_CONFLICT_SCHEDULE_MSG, checkConflict);
                }
                return new BusinessResult(Const.WARNING_USER_CONFLICT_SCHEDULE_CODE, Const.WARNING_USER_CONFLICT_SCHEDULE_MSG, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> CheckUserConflictSchedule(CheckConflictScheduleModel checkConflictScheduleModel)
        {
            try
            {
                var startTimeConvert = TimeSpan.Parse(checkConflictScheduleModel.StartTime);
                var endTimeConvert = TimeSpan.Parse(checkConflictScheduleModel.EndTime);
                var checkConflict = await _unitOfWork.UserWorkLogRepository.CheckUserConflictByStartTimeSchedule(checkConflictScheduleModel.UserId, startTimeConvert, endTimeConvert, checkConflictScheduleModel.DateCheck);
                if(!checkConflict)
                {
                    return new BusinessResult(Const.SUCCESS_USER_NO_CONFLICT_SCHEDULE_CODE, Const.SUCCESS_USER_NO_CONFLICT_SCHEDULE_MSG, checkConflict);
                }
                return new BusinessResult(Const.WARNING_USER_CONFLICT_SCHEDULE_CODE, Const.WARNING_USER_CONFLICT_SCHEDULE_MSG, false);

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

       
    }
}
