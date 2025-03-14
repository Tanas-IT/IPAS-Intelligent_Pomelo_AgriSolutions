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
    public class HarvestTypeHistoryRepository : GenericRepository<ProductHarvestHistory>, IHarvestTypeHistoryRepository
    {
        private readonly IpasContext _context;

        public HarvestTypeHistoryRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<ProductHarvestHistory>> GetHarvestDataByYear(int year, int? farmId)
        {
            var result = await _context.ProductHarvestHistories
            .Include(ht => ht.HarvestHistory)
            .ThenInclude(hh => hh.Crop)
            .Include(ht => ht.MasterType)
            .Where(ht => ht.HarvestHistory.DateHarvest.HasValue &&
                         ht.HarvestHistory.DateHarvest.Value.Year == year &&
                         ht.HarvestHistory.Crop.FarmId == farmId && ht.HarvestHistory.HarvestStatus.ToLower().Equals("completed"))
            .ToListAsync();
            return result;
        }
    }
}
