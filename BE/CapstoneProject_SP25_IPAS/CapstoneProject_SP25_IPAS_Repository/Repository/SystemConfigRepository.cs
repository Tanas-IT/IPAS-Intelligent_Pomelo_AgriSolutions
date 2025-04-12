using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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

        public async Task<List<SystemConfiguration>> GetAllConfigsByGroupNameAsync(string groupName)
        {
            return await _context.SystemConfigurations
                .Where(c => c.ConfigGroup.Trim().ToLower().Equals(groupName.Trim().ToLower()))
                .Where(c => c.IsActive)
                .ToListAsync();
        }

        public virtual async Task<IEnumerable<SystemConfiguration>> Get(
            Expression<Func<SystemConfiguration, bool>> filter = null!,
            Func<IQueryable<SystemConfiguration>, IOrderedQueryable<SystemConfiguration>> orderBy = null!,
            int? pageIndex = null, // Optional parameter for pagination (page number)
            int? pageSize = null)  // Optional parameter for pagination (number of records per page)
        {
            IQueryable<SystemConfiguration> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            query = query.Include(x => x.ReferenceConfig);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Implementing pagination
            if (pageIndex.HasValue && pageSize.HasValue)
            {
                // Ensure the pageIndex and pageSize are valid
                int validPageIndex = pageIndex.Value > 0 ? pageIndex.Value - 1 : 0;
                int validPageSize = pageSize.Value > 0 ? pageSize.Value : 5; // Assuming a default pageSize of 10 if an invalid value is passed

                query = query.Skip(validPageIndex * validPageSize).Take(validPageSize);
            }

            return await query.AsNoTracking().ToListAsync();
        }

        public virtual async Task<SystemConfiguration> GetByCondition(Expression<Func<SystemConfiguration, bool>> filter)
        {
            IQueryable<SystemConfiguration> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }
            query = query.Include(x => x.ReferenceConfig)
                .Include(x => x.DependentConfigurations);

            return await query.AsNoTracking().FirstOrDefaultAsync();
        }

        public virtual async Task<IEnumerable<SystemConfiguration>> getAllSystemConfigNoPagin(
            Expression<Func<SystemConfiguration, bool>> filter = null!,
            Func<IQueryable<SystemConfiguration>, IOrderedQueryable<SystemConfiguration>> orderBy = null!
            )
        {
            IQueryable<SystemConfiguration> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (orderBy != null)
            {
                query = orderBy(query);
            }
            query = query.Include(x => x.ReferenceConfig);
            return await query.AsNoTracking().ToListAsync();

        }
    }
}
