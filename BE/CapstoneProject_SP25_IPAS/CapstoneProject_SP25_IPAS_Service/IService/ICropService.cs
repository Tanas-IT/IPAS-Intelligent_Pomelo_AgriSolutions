using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CropRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ICropService
    {
        public Task<BusinessResult> createCrop(CropCreateRequest CropCreateRequest);
        public Task<BusinessResult> updateCrop(CropUpdateInfoRequest historyUpdateRequest);
        public Task<BusinessResult> getCropById(int CropId);
        public Task<BusinessResult> getAllCropOfFarm(int farmId, PaginationParameter paginationParameter, CropFilter cropFilter);
        public Task<BusinessResult> permanentlyDeleteCrop(int cropId);
        public Task<BusinessResult> softedDeleteCrop(int cropId);
        public Task<BusinessResult> getAllCropOfLandPlot(int landPlotId, PaginationParameter paginationParameter, CropFilter cropFilter);
        public Task<BusinessResult> getAllCropOfPlotForSelected(int landPlot, string? searchValue);
        public Task<BusinessResult> GetLandPlotsOfCrop(int cropId);
        public Task<BusinessResult> GetCropInCurrentTime(int farmId);
        public Task<BusinessResult> GetCropsOfFarmForSelected(int farmId);
    }
}
