﻿using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Server.IISIntegration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Buffers;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using static Org.BouncyCastle.Math.EC.ECCurve;
using Process = CapstoneProject_SP25_IPAS_BussinessObject.Entities.Process;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class ProcessService : IProcessService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        public ProcessService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService, IConfiguration config)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _config = config;
        }

        public async Task<BusinessResult> CreateProcess(CreateProcessModel createProcessModel, int? farmId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var newProcess = new Process()
                    {
                        ProcessCode = $"PRC{DateTime.Now:yyMMddHHmmssfff}",
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        FarmId = farmId,
                        MasterTypeId = createProcessModel.MasterTypeId,
                        ProcessName = createProcessModel.ProcessName,
                        PlanTargetInProcess = createProcessModel.PlanTargetInProcess,
                        IsDefault = false,
                        IsSample = createProcessModel.IsSample,
                        IsActive = createProcessModel.IsActive,
                        IsDeleted = false,
                        Order = createProcessModel.Order,
                        StartDate = createProcessModel.StartDate,
                        EndDate = createProcessModel.EndDate
                    };

                    await _unitOfWork.ProcessRepository.Insert(newProcess);
                    if (createProcessModel.IsSample != null && createProcessModel.IsSample == true)
                    {
                        createProcessModel.ListPlan = null;
                    }


                    if (createProcessModel.ListSubProcess != null)
                    {

                        foreach (var subProcessRaw in createProcessModel.ListSubProcess)
                        {
                            var subProcess = JsonConvert.DeserializeObject<AddSubProcessModel>(subProcessRaw);
                            if (createProcessModel.IsSample != null && createProcessModel.IsSample == true)
                            {
                                subProcess.ListPlan = null;
                            }
                            var newSubProcess = new SubProcess()
                            {
                                SubProcessCode = $"SPC{DateTime.Now:yyMMddHHmmssfff}",
                                SubProcessName = subProcess.SubProcessName,
                                CreateDate = DateTime.Now,
                                UpdateDate = DateTime.Now,
                                IsDefault = false,
                                IsActive = subProcess.IsActive,
                                IsDeleted = false,
                                ParentSubProcessId = subProcess.ParentSubProcessId <= 0 ? null : subProcess.ParentSubProcessId,
                                MasterTypeId = subProcess.MasterTypeId,
                                Order = subProcess.Order,
                                StartDate = subProcess.StartDate,
                                EndDate = subProcess.EndDate,
                            };

                            if (subProcess.ListPlan != null)
                            {
                                foreach (var planRaw in subProcess.ListPlan)
                                {
                                    var plan = JsonConvert.DeserializeObject<AddPlanInProcessModel>(planRaw);
                                    var newPlan = new Plan()
                                    {
                                        PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                                        PlanName = plan.PlanName,
                                        IsSample = true,
                                        PlanDetail = plan.PlanDetail,
                                        Notes = plan.PlanNote,
                                        FarmID = farmId,
                                        MasterTypeId = plan.MasterTypeId,
                                        IsDeleted = false,
                                    };

                                    var growthStagePlan = new GrowthStagePlan()
                                    {
                                        GrowthStageID = plan.GrowthStageId,
                                    };
                                    newPlan.GrowthStagePlans.Add(growthStagePlan);

                                    newSubProcess.Plans.Add(newPlan);
                                }
                            }
                            newProcess.SubProcesses.Add(newSubProcess);
                        }
                    }
                    if (createProcessModel.ListPlan != null)
                    {
                        foreach (var planRaw in createProcessModel.ListPlan)
                        {
                            var plan = JsonConvert.DeserializeObject<AddPlanInProcessModel>(planRaw);
                            var newPlan = new Plan()
                            {
                                PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                                PlanName = plan.PlanName,
                                PlanDetail = plan.PlanDetail,
                                Notes = plan.PlanNote,
                                IsSample = true,
                                FarmID = farmId,
                                MasterTypeId = plan.MasterTypeId,
                                IsDeleted = false
                            };

                            var newGrowthStagePlan = new GrowthStagePlan()
                            {
                                GrowthStageID = plan.GrowthStageId
                            };
                            newPlan.GrowthStagePlans.Add(newGrowthStagePlan);

                            newProcess.Plans.Add(newPlan);
                        }
                    }
                    var checkInsertProcess = await _unitOfWork.SaveAsync();
                    await transaction.CommitAsync();
                    if (checkInsertProcess > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_PROCESS_CODE, Const.SUCCESS_CREATE_PROCESS_MESSAGE, checkInsertProcess > 0); ;
                    }
                    return new BusinessResult(Const.FAIL_CREATE_PROCESS_CODE, Const.FAIL_CREATE_PROCESS_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, "Have an error when create process");
                }
            }
        }

        public async Task<BusinessResult> GetAllProcessPagination(PaginationParameter paginationParameter, ProcessFilters processFilters, int farmId)
        {
            try
            {
                Expression<Func<Process, bool>> filter = x => x.FarmId == farmId && x.IsDeleted == false;
                Func<IQueryable<Process>, IOrderedQueryable<Process>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now.Date;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.ProcessId == validInt);
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = filter.And(x => x.CreateDate == validDate
                                      || x.UpdateDate == validDate);
                    }
                    else if (Boolean.TryParse(paginationParameter.Search, out validBool))
                    {
                        filter = filter.And(x => x.IsDeleted == validBool || x.IsDefault == validBool || x.IsActive == validBool);
                    }
                    else
                    {
                        filter = filter.And(x => x.ProcessCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.ProcessName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MasterType.MasterTypeName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Farm.FarmName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.GrowthStage.GrowthStageName.ToLower().Contains(paginationParameter.Search.ToLower()));
                    }
                }

                if (processFilters.createDateFrom.HasValue || processFilters.createDateTo.HasValue)
                {
                    if (!processFilters.createDateFrom.HasValue || !processFilters.createDateTo.HasValue)
                    {
                        return new BusinessResult(Const.WARNING_MISSING_DATE_FILTER_CODE, Const.WARNING_MISSING_DATE_FILTER_MSG);
                    }

                    if (processFilters.createDateFrom.Value > processFilters.createDateTo.Value)
                    {
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);
                    }
                    filter = filter.And(x => x.CreateDate >= processFilters.createDateFrom &&
                                             x.CreateDate <= processFilters.createDateTo);
                }

                if (processFilters.isActive != null)
                    filter = filter.And(x => x.IsActive == processFilters.isActive);
                if (processFilters.isSample != null)
                    filter = filter.And(x => x.IsSample == processFilters.isSample);
                if (processFilters.MasterTypeName != null)
                {
                    filter = filter.And(x => x.MasterType.MasterTypeName.Contains(processFilters.MasterTypeName));
                }
                if (processFilters.ProcessName != null)
                {
                    filter = filter.And(x => x.ProcessName.Contains(processFilters.ProcessName));
                }

                if (processFilters.GrowthStage != null)
                {

                    filter = filter.And(x => x.GrowthStage.GrowthStageName.Contains(processFilters.GrowthStage));
                }

                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "processid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ProcessId)
                                   : x => x.OrderBy(x => x.ProcessId)) : x => x.OrderBy(x => x.ProcessId);
                        break;
                    case "processcode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ProcessCode)
                                   : x => x.OrderBy(x => x.ProcessCode)) : x => x.OrderBy(x => x.ProcessCode);
                        break;
                    case "processname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ProcessName)
                                   : x => x.OrderBy(x => x.ProcessName)) : x => x.OrderBy(x => x.ProcessName);
                        break;
                    case "mastertypename":
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
                    case "farmname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Farm.FarmName)
                                   : x => x.OrderBy(x => x.Farm.FarmName)) : x => x.OrderBy(x => x.Farm.FarmName);
                        break;
                    case "isdeleted":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.IsDeleted)
                                   : x => x.OrderBy(x => x.IsDeleted)) : x => x.OrderBy(x => x.IsDeleted);
                        break;
                    case "isdefault":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.IsDefault)
                                   : x => x.OrderBy(x => x.IsDefault)) : x => x.OrderBy(x => x.IsDefault);
                        break;
                    case "isactive":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.IsActive)
                                   : x => x.OrderBy(x => x.IsActive)) : x => x.OrderBy(x => x.IsActive);
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
                    case "order":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Order)
                                   : x => x.OrderBy(x => x.Order)) : x => x.OrderBy(x => x.Order);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.ProcessId);
                        break;
                }
                var entities = await _unitOfWork.ProcessRepository.GetProcessPaging(filter, orderBy, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<ProcessModel>();
                pagin.List = _mapper.Map<IEnumerable<ProcessModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.ProcessRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_PROCESS_CODE, Const.SUCCESS_GET_ALL_PROCESS_MESSAGE, pagin);
                }
                else
                {
                    return new BusinessResult(200, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG, new PageEntity<ProcessModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetProcessByID(int processId)
        {
            try
            {
                var getProcess = await _unitOfWork.ProcessRepository.GetProcessByIdForDetail(processId);
                if (getProcess != null)
                {
                    var result = _mapper.Map<ProcessModel>(getProcess);
                    return new BusinessResult(Const.SUCCESS_GET_PROCESS_BY_ID_CODE, Const.SUCCESS_GET_PROCESS_BY_ID_MESSAGE, result);
                }
                return new BusinessResult(200, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetProcessSelectedByMasterType(List<int> masterTypeId)
        {
            try
            {
                var getProcess = await _unitOfWork.ProcessRepository.GetAllNoPaging(x => masterTypeId.Contains(x.MasterTypeId.Value) && x.IsDeleted == false && x.IsActive == true);
                if (getProcess != null)
                {
                    var result = _mapper.Map<List<ForSelectedModels>>(getProcess);
                    return new BusinessResult(Const.SUCCESS_GET_PROCESS_BY_ID_CODE, "Get Process for selected by master type success", result);
                }
                return new BusinessResult(200, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetProcessByName(string processName)
        {
            try
            {
                var getProcess = await _unitOfWork.ProcessRepository.GetByCondition(x => x.ProcessName.ToLower().Contains(processName.ToLower()), "GrowthStage,Farm,MasterType,SubProcesses");
                if (getProcess != null)
                {
                    var result = _mapper.Map<ProcessModel>(getProcess);
                    return new BusinessResult(Const.SUCCESS_GET_PROCESS_BY_NAME_CODE, Const.SUCCESS_GET_PROCESS_BY_NAME_MESSAGE, result);
                }
                return new BusinessResult(Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> InsertManyProcess(List<CreateManyProcessModel> listCreateProcessModel, int? farmId)
        {

            try
            {
                var checkInsertProcess = 0;
                foreach (var createProcessModel in listCreateProcessModel)
                {
                    var newProcessModel = new CreateProcessModel()
                    {
                        MasterTypeId = createProcessModel.MasterTypeId,
                        ProcessName = createProcessModel.ProcessName,
                        IsActive = createProcessModel.IsActive,
                        IsDeleted = false,
                    };
                    var listPlan = new List<string>
                                {
                                    JsonConvert.SerializeObject(new {
                                        PlanName = "Plan 1",
                                        PlanDetail = "Chi tiết 1",
                                        PlanNote = "Ghi chú 1",
                                        GrowthStageId = 2,
                                        MasterTypeId = 3
                                    })
                                };

                    var subProcess = new AddSubProcessModel
                    {
                        SubProcessName = "Sub 1",
                        ListPlan = listPlan
                    };

                    if (createProcessModel.ListSubProcess != null)
                    {
                        newProcessModel.ListSubProcess = createProcessModel.ListSubProcess
                            .Select(x => JsonConvert.SerializeObject(x))
                            .ToList();

                        var listPlanStrings = subProcess.ListPlan
                                        .Select(plan => JsonConvert.SerializeObject(plan))
                                        .ToList();

                        subProcess.ListPlan = listPlanStrings;

                        // Gán vào ListPlan của AddSubProcessModel

                    }

                    if (createProcessModel.ListPlan != null)
                    {
                        newProcessModel.ListPlan = createProcessModel.ListPlan
                            .Select(x => JsonConvert.SerializeObject(x))
                            .ToList();
                    }
                    var result = await CreateProcess(newProcessModel, farmId);
                    if (result.StatusCode == 200)
                    {
                        checkInsertProcess++;
                    }
                }
                if (checkInsertProcess == listCreateProcessModel.Count)
                {
                    return new BusinessResult(Const.SUCCESS_CREATE_PROCESS_CODE, Const.SUCCESS_CREATE_PROCESS_MESSAGE, checkInsertProcess > 0); ;
                }
                return new BusinessResult(Const.FAIL_CREATE_PROCESS_CODE, Const.FAIL_CREATE_PROCESS_MESSAGE, false);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }

        }

        public async Task<BusinessResult> PermanentlyDeleteProcess(int processId)
        {
            try
            {
                string includeProperties = "GrowthStage,Farm,MasterType,SubProcesses";
                var deleteProcess = await _unitOfWork.ProcessRepository.GetByCondition(x => x.ProcessId == processId, includeProperties);


                _unitOfWork.ProcessRepository.Delete(deleteProcess);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(Const.SUCCESS_DELETE_PROCESS_CODE, Const.SUCCESS_DELETE_PROCESS_MESSAGE, true);
                }
                return new BusinessResult(Const.FAIL_DELETE_PROCESS_CODE, Const.FAIL_DELETE_PROCESS_MESSAGE, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateProcessInfo(UpdateProcessModel updateProcessModel)
        {

            var checkProcessHasUsed = await _unitOfWork.ProcessRepository.GetProcessByIdHasPlanAsync(updateProcessModel.ProcessId);
            var processFlag = false;

            if (checkProcessHasUsed != null)
            {
                processFlag = checkProcessHasUsed.Plans.Any(p => p.IsSample == false) ||
                              checkProcessHasUsed.SubProcesses.Any(sp =>
                                  sp.Plans.Any(p => p.IsSample == false));

                if (processFlag)
                {
                    var listPlanCreate = checkProcessHasUsed.Plans.Select(plan => new PlanCreateManyModel
                    {
                        PlanName = plan.PlanName,
                        PlanDetail = plan.PlanDetail,
                        PlanNote = plan.Notes,
                    }).ToList();
                    List<PlanCreateManyModel?>? listPlanUpdate = null;
                    if(updateProcessModel.ListPlan != null)
                    {
                        listPlanUpdate = updateProcessModel.ListPlan.Select(planJson =>
                        {
                            var plan = JsonConvert.DeserializeObject<PlanCreateManyModel>(planJson);
                            return plan;
                        }).ToList();
                    }
                    var listSubProcess = checkProcessHasUsed.SubProcesses.Select(sp => new SubProcessCreateManyModel
                    {
                        SubProcessName = sp.SubProcessName,
                        ParentSubProcessId = sp.ParentSubProcessId,
                        IsActive = sp.IsActive,
                        Order = sp.Order,
                        ListPlan = sp.Plans.Select(plan => new PlanCreateManyModel
                        {
                            PlanName = plan.PlanName,
                            PlanDetail = plan.PlanDetail,
                            PlanNote = plan.Notes,
                        }).ToList() 
                    }).ToList();
                    List<SubProcessCreateManyModel?>? subProcesses = null;
                    if (updateProcessModel.ListUpdateSubProcess != null)
                    {
                        subProcesses = updateProcessModel.ListUpdateSubProcess.Select(subProcessJson =>
                        {
                            var subProcess = JsonConvert.DeserializeObject<SubProcessCreateManyModel>(subProcessJson);
                            return subProcess;
                        }).ToList();
                    }
                    var modifiedProcessName = updateProcessModel.ProcessName != null ? updateProcessModel.ProcessName : checkProcessHasUsed.ProcessName;
                    var timeZoneForProcess = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                    var todayForProcess = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneForProcess);
                    var newProcessModified = new CreateManyProcessModel()
                    {
                        ProcessName = modifiedProcessName + " - modifiled on " + $"{todayForProcess}",
                        IsActive = updateProcessModel.IsActive != null ? updateProcessModel.IsActive : checkProcessHasUsed.IsActive,
                        IsSample = checkProcessHasUsed.IsSample,
                        ListPlan = updateProcessModel.ListPlan != null ? listPlanUpdate : listPlanCreate,
                        ListSubProcess = updateProcessModel.ListUpdateSubProcess != null ? subProcesses : listSubProcess,
                        MasterTypeId = updateProcessModel.MasterTypeId != null ? updateProcessModel.MasterTypeId : checkProcessHasUsed.MasterTypeId,
                        PlanTargetInProcess = updateProcessModel.PlanTargetInProcess != null ? updateProcessModel.PlanTargetInProcess : checkProcessHasUsed.PlanTargetInProcess
                    };
                    var checkCreateModified = await CreateProcessWithSub(newProcessModified, checkProcessHasUsed.FarmId.Value);
                    if (checkCreateModified.StatusCode == 200)
                    {
                        return new BusinessResult(200, "This process is already in use. As a result, a new process will be created. Please check the process management.", checkCreateModified.Data);
                    }
                    else
                    {
                        return new BusinessResult(400, "Update Process failed");
                    }
                }
            }
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkExistProcess = await _unitOfWork.ProcessRepository.GetByID(updateProcessModel.ProcessId);
                    var result = 0;
                    var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                    var today = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone).Date;
                    var vietnamTimeOfDay = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone).TimeOfDay;
                    if (checkExistProcess != null)
                    {
                        if (checkExistProcess.StartDate <= TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone) || checkExistProcess.IsActive == true)
                        {
                            if (checkExistProcess.Plans.Count > 0)
                            {
                                throw new Exception("Process is running. Can not update");
                            }
                        }

                        if (updateProcessModel.PlanTargetInProcess != null)
                        {
                            checkExistProcess.PlanTargetInProcess = updateProcessModel.PlanTargetInProcess;
                        }
                        if (updateProcessModel.ProcessName != null)
                        {
                            checkExistProcess.ProcessName = updateProcessModel.ProcessName;
                        }
                        if (updateProcessModel.StartDate != null)
                        {
                            checkExistProcess.StartDate = updateProcessModel.StartDate;
                        }
                        if (updateProcessModel.EndDate != null)
                        {
                            checkExistProcess.EndDate = updateProcessModel.EndDate;
                        }
                        if (updateProcessModel.ProcessName != null)
                        {
                            checkExistProcess.ProcessName = updateProcessModel.ProcessName;
                        }
                        if (updateProcessModel.IsActive != null)
                        {
                            checkExistProcess.IsActive = updateProcessModel.IsActive;
                        }
                        if (updateProcessModel.IsDefault != null)
                        {
                            checkExistProcess.IsDefault = updateProcessModel.IsDefault;
                        }
                        if (updateProcessModel.IsDeleted != null)
                        {
                            checkExistProcess.IsDeleted = updateProcessModel.IsDeleted;
                        }
                        if (updateProcessModel.MasterTypeId != null)
                        {
                            checkExistProcess.MasterTypeId = updateProcessModel.MasterTypeId;
                        }
                        if (updateProcessModel.GrowthStageID != null)
                        {
                            checkExistProcess.GrowthStageId = updateProcessModel.GrowthStageID;
                        }
                        if (updateProcessModel.Order != null)
                        {
                            checkExistProcess.Order = updateProcessModel.Order;
                        }

                        _unitOfWork.ProcessRepository.Update(checkExistProcess);

                        if (updateProcessModel.ListUpdateSubProcess != null)
                        {
                            Dictionary<int, int> idMapping = new Dictionary<int, int>();
                            foreach (var subProcessRaw in updateProcessModel.ListUpdateSubProcess)
                            {
                                var subProcess = JsonConvert.DeserializeObject<UpdateSubProcessModel>(subProcessRaw);

                                var subProcessUpdate = await _unitOfWork.SubProcessRepository.GetByCondition(x => x.SubProcessID == subProcess.SubProcessId, "");
                                if (subProcess.Status != null)
                                {
                                    if (subProcess.Status.ToLower().Equals("add"))
                                    {
                                        var newSubProcess = new SubProcess();
                                        int? realParentId = null;
                                        if (subProcess.ParentSubProcessId.HasValue)
                                        {
                                            var parentExists = await _unitOfWork.SubProcessRepository
                                                .GetByCondition(sp => sp.SubProcessID == subProcess.ParentSubProcessId.Value);

                                            if (parentExists != null)
                                            {
                                                realParentId = subProcess.ParentSubProcessId.Value; // Gán trực tiếp nếu tồn tại
                                            }
                                            else if (idMapping.ContainsKey(subProcess.ParentSubProcessId.Value))
                                            {
                                                realParentId = idMapping[subProcess.ParentSubProcessId.Value]; // Lấy từ ánh xạ nếu có
                                            }
                                        }

                                        // Chuyển đổi sang entity SubProcess
                                        newSubProcess = new SubProcess()
                                        {
                                            SubProcessCode = $"SPC{DateTime.Now:yyMMddHHmmssfff}",
                                            MasterTypeId = subProcess.MasterTypeId,
                                            SubProcessName = subProcess.SubProcessName,
                                            IsDefault = subProcess.IsDefault,
                                            IsActive = subProcess.IsActive,
                                            IsDeleted = false,
                                            CreateDate = DateTime.Now,
                                            UpdateDate = DateTime.Now,
                                            ProcessId = checkExistProcess.ProcessId,
                                            Order = subProcess.Order
                                        };
                                        newSubProcess.ParentSubProcessId = realParentId;

                                        await _unitOfWork.SubProcessRepository.Insert(newSubProcess);
                                        result += await _unitOfWork.SaveAsync();
                                        idMapping[subProcess.SubProcessId.Value] = newSubProcess.SubProcessID;

                                        if (subProcess.ListPlan != null)
                                        {
                                            foreach (var plan in subProcess.ListPlan)
                                            {
                                                var getPlanInDB = await _unitOfWork.PlanRepository.GetByID(plan.PlanId != null ? plan.PlanId.Value : -1);
                                                if (plan.PlanStatus != null)
                                                {
                                                    if (plan.PlanStatus.ToLower().Equals("add"))
                                                    {
                                                        var newPlan = new Plan()
                                                        {
                                                            PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                                                            PlanName = plan.PlanName,
                                                            PlanDetail = plan.PlanDetail,
                                                            Notes = plan.PlanNote,
                                                            IsSample = true,
                                                            FarmID = checkExistProcess.FarmId,
                                                            MasterTypeId = plan.MasterTypeId,
                                                            SubProcessId = newSubProcess.SubProcessID,
                                                            IsDeleted = false
                                                        };
                                                        await _unitOfWork.PlanRepository.Insert(newPlan);
                                                        var addNewGrowthStages = new GrowthStagePlan()
                                                        {
                                                            GrowthStageID = plan.GrowthStageId,
                                                        };
                                                        newPlan.GrowthStagePlans.Add(addNewGrowthStages);
                                                    }
                                                    else if (plan.PlanStatus.ToLower().Equals("update"))
                                                    {
                                                        if (getPlanInDB != null)
                                                        {
                                                            if (plan.PlanName != null)
                                                            {
                                                                getPlanInDB.PlanName = plan.PlanName;
                                                            }
                                                            if (plan.PlanDetail != null)
                                                            {
                                                                getPlanInDB.PlanDetail = plan.PlanDetail;
                                                            }
                                                            if (plan.PlanNote != null)
                                                            {
                                                                getPlanInDB.Notes = plan.PlanNote;
                                                            }
                                                            if (plan.GrowthStageId.HasValue) // Kiểm tra xem có giá trị không
                                                            {
                                                                int newGrowthStageId = plan.GrowthStageId.Value;

                                                                // Xóa những GrowthStagePlans không trùng với GrowthStageId mới
                                                                getPlanInDB.GrowthStagePlans = getPlanInDB.GrowthStagePlans
                                                                  .Where(x => x.GrowthStageID == newGrowthStageId)
                                                                  .ToList();

                                                                // Kiểm tra nếu chưa có GrowthStageID mới trong danh sách thì thêm vào
                                                                if (!getPlanInDB.GrowthStagePlans.Any(x => x.GrowthStageID == newGrowthStageId))
                                                                {
                                                                    getPlanInDB.GrowthStagePlans.Add(new GrowthStagePlan { GrowthStageID = newGrowthStageId });
                                                                }
                                                            }
                                                            if (plan.MasterTypeId != null)
                                                            {
                                                                getPlanInDB.MasterTypeId = plan.MasterTypeId;
                                                            }
                                                            getPlanInDB.UpdateDate = DateTime.Now;
                                                            _unitOfWork.PlanRepository.Update(getPlanInDB);
                                                        }
                                                    }
                                                    else if (plan.PlanStatus.ToLower().Equals("delete"))
                                                    {
                                                        getPlanInDB.IsDeleted = true;
                                                        _unitOfWork.PlanRepository.Update(getPlanInDB);
                                                    }
                                                }

                                            }
                                        }

                                    }
                                    else if (subProcess.Status.ToLower().Equals("update"))
                                    {
                                        if (subProcessUpdate != null)
                                        {
                                            if (subProcess.ParentSubProcessId != null)
                                            {
                                                subProcessUpdate.ParentSubProcessId = subProcess.ParentSubProcessId;
                                            }
                                            if (subProcess.SubProcessName != null)
                                            {
                                                subProcessUpdate.SubProcessName = subProcess.SubProcessName;
                                            }
                                            if (subProcess.IsDefault != null)
                                            {
                                                subProcessUpdate.IsDefault = subProcess.IsDefault;
                                            }
                                            if (subProcess.IsActive != null)
                                            {
                                                subProcessUpdate.IsActive = subProcess.IsActive;
                                            }
                                            if (subProcess.IsDeleted != null)
                                            {
                                                subProcessUpdate.IsDeleted = subProcess.IsDeleted;
                                            }
                                            if (subProcess.MasterTypeId != null)
                                            {
                                                subProcessUpdate.MasterTypeId = subProcess.MasterTypeId;
                                            }
                                            if (subProcess.Order != null)
                                            {
                                                subProcessUpdate.Order = subProcess.Order;
                                            }

                                            _unitOfWork.SubProcessRepository.Update(subProcessUpdate);
                                            subProcessUpdate.UpdateDate = DateTime.Now;

                                            if (subProcess.ListPlan != null && subProcess.ListPlan.Count > 0)
                                            {
                                                foreach (var plan in subProcess.ListPlan)
                                                {
                                                    var getUpdatePlanInDB = await _unitOfWork.PlanRepository.GetByID(plan.PlanId != null ? plan.PlanId.Value : -1);
                                                    if (plan.PlanStatus != null)
                                                    {
                                                        if (plan.PlanStatus.ToLower().Equals("add"))
                                                        {
                                                            var newPlan = new Plan()
                                                            {
                                                                PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                                                                PlanName = plan.PlanName,
                                                                PlanDetail = plan.PlanDetail,
                                                                Notes = plan.PlanNote,
                                                                FarmID = checkExistProcess.FarmId,
                                                                IsSample = true,
                                                                MasterTypeId = plan.MasterTypeId,
                                                                SubProcessId = subProcess.SubProcessId,
                                                                IsDeleted = false
                                                            };
                                                            await _unitOfWork.PlanRepository.Insert(newPlan);
                                                            if (plan.GrowthStageId.HasValue) // Kiểm tra xem có giá trị không
                                                            {
                                                                newPlan.GrowthStagePlans.Add(new GrowthStagePlan { GrowthStageID = plan.GrowthStageId });
                                                            }


                                                        }
                                                        else if (plan.PlanStatus.ToLower().Equals("update"))
                                                        {
                                                            if (getUpdatePlanInDB != null)
                                                            {
                                                                if (plan.PlanName != null)
                                                                {
                                                                    getUpdatePlanInDB.PlanName = plan.PlanName;
                                                                }
                                                                if (plan.PlanDetail != null)
                                                                {
                                                                    getUpdatePlanInDB.PlanDetail = plan.PlanDetail;
                                                                }
                                                                if (plan.PlanNote != null)
                                                                {
                                                                    getUpdatePlanInDB.Notes = plan.PlanNote;
                                                                }
                                                                if (plan.GrowthStageId.HasValue) // Kiểm tra xem có giá trị không
                                                                {
                                                                    int newGrowthStageId = plan.GrowthStageId.Value;

                                                                    // Xóa những GrowthStagePlans không trùng với GrowthStageId mới
                                                                    getUpdatePlanInDB.GrowthStagePlans = getUpdatePlanInDB.GrowthStagePlans
                                                                      .Where(x => x.GrowthStageID == newGrowthStageId)
                                                                      .ToList();

                                                                    // Kiểm tra nếu chưa có GrowthStageID mới trong danh sách thì thêm vào
                                                                    if (!getUpdatePlanInDB.GrowthStagePlans.Any(x => x.GrowthStageID == newGrowthStageId))
                                                                    {
                                                                        getUpdatePlanInDB.GrowthStagePlans.Add(new GrowthStagePlan { GrowthStageID = newGrowthStageId });
                                                                    }
                                                                }
                                                                if (plan.MasterTypeId != null)
                                                                {
                                                                    getUpdatePlanInDB.MasterTypeId = plan.MasterTypeId;
                                                                }
                                                                getUpdatePlanInDB.UpdateDate = DateTime.Now;
                                                                _unitOfWork.PlanRepository.Update(getUpdatePlanInDB);
                                                            }
                                                        }
                                                        else if (plan.PlanStatus.ToLower().Equals("delete"))
                                                        {
                                                            if (getUpdatePlanInDB != null)
                                                            {
                                                                getUpdatePlanInDB.IsDeleted = true;
                                                                _unitOfWork.PlanRepository.Update(getUpdatePlanInDB);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else if (subProcess.Status.ToLower().Equals("delete"))
                                    {

                                        subProcessUpdate.IsDeleted = true;
                                        if (subProcessUpdate.ChildSubProcesses != null && subProcessUpdate.ChildSubProcesses.Count > 0)
                                        {
                                            foreach (var deleteSubProcess in subProcessUpdate.ChildSubProcesses)
                                            {
                                                deleteSubProcess.IsDeleted = true;
                                            }
                                        }
                                        _unitOfWork.SubProcessRepository.Update(subProcessUpdate);
                                        if (subProcess.ListPlan != null && subProcess.ListPlan.Count > 0)
                                        {
                                            foreach (var plan in subProcess.ListPlan)
                                            {
                                                var getUpdatePlanInDB = await _unitOfWork.PlanRepository.GetByID(plan.PlanId != null ? plan.PlanId.Value : -1);
                                                if (plan.PlanStatus != null)
                                                {
                                                    if (plan.PlanStatus.ToLower().Equals("add"))
                                                    {
                                                        var newPlan = new Plan()
                                                        {
                                                            PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                                                            PlanName = plan.PlanName,
                                                            PlanDetail = plan.PlanDetail,
                                                            Notes = plan.PlanNote,
                                                            FarmID = checkExistProcess.FarmId,
                                                            IsSample = true,
                                                            MasterTypeId = plan.MasterTypeId,
                                                            SubProcessId = subProcessUpdate.SubProcessID,
                                                            IsDeleted = false
                                                        };
                                                        await _unitOfWork.PlanRepository.Insert(newPlan);
                                                        if (plan.GrowthStageId != null)
                                                        {
                                                            newPlan.GrowthStagePlans.Add(new GrowthStagePlan() { GrowthStageID = plan.GrowthStageId });
                                                        }

                                                    }
                                                    else if (plan.PlanStatus.ToLower().Equals("update"))
                                                    {
                                                        if (getUpdatePlanInDB != null)
                                                        {
                                                            if (plan.PlanName != null)
                                                            {
                                                                getUpdatePlanInDB.PlanName = plan.PlanName;
                                                            }
                                                            if (plan.PlanDetail != null)
                                                            {
                                                                getUpdatePlanInDB.PlanDetail = plan.PlanDetail;
                                                            }
                                                            if (plan.PlanNote != null)
                                                            {
                                                                getUpdatePlanInDB.Notes = plan.PlanNote;
                                                            }
                                                            if (plan.GrowthStageId.HasValue) // Kiểm tra xem có giá trị không
                                                            {
                                                                int newGrowthStageId = plan.GrowthStageId.Value;

                                                                // Xóa những GrowthStagePlans không trùng với GrowthStageId mới
                                                                getUpdatePlanInDB.GrowthStagePlans = getUpdatePlanInDB.GrowthStagePlans
                                                                  .Where(x => x.GrowthStageID == newGrowthStageId)
                                                                  .ToList();

                                                                // Kiểm tra nếu chưa có GrowthStageID mới trong danh sách thì thêm vào
                                                                if (!getUpdatePlanInDB.GrowthStagePlans.Any(x => x.GrowthStageID == newGrowthStageId))
                                                                {
                                                                    getUpdatePlanInDB.GrowthStagePlans.Add(new GrowthStagePlan { GrowthStageID = newGrowthStageId });
                                                                }
                                                            }
                                                            if (plan.MasterTypeId != null)
                                                            {
                                                                getUpdatePlanInDB.MasterTypeId = plan.MasterTypeId;
                                                            }
                                                            getUpdatePlanInDB.UpdateDate = DateTime.Now;
                                                            _unitOfWork.PlanRepository.Update(getUpdatePlanInDB);
                                                        }
                                                    }
                                                    else if (plan.PlanStatus.ToLower().Equals("delete"))
                                                    {
                                                        getUpdatePlanInDB.IsDeleted = true;
                                                        _unitOfWork.PlanRepository.Update(getUpdatePlanInDB);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                            if (updateProcessModel.ListPlan != null && updateProcessModel.ListPlan.Count > 0)
                            {
                                foreach (var updatePlanRaw in updateProcessModel.ListPlan)
                                {
                                    var updatePlan = JsonConvert.DeserializeObject<UpdatePlanInProcessModel>(updatePlanRaw);
                                    var getUpdatePlanInDB = await _unitOfWork.PlanRepository.GetByID(updatePlan.PlanId != null ? updatePlan.PlanId.Value : -1);
                                    if (updatePlan.PlanStatus != null)
                                    {
                                        if (updatePlan.PlanStatus.ToLower().Equals("add"))
                                        {
                                            var newPlan = new Plan()
                                            {
                                                PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                                                PlanName = updatePlan.PlanName,
                                                PlanDetail = updatePlan.PlanDetail,
                                                Notes = updatePlan.PlanNote,
                                                IsSample = true,
                                                FarmID = checkExistProcess.FarmId,
                                                MasterTypeId = updatePlan.MasterTypeId,
                                                ProcessId = checkExistProcess.ProcessId,
                                                IsDeleted = false
                                            };
                                            await _unitOfWork.PlanRepository.Insert(newPlan);
                                            if (updatePlan.GrowthStageId != null)
                                            {
                                                newPlan.GrowthStagePlans.Add(new GrowthStagePlan() { GrowthStageID = updatePlan.GrowthStageId });

                                            }


                                        }
                                        else if (updatePlan.PlanStatus.ToLower().Equals("update"))
                                        {
                                            if (getUpdatePlanInDB != null)
                                            {
                                                if (updatePlan.PlanName != null)
                                                {
                                                    getUpdatePlanInDB.PlanName = updatePlan.PlanName;
                                                }
                                                if (updatePlan.PlanDetail != null)
                                                {
                                                    getUpdatePlanInDB.PlanDetail = updatePlan.PlanDetail;
                                                }
                                                if (updatePlan.PlanNote != null)
                                                {
                                                    getUpdatePlanInDB.Notes = updatePlan.PlanNote;
                                                }
                                                if (updatePlan.GrowthStageId.HasValue) // Kiểm tra xem có giá trị không
                                                {
                                                    int newGrowthStageId = updatePlan.GrowthStageId.Value;

                                                    // Xóa những GrowthStagePlans không trùng với GrowthStageId mới
                                                    getUpdatePlanInDB.GrowthStagePlans = getUpdatePlanInDB.GrowthStagePlans
                                                      .Where(x => x.GrowthStageID == newGrowthStageId)
                                                      .ToList();

                                                    // Kiểm tra nếu chưa có GrowthStageID mới trong danh sách thì thêm vào
                                                    if (!getUpdatePlanInDB.GrowthStagePlans.Any(x => x.GrowthStageID == newGrowthStageId))
                                                    {
                                                        getUpdatePlanInDB.GrowthStagePlans.Add(new GrowthStagePlan { GrowthStageID = newGrowthStageId });
                                                    }
                                                }
                                                if (updatePlan.MasterTypeId != null)
                                                {
                                                    getUpdatePlanInDB.MasterTypeId = updatePlan.MasterTypeId;
                                                }
                                                getUpdatePlanInDB.UpdateDate = DateTime.Now;
                                                _unitOfWork.PlanRepository.Update(getUpdatePlanInDB);
                                            }
                                        }
                                        else if (updatePlan.PlanStatus.ToLower().Equals("delete"))
                                        {
                                            getUpdatePlanInDB.IsDeleted = true;
                                            _unitOfWork.PlanRepository.Update(getUpdatePlanInDB);
                                        }
                                    }
                                }
                            }
                        }
                        var finalResult = await _unitOfWork.SaveAsync();
                        checkExistProcess.UpdateDate = DateTime.Now;
                        if (result > 0 || finalResult > 0)
                        {
                            await transaction.CommitAsync();
                            return new BusinessResult(Const.SUCCESS_UPDATE_PROCESS_CODE, Const.SUCCESS_UPDATE_PROCESS_MESSAGE, checkExistProcess);
                        }
                        else
                        {
                            return new BusinessResult(Const.FAIL_UPDATE_PROCESS_CODE, Const.FAIL_UPDATE_PROCESS_MESSAGE, false);
                        }
                    }
                    else
                    {
                        return new BusinessResult(Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }

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

        public async Task<BusinessResult> SoftDeleteProcess(List<int> listProcessId)
        {
            try
            {
                if (listProcessId != null)
                {
                    List<string> failedProcessNames = new List<string>(); // Danh sách process không thể xóa
                    bool hasDeleted = false; // Cờ kiểm tra xem có process nào được xóa không

                    foreach (var processId in listProcessId)
                    {
                        var checkExistProcess = await _unitOfWork.ProcessRepository.GetProcessByIdInclude(processId);
                        if (checkExistProcess == null)
                        {
                            continue; // Nếu process không tồn tại, bỏ qua
                        }

                        bool hasActivePlan = false;

                        // Kiểm tra Plans trực tiếp của Process
                        if (checkExistProcess.Plans != null)
                        {
                            foreach (var planInProcess in checkExistProcess.Plans)
                            {
                                if (planInProcess.IsSample == false)
                                {
                                    hasActivePlan = true;
                                    failedProcessNames.Add(checkExistProcess.ProcessName);
                                    break;
                                }
                            }
                        }

                        // Kiểm tra Plans của SubProcesses
                        if (!hasActivePlan && checkExistProcess.SubProcesses != null)
                        {
                            foreach (var subProcess in checkExistProcess.SubProcesses)
                            {
                                if (subProcess.StartDate <= DateTime.Now.Date)
                                {
                                    hasActivePlan = true;
                                }
                                if (subProcess.Plans != null)
                                {
                                    foreach (var planInSub in subProcess.Plans)
                                    {
                                        if (planInSub.IsSample == false)
                                        {
                                            hasActivePlan = true;
                                            failedProcessNames.Add(checkExistProcess.ProcessName);
                                            break;
                                        }
                                    }
                                }
                                if (hasActivePlan) break;
                            }
                        }

                        // Nếu có kế hoạch đang hoạt động, không xóa process này
                        if (hasActivePlan)
                        {
                            continue;
                        }

                        // Xóa process nếu không có kế hoạch hoạt động
                        checkExistProcess.IsDeleted = true;
                        if (checkExistProcess.SubProcesses != null)
                        {
                            foreach (var subProcess in checkExistProcess.SubProcesses)
                            {
                                subProcess.IsDeleted = true;
                            }
                        }
                        hasDeleted = true;
                        _unitOfWork.ProcessRepository.Update(checkExistProcess);
                    }

                    // Lưu thay đổi vào DB nếu có process nào được xóa
                    if (hasDeleted)
                    {
                        var result = await _unitOfWork.SaveAsync();
                        if (result > 0)
                        {
                            if (failedProcessNames.Any())
                            {
                                string messageError = string.Join(", ", failedProcessNames);
                                return new BusinessResult(Const.SUCCESS_SOFT_DELETE_PROCESS_CODE,
                                    $"Delete {messageError} failed", true);
                            }

                            return new BusinessResult(Const.SUCCESS_SOFT_DELETE_PROCESS_CODE, Const.SUCCESS_SOFT_DELETE_PROCESS_MESSAGE, true);
                        }
                        return new BusinessResult(Const.FAIL_SOFT_DELETE_PROCESS_CODE, Const.FAIL_SOFT_DELETE_PROCESS_MESSAGE, false);
                    }

                    // Nếu không có process nào bị xóa
                    if (failedProcessNames.Any())
                    {
                        string messageError = string.Join(", ", failedProcessNames);
                        return new BusinessResult(400,
                            $"Delete {messageError} failed because it has been used");
                    }
                }

                // Nếu danh sách processId rỗng hoặc null
                return new BusinessResult(400, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }

        }

        public async Task<BusinessResult> GetForSelect(int farmId, string? searchValue, bool? isSample)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(200, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                Expression<Func<Process, bool>> filter = x => x.FarmId == farmId && x.IsDeleted == false;
                if (isSample != null)
                {
                    filter = filter.And(x => x.IsSample == isSample);
                }
                if (!string.IsNullOrEmpty(searchValue))
                {
                    filter = filter.And(x => x.ProcessName!.ToLower().Contains(searchValue.ToLower()));
                }
                Func<IQueryable<Process>, IOrderedQueryable<Process>> orderBy = x => x.OrderByDescending(x => x.ProcessId);
                string includeProperties = "GrowthStage,Farm,MasterType,SubProcesses";
                var processes = await _unitOfWork.ProcessRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (!processes.Any())
                    return new BusinessResult(Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG);
                var mappedResult = _mapper.Map<IEnumerable<ProcessModel>>(processes);
                foreach (var item in mappedResult)
                {
                    item.SubProcesses = null;
                    //item.ListProcessData = null;
                }
                return new BusinessResult(Const.SUCCESS_GET_ALL_PROCESS_CODE, Const.SUCCESS_GET_ALL_PROCESS_MESSAGE, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetProcessByTypeName(int farmId, string typeName)
        {
            try
            {
                var getProcessByTypeName = await _unitOfWork.ProcessRepository.GetProcessByTypeName(farmId, typeName);
                if (getProcessByTypeName != null && getProcessByTypeName.Any())
                {
                    var result = _mapper.Map<List<ProcessModel>>(getProcessByTypeName);
                    return new BusinessResult(200, "Get Process By Type Name Success", result);
                }
                return new BusinessResult(404, "Does not have any process");

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> CreateProcessWithSub(CreateManyProcessModel createManyProcessModel, int farmId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var newProcess = new Process()
                    {
                        ProcessCode = $"PRC{DateTime.Now:yyMMddHHmmssfff}",
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        FarmId = farmId,
                        MasterTypeId = createManyProcessModel.MasterTypeId,
                        ProcessName = createManyProcessModel.ProcessName,
                        PlanTargetInProcess = createManyProcessModel.PlanTargetInProcess,
                        IsDefault = false,
                        IsSample = createManyProcessModel.IsSample,
                        IsActive = createManyProcessModel.IsActive,
                        IsDeleted = false,
                    };

                    await _unitOfWork.ProcessRepository.Insert(newProcess);
                    await _unitOfWork.SaveAsync();
                    var result = 0;
                    if (createManyProcessModel.ListSubProcess != null)
                    {
                        Dictionary<int, int> idMapping = new Dictionary<int, int>();
                        foreach (var subProcess in createManyProcessModel.ListSubProcess)
                        {

                            var newSubProcess = new SubProcess();
                            int? realParentId = null;
                            if (subProcess.ParentSubProcessId != null)
                            {
                                var parentExists = await _unitOfWork.SubProcessRepository
                                    .GetByCondition(sp => sp.SubProcessID == subProcess.ParentSubProcessId);

                                if (parentExists != null)
                                {
                                    realParentId = subProcess.ParentSubProcessId; // Gán trực tiếp nếu tồn tại
                                }
                                else if (idMapping.ContainsKey(subProcess.ParentSubProcessId.Value))
                                {
                                    realParentId = idMapping[subProcess.ParentSubProcessId.Value]; // Lấy từ ánh xạ nếu có
                                }
                            }

                            // Chuyển đổi sang entity SubProcess
                            newSubProcess = new SubProcess()
                            {
                                SubProcessCode = $"SPC{DateTime.Now:yyMMddHHmmssfff}",
                                SubProcessName = subProcess.SubProcessName,
                                IsDefault = true,
                                IsActive = subProcess.IsActive,
                                IsDeleted = false,
                                CreateDate = DateTime.Now,
                                UpdateDate = DateTime.Now,
                                ProcessId = newProcess.ProcessId,
                                Order = subProcess.Order
                            };
                            newSubProcess.ParentSubProcessId = realParentId;

                            await _unitOfWork.SubProcessRepository.Insert(newSubProcess);
                            result += await _unitOfWork.SaveAsync();
                            idMapping[subProcess.SubProcessId.Value] = newSubProcess.SubProcessID;

                            if (subProcess.ListPlan != null)
                            {
                                foreach (var plan in subProcess.ListPlan)
                                {

                                    var newPlan = new Plan()
                                    {
                                        PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                                        PlanName = plan.PlanName,
                                        PlanDetail = plan.PlanDetail,
                                        Notes = plan.PlanNote,
                                        IsSample = true,
                                        FarmID = farmId,
                                        SubProcessId = newSubProcess.SubProcessID,
                                        IsDeleted = false
                                    };
                                    await _unitOfWork.PlanRepository.Insert(newPlan);
                                }

                            }

                        }
                        if (createManyProcessModel.ListPlan != null && createManyProcessModel.ListPlan.Count > 0)
                        {
                            foreach (var updatePlan in createManyProcessModel.ListPlan)
                            {

                                var newPlan = new Plan()
                                {
                                    PlanCode = $"PLAN{DateTime.Now:yyMMddHHmmssfff}",
                                    PlanName = updatePlan.PlanName,
                                    PlanDetail = updatePlan.PlanDetail,
                                    Notes = updatePlan.PlanNote,
                                    IsSample = true,
                                    FarmID = farmId,
                                    ProcessId = newProcess.ProcessId,
                                    IsDeleted = false
                                };
                                await _unitOfWork.PlanRepository.Insert(newPlan);
                            }
                        }
                    }
                    var checkInsertProcess = await _unitOfWork.SaveAsync();
                    if (result > 0 || checkInsertProcess > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_CREATE_PROCESS_CODE, Const.SUCCESS_CREATE_PROCESS_MESSAGE, checkInsertProcess > 0);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_CREATE_PROCESS_CODE, Const.FAIL_CREATE_PROCESS_MESSAGE, false);
                    }


                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, "Have an error when create process");
                }
            }
        }


    }
}
