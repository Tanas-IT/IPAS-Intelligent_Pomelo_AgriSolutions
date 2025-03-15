using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Razor.Internal;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class CriteriaTargetRepository : GenericRepository<CriteriaTarget>, ICriteriaTargetRepository
    {
        private readonly IpasContext _context;
        public CriteriaTargetRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CriteriaTarget>> GetAllCriteriaOfTargetNoPaging(int? plantId = null, int? graftedPlantId = null, int? plantLotId = null)
        {
            var query = _context.CriteriaTargets
                .Include(x => x.Criteria)
                .ThenInclude(x => x.MasterType)
                .AsQueryable();

            if (plantId.HasValue)
                query = query.Where(x => x.PlantID == plantId);
            else if (graftedPlantId.HasValue)
                query = query.Where(x => x.GraftedPlantID == graftedPlantId);
            else if (plantLotId.HasValue)
                query = query.Where(x => x.PlantLotID == plantLotId);

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<CriteriaTarget>> GetForDelete(
            Expression<Func<CriteriaTarget, bool>> filter = null!)
        {
            IQueryable<CriteriaTarget> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            query = query.Include(x => x.Criteria)
                .ThenInclude(x => x.MasterType);
            return await query.AsNoTracking().ToListAsync();

        }
    }
}
