using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest.ProductHarvestRequest;
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
        public Task<BusinessResult> getHarvestByCode(string harvestCode);
        public Task<BusinessResult> getHarvestForSelectedByPlotId(int cropId);

        public Task<BusinessResult> createProductHarvestHistory(CreateHarvestTypeHistoryRequest createRequest);
        public Task<BusinessResult> createPlantRecordHarvest(CreatePlantRecordHarvestRequest createRequest);

        public Task<BusinessResult> updateProductHarvest(UpdateProductHarvesRequest updateRequest);
        public Task<BusinessResult> getAllHistoryPlantOfHarvest(int harvestId, int masterTypeId);
        //public Task<BusinessResult> deleteProductHarvest(int harvestHistory, int masterTypeId, int? plantId);
        public Task<BusinessResult> deleteProductHarvest(int harvestHistory, int masterTypeId);
        public Task<BusinessResult> deletePlantRecord(DeletePlantRecoredRequest request);
        public Task<BusinessResult> SoftedDeleted(List<int> harvestHistoryId);
        public Task<BusinessResult> StatisticOfPlantByYear(GetStatictisOfPlantByYearRequest request);
        public Task<BusinessResult> getProductInHarvestForSelected(int harvestId);
        public Task<BusinessResult> GetTopPlantsByYear(GetTopStatisticByYearRequest request);
        public Task<BusinessResult> GetTopPlantsByCrop(GetTopStatisticByCropRequest request);


    }
}
