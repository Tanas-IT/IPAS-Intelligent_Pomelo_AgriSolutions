using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using MailKit.Search;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class PlantRepository : GenericRepository<Plant>, IPlantRepository
    {
        private readonly IpasContext _context;
        public PlantRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Plant>> GetPlantsInFarmPagin(
     int farmId, string? search, int? pageIndex, int? pageSize, string? sortBy, string? direction)
        {
            pageIndex = pageIndex ?? 1;
            pageSize = pageSize ?? 10;

            var query = _context.Plants
                .Include(p => p.LandRow)
                .ThenInclude(lr => lr!.LandPlot)
                .Include(p => p.MasterType)
                .Include(p => p.PlantCriterias)
                    .ThenInclude(pc => pc.Criteria)
                    //.ThenInclude(c => c.MasterType)
                .Where(p => p.LandRow != null && p.LandRow.LandPlot!.FarmId == farmId && p.IsDeleted == false)
                .AsQueryable();

            // search
            if (!string.IsNullOrWhiteSpace(search))
            {
                string searchLower = search.Trim().ToLower();
                query = query.Where(p => p.PlantName!.ToLower().Contains(searchLower) ||
                                         p.PlantCode!.ToLower().Contains(searchLower));
            }

            // Sort
            var sortColumn = sortBy?.Trim().ToLower();
            bool isDescending = (direction ?? "asc").Trim().ToLower() == "desc";

            var orderByMapping = new Dictionary<string, Expression<Func<Plant, object>>>()
    {
        { "plantname", p => p.PlantName! },
        { "growthstage", p => p.GrowthStage! },
        { "healthstatus", p => p.HealthStatus! },
        { "plantingdate", p => p.PlantingDate! },
        { "landrowindex", p => p.LandRow!.RowIndex! },
        { "plantvariety", p => p.MasterType!.MasterTypeName! }
    };

            if (!string.IsNullOrEmpty(sortColumn) && orderByMapping.ContainsKey(sortColumn))
            {
                query = isDescending
                    ? query.OrderByDescending(orderByMapping[sortColumn])
                    : query.OrderBy(orderByMapping[sortColumn]);
            }
            else
            {
                query = query.OrderByDescending(p => p.PlantId); // Mặc định sắp xếp theo PlantId giảm dần
            }

            // Phân trang ngay trong DB
            var plants = await query
                .Skip((pageIndex.Value - 1) * pageSize.Value)
                .Take(pageSize.Value)
                .ToListAsync();

            return plants;
        }

        public async Task<IEnumerable<Plant>> GetPlantsInPlotPagin(
     int landPlotId, string? search, int? pageIndex, int? pageSize, string? sortBy, string? direction)
        {
            pageIndex = pageIndex ?? 1;
            pageSize = pageSize ?? 10;

            var query = _context.Plants
                .Include(p => p.LandRow)
                .ThenInclude(lr => lr!.LandPlot)
                .Include(p => p.MasterType)
                .Include(p => p.PlantCriterias)
                    .ThenInclude(pc => pc.Criteria)
                    //.ThenInclude(c => c.MasterType)
                .Where(p => p.LandRow != null && p.LandRow.LandPlotId == landPlotId && p.IsDeleted == false)
                .AsQueryable();

            // search
            if (!string.IsNullOrWhiteSpace(search))
            {
                string searchLower = search.Trim().ToLower();
                query = query.Where(p => p.PlantName!.ToLower().Contains(searchLower) ||
                                         p.PlantCode!.ToLower().Contains(searchLower));
            }

            // Sort
            var sortColumn = sortBy?.Trim().ToLower();
            bool isDescending = (direction ?? "asc").Trim().ToLower() == "desc";

            var orderByMapping = new Dictionary<string, Expression<Func<Plant, object>>>()
    {
        { "plantname", p => p.PlantName! },
        { "growthstage", p => p.GrowthStage! },
        { "healthstatus", p => p.HealthStatus! },
        { "plantingdate", p => p.PlantingDate! },
        { "landrowindex", p => p.LandRow!.RowIndex! },
        { "plantvariety", p => p.MasterType!.MasterTypeName! }
    };

            if (!string.IsNullOrEmpty(sortColumn) && orderByMapping.ContainsKey(sortColumn))
            {
                query = isDescending
                    ? query.OrderByDescending(orderByMapping[sortColumn])
                    : query.OrderBy(orderByMapping[sortColumn]);
            }
            else
            {
                query = query.OrderByDescending(p => p.PlantId); // Mặc định sắp xếp theo PlantId giảm dần
            }

            // Phân trang ngay trong DB
            var plants = await query
                .Skip((pageIndex.Value - 1) * pageSize.Value)
                .Take(pageSize.Value)
                .ToListAsync();

            return plants;
        }

        public async Task<Plant?> getById(int plantId)
        {
            return await _context.Plants
            .Include(p => p.LandRow)
                .ThenInclude(lr => lr!.LandPlot)
             .Include(p => p.MasterType)
             .Include(p => p.PlantCriterias)
                    .ThenInclude(pc => pc.Criteria)
                    //.ThenInclude(c => c.MasterType)
            .FirstOrDefaultAsync(p => p.PlantId == plantId && p.IsDeleted == false);
        }

        public async Task<List<Plant>> getPlantInclude()
        {
           return await _context.Plants.Include(x => x.LandRow)
                .Include(lr => lr.LandRow.LandPlot.LandPlotCoordinations)
                .Include(x => x.LandRow.LandPlot.Farm).ToListAsync();
        }
    }
}
