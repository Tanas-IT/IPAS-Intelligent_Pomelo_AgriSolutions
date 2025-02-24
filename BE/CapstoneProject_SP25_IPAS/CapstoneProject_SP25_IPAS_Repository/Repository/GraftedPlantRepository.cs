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
                query =  query.OrderBy(x => x.GraftedPlantId);
            //query.Include(x => x.Resources)
                query.Include(x => x.PlanTargets)
                .Include(x => x.CriteriaTargets)
                .Include(x => x.GraftedPlantNotes);
            return await query.AsNoTracking().ToListAsync();

        }
    }
}
