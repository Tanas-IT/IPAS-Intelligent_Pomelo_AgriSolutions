using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Http;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using System.Diagnostics;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SubProcessModel;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class SubProcessService : ISubProcessService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;

        public SubProcessService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<BusinessResult> CreateSubProcess(CreateSubProcessModel createSubProcessModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var newSubProcess = new SubProcess()
                    {
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        ProcessId = createSubProcessModel.ProcessId,
                        ParentSubProcessId = createSubProcessModel.ParentSubProcessId,
                        MasterTypeId = createSubProcessModel.MasterTypeId,
                        SubProcessName = createSubProcessModel.SubProcessName,
                        IsDefault = false,
                        IsActive = createSubProcessModel.IsActive,
                        IsDeleted = false,
                        SubProcessCode = $"{CodeAliasEntityConst.SUB_PROCESS}-{DateTime.Now.ToString("ddmmyyyy")}-{CodeAliasEntityConst.PROCESS}{createSubProcessModel.ProcessId}{CodeAliasEntityConst.MASTER_TYPE}{createSubProcessModel.MasterTypeId}-{CodeHelper.GenerateCode()}",
                    };
                    
                    await _unitOfWork.SubProcessRepository.Insert(newSubProcess);

                    var checkInsertProcess = await _unitOfWork.SaveAsync();
                    await transaction.CommitAsync();
                    if (checkInsertProcess > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_SUB_PROCESS_CODE, Const.SUCCESS_CREATE_SUB_PROCESS_MESSAGE, checkInsertProcess > 0); ;
                    }
                    return new BusinessResult(Const.FAIL_CREATE_SUB_PROCESS_CODE, Const.FAIL_CREATE_SUB_PROCESS_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> GetAllSubProcessPagination(PaginationParameter paginationParameter, SubProcessFilters subProcessFilters)
        {
            try
            {
                Expression<Func<SubProcess, bool>> filter = null!;
                Func<IQueryable<SubProcess>, IOrderedQueryable<SubProcess>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.SubProcessID == validInt || x.ParentSubProcessId == validInt);
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
                        filter = filter.And(x => x.SubProcessCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.SubProcessName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MasterType.MasterTypeName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Process.ProcessName.ToLower().Contains(paginationParameter.Search.ToLower()));
                    }
                }

                if (subProcessFilters.createDateFrom.HasValue || subProcessFilters.createDateTo.HasValue)
                {
                    if (!subProcessFilters.createDateFrom.HasValue || !subProcessFilters.createDateTo.HasValue)
                    {
                        return new BusinessResult(Const.WARNING_MISSING_DATE_FILTER_CODE, Const.WARNING_MISSING_DATE_FILTER_MSG);
                    }

                    if (subProcessFilters.createDateFrom.Value > subProcessFilters.createDateTo.Value)
                    {
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);
                    }
                    filter = filter.And(x => x.CreateDate >= subProcessFilters.createDateFrom &&
                                             x.CreateDate <= subProcessFilters.createDateTo);
                }

                if (subProcessFilters.isActive != null)
                    filter = filter.And(x => x.IsActive == subProcessFilters.isActive);
                if (subProcessFilters.MasterType != null)
                {
                    filter = filter.And(x => x.MasterType.MasterTypeName.Contains(subProcessFilters.MasterType));
                }

                if (subProcessFilters.ProcessName != null)
                {
                    filter = filter.And(x => x.Process.ProcessName.Contains(subProcessFilters.ProcessName));
                }

                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "subprocessid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.SubProcessID)
                                   : x => x.OrderBy(x => x.SubProcessID)) : x => x.OrderBy(x => x.SubProcessID);
                        break;
                    case "subprocesscode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.SubProcessCode)
                                   : x => x.OrderBy(x => x.SubProcessCode)) : x => x.OrderBy(x => x.SubProcessCode);
                        break;
                    case "subprocessname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.SubProcessName)
                                   : x => x.OrderBy(x => x.SubProcessName)) : x => x.OrderBy(x => x.SubProcessName);
                        break;
                    case "mastertypename":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MasterType.MasterTypeName)
                                   : x => x.OrderBy(x => x.MasterType.MasterTypeName)) : x => x.OrderBy(x => x.MasterType.MasterTypeName);
                        break;
                    case "processname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Process.ProcessName)
                                   : x => x.OrderBy(x => x.Process.ProcessName)) : x => x.OrderBy(x => x.Process.ProcessName);
                        break;
                    case "parentsubprocessid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ParentSubProcessId)
                                   : x => x.OrderBy(x => x.ParentSubProcessId)) : x => x.OrderBy(x => x.ParentSubProcessId);
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
                    default:
                        orderBy = x => x.OrderBy(x => x.SubProcessID);
                        break;
                }
                string includeProperties = "MasterType,Process,ChildSubProcesses";
                var entities = await _unitOfWork.SubProcessRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<SubProcessModel>();
                pagin.List = _mapper.Map<IEnumerable<SubProcessModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.SubProcessRepository.Count(x => x.IsDeleted == false);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_SUB_PROCESS_CODE, Const.SUCCESS_GET_ALL_SUB_PROCESS_MESSAGE, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_MSG, new PageEntity<SubProcessModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetSubProcessByID(int subProcessId)
        {
            try
            {
                var getProcess = await _unitOfWork.SubProcessRepository.GetByCondition(x => x.SubProcessID == subProcessId, "MasterType,Process");
                if (getProcess != null)
                {
                    var result = _mapper.Map<SubProcessModel>(getProcess);
                    return new BusinessResult(Const.SUCCESS_GET_SUB_PROCESS_BY_ID_CODE, Const.SUCCESS_GET_SUB_PROCESS_BY_ID_MESSAGE, result);
                }
                return new BusinessResult(Const.WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetSubProcessByName(string subProcessName)
        {
            try
            {
                var getProcess = await _unitOfWork.SubProcessRepository.GetByCondition(x => x.SubProcessName.ToLower().Contains(subProcessName.ToLower()), "MasterType,Process");
                if (getProcess != null)
                {
                    var result = _mapper.Map<SubProcessModel>(getProcess);
                    return new BusinessResult(Const.SUCCESS_GET_SUB_PROCESS_BY_NAME_CODE, Const.SUCCESS_GET_SUB_PROCESS_BY_NAME_MESSAGE, result);
                }
                return new BusinessResult(Const.WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PermanentlyDeleteSubProcess(int subProcessId)
        {
            try
            {
                string includeProperties = "Process,MasterType";
                var deleteSubProcess = await _unitOfWork.SubProcessRepository.GetByCondition(x => x.SubProcessID == subProcessId, includeProperties);
                _unitOfWork.SubProcessRepository.Delete(deleteSubProcess);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(Const.SUCCESS_DELETE_SUB_PROCESS_CODE, Const.SUCCESS_DELETE_SUB_PROCESS_MESSAGE, true);
                }
                return new BusinessResult(Const.FAIL_DELETE_SUB_PROCESS_CODE, Const.FAIL_DELETE_SUB_PROCESS_MESSAGE, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateSubProcessInfo(UpdateSubProcessModel updateSubProcessModel)
        {
            try
            {
                var checkExistSubProcess = await _unitOfWork.SubProcessRepository.GetByCondition(x => x.SubProcessID == updateSubProcessModel.SubProcessId, "");
                if (checkExistSubProcess != null)
                {
                    if (updateSubProcessModel.SubProcessName != null)
                    {
                        checkExistSubProcess.SubProcessName = updateSubProcessModel.SubProcessName;
                    }
                    if (updateSubProcessModel.IsActive != null)
                    {
                        checkExistSubProcess.IsActive = updateSubProcessModel.IsActive;
                    }
                    if (updateSubProcessModel.IsDeleted != null)
                    {
                        checkExistSubProcess.IsDeleted = updateSubProcessModel.IsDeleted;
                    }
                    if (updateSubProcessModel.IsDefault != null)
                    {
                        checkExistSubProcess.IsDefault = updateSubProcessModel.IsDefault;
                    }
                    if (updateSubProcessModel.ProcessId != null)
                    {
                        checkExistSubProcess.ProcessId = updateSubProcessModel.ProcessId;
                    }
                    if (updateSubProcessModel.MasterTypeId != null)
                    {
                        checkExistSubProcess.MasterTypeId = updateSubProcessModel.MasterTypeId;
                    }
                    if (updateSubProcessModel.ParentSubProcessId != null)
                    {
                        checkExistSubProcess.ParentSubProcessId = updateSubProcessModel.ParentSubProcessId;
                    }
                    checkExistSubProcess.UpdateDate = DateTime.Now;
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_UPDATE_SUB_PROCESS_CODE, Const.SUCCESS_UPDATE_SUB_PROCESS_MESSAGE, checkExistSubProcess);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_SUB_PROCESS_CODE, Const.FAIL_UPDATE_SUB_PROCESS_MESSAGE, false);
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

        public async Task<BusinessResult> SoftDeleteSubProcess(int subProcessId)
        {

            try
            {
                var checkExistSubProcess = await _unitOfWork.SubProcessRepository.GetByID(subProcessId);
                if (checkExistSubProcess != null)
                {
                    checkExistSubProcess.IsDeleted = true;
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_SOFT_DELETE_SUB_PROCESS_CODE, Const.SUCCESS_SOFT_DELETE_SUB_PROCESS_MESSAGE, result > 0);
                    }
                    return new BusinessResult(Const.FAIL_SOFT_DELETE_SUB_PROCESS_CODE, Const.FAIL_SOFT_DELETE_SUB_PROCESS_MESSAGE, false);

                }
                return new BusinessResult(Const.WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
