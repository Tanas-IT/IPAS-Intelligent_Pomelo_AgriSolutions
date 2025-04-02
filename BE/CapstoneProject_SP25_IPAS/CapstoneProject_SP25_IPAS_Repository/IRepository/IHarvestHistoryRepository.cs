using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IHarvestHistoryRepository
    {
        public Task<HarvestHistory> GetByID(int harvestId);
        //public Task<IEnumerable<HarvestHistory>> GetHarvestPaginFilterAsync(int cropId, PaginationParameter paginationParameter, HarvestFilter filter);
        public Task<IEnumerable<HarvestHistory>> GetHarvestPaginFilterAsync(Expression<Func<HarvestHistory, bool>> filter = null!,
            Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = null!,
            int? pageIndex = null,
            int? pageSize = null);
        public Task<IEnumerable<ProductHarvestHistory>> GetAllPlantOfHarvesType(int harvestId, int masterTypeId);
        public Task<List<HarvestHistory>> GetHarvestHistoryInclude(int? farmId);
        public Task<IEnumerable<HarvestHistory>> GetAllHarvest(Expression<Func<HarvestHistory, bool>> filter = null!,
           Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = null!);


    }
}
