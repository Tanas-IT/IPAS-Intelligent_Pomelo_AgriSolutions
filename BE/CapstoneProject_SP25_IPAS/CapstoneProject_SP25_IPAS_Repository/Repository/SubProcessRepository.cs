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
    }
}
