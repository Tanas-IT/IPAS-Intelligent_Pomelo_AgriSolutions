using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IHarvestHistoryService
    {
        public Task<BusinessResult> createHarvestHistory(CreateHarvestHistoryRequest createRequest);
        public Task<BusinessResult> updateHarvestHistoryInfo(UpdateHarvestHistoryRequest updateRequest);
        public Task<BusinessResult> getHarvestHistoryByCrop(int cropId, PaginationParameter paginationParameter, HarvestFilter filter);
        public Task<BusinessResult> deleteHarvestHistory(int harvestHistory);
        public Task<BusinessResult> getHarvestById(int harvestId);
        public Task<BusinessResult> getHarvestForSelectedByPlotId(int cropId);

        public Task<BusinessResult> createHarvesTypeHistory(CreateHarvestTypeHistoryRequest createRequest);
        public Task<BusinessResult> updateHarvesTypeHistory(UpdateHarvesTypeHistoryRequest updateRequest);
        public Task<BusinessResult> getAllHistoryPlantOfHarvest(int harvestId, int masterTypeId);
        public Task<BusinessResult> deleteHarvestType(int harvestHistory, int masterTypeId, int? plantId);
    }
}
