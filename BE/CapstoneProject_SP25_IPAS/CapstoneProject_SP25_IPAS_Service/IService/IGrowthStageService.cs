using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IGrowthStageService
    {
        public Task<BusinessResult> GetGrowthStageByID(int growthStageId);

        public Task<BusinessResult> GetAllGrowthStagePagination(PaginationParameter paginationParameter);

        public Task<BusinessResult> CreateGrowthStage(CreateGrowthStageModel createGrowthStageModel);

        public Task<BusinessResult> UpdateGrowthStageInfo(UpdateGrowthStageModel updateriteriaTypeModel);

        public Task<BusinessResult> PermanentlyDeleteGrowthStage(int growthStageId);
        public Task<BusinessResult> GetGrowthStageByFarmId(int? farmId);
    }
}
