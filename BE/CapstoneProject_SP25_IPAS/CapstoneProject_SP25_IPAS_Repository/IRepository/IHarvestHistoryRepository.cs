using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IHarvestHistoryRepository
    {
        public Task<HarvestHistory> GetByID(int harvestId);
        public Task<IEnumerable<HarvestHistory>> GetHarvestPaginFilterAsync(int cropId, PaginationParameter paginationParameter, HarvestFilter filter);
        public Task<IEnumerable<HarvestTypeHistory>> GetAllPlantOfHarvesType(int harvestId, int masterTypeId);
        public Task<List<HarvestHistory>> GetHarvestHistoryInclude();
    }
}
