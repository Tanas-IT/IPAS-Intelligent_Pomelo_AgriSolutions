using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IPlantService
    {
        public Task<BusinessResult> getById(int plantId);
        //public Task<BusinessResult> getAllPlantOfPlot(int landplotId, PaginationParameter paginationParameter);
        //public Task<BusinessResult> getAllPlantOfFarm(int farmId, PaginationParameter paginationParameter);
        public Task<BusinessResult> createPlant(PlantCreateRequest plantCreateRequest);
        public Task<BusinessResult> updatePlant(PlantUpdateRequest plantUpdateRequest);
        public Task<BusinessResult> deletePlant(int plantId);
        public Task<BusinessResult> deleteMultiplePlant(List<int> ids);
        public Task<BusinessResult> ImportPlantAsync(ImportExcelRequest request);
        public Task<BusinessResult> getPlantInPlotForSelected(int plotId);
        public Task<BusinessResult> getPlantInRowForSelected(int rowId);
        public Task<BusinessResult> getPlantPagin(GetPlantPaginRequest request, PaginationParameter paginationParameter);
        public Task<BusinessResult> SoftedMultipleDelete(List<int> plantIdList);
        public Task<BusinessResult> getPlantNotYetPlanting(int farmId);
        public Task<BusinessResult> getPlantByGrowthActiveFunc(int farmId, string activeFunction);
        //public Task<BusinessResult> CheckIfPlantCanBeGraftedAsync(int plantId, string targetType);
    }
}
