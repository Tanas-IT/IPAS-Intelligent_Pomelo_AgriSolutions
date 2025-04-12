using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IProcessRepository
    {
        public Task<Process> GetProcessByIdInclude(int processId);
        public Task<List<Process>> GetProcessByTypeName (int farmId, string typeName);
        public Task<Process> GetProcessByIdAsync(int processId);
    }
}
