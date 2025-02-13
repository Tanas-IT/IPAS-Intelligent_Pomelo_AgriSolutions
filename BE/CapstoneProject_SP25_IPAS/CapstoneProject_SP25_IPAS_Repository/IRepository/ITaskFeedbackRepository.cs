using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface ITaskFeedbackRepository
    {
        public Task<int> GetLastTaskFeedbackSequence();
        public Task<List<TaskFeedback>> GetListTaskFeedbackByManagerId(int managerId);
        public Task<List<TaskFeedback>> GetListTaskFeedbackByWorkLogId(int workLogId);
    }
}
