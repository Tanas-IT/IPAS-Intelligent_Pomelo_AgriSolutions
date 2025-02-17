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
    public class PartnerRepository : GenericRepository<Partner>, IPartnerRepository
    {
        private readonly IpasContext _context;
        public PartnerRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> GetLastId()
        {
            var lastId = await _context.Partners.MaxAsync(x => x.PartnerId);
            return lastId + 1;
        }

        public async Task<List<Partner>> GetPartnerByRoleName(string roleName)
        {
            var result = await _context.Partners.Include(x => x.Role)
                                                .Where(x => x.Role.RoleName.Equals(roleName))
                                                .ToListAsync();
            return result;

        }
    }
}
