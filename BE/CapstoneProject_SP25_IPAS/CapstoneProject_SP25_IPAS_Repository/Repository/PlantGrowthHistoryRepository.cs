using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class PlantGrowthHistoryRepository : GenericRepository<PlantGrowthHistory>, IPlantGrowthHistoryRepository
    {
        private readonly IpasContext _context;
        public PlantGrowthHistoryRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PlantGrowthHistory> GetGrowthHistoryById(int id)
        {
            var plantGrowthHistory = await _context.PlantGrowthHistories
                .Include(x => x.Plant)
                .ThenInclude(x => x.LandRow)
                .ThenInclude(x => x.LandPlot)
                .FirstOrDefaultAsync(x => x.PlantGrowthHistoryId == id);
            return plantGrowthHistory;
        }

        public async Task<List<PlantGrowthHistory>> GetGrowthHistoryByPlantId(int id)
        {
            var result = await _context.PlantGrowthHistories
                .Include(x => x.Resources)
                .Where(x => x.PlantId == id).ToListAsync();
            return result;
        }
    }
}
