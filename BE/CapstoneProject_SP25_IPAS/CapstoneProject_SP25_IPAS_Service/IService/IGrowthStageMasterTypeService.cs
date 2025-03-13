using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageMasterTypeModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IGrowthStageMasterTypeService
    {
        public Task<BusinessResult> CreateGrowthStageMasterType(List<CreateGrowthStageMasterTypeModel> createGrowthStageMasterTypeModels, int farmId);
        public Task<BusinessResult> GetGrowthStageMasterTypeByFarmId(int farmId);
        public Task<BusinessResult> UpdateGrowthStageMasterType(UpdateGrowthStageMasterTypeModel updateGrowthStageMasterTypeModel, int farmId);
        public Task<BusinessResult> DeleteGrowthStageMasterType(List<int> growthStageMasterTpeIds);


    }
}
