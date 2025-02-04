using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IPlantGrowthHistoryService
    {
        public Task<BusinessResult> createPlantGrowthHistory(PlantGrowthHistoryCreateRequest historyCreateRequest);
        public Task<BusinessResult> updatePlantGrowthHistory(PlantGrowthHistoryUpdateRequest historyUpdateRequest);
        public Task<BusinessResult> getPlantGrowthById(int plantGrowthHistoryId);
        public Task<BusinessResult> getAllHistoryOfPlantById(int plantId);
        public Task<BusinessResult> deleteGrowthHistory(int plantGrowthHistoryId);
    }
}
