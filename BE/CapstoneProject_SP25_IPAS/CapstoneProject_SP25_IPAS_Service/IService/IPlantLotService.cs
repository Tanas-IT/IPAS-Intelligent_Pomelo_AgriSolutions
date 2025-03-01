using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IPlantLotService
    {
        public Task<BusinessResult> GetPlantLotById(int plantLotId);
        public Task<BusinessResult> UpdatePlantLot(UpdatePlantLotModel updatePlantLotRequestModel);
        public Task<BusinessResult> DeletePlantLot(int plantLotId);
        public Task<BusinessResult> CreatePlantLot(CreatePlantLotModel createPlantLotModel);
        public Task<BusinessResult> GetAllPlantLots(PaginationParameter paginationParameter);
        public Task<BusinessResult> CreateManyPlant(List<CriteriaForPlantLotRequestModel> criterias, int quantity);
        public Task<BusinessResult> FillPlantToPlot(FillPlanToPlotRequest fillRequest);
        public Task<BusinessResult> GetForSelectedByFarmId(int farmId);
        public Task<BusinessResult> softedMultipleDelete(List<int> plantLotIds);
    }
}
