//using AutoMapper;
//using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
//using CapstoneProject_SP25_IPAS_Common.Constants;
//using CapstoneProject_SP25_IPAS_Common;
//using CapstoneProject_SP25_IPAS_Common.Utils;
//using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
//using CapstoneProject_SP25_IPAS_Service.Base;
//using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageModel;
//using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessStyleModel;
//using CapstoneProject_SP25_IPAS_Service.IService;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using CapstoneProject_SP25_IPAS_Service.Pagination;
//using System.Linq.Expressions;

//namespace CapstoneProject_SP25_IPAS_Service.Service
//{
//    public class ProcessStyleService : IProcessStyleService
//    {
//        private readonly IUnitOfWork _unitOfWork;
//        private readonly IMapper _mapper;

//        public ProcessStyleService(IUnitOfWork unitOfWork, IMapper mapper)
//        {
//            _unitOfWork = unitOfWork;
//            _mapper = mapper;
//        }

//        public async Task<BusinessResult> CreateProcessStyle(CreateProcessStyleModel createProcessStyleModel)
//        {
//            using (var transaction = await _unitOfWork.BeginTransactionAsync())
//            {
//                try
//                {
//                    var createProcessStyle = new ProcessStyle()
//                    {
//                        ProcessStyleCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.PROCESS_STYLE),
//                        ProcessStyleName = createProcessStyleModel.ProcessStyleName,
//                        Description = createProcessStyleModel.Description,
//                        CreateDate = DateTime.Now,
//                        UpdateDate = DateTime.Now
//                    };
//                    await _unitOfWork.ProcessStyleRepository.Insert(createProcessStyle);
//                    var result = await _unitOfWork.SaveAsync();
//                    await transaction.CommitAsync();
//                    if (result > 0)
//                    {
//                        return new BusinessResult(Const.SUCCESS_CREATE_PROCESS_STYLE_CODE, Const.SUCCESS_CREATE_PROCESS_STYLE_MESSAGE, result > 0);
//                    }
//                    return new BusinessResult(Const.FAIL_CREATE_PROCESS_STYLE_CODE, Const.FAIL_CREATE_PROCESS_STYLE_MESSAGE, false);
//                }
//                catch (Exception ex)
//                {
//                    await transaction.RollbackAsync();
//                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
//                }
//            }
//        }

//        public async Task<BusinessResult> GetAllProcessStylePagination(PaginationParameter paginationParameter)
//        {
//            try
//            {
//                Expression<Func<ProcessStyle, bool>> filter = null!;
//                Func<IQueryable<ProcessStyle>, IOrderedQueryable<ProcessStyle>> orderBy = null!;
//                if (!string.IsNullOrEmpty(paginationParameter.Search))
//                {
//                    int validInt = 0;
//                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
//                    DateTime validDate = DateTime.Now;
//                    if (checkInt)
//                    {
//                        filter = x => x.ProcessStyleId == validInt;
//                    }
//                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
//                    {
//                        filter = x => x.CreateDate == validDate || x.UpdateDate == validDate;
//                    }
//                    else
//                    {
//                        filter = x => x.ProcessStyleName.ToLower().Contains(paginationParameter.Search.ToLower())
//                                      || x.Description.ToLower().Contains(paginationParameter.Search.ToLower());
//                    }
//                }
//                switch (paginationParameter.SortBy)
//                {
//                    case "processstyleid":
//                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
//                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
//                                   ? x => x.OrderByDescending(x => x.ProcessStyleId)
//                                   : x => x.OrderBy(x => x.ProcessStyleId)) : x => x.OrderBy(x => x.ProcessStyleId);
//                        break;
//                    case "processstylecode":
//                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
//                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
//                                   ? x => x.OrderByDescending(x => x.ProcessStyleCode)
//                                   : x => x.OrderBy(x => x.ProcessStyleCode)) : x => x.OrderBy(x => x.ProcessStyleCode);
//                        break;
//                    case "processstylename":
//                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
//                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
//                                   ? x => x.OrderByDescending(x => x.ProcessStyleName)
//                                   : x => x.OrderBy(x => x.ProcessStyleName)) : x => x.OrderBy(x => x.ProcessStyleName);
//                        break;
//                    case "description":
//                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
//                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
//                                   ? x => x.OrderByDescending(x => x.Description)
//                                   : x => x.OrderBy(x => x.Description)) : x => x.OrderBy(x => x.Description);
//                        break;
//                    case "createdate":
//                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
//                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
//                                   ? x => x.OrderByDescending(x => x.CreateDate)
//                                   : x => x.OrderBy(x => x.CreateDate)) : x => x.OrderBy(x => x.CreateDate);
//                        break;
//                    case "updatedate":
//                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
//                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
//                                   ? x => x.OrderByDescending(x => x.UpdateDate)
//                                   : x => x.OrderBy(x => x.UpdateDate)) : x => x.OrderBy(x => x.UpdateDate);
//                        break;
//                    default:
//                        orderBy = x => x.OrderBy(x => x.ProcessStyleId);
//                        break;
//                }
//                string includeProperties = "";
//                var entities = await _unitOfWork.ProcessStyleRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
//                var pagin = new PageEntity<ProcessStyleModel>();
//                pagin.List = _mapper.Map<IEnumerable<ProcessStyleModel>>(entities).ToList();
//                pagin.TotalRecord = await _unitOfWork.ProcessStyleRepository.Count();
//                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
//                if (pagin.List.Any())
//                {
//                    return new BusinessResult(Const.SUCCESS_GET_ALL_PROCESS_STYLE_CODE, Const.SUCCESS_GET_ALL_PROCESS_STYLE_MESSAGE, pagin);
//                }
//                else
//                {
//                    return new BusinessResult(Const.WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_MSG, new PageEntity<ProcessStyleModel>());
//                }
//            }
//            catch (Exception ex)
//            {

//                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
//            }
//        }

//        public async Task<BusinessResult> GetProcessStyleByID(int processStyleId)
//        {
//            try
//            {
//                var getProcessStyle = await _unitOfWork.ProcessStyleRepository.GetByID(processStyleId);
//                if (getProcessStyle != null)
//                {
//                    return new BusinessResult(Const.SUCCESS_GET_PROCESS_STYLE_BY_ID_CODE, Const.SUCCESS_GET_PROCESS_STYLE_BY_ID_MESSAGE, getProcessStyle);
//                }
//                return new BusinessResult(Const.WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_MSG);
//            }
//            catch (Exception ex)
//            {

//                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
//            }
//        }

//        public async Task<BusinessResult> PermanentlyDeleteProcessStyle(int processStyleId)
//        {
//            try
//            {
//                string includeProperties = "Processes,SubProcesses";
//                var getDeleteProcessStyle = await _unitOfWork.ProcessStyleRepository.GetByCondition(x => x.ProcessStyleId == processStyleId, includeProperties);
//                if (getDeleteProcessStyle != null)
//                {
//                    foreach (var process in getDeleteProcessStyle.Processes.ToList())
//                    {
//                        process.ProcessStyleId = null;
//                    }
//                    foreach (var subProcess in getDeleteProcessStyle.SubProcesses.ToList())
//                    {
//                        subProcess.ProcessStyleId = null;
//                    }
//                    await _unitOfWork.SaveAsync();
//                    _unitOfWork.ProcessStyleRepository.Delete(getDeleteProcessStyle);
//                    var result = await _unitOfWork.SaveAsync();
//                    if (result > 0)
//                    {
//                        return new BusinessResult(Const.SUCCESS_DELETE_PROCESS_STYLE_CODE, Const.SUCCESS_DELETE_PROCESS_STYLE_MESSAGE, result > 0);
//                    }
//                    return new BusinessResult(Const.FAIL_DELETE_PROCESS_STYLE_CODE, Const.FAIL_DELETE_PROCESS_STYLE_MESSAGE, false);
//                }
//                return new BusinessResult(Const.WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_MSG);
//            }
//            catch (Exception ex)
//            {
//                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
//            }
//        }

//        public async Task<BusinessResult> UpdateProcessStyleInfo(UpdateProcessStyleModel updateProcessTyleModel)
//        {
//            try
//            {
//                var checkExistProcessStyle = await _unitOfWork.ProcessStyleRepository.GetByID(updateProcessTyleModel.ProcessStyleId);
//                if (checkExistProcessStyle != null)
//                {
//                    if (updateProcessTyleModel.ProcessStyleName != null)
//                    {
//                        checkExistProcessStyle.ProcessStyleName = updateProcessTyleModel.ProcessStyleName;
//                    }
//                    if (updateProcessTyleModel.Description != null)
//                    {
//                        checkExistProcessStyle.Description = updateProcessTyleModel.Description;
//                    }
//                    checkExistProcessStyle.UpdateDate = DateTime.Now;
//                    var result = await _unitOfWork.SaveAsync();
//                    if (result > 0)
//                    {
//                        return new BusinessResult(Const.SUCCESS_UPDATE_PROCESS_STYLE_CODE, Const.SUCCESS_UPDATE_PROCESS_STYLE_MESSAGE, checkExistProcessStyle);
//                    }
//                    return new BusinessResult(Const.FAIL_UPDATE_PROCESS_STYLE_CODE, Const.FAIL_UPDATE_PROCESS_STYLE_MESSAGE, false);
//                }
//                return new BusinessResult(Const.WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_MSG);
//            }
//            catch (Exception ex)
//            {
//                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
//            }
//        }
//    }
//}
