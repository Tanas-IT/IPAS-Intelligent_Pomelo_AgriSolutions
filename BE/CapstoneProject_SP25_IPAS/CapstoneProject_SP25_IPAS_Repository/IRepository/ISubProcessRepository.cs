using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface ISubProcessRepository
    {
        public Task<Process> GetProcessBySubProcessId(int subProcessId);
        public Task<List<SubProcess>> GetSubProcessByProcessId(int processId);
        public Task<List<SubProcess>> GetAllByProcessOrParentAsync(int processId);
        public Task<List<SubProcess>> GetAllByProcessOrParentForRedoAsync(int? processId, int? subProcessId);
    }
}
