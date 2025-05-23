﻿using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IWorkLogRepository
    {
        public Task<List<WorkLog>> GetListWorkLogByListSchedules(List<CarePlanSchedule> schedules);
        public Task<List<WorkLog>> GetListWorkLogByWorkLogDate(WorkLog newWorkLog);
        public Task<List<WorkLog>> GetListWorkLogByScheduelId(int scheduleId);
        public Task<double> CalculatePlanProgress(int planId);
        public Task<bool> DeleteWorkLogAndUserWorkLog(WorkLog deleteWorkLog);
        public Task<bool> AssignTaskForUser(int employeeId, int workLogId, bool? isRepoter);
        public Task<List<WorkLog>> GetListWorkLogByYearAndMonth(int year, int month, int? farmId);
        public Task<List<WorkLog>> GetListWorkLogByPlanId(int planId);

        public Task<List<WorkLog>> GetCalendarEvents(int? userId = null, int? planId = null, DateTime? startDate = null, DateTime? endDate = null, int farmId = 0);
        public Task<List<WorkLog>> GetWorkLog(Expression<Func<WorkLog, bool>> filter = null!,
           Func<IQueryable<WorkLog>, IOrderedQueryable<WorkLog>> orderBy = null!,
           int? pageIndex = null,
           int? pageSize = null);

        public Task<List<WorkLog>> GetWorkLogInclude();
        public Task<WorkLog> GetWorkLogIncludeById(int workLogId);
        public Task<bool> CheckConflictTimeOfWorkLog(TimeSpan newStartTime, TimeSpan newEndTime, DateTime dayCheck);
        public Task<List<WorkLog>> GetConflictWorkLogsOnSameLocation(TimeSpan startTime, TimeSpan endTime, DateTime date, List<int>? treeIds, List<int>? rowIds, List<int?> plotIds);
        public Task<bool> CheckWorkLogAvailability([FromQuery] int[] workLogIds);
        public Task CheckWorkLogAvailabilityWhenAddPlan(TimeSpan newStartTime, TimeSpan newEndTime, DateTime dayCheck, int? masterTypeId, List<int> listEmployeeIds);
        public Task<List<WorkLog>> GetWorkLogsByFarm(int farmId);
        public Task CheckConflictTaskOfEmployee(TimeSpan newStartTime, TimeSpan newEndTime, DateTime dayCheck, List<int> listEmployeeIds, int? workLogId = null);

        public Task<List<WorkLog>> GetListWorkLogByFarmId(int farmId);
        public Task<List<WorkLog>> GetWorkLogByStatusAndUserId (string status, int userId);
        public Task<List<WorkLog>> GetListWorkLogById(int workLogId);
        public Task<WorkLog> GetWorkLogByIdWithPlan(int workLogId);
        public Task<WorkLog> GetCurrentWorkLog(int workLogId);
        public Task<List<WorkLog>> GetWorkLogsByPlanIdsAsync(List<int> planIds);
        public Task<WorkLog> GetWorkLogForUpdateById(int workLogId);
        public Task<WorkLog> GetWorkLogByIdForDelete(int workLogId);
        public Task<WorkLog> GetWorkLogByIdWithPlanAndNotUserWorkLog(int workLogId);
        public Task<List<WorkLog>> GetWorkLogsByPlanIdsWithNoScheduleAsync(List<int> planIds);
        public Task<List<WorkLog>> GetWorkLogByIdForDelete(int userId, int farmId);
        public Task<WorkLog> GetWorkLogForEmployeeRedo(int? workLogId);
    }
}
