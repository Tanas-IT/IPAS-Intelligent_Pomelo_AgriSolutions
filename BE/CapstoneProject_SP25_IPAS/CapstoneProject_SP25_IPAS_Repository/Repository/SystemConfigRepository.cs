using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class SystemConfigRepository : GenericRepository<SystemConfiguration>, ISystemConfigRepository
    {
        private readonly IpasContext _context;
        public SystemConfigRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<SystemConfiguration>> GetAllActiveConfigsAsync(string key)
        {
            return await _context.SystemConfigurations
                .Where(c => c.ConfigKey.Trim().ToLower().Equals(key.Trim().ToLower()))
                .Where(c => c.IsActive)
                .ToListAsync();
        }
        public async Task DeleteConfigAsync(int configId)
        {
            var config = await _context.SystemConfigurations.FindAsync(configId);
            if (config != null && config.IsDeleteable!.Value) // Chỉ xóa nếu được phép
            {
                _context.SystemConfigurations.Remove(config);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<T> GetConfigValue<T>(string configKey, T defaultValue)
        {
            var config = await _context.SystemConfigurations
                .Where(x => x.ConfigKey.Trim().ToLower() == configKey.Trim().ToLower() && x.IsActive == true)
                .FirstOrDefaultAsync();

            if (config == null || string.IsNullOrEmpty(config.ConfigValue))
            {
                return defaultValue;
            }

            try
            {
                // Convert về kiểu dữ liệu mong muốn
                return (T)Convert.ChangeType(config.ConfigValue, typeof(T));
            }
            catch
            {
                return defaultValue; // Nếu lỗi khi parse, trả về giá trị mặc định
            }
        }
    }
}
