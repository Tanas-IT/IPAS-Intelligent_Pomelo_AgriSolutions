using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using MailKit.Search;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class GraftedPlantRepository : GenericRepository<GraftedPlant>, IGraftedPlantRepository
    {
        private readonly IpasContext _context;

        public GraftedPlantRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<GraftedPlant>> GetAllNoPaging(
            Expression<Func<GraftedPlant, bool>> filter = null!)

        {
            IQueryable<GraftedPlant> query = dbSet.Where(x => x.IsDeleted == false);
            if (filter != null)
            {
                query = query.Where(filter);
            }
            query = query.OrderBy(x => x.GraftedPlantId);
            //query.Include(x => x.Resources)
            query.Include(x => x.PlanTargets)
            .Include(x => x.CriteriaTargets)
            .Include(x => x.GraftedPlantNotes);
            return await query.AsNoTracking().ToListAsync();

        }

        public virtual async Task<IEnumerable<GraftedPlant>> Get(
           Expression<Func<GraftedPlant, bool>> filter = null!,
           Func<IQueryable<GraftedPlant>, IOrderedQueryable<GraftedPlant>> orderBy = null!,
           int? pageIndex = null,
           int? pageSize = null)
        {
            IQueryable<GraftedPlant> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            query = query.Include(x => x.Plant)
                .ThenInclude(x => x.MasterType)
                .Include(x => x.PlantLot);
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

        public async Task<GraftedPlant> GetGraftedPlantById(int graftedPlantId)
        {
            var result = await _context.GraftedPlants
                .Include(x => x.PlantLot)
                .Include(x => x.Plant)
                .ThenInclude(x => x.LandRow)
                .ThenInclude(x => x.LandPlot)
                .Include(x => x.Plant.MasterType)
                .FirstOrDefaultAsync(x => x.GraftedPlantId == graftedPlantId && x.IsDeleted == false);
            return result;
        }
    }
}
