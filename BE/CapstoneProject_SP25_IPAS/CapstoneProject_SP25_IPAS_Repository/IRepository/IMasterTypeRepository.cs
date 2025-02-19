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
        public Task<List<MasterType>> GetMasterTypeByName(string name, int farmId);

        public Task<List<MasterType>> GetMasterTypesByTypeName(string name, int farmId);

        public Task<MasterType> CheckTypeIdInTypeName(int masterId, string typeName);

        public Task<int> GetLastID();

    }
}
