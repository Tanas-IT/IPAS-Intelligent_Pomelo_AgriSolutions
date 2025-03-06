using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IUserFarmRepository
    {
        public Task<int> getRoleOfUserInFarm(int userId, int farmId);
        public Task<int> updateRoleOfUserInFarm(int userId, int newRoleId, int farmId);
        public Task<List<UserFarm>> GetFarmOfUser(int userId);

    }
}
