using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using Process = CapstoneProject_SP25_IPAS_BussinessObject.Entities.Process;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class ProcessRepository : GenericRepository<Process>, IProcessRepository
    {
        private readonly IpasContext _context;

        public ProcessRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Process> GetListProcessById(int processId)
        {
            var result = await _context.Processes
                                .Include(x => x.GrowthStage)
                                .Include(x => x.MasterType)
                                .Include(x => x.Farm)
                                .Include(x => x.Plans)
                                .Include(x => x.SubProcesses)
                                .ThenInclude(x => x.Plans).FirstOrDefaultAsync(x => x.ProcessId == processId);
            return result;
        }
    }
}
