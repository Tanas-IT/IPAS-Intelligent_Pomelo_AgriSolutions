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
    public class MasterTypeRepository : GenericRepository<MasterType>, IMasterTypeRepository
    {
        private readonly IpasContext _context;

        public MasterTypeRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<MasterType>> GetMasterTypeByName(string name)
        {
            var getMasterTypeByName = await  _context.MasterTypes.Include(x => x.CriteriaMasterTypes)
                .ThenInclude(x => x.Criteria)
                .Where(x => x.MasterTypeName.ToLower().Contains(name.ToLower())).ToListAsync();
            if(getMasterTypeByName != null)
            {
                return getMasterTypeByName;
            }
            return null;
        }
    }
}
