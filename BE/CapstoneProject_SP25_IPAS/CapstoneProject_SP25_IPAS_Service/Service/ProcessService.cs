using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Server.IISIntegration;
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
using System.Text;
using System.Threading.Tasks;
using Process = CapstoneProject_SP25_IPAS_BussinessObject.Entities.Process;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class ProcessService : IProcessService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IMapper _mapper;

        public ProcessService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<BusinessResult> CreateProcess(CreateProcessModel createProcessModel, int? farmId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var newProcess = new Process()
                    {
                        ProcessCode = $"{CodeAliasEntityConst.PROCESS}-{DateTime.Now.ToString("ddmmyyyy")}-{CodeAliasEntityConst.FARM}{farmId}-{CodeAliasEntityConst.GROWTHSTAGE}{createProcessModel.GrowthStageID}",
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        FarmId = farmId,
                        GrowthStageId = createProcessModel.GrowthStageID,
                        MasterTypeId = createProcessModel.MasterTypeId,
                        ProcessName = createProcessModel.ProcessName,
                        IsDefault = false,
                        IsActive = createProcessModel.IsActive,
                        IsDeleted = false,
                        Order = createProcessModel.Order,
                        StartDate = createProcessModel.StartDate,
                        EndDate = createProcessModel.EndDate
                    };
                    var processData = createProcessModel.ProcessData;
                    var getLink = "";
                    if (processData != null)
                    {
                        if (IsImageFile(processData))
                        {
                            getLink = await _cloudinaryService.UploadImageAsync(processData, "process/data");
                        }
                        else
                        {
                            getLink = await _cloudinaryService.UploadVideoAsync(processData, "process/data");
                        }
                    }
                    newProcess.ResourceUrl = getLink;
                    await _unitOfWork.ProcessRepository.Insert(newProcess);

                    if (createProcessModel.ListSubProcess != null)
                    {

                        foreach (var subProcessRaw in createProcessModel.ListSubProcess)
                        {
                            var subProcess = JsonConvert.DeserializeObject<AddSubProcessModel>(subProcessRaw);
                            var newSubProcess = new SubProcess()
                            {
                                SubProcessCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.SUB_PROCESS),
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

                            if(subProcess.ListPlan != null)
                            {
                                foreach (var plan in subProcess.ListPlan)
                                {
                                    //var plan = JsonConvert.DeserializeObject<AddPlanInProcessModel>(planRaw);
                                    var newPlan = new Plan()
                                    {
                                        PlanCode = "PLAN" + "_" + DateTime.Now.ToString("ddMMyyyy") + "_" + plan.MasterTypeId,
                                        PlanName = plan.PlanName,
                                        PlanDetail = plan.PlanDetail,
                                        Notes = plan.PlanNote,
                                        GrowthStageId = plan.GrowthStageId,
                                        MasterTypeId = plan.MasterTypeId,
                                    };

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
                                PlanCode = "PLAN" + "_" + DateTime.Now.ToString("ddMMyyyy") + "_" + plan.MasterTypeId,
                                PlanName = plan.PlanName,
                                PlanDetail = plan.PlanDetail,
                                Notes = plan.PlanNote,
                                GrowthStageId = plan.GrowthStageId,
                                MasterTypeId = plan.MasterTypeId,
                            };

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
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> GetAllProcessPagination(PaginationParameter paginationParameter, ProcessFilters processFilters, int farmId)
        {
            try
            {
                Expression<Func<Process, bool>> filter = x => x.FarmId == farmId;
                Func<IQueryable<Process>, IOrderedQueryable<Process>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
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
                string includeProperties = "GrowthStage,Farm,MasterType,SubProcesses";
                var entities = await _unitOfWork.ProcessRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
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
                    return new BusinessResult(Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG, new PageEntity<ProcessModel>());
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
                var getProcess = await _unitOfWork.ProcessRepository.GetByCondition(x => x.ProcessId == processId, "GrowthStage,Farm,MasterType,SubProcesses");
                if (getProcess != null)
                {
                    var result = _mapper.Map<ProcessModel>(getProcess);
                    return new BusinessResult(Const.SUCCESS_GET_PROCESS_BY_ID_CODE, Const.SUCCESS_GET_PROCESS_BY_ID_MESSAGE, result);
                }
                return new BusinessResult(Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG);
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
                        ListSubProcess = createProcessModel.ListSubProcess,
                        ListPlan = createProcessModel.ListPlan,
                        IsActive = createProcessModel.IsActive,
                        IsDeleted = createProcessModel.IsDeleted,
                        GrowthStageID = createProcessModel.GrowthStageID,
                        Order = createProcessModel.Order,
                    };
                    var result = await CreateProcess(newProcessModel, farmId);
                    if(result.StatusCode == 200)
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
                var processData = deleteProcess.ResourceUrl;
                if (processData != null)
                {
                    if (IsImageLink(processData))
                    {
                        await _cloudinaryService.DeleteImageByUrlAsync(processData);
                    }
                    else
                    {
                        await _cloudinaryService.DeleteVideoByUrlAsync(processData);
                    }
                }
                foreach (var subProcess in deleteProcess.SubProcesses.ToList())
                {
                    var subProcessData = subProcess.ResourceUrl;
                    if (subProcessData != null)
                    {
                        if (IsImageLink(subProcessData))
                        {
                            await _cloudinaryService.DeleteImageByUrlAsync(subProcessData);
                        }
                        else
                        {
                            await _cloudinaryService.DeleteVideoByUrlAsync(subProcessData);
                        }
                    }
                }
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
            try
            {
                var checkExistProcess = await _unitOfWork.ProcessRepository.GetByCondition(x => x.ProcessId == updateProcessModel.ProcessId, "");
                if (checkExistProcess != null)
                {
                    if(checkExistProcess.StartDate <= DateTime.Now || checkExistProcess.IsActive == true )
                    {
                        throw new Exception("Process is running. Can not update");
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
                    if (updateProcessModel.FarmId != null)
                    {
                        checkExistProcess.FarmId = updateProcessModel.FarmId;
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
                    var processData = checkExistProcess.ResourceUrl;
                    if (updateProcessModel.UpdateProcessData != null)
                    {
                        if (processData != null)
                        {
                            if (IsImageLink(processData))
                            {
                                await _cloudinaryService.DeleteImageByUrlAsync(processData);
                            }
                            else
                            {
                                await _cloudinaryService.DeleteVideoByUrlAsync(processData);
                            }
                        }
                        var getLink = "";
                        if (IsImageFile(updateProcessModel.UpdateProcessData))
                        {
                            getLink = await _cloudinaryService.UploadImageAsync(updateProcessModel.UpdateProcessData, "process/data");
                        }
                        else
                        {
                            getLink = await _cloudinaryService.UploadVideoAsync(updateProcessModel.UpdateProcessData, "process/data");
                        }
                        checkExistProcess.ResourceUrl = getLink;
                    }
                    checkExistProcess.UpdateDate = DateTime.Now;
                    if (updateProcessModel.ListUpdateSubProcess != null)
                    {
                        foreach (var subProcessRaw in updateProcessModel.ListUpdateSubProcess)
                        {
                            var subProcess = JsonConvert.DeserializeObject<UpdateSubProcessModel>(subProcessRaw);
                            var getListSubProcess = await _unitOfWork.SubProcessRepository.GetAllNoPaging();
                            var getListSubProcessOfProcess = getListSubProcess.Where(x => x.ProcessId == checkExistProcess.ProcessId).ToList();
                            var flag = false;
                            foreach (var item in getListSubProcessOfProcess)
                            {
                                if (item.SubProcessID == subProcess.SubProcessId)
                                {
                                    flag = true;
                                }
                            }
                            if (flag)
                            {
                                var subProcessUpdate = await _unitOfWork.SubProcessRepository.GetByCondition(x => x.SubProcessID == subProcess.SubProcessId, "");
                                if (subProcess.Status.ToLower().Equals("add"))
                                {
                                    var newSubProcess = new SubProcess()
                                    {
                                        SubProcessCode = CodeAliasEntityConst.SUB_PROCESS + "_" + DateTime.Now.Date.ToString(),
                                        MasterTypeId = subProcess.MasterTypeId,
                                        SubProcessName = subProcess.SubProcessName,
                                        IsDefault = subProcess.IsDefault,
                                        IsActive = subProcess.IsActive,
                                        IsDeleted = subProcess.IsDeleted,
                                        ParentSubProcessId = subProcess.ParentSubProcessId,
                                        CreateDate = DateTime.Now,
                                        UpdateDate = DateTime.Now,
                                    };
                                    checkExistProcess.SubProcesses.Add(newSubProcess);
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
                                            subProcessUpdate.Order = subProcess.MasterTypeId;
                                        }
                                        subProcessUpdate.UpdateDate = DateTime.Now;
                                    }
                                }
                                else if (subProcess.Status.ToLower().Equals("delete"))
                                {
                                    var checkSubProcessDeletet = await _unitOfWork.SubProcessRepository.GetByID(subProcess.SubProcessId);
                                    if (checkSubProcessDeletet != null)
                                    {
                                        _unitOfWork.SubProcessRepository.Delete(checkSubProcessDeletet);
                                    }
                                }
                            }
                            else
                            {
                                return new BusinessResult(Const.FAIL_UPDATE_SUB_PROCESS_OF_PROCESS_CODE, Const.FAIL_UPDATE_SUB_PROCESS_OF_PROCESS_MESSAGE);
                            }
                        }
                        if (updateProcessModel.ListPlan != null)
                        {
                            foreach (var updatePlanRaw in updateProcessModel.ListPlan)
                            {
                                var updatePlan = JsonConvert.DeserializeObject<UpdatePlanInProcessModel>(updatePlanRaw);
                                var getListPlan = await _unitOfWork.PlanRepository.GetAllNoPaging();
                                var getListPlanOfProcess = getListPlan.Where(x => x.ProcessId == checkExistProcess.ProcessId).ToList();
                                bool flag = false;
                                foreach (var item in getListPlanOfProcess)
                                {
                                    if (item.PlanId == updatePlan.PlanId)
                                    {
                                        flag = true;
                                    }
                                }
                                if (flag)
                                {
                                    var planUpdate = await _unitOfWork.PlanRepository.GetByCondition(x => x.PlanId == updatePlan.PlanId, "");
                                    if (planUpdate != null)
                                    {
                                        if (updatePlan.PlanName != null)
                                        {
                                            planUpdate.PlanName = updatePlan.PlanName;
                                        }
                                        if (updatePlan.PlanDetail != null)
                                        {
                                            planUpdate.PlanDetail = updatePlan.PlanDetail;
                                        }
                                        if (updatePlan.PlanNote != null)
                                        {
                                            planUpdate.Notes = updatePlan.PlanNote;
                                        }
                                        if (updatePlan.GrowthStageId != null)
                                        {
                                            planUpdate.GrowthStageId = updatePlan.GrowthStageId;
                                        }
                                        if (updatePlan.MasterTypeId != null)
                                        {
                                            planUpdate.MasterTypeId = updatePlan.MasterTypeId;
                                        }
                                        planUpdate.UpdateDate = DateTime.Now;
                                    }
                                }
                            }
                        }
                    }
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
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
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
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

        public async Task<BusinessResult> SoftDeleteProcess(int processId)
        {
            try
            {
                var checkExistProcess = await _unitOfWork.ProcessRepository.GetByID(processId);
                if (checkExistProcess != null)
                {
                    checkExistProcess.IsDeleted = true;
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_SOFT_DELETE_PROCESS_CODE, Const.SUCCESS_SOFT_DELETE_PROCESS_MESSAGE, result > 0);
                    }
                    return new BusinessResult(Const.FAIL_SOFT_DELETE_PROCESS_CODE, Const.FAIL_SOFT_DELETE_PROCESS_MESSAGE, false);

                }
                return new BusinessResult(Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetForSelect(int farmId, string? searchValue)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                Expression<Func<Process, bool>> filter = x => x.FarmId == farmId && x.IsDeleted == false;
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

        public Task<BusinessResult> GetProcessByFarmId(int farmId)
        {
            throw new NotImplementedException();
        }
    }
}
