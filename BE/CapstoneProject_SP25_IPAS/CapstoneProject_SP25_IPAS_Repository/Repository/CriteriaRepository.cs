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
    public class CriteriaRepository : GenericRepository<Criteria>, ICriteriaRepository
    {
        private readonly IpasContext _context;

        public CriteriaRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public virtual async Task<IEnumerable<Criteria>> GetForExport(
            Expression<Func<Criteria, bool>> filter = null!,
            Func<IQueryable<Criteria>, IOrderedQueryable<Criteria>> orderBy = null!
           )
        {
            IQueryable<Criteria> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (orderBy != null)
            {
                query = orderBy(query);
            }
            query = query.Include(x => x.MasterType);
            return await query.AsNoTracking().ToListAsync();

        }
    }
}
