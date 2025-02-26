using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IUserRepostiory
    {
        public Task<User?> GetUserByEmailAsync(string email);
        public Task<User?> GetUserByIdAsync(int userId);
        public Task AddUserAsync(User newUser);

        public Task<int> UpdateUserAsync(User user);
        public Task<int> SoftDeleteUserAsync(int userId);
        public Task<List<User>> GetAllUsersByRole(string roleName);
        public Task<bool> AddOtpToUser(string email, string otpCode, DateTime expiredOtpTime);
        public Task<int> GetAllEmployeeByFarmId(int? farmId);
    }
}
