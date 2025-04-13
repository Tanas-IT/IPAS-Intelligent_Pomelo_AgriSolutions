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
        public async Task<List<SubProcess>> GetAllByProcessOrParentForRedoAsync(int? processId, int? subProcessId)
        {
            var result = new List<SubProcess>();
            var all = new List<SubProcess>();

            if (processId.HasValue)
            {
                all = await _context.SubProcesses
                    .Where(x => x.ProcessId == processId && x.IsDeleted == false)
                    .ToListAsync();
            }
            else if (subProcessId.HasValue)
            {
                var root = await _context.SubProcesses.FirstOrDefaultAsync(x => x.SubProcessID == subProcessId && x.IsDeleted == false);
                if (root != null)
                {
                    all = await _context.SubProcesses
                        .Where(x => x.ProcessId == root.ProcessId && x.IsDeleted == false)
                        .ToListAsync();
                }
            }

            if (!all.Any()) return result;

            var subProcessMap = all.ToDictionary(x => x.SubProcessID, x => x);

            if (subProcessId.HasValue && subProcessMap.TryGetValue(subProcessId.Value, out var current))
            {
                var currentOrder = current.Order ?? 0;
                var currentParentId = current.ParentSubProcessId;
                var currentProcessId = current.ProcessId;

                // 1. Thêm chính nó và toàn bộ cây con cháu
                var queue = new Queue<SubProcess>();
                queue.Enqueue(current);
                result.Add(current);

                while (queue.Any())
                {
                    var node = queue.Dequeue();
                    var children = all.Where(x => x.ParentSubProcessId == node.SubProcessID);
                    foreach (var child in children)
                    {
                        if (!result.Any(x => x.SubProcessID == child.SubProcessID))
                        {
                            result.Add(child);
                            queue.Enqueue(child);
                        }
                    }
                }

                // 2. Thêm các subprocess "sau" cùng cấp hoặc top-level
                var relatedByOrder = all.Where(sp =>
                    sp.SubProcessID != current.SubProcessID &&
                    (
                        // Cùng Parent
                        (sp.ParentSubProcessId == currentParentId && (sp.Order ?? 0) > currentOrder)
                        ||
                        // Cùng Process, cả hai không có Parent (top-level)
                        (sp.ParentSubProcessId == null && currentParentId == null && sp.ProcessId == currentProcessId && (sp.Order ?? 0) > currentOrder)
                    )).ToList();

                foreach (var sp in relatedByOrder)
                {
                    if (!result.Any(x => x.SubProcessID == sp.SubProcessID))
                        result.Add(sp);
                }
            }
            else
            {
                // Không có subProcessId → trả về hết process
                result.AddRange(all);
            }

            return result;
        }
    }
}
