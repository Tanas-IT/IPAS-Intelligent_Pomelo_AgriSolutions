using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IGraftedPlantService
    {
        public Task<BusinessResult> createGraftedPlantAsync(CreateGraftedPlantRequest createRequest);
        public Task<BusinessResult> updateGraftedPlantAsync(UpdateGraftedPlantRequest updateRequest);
        public Task<BusinessResult> getAllGraftedPagin(GetGraftedPaginRequest getRequest, PaginationParameter paginationParameter);
        public Task<BusinessResult> getAllGraftedByPlantPagin(GetGraftedByPlantRequest getRequest, PaginationParameter paginationParameter);
        public Task<BusinessResult> getGraftedByIdAsync(int graftedPlantId);

        public Task<BusinessResult> deletePermanentlyGrafteAsync(List<int> graftedPlantId);
        public Task<BusinessResult> deteSoftedGraftedAsync(List<int> graftedPlantId);
        public Task<BusinessResult> getGraftedForSelected(int farmId);
        public Task<BusinessResult> CheckGraftedConditionAppliedAsync(int? plantId, int? graftedId);

        public Task<BusinessResult> getHistoryOfGraftedPlant(int farmId, int plantId);
        public Task<BusinessResult> CompletedGraftedPlant(CompletedGraftedPlantRequest request);
        public Task<BusinessResult> GroupGraftedPlantsIntoPlantLot(GroupingGraftedRequest request);
        public Task<BusinessResult> CreatePlantFromGrafted(CreatePlantFromGraftedRequest request);
        public Task<BusinessResult> UngroupGraftedPlants(List<int> graftedPlantIds);
        public Task<BusinessResult> markDeadGraftedAsync(List<int> graftedPlantIdsDead);


    }
}
