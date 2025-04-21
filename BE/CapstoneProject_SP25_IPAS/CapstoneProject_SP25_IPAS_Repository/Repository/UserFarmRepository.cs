using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class UserFarmRepository : GenericRepository<UserFarm>, IUserFarmRepository
    {
        private readonly IpasContext _context;
        public UserFarmRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> getRoleOfUserInFarm(int userId, int farmId)
        {
            var getUserFarm = await _context.UserFarms.FirstOrDefaultAsync(x => x.UserId == userId && x.FarmId == farmId);
            if (getUserFarm != null)
            {
                return getUserFarm.RoleId ?? -1;
            }
            return -1;
        }

        public async Task<int> updateRoleOfUserInFarm(int userId, int newRoleId, int farmId)
        {
            var getUserFarm = await _context.UserFarms.FirstOrDefaultAsync(x => x.UserId == userId && x.FarmId == farmId);
            if (getUserFarm != null)
            {
                getUserFarm.RoleId = newRoleId;
                var result = await _context.SaveChangesAsync();  
                return newRoleId;
            }
            return -1;
        }

        public async Task<List<UserFarm>> GetFarmOfUser(int userId)
        {
            IQueryable<UserFarm> query = _context.UserFarms.AsQueryable();

            query = query.Where(x => x.UserId == userId && x.Farm.IsDeleted != true && x.User.IsDeleted != true);

            query = query.Include(x => x.User)
                .Include(x => x.Role)
                .Include(x => x.Farm)
                .ThenInclude(x => x.Orders);

            return await query.ToListAsync();
        }

        public async Task<List<UserFarm>> GetUserOfFarm(int farmId)
        {
            IQueryable<UserFarm> query = _context.UserFarms.AsQueryable();

            query = query.Where(x => x.FarmId == farmId && x.Farm.IsDeleted != true && x.User.IsDeleted != true);

            query = query.Include(x => x.User)
                .Include(x => x.Role)
                .Include(x => x.Farm)
                .ThenInclude(x => x.Orders);

            return await query.ToListAsync();
        }

        public async Task<List<UserFarm>> GetManagerOffarm(int? farmId)
        {
            var result = await _context.UserFarms
                .Include(x => x.Role)
                .Where(x => x.Role.RoleName.ToLower().Equals("manager") && x.FarmId == farmId).ToListAsync();
            return result;
        }

        public async Task<List<User>> GetExpertOffarm()
        {
            var result = await _context.Users
                .Include(x => x.Role)
                .Where(x => x.Role.RoleName.ToLower().Equals("expert")).ToListAsync();
            return result;
        }

        public virtual async Task<IEnumerable<UserFarm>> GetUserFarmList(
           Expression<Func<UserFarm, bool>> filter = null!,
           Func<IQueryable<UserFarm>, IOrderedQueryable<UserFarm>> orderBy = null!,
           int? pageIndex = null, // Optional parameter for pagination (page number)
           int? pageSize = null)  // Optional parameter for pagination (number of records per page)
        {
            IQueryable<UserFarm> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

          
                    //Role,User,Farm,EmployeeSkills
                    query = query.Include(x => x.Role)
                                  .Include(x => x.User)
                                  .Include(x => x.Farm)
                                  .Include(x => x.EmployeeSkills)
                                  .ThenInclude(x => x.WorkType);
           

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
    }
}
