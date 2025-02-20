using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class GrowthStageRepository : GenericRepository<GrowthStage>, IGrowthStageRepository
    {
        private readonly IpasContext _context;
        public GrowthStageRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<GrowthStage>> GetGrowthStagesByFarmId(int? farmId)
        {
           var result = await _context.GrowthStages.
                Include(x => x.Processes)
                .Include(x => x.Plants)
                .Include(x => x.Plans)
                .Include(x => x.MasterTypes)
                .Include(x => x.Farm).
                Where(x => x.FarmID == farmId).ToListAsync();
            return result;
        }
    }
}
