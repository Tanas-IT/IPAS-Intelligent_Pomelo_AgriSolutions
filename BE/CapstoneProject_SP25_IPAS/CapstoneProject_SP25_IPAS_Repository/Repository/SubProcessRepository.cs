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
    public class SubProcessRepository : GenericRepository<SubProcess>, ISubProcessRepository
    {
        private readonly IpasContext _context;

        public SubProcessRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Process> GetProcessBySubProcessId(int subProcessId)
        {
            var getSubProcess = await _context.SubProcesses.FirstOrDefaultAsync(x => x.SubProcessID == subProcessId);
            var result = await _context.Processes.FirstOrDefaultAsync(x => x.ProcessId == getSubProcess.ProcessId);
            return result;
        }

        public async Task<List<SubProcess>> GetSubProcessByProcessId(int processId)
        {
            var result = await _context.SubProcesses.Where(x => x.ProcessId == processId).ToListAsync();
            if(result == null || result.Count() <= 0)
            {
                return new List<SubProcess>();
            }
            return result;
        }

        public async Task<List<SubProcess>> GetAllByProcessOrParentAsync(int processId)
        {
            var allSubProcesses = await _context.SubProcesses
                .AsNoTracking()
                .ToListAsync();

            // Tạo map cho nhanh
            var subProcessMap = allSubProcesses.ToDictionary(sp => sp.SubProcessID, sp => sp);

            // Lấy các SubProcess gốc (có ProcessId = processId)
            var rootSubProcesses = allSubProcesses
                .Where(sp => sp.ProcessId == processId)
                .ToList();

            var resultSet = new HashSet<SubProcess>();

            // Hàm đệ quy lấy tất cả SubProcess con
            void AddSubTree(SubProcess sp)
            {
                if (resultSet.Contains(sp)) return;
                resultSet.Add(sp);

                var children = allSubProcesses.Where(c => c.ParentSubProcessId == sp.SubProcessID);
                foreach (var child in children)
                {
                    AddSubTree(child);
                }
            }

            foreach (var root in rootSubProcesses)
            {
                AddSubTree(root);
            }

            return resultSet.ToList();
        }
    }
}
