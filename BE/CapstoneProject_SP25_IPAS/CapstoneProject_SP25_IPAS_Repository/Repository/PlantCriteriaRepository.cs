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
    public class PlantCriteriaRepository : GenericRepository<PlantCriteria>, IPlantCriteriaRepository
    {
        private readonly IpasContext _context;
        public PlantCriteriaRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PlantCriteria>> GetAllCriteriaOfPlantNoPaging(int plantId)
        {
            var plantCriteria = await _context.PlantCriteria
                .Include(x => x.Criteria)
               // .ThenInclude(x => x.MasterType)
                .Where(x => x.PlantId == plantId)
                .ToListAsync();
            return plantCriteria;
        }
    }
}
