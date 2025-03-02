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

        public Task<BusinessResult> GetAllGrowthStagePagination(PaginationParameter paginationParameter, int farmId);

        public Task<BusinessResult> CreateGrowthStage(CreateGrowthStageModel createGrowthStageModel, int farmId);

        public Task<BusinessResult> UpdateGrowthStageInfo(UpdateGrowthStageModel updateriteriaTypeModel);

        public Task<BusinessResult> PermanentlyDeleteGrowthStage(int growthStageId);
        public Task<BusinessResult> GetGrowthStageByFarmId(int? farmId);
        public Task<BusinessResult> SoftedMultipleDelete(List<int> growthStagesId, int farmId);
        public Task<BusinessResult> PermanentlyDeleteManyGrowthStage(List<int> growthStagesId);

        public Task<GrowthStageModel?> GetGrowthStageIdByPlantingDate(int farmId, DateTime plantingDate);

        public List<string> ValidateActiveFunction(string activeFunctionRequest);

        public Task<BusinessResult> UpdatePlantGrowthStage(List<int> plantIds, int? newGrowthStageId);

    }
}
