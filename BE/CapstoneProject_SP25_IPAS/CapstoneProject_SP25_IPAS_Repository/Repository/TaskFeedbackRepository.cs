using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class TaskFeedbackRepository : GenericRepository<TaskFeedback>, ITaskFeedbackRepository
    {
        private readonly IpasContext _context;

        public TaskFeedbackRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> GetLastTaskFeedbackSequence()
        {
                var lastTaskFeedbackId = await _context.TaskFeedbacks
                       .OrderByDescending(p => p.TaskFeedbackId) // Lấy mã lớn nhất
                       .Select(p => p.TaskFeedbackId)
                       .FirstOrDefaultAsync();
                return lastTaskFeedbackId;
        }

        public async Task<List<TaskFeedback>> GetListTaskFeedbackByManagerId(int managerId)
        {
            var listTaskFeedback = await _context.TaskFeedbacks.Where(x => x.ManagerId == managerId).ToListAsync();
            return listTaskFeedback;
        }

        public async Task<List<TaskFeedback>> GetListTaskFeedbackByWorkLogId(int workLogId)
        {
            var listTaskFeedback = await _context.TaskFeedbacks.Where(x => x.WorkLogId == workLogId).ToListAsync();
            return listTaskFeedback;
        }
    }
}
