using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IProcessRepository
    {
        public Task<Process> GetProcessByIdInclude(int processId);
        public Task<List<Process>> GetProcessByTypeName (int farmId, string typeName);
        public Task<Process> GetProcessByIdAsync(int processId);
        public Task<Process> GetProcessByIdForDetail(int processId);
        public Task<Process> GetProcessByIdHasPlanAsync(int processId);
        public Task<IEnumerable<Process>> GetProcessPaging(
         Expression<Func<Process, bool>> filter = null!,
         Func<IQueryable<Process>, IOrderedQueryable<Process>> orderBy = null!,
         int? pageIndex = null,
         int? pageSize = null);
    }
}
