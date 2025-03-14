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
    public class Type_TypeRepository : GenericRepository<Type_Type>, IType_TypeRepository
    {
        private readonly IpasContext _context;

        public Type_TypeRepository(IpasContext context) : base(context)
        {
            _context = context;
        }


        public async Task<List<Type_Type>> GetAllNoPaging(Expression<Func<Type_Type, bool>> filter = null!,
            Func<IQueryable<Type_Type>, IOrderedQueryable<Type_Type>> orderBy = null!)
        {
            IQueryable<Type_Type> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (orderBy != null)
            {
                query = orderBy(query);
            }
            query = query.Include(x => x.Product)
                .Include(x => x.CriteriaSet)
                .ThenInclude(x => x.Criterias);
            return await query.AsNoTracking().ToListAsync();
        }

    }
}
