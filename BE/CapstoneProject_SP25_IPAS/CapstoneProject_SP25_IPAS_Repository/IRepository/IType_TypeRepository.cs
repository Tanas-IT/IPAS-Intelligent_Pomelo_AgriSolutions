using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IType_TypeRepository
    {
        public Task<List<Type_Type>> GetAllNoPagin(Expression<Func<Type_Type, bool>> filter = null!, Func<IQueryable<Type_Type>, IOrderedQueryable<Type_Type>> orderBy = null!);

    }
}
