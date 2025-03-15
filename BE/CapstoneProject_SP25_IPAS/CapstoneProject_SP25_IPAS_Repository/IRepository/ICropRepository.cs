using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface ICropRepository
    {
        public Task<Crop> getCropToDelete(int cropId);
        public Task<Crop> getCropInExpired(int cropId);
        public Task<IEnumerable<Crop>> GetAllCropsOfLandPlot(int landPlotId, PaginationParameter paginationParameter, CropFilter cropFilter);
        public Task<IEnumerable<Crop>> GetAllCropsOfFarm(int FarmId, PaginationParameter paginationParameter, CropFilter cropFilter);
        public Task<List<Crop>> GetCropsInCurrentTime();
        public Task<List<LandPlot>> GetLandPlotOfCrops(int cropId);
    }
}
