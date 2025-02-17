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
    public class LandPlotRepository : GenericRepository<LandPlot>, ILandPlotRepository
    {
        private readonly IpasContext _context;

        public LandPlotRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public override async Task<LandPlot> GetByID(int landplotId)
        {
            if (landplotId > 0)
            {
                var landPlot = await _context.LandPlots
                    .Where(x => x.LandPlotId == landplotId)
                    .Include(x => x.LandRows)
                    .ThenInclude(x => x.Plants)
                    .FirstOrDefaultAsync();
                return landPlot!;
            }
            return null!;
        }

        public async Task<int> GetLastID()
        {
            var lastID = await _context.LandPlots.MaxAsync(x => x.LandPlotId);
            if (lastID <= 0)
                return 1;
            return lastID + 1;
        }
    }
}
