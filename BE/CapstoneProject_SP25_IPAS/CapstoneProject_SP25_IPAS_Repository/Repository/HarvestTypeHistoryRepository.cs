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
            .Include(ht => ht.Product)
            .Where(ht => ht.HarvestHistory.DateHarvest.HasValue &&
                         ht.HarvestHistory.DateHarvest.Value.Year == year &&
                         ht.HarvestHistory.Crop.FarmId == farmId && ht.HarvestHistory.HarvestStatus.ToLower().Equals("completed"))
            .ToListAsync();
            return result;
        }

        public async Task<IEnumerable<ProductHarvestHistory>> getToTopStatistic(
            Expression<Func<ProductHarvestHistory, bool>> filter = null!,
            Func<IQueryable<ProductHarvestHistory>, IOrderedQueryable<ProductHarvestHistory>> orderBy = null!)
        {
            IQueryable<ProductHarvestHistory> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            query = query.Include(x => x.Plant)
                .ThenInclude(x => x!.LandRow)
                .ThenInclude(x => x!.LandPlot)
                .Include(x => x.Plant!.MasterType)
                .Include(x => x.Plant!.GrowthStage)
                .Include(x => x.HarvestHistory); ;

            return await query.AsNoTracking().ToListAsync();

        }

        public async Task<IEnumerable<ProductHarvestHistory>> getPlantLogHarvestPagin(
       Expression<Func<ProductHarvestHistory, bool>> filter = null!,
            Func<IQueryable<ProductHarvestHistory>, IOrderedQueryable<ProductHarvestHistory>> orderBy = null!,
            int? pageIndex = null, // Optional parameter for pagination (page number)
            int? pageSize = null)  // Optional parameter for pagination (number of records per page)
        {
            IQueryable<ProductHarvestHistory> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            query = query.Include(h => h.Plant)
                .Include(h => h.HarvestHistory)
                .ThenInclude(h => h.Crop)
                .Include(h => h.Product)
                .Include(x => x.User);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Implementing pagination
            if (pageIndex.HasValue && pageSize.HasValue)
            {
                // Ensure the pageIndex and pageSize are valid
                int validPageIndex = pageIndex.Value > 0 ? pageIndex.Value - 1 : 0;
                int validPageSize = pageSize.Value > 0 ? pageSize.Value : 5; // Assuming a default pageSize of 10 if an invalid value is passed

                query = query.Skip(validPageIndex * validPageSize).Take(validPageSize);
            }

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<List<ProductHarvestHistory>> GetAllProductHarvestHistory(int farmId)
        {
            var result = await _context.ProductHarvestHistories
                                    .Include(x => x.Plant)
                                    .ThenInclude(x => x.LandRow)
                                    .ThenInclude(x => x.LandPlot)
                                    .Where(x => x.Plant.LandRow.LandPlot.FarmId == farmId).ToListAsync();
            return result;

        }
    }
}
