using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IMasterTypeRepository
    {
        public Task<List<MasterType>> GetMasterTypeByName(string name, int farmId, string target = null);

        public Task<List<MasterType>> GetMasterTypesByTypeName(string name);

        public Task<MasterType> CheckTypeIdInTypeName(int masterId, string typeName);
        public Task<int> GetLastMasterType();
        public Task<int> AddMasterType(MasterType newMasterType);

        public Task<int> GetLastID();
        public Task<List<MasterType>> GetCriteriaSetOfFarm(string name, int farmId, List<string> target);
        public Task<List<MasterType>> GetMasterTypesByGrowthStages(List<int?> growthStageIds);
        public Task<List<MasterType>> GetMasterTypesWithTypeNameByGrowthStages(List<int?> growthStageIds, string typeName);

    }
}
