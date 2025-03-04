using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class RoleRepository : GenericRepository<Role>, IRoleRepository
    {
        private readonly IpasContext _context;
        public RoleRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task AddRoleAsync(Role newRole)
        {
            await _context.Roles.AddAsync(newRole);
            await _context.SaveChangesAsync();
        }

        public async Task<Role?> GetRoleById(int? id)
        {
            return await _context.Roles.FirstOrDefaultAsync(x => x.RoleId == id);
        }
        public async Task<Role?> GetRoleByName(string roleName)
        {
            return await _context.Roles.FirstOrDefaultAsync(x => x.RoleName.ToLower().Equals(roleName.ToLower()));
        }
    }
}
