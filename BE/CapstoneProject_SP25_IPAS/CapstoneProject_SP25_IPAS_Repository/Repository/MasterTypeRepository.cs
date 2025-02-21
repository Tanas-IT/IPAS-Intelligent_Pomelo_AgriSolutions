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

        public async Task<List<MasterType>> GetMasterTypeByName(string name, int farmId)
        {
            var getMasterTypeByName = await _context.MasterTypes
                .Where(x => x.TypeName!.ToLower().Equals(name.ToLower()) 
                && (x.FarmID == farmId || x.IsDefault == true))
                .OrderBy(x => x.MasterTypeId)
                .ToListAsync();
            if (getMasterTypeByName.Any())
            {
                return getMasterTypeByName;
            }
            return null!;
        }

        public async Task<List<MasterType>> GetMasterTypesByTypeName(string name)
        {
            var getMasterTypeByName = await _context.MasterTypes
                .Where(x => x.TypeName!.ToLower().Contains(name.ToLower())
                &&(x.IsDefault == true))
                .ToListAsync();
            if (getMasterTypeByName.Any())
            {
                return getMasterTypeByName;
            }
            return null!;
        }

        public async Task<MasterType> CheckTypeIdInTypeName(int masterId, string typeName)
        {
            var getMasterTypeByName = await _context.MasterTypes
                .Where(x => x.MasterTypeId == masterId && x.TypeName!.ToLower().Contains(typeName.ToLower())
                &&(x.IsDefault == true))
                .FirstOrDefaultAsync();
            return getMasterTypeByName!;
        }

        public async Task<int> GetLastMasterType()
        {
            var lastMasterType = await _context.MasterTypes
                 .OrderByDescending(p => p.MasterTypeId) // Lấy mã lớn nhất
                 .Select(p => p.MasterTypeId)
                 .FirstOrDefaultAsync();
            return lastMasterType;
        }

        public async Task<int> AddMasterType(MasterType newMasterType)
        {
            await _context.MasterTypes.AddAsync(newMasterType);
            var result = await _context.SaveChangesAsync();
            return result;
        }
        public async Task<int> GetLastID()
        {
            var lastId = await _context.MasterTypes.AsNoTracking().MaxAsync(x => x.MasterTypeId);
            if (lastId <= 0)
                return 1;
            return lastId + 1;
        }
    }
}
