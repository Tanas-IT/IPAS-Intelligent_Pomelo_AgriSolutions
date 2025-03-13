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
    public class GrowthStageMasterTypeRepository : GenericRepository<GrowthStageMasterType>, IGrowthStageMasterTypeRepository
    {
        private readonly IpasContext _context;

        public GrowthStageMasterTypeRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<GrowthStageMasterType>> GetGrowthStageMasterTypeByFarmId(int farmId)
        {
            var result = await _context.GrowthStageMasterTypes
                .Include(x => x.GrowthStage)
                .Include(x => x.MasterType)
                .Where(x => x.FarmID == farmId).ToListAsync();
            return result;
        }
    }
}
