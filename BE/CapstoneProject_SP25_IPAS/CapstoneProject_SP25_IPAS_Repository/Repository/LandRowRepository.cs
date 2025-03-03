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
    public class LandRowRepository : GenericRepository<LandRow>, ILandRowRepository
    {
        private readonly IpasContext _context;
        public LandRowRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<int>> GetRowsByLandPlotIdAsync(int landPlotId)
        {
            var getListRow = await _context.LandRows.Where(x => x.LandPlotId == landPlotId).Select(x => x.LandRowId).ToListAsync();
            return getListRow;
        }
    }
}
