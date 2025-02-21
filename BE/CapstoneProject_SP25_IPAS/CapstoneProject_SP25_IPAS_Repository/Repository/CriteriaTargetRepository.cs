using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Razor.Internal;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class CriteriaTargetRepository : GenericRepository<CriteriaTarget>, ICriteriaTargetRepository
    {
        private readonly IpasContext _context;
        public CriteriaTargetRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CriteriaTarget>> GetAllCriteriaOfPlantNoPaging(int plantId)
        {
            var plantCriteria = await _context.CriteriaTargets
                .Include(x => x.Criteria)
               // .ThenInclude(x => x.MasterType)
                .Where(x => x.PlantID == plantId)
                .ToListAsync();
            return plantCriteria;
        }
    }
}
