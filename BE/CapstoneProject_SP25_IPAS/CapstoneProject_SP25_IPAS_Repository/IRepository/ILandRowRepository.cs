using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface ILandRowRepository
    {
        public Task<List<int>> GetRowsByLandPlotIdAsync(int landPlotId);
    }
}
