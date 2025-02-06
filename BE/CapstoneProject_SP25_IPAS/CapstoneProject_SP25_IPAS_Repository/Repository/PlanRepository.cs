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
    public class PlanRepository : GenericRepository<Plan>, IPlanRepository
    {
        private readonly IpasContext _context;

        public PlanRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> GetLastPlanSequence()
        {
          var lastPlanId =  await _context.Plans
                 .OrderByDescending(p => p.PlanId) // Lấy mã lớn nhất
                 .Select(p => p.PlanId)
                 .FirstOrDefaultAsync();
            return lastPlanId;
        }
    }
}
