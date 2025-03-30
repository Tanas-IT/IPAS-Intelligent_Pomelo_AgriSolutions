using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ScheduleRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using FluentValidation.Internal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class ScheduleService : IScheduleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ScheduleService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> ChangeTimeOfSchedule(ChangeTimeOfScheduleModel changeTimeOfEmployeeModel)
        {
            try
            {
                var findSchedule = await _unitOfWork.CarePlanScheduleRepository.GetByID(changeTimeOfEmployeeModel.ScheduleId);
                if (changeTimeOfEmployeeModel.StartTime != null && changeTimeOfEmployeeModel.EndTime != null)
                {
                    var parseStartTime = TimeSpan.Parse(changeTimeOfEmployeeModel.StartTime);
                    var parseEndTime = TimeSpan.Parse(changeTimeOfEmployeeModel.EndTime);
                    findSchedule.StartTime = parseStartTime;
                    findSchedule.EndTime = parseEndTime;
                    var findWorkLogs = await _unitOfWork.WorkLogRepository.GetListWorkLogByScheduelId(changeTimeOfEmployeeModel.ScheduleId);
                    if(findWorkLogs != null)
                    {
                        foreach (var workLog in findWorkLogs)
                        {
                            workLog.ActualStartTime = parseStartTime;
                            workLog.ActualEndTime = parseEndTime;
                        }
                         _unitOfWork.WorkLogRepository.UpdateRange(findWorkLogs);
                    }
                    _unitOfWork.CarePlanScheduleRepository.Update(findSchedule);
                }
                var result = await _unitOfWork.SaveAsync();
                if(result > 0)
                {
                    return new BusinessResult(200, "Change Time Of Schedule Success");
                }
                return new BusinessResult(400, "Change Time Of Schedule Failed");

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateTimeAndEmployee(ChangeTimeAndEmployeeModel changeTimeAndEmployeeModel)
        {
            try
            {
                var getWorkLogToUpdate = await _unitOfWork.WorkLogRepository.GetByCondition(x => x.WorkLogId == changeTimeAndEmployeeModel.WorkLogId);
                if(getWorkLogToUpdate == null)
                {
                    return new BusinessResult(404, "Can not find any workLog to update");
                }

                var getScheduleToUpdate = await _unitOfWork.CarePlanScheduleRepository.GetByCondition(x => x.ScheduleId == getWorkLogToUpdate.ScheduleId);
                if(changeTimeAndEmployeeModel.StartTime != null && changeTimeAndEmployeeModel.EndTime != null)
                {
                    var parseStartTime = TimeSpan.Parse(changeTimeAndEmployeeModel.StartTime);
                    var parseEndTime = TimeSpan.Parse(changeTimeAndEmployeeModel.EndTime);
                    await _unitOfWork.WorkLogRepository.CheckConflictTaskOfEmployee(parseStartTime, parseEndTime, changeTimeAndEmployeeModel.DateWork.Value , changeTimeAndEmployeeModel.ListEmployeeUpdate.Select(x => x.NewUserId).ToList());
                    if (getScheduleToUpdate != null)
                    {
                        getScheduleToUpdate.StartTime = parseStartTime;
                        getScheduleToUpdate.EndTime = parseEndTime;
                    }
                    getWorkLogToUpdate.ActualStartTime = parseStartTime;
                    getWorkLogToUpdate.ActualEndTime = parseEndTime;
                }
                
                if (changeTimeAndEmployeeModel.DateWork != null)
                {
                    if (changeTimeAndEmployeeModel.DateWork < DateTime.Now)
                    {
                        return new BusinessResult(400, "Date of Work must be greater than now");
                    }
                    getWorkLogToUpdate.Date = changeTimeAndEmployeeModel.DateWork;
                    if (getScheduleToUpdate != null)
                    {
                        getScheduleToUpdate.CustomDates = JsonConvert.SerializeObject(changeTimeAndEmployeeModel.DateWork.Value.ToString("yyyy/MM/dd"));
                    }
                }

                if (changeTimeAndEmployeeModel.ListEmployeeUpdate != null)
                {
                    foreach(var changeEmployee in changeTimeAndEmployeeModel.ListEmployeeUpdate)
                    {
                        var getUserToUpdate = await _unitOfWork.UserWorkLogRepository.GetByCondition(x => x.WorkLogId == changeTimeAndEmployeeModel.WorkLogId && x.UserId == changeEmployee.OldUserId);
                        getUserToUpdate.UserId = changeEmployee.NewUserId;
                        if (changeEmployee.IsReporter != null)
                        {
                            getUserToUpdate.IsReporter = changeEmployee.IsReporter;
                        }
                        _unitOfWork.UserWorkLogRepository.Update(getUserToUpdate);
                        await _unitOfWork.SaveAsync();
                    }
                }
                if (getScheduleToUpdate != null)
                {
                    _unitOfWork.CarePlanScheduleRepository.Update(getScheduleToUpdate);
                }
                _unitOfWork.WorkLogRepository.Update(getWorkLogToUpdate);
                var result = await _unitOfWork.SaveAsync();
                if(result > 0)
                {
                    return new BusinessResult(200, "Update Success");
                }
                return new BusinessResult(400, "Update Failed");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
