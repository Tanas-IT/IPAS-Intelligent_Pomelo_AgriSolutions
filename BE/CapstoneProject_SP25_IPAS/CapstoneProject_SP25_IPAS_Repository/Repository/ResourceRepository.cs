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
    public class ResourceRepository : GenericRepository<Resource>, IResourceRepository
    {
        private readonly IpasContext _context;
        public ResourceRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Resource>> GetListResourceByGraftedNoteId(int graftedNoteId)
        {
            var result = await _context.Resources.Where(x => x.GraftedPlantNoteID == graftedNoteId).ToListAsync();
            return result;
        }
        public async Task<List<Resource>> GetListResourceByPlantGrowthHistoryId(int plantGrowthHistoryId)
        {
            var result = await _context.Resources.Where(x => x.PlantGrowthHistoryID == plantGrowthHistoryId).ToListAsync();
            return result;
        }

    }
}
