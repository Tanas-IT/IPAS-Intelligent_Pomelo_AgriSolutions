using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.TaskFeedbackModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ITaskFeedbackService
    {
        public Task<BusinessResult> GetTaskFeedbackByID(int taskFeedbackId);

        public Task<BusinessResult> GetAllTaskFeedbackPagination(PaginationParameter paginationParameter, TaskFeedbackFilter taskFeedbackFilter);

        public Task<BusinessResult> CreateTaskFeedback(CreateTaskFeedbackModel createTaskFeedbackModel);

        public Task<BusinessResult> UpdateTaskFeedbackInfo(UpdateTaskFeedbackModel updateTaskFeedbackModel);

        public Task<BusinessResult> PermanentlyDeleteTaskFeedback(int taskFeedbackId);

        public Task<BusinessResult> GetTaskFeedbackByManagerId(int managerId);
        public Task<BusinessResult> GetTaskFeedbackByWorkLogId(int workLogId);
    }
}
