using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.TaskFeedbackModels;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.TaskFeedbackRequest;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class TaskFeedbackService : ITaskFeedbackService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TaskFeedbackService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CreateTaskFeedback(CreateTaskFeedbackModel createTaskFeedbackModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var newTaskFeedback = new TaskFeedback()
                    {
                        TaskFeedbackCode = "TFB" + " - " + createTaskFeedbackModel.WorkLogId + " - " + DateTime.Now.Day.ToString(),
                        CreateDate = DateTime.Now,
                        Content = createTaskFeedbackModel.Content,
                        ManagerId = createTaskFeedbackModel.ManagerId,
                        WorkLogId = createTaskFeedbackModel.WorkLogId
                    };
                    var getWorkLog = await _unitOfWork.WorkLogRepository.GetByID(createTaskFeedbackModel.WorkLogId != null ? createTaskFeedbackModel.WorkLogId.Value : -1);
                    if(createTaskFeedbackModel.Status != null && getWorkLog != null)
                    {
                        if(createTaskFeedbackModel.Status.ToLower().Equals("redo") || createTaskFeedbackModel.Status.ToLower().Equals("failed"))
                        {
                            getWorkLog.Status = "Redo";
                            getWorkLog.ReasonDelay = createTaskFeedbackModel.Reason;
                        }
                        else
                        {
                            getWorkLog.Status = createTaskFeedbackModel.Status;
                        }
                        _unitOfWork.WorkLogRepository.Update(getWorkLog);
                    }

                    await _unitOfWork.TaskFeedbackRepository.Insert(newTaskFeedback);

                    var checkInsertTaskFeedback = await _unitOfWork.SaveAsync();
                    await transaction.CommitAsync();
                    if (checkInsertTaskFeedback > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_TASK_FEEDBACK_CODE, Const.SUCCESS_CREATE_TASK_FEEDBACK_MSG, true);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_TASK_FEEDBACK_CODE, Const.FAIL_CREATE_TASK_FEEDBACK_MSG, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }

            }
        }

        public async Task<BusinessResult> GetAllTaskFeedbackPagination(PaginationParameter paginationParameter, TaskFeedbackFilter taskFeedbackFilter)
        {
            try
            {
                Expression<Func<TaskFeedback, bool>> filter = null!;
                Func<IQueryable<TaskFeedback>, IOrderedQueryable<TaskFeedback>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.TaskFeedbackId == validInt);
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = filter.And(x => x.CreateDate == validDate);
                    }
                    else
                    {
                        filter = x => x.TaskFeedbackCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Manager.FullName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Content.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.WorkLog.WorkLogName.ToLower().Contains(paginationParameter.Search.ToLower());
                    }
                }

                if (taskFeedbackFilter.CreateDate.HasValue)
                {
                    filter = filter.And(x => x.CreateDate == taskFeedbackFilter.CreateDate);
                }

                if (taskFeedbackFilter.TaskFeedbackId > 0)
                    filter = filter.And(x => x.TaskFeedbackId == taskFeedbackFilter.TaskFeedbackId);
                if (taskFeedbackFilter.Content != null)
                    filter = filter.And(x => x.Content.ToLower().Contains(taskFeedbackFilter.Content.ToLower()));
                if (taskFeedbackFilter.ManagerName != null)
                {
                    List<string> filterList = taskFeedbackFilter.ManagerName.Split(',', StringSplitOptions.TrimEntries)
                               .Select(f => f.ToLower()) // Chuyển về chữ thường
                               .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.Manager.FullName.ToLower().Contains(item));
                    }
                }

                if (taskFeedbackFilter.WorkLogName != null)
                {
                    List<string> filterList = taskFeedbackFilter.WorkLogName.Split(',', StringSplitOptions.TrimEntries)
                               .Select(f => f.ToLower()) // Chuyển về chữ thường
                               .ToList();

                    foreach (var item in filterList)
                    {
                        filter = filter.And(x => x.WorkLog.WorkLogName.ToLower().Contains(item));
                    }
                }
                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "taskfeedbackid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.TaskFeedbackId)
                                   : x => x.OrderBy(x => x.TaskFeedbackId)) : x => x.OrderBy(x => x.TaskFeedbackId);
                        break;
                    case "taskfeedbackcode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.TaskFeedbackCode)
                                   : x => x.OrderBy(x => x.TaskFeedbackCode)) : x => x.OrderBy(x => x.TaskFeedbackCode);
                        break;
                    case "content":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Content)
                                   : x => x.OrderBy(x => x.Content)) : x => x.OrderBy(x => x.Content);
                        break;
                    case "manangername":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Manager.FullName)
                                   : x => x.OrderBy(x => x.Manager.FullName)) : x => x.OrderBy(x => x.Manager.FullName);
                        break;
                    case "worklogname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.WorkLog.WorkLogName)
                                   : x => x.OrderBy(x => x.WorkLog.WorkLogName)) : x => x.OrderBy(x => x.WorkLog.WorkLogName);
                        break;
                    case "createdate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.CreateDate)
                                   : x => x.OrderBy(x => x.CreateDate)) : x => x.OrderBy(x => x.CreateDate);
                        break;

                    default:
                        orderBy = x => x.OrderBy(x => x.TaskFeedbackId);
                        break;
                }
                string includeProperties = "Manager,WorkLog";
                var entities = await _unitOfWork.TaskFeedbackRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<TaskFeedbackModel>();
                pagin.List = _mapper.Map<IEnumerable<TaskFeedbackModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.TaskFeedbackRepository.Count();
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_TASK_FEEDBACK_CODE, Const.SUCCESS_GET_ALL_TASK_FEEDBACK_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_TASK_FEEDBACK_NOT_EXIST_CODE, Const.WARNING_TASK_FEEDBACK_NOT_EXIST_MSG, new PageEntity<TaskFeedbackModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetTaskFeedbackByID(int taskFeedbackId)
        {
            try
            {
                var getTaskFeedback = await _unitOfWork.TaskFeedbackRepository.GetByCondition(x => x.TaskFeedbackId == taskFeedbackId, "WorkLog,Manager");
                if (getTaskFeedback != null)
                {
                    //var getTaskFeedbackModel = _mapper.Map<List<TaskFeedbackModel>>(getTaskFeedback);
                    var getTaskFeedbackModel = _mapper.Map<TaskFeedbackModel>(getTaskFeedback);
                    return new BusinessResult(Const.SUCCESS_GET_TASK_FEEDBACK_BY_ID_CODE, Const.SUCCESS_GET_TASK_FEEDBACK_BY_ID_MSG, getTaskFeedbackModel);
                }
                return new BusinessResult(Const.WARNING_TASK_FEEDBACK_NOT_EXIST_CODE, Const.WARNING_TASK_FEEDBACK_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetTaskFeedbackByManagerId(int managerId)
        {
            try
            {
                var listTaskFeedback = await _unitOfWork.TaskFeedbackRepository.GetListTaskFeedbackByManagerId(managerId);
                if (listTaskFeedback.Count() > 0)
                {
                    var listTaskFeedbackModel = _mapper.Map<List<TaskFeedbackModel>>(listTaskFeedback);
                    return new BusinessResult(Const.SUCCESS_GET_TASK_FEEDBACK_BY_MANAGER_ID_CODE, Const.SUCCESS_GET_TASK_FEEDBACK_BY_MANAGER_ID_MSG, listTaskFeedbackModel);
                }
                return new BusinessResult(Const.WARNING_TASK_FEEDBACK_NOT_EXIST_CODE, Const.WARNING_TASK_FEEDBACK_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetTaskFeedbackByWorkLogId(int workLogId)
        {
            try
            {
                var listTaskFeedback = await _unitOfWork.TaskFeedbackRepository.GetListTaskFeedbackByWorkLogId(workLogId);
                if (listTaskFeedback.Count() > 0)
                {
                    var listTaskFeedbackModel = _mapper.Map<List<TaskFeedbackModel>>(listTaskFeedback);
                    return new BusinessResult(Const.SUCCESS_GET_TASK_FEEDBACK_BY_WORK_LOG_ID_CODE, Const.SUCCESS_GET_TASK_FEEDBACK_BY_WORK_LOG_ID_MSG, listTaskFeedbackModel);
                }
                return new BusinessResult(Const.WARNING_TASK_FEEDBACK_NOT_EXIST_CODE, Const.WARNING_TASK_FEEDBACK_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PermanentlyDeleteTaskFeedback(int taskFeedbackId)
        {
            try
            {
                var checkExistTaskFeedback = await _unitOfWork.TaskFeedbackRepository.GetByCondition(x => x.TaskFeedbackId == taskFeedbackId, "Manager,WorkLog");
                if (checkExistTaskFeedback != null)
                {
                    _unitOfWork.TaskFeedbackRepository.Delete(checkExistTaskFeedback);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_DELETE_TASK_FEEDBACK_CODE, Const.SUCCESS_DELETE_TASK_FEEDBACK_MSG, result > 0);
                    }
                    return new BusinessResult(Const.FAIL_DELETE_TASK_FEEDBACK_CODE, Const.FAIL_DELETE_TASK_FEEDBACK_MSG, false);
                }
                return new BusinessResult(Const.WARNING_TASK_FEEDBACK_NOT_EXIST_CODE, Const.WARNING_TASK_FEEDBACK_NOT_EXIST_MSG);

            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateTaskFeedbackInfo(UpdateTaskFeedbackModel updateTaskFeedbackModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkExistTaskFeedback = await _unitOfWork.TaskFeedbackRepository.GetByID(updateTaskFeedbackModel.TaskFeedbackId);
                    var getWorkLog = await _unitOfWork.WorkLogRepository.GetByID(checkExistTaskFeedback.WorkLogId != null ? checkExistTaskFeedback.WorkLogId.Value : -1);
                    if(getWorkLog != null && getWorkLog.Status != null)
                    {
                        if(getWorkLog.Status.ToLower().Equals("done"))
                        {
                            return new BusinessResult(400, "This workLog is done. Can not update task feedback");
                        }
                    }
                    if (checkExistTaskFeedback != null)
                    {
                        if (!string.IsNullOrEmpty(updateTaskFeedbackModel.Content))
                        {
                            checkExistTaskFeedback.Content = updateTaskFeedbackModel.Content;
                        }
                        if (updateTaskFeedbackModel.Status != null && getWorkLog != null)
                        {
                            if (updateTaskFeedbackModel.Status.ToLower().Equals("redo"))
                            {
                                getWorkLog.Status = "Redo";
                                getWorkLog.ReasonDelay = updateTaskFeedbackModel.Reason;
                            }
                            else
                            {
                                getWorkLog.Status = updateTaskFeedbackModel.Status;
                            }
                            _unitOfWork.WorkLogRepository.Update(getWorkLog);
                        }

                        //if (updateTaskFeedbackModel.ManagerId.HasValue)
                        //{
                        //    checkExistTaskFeedback.ManagerId = updateTaskFeedbackModel.ManagerId;
                        //}
                        if (updateTaskFeedbackModel.WorkLogId != null)
                        {
                            checkExistTaskFeedback.WorkLogId = updateTaskFeedbackModel.WorkLogId;
                        }
                        _unitOfWork.TaskFeedbackRepository.Update(checkExistTaskFeedback);
                        var result = await _unitOfWork.SaveAsync();
                        if (result > 0)
                        {
                            await transaction.CommitAsync();
                            return new BusinessResult(Const.SUCCESS_UPDATE_TASK_FEEDBACK_CODE, Const.SUCCESS_UPDATE_TASK_FEEDBACK_MSG, checkExistTaskFeedback);
                        }
                        else
                        {
                            await transaction.RollbackAsync();
                            return new BusinessResult(Const.FAIL_UPDATE_TASK_FEEDBACK_CODE, Const.FAIL_UPDATE_TASK_FEEDBACK_MSG, false);
                        }

                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.WARNING_TASK_FEEDBACK_NOT_EXIST_CODE, Const.WARNING_TASK_FEEDBACK_NOT_EXIST_MSG);
                    }

                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        private async Task<string> GetNextSequenceNumber()
        {
            int lastNumber = await _unitOfWork.TaskFeedbackRepository.GetLastTaskFeedbackSequence(); // Hàm lấy số thứ tự gần nhất từ DB
            int nextTaskFeedbackId = lastNumber + 1;

            // Xác định số chữ số cần hiển thị
            int digitCount = nextTaskFeedbackId.ToString().Length; // Số chữ số thực tế
            string sequence = nextTaskFeedbackId.ToString($"D{digitCount}");
            return sequence;
        }
    }
}
