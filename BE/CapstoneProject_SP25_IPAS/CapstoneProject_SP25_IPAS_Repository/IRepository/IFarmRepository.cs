using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IFarmRepository
    {
        public Task<IEnumerable<Farm>> Get(
            Expression<Func<Farm, bool>> filter = null!,
            Func<IQueryable<Farm>, IOrderedQueryable<Farm>> orderBy = null!,
            int? pageIndex = null, 
            int? pageSize = null);
        public Task<Farm> GetFarmById(int farmId);

        public Task<int> GetLastFarmID();

        public Task<List<UserFarm>> GetEmployeeOfFarmByRole(int farmId, List<int> roleIds);
        public Task<List<Farm>> GetAllFarmOfSystem();

    }
}
