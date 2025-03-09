
﻿using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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

        public async Task<IEnumerable<LandRow>> Get(
            Expression<Func<LandRow, bool>> filter = null!,
            Func<IQueryable<LandRow>, IOrderedQueryable<LandRow>> orderBy = null!,
            int? pageIndex = null, // Optional parameter for pagination (page number)
            int? pageSize = null)  // Optional parameter for pagination (number of records per page)
        {
            IQueryable<LandRow> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            query = query
                .Include(x => x.Plants.Where(x => x.IsDeleted != true))
                .Include(x => x.LandPlot);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Implementing pagination
            if (pageIndex.HasValue && pageSize.HasValue)
            {
                // Ensure the pageIndex and pageSize are valid
                int validPageIndex = pageIndex.Value > 0 ? pageIndex.Value - 1 : 0;
                int validPageSize = pageSize.Value > 0 ? pageSize.Value : 5; // Assuming a default pageSize of 10 if an invalid value is passed

                query = query.Skip(validPageIndex * validPageSize).Take(validPageSize);
            }

            return await query.AsNoTracking().ToListAsync();
        }
    }
}
