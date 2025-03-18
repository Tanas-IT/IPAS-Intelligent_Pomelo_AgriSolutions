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
                .Include(p => p.CriteriaTargets)
                    .ThenInclude(pc => pc.Criteria)
                    .ThenInclude(c => c.MasterType)
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
                .Include(p => p.CriteriaTargets)
                    .ThenInclude(pc => pc.Criteria)
                    .ThenInclude(c => c.MasterType)
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
             .Include(p => p.GrowthStage)
             .Include(p => p.PlantReference)
             .Include(p => p.CriteriaTargets)
                    .ThenInclude(pc => pc.Criteria)
                    .ThenInclude(c => c.MasterType)
            .FirstOrDefaultAsync(p => p.PlantId == plantId && p.IsDeleted == false );
        }

        public async Task<List<Plant>> getPlantInclude()
        {
            return await _context.Plants.Include(x => x.LandRow).Include(x => x.GrowthStage)
                 .Include(lr => lr.LandRow.LandPlot.LandPlotCoordinations)
                 .Include(x => x.LandRow.LandPlot.Farm).ToListAsync();
        }

        public async Task<IEnumerable<Plant>> GetAllNoPaging(
            Expression<Func<Plant, bool>> filter = null!,
            Func<IQueryable<Plant>, IOrderedQueryable<Plant>> orderBy = null!)
        {
            IQueryable<Plant> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            query = query
                .Include(p => p.LandRow)
                .ThenInclude(lr => lr!.LandPlot)
                .Include(p => p.MasterType)
                .Include(p => p.GrowthStage)
                .Include(p => p.CriteriaTargets)
                    .ThenInclude(pc => pc.Criteria)
                    .ThenInclude(c => c.MasterType);

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<Plant>> GetAllForDelete(
           Expression<Func<Plant, bool>> filter = null!,
           Func<IQueryable<Plant>, IOrderedQueryable<Plant>> orderBy = null!)
        {
            IQueryable<Plant> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            //query = query
            //    .Include(p => p.LandRow)
            //    .ThenInclude(lr => lr!.LandPlot)
            //    .Include(p => p.MasterType)
            //    .Include(p => p.GrowthStage)
            //    .Include(p => p.CriteriaTargets)
            //        .ThenInclude(pc => pc.Criteria)
            //        .ThenInclude(c => c.MasterType);

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<Plant>> Get(
            Expression<Func<Plant, bool>> filter = null!,
            Func<IQueryable<Plant>, IOrderedQueryable<Plant>> orderBy = null!,
             int? pageIndex = null, // Optional parameter for pagination (page number)
            int? pageSize = null)
        {
            IQueryable<Plant> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            query = query
                .Include(p => p.LandRow)
                .ThenInclude(lr => lr!.LandPlot)
                .Include(p => p.MasterType)
                .Include(p => p.GrowthStage)
                .Include(p => p.PlantReference)
                .Include(p => p.CriteriaTargets)
                    .ThenInclude(pc => pc.Criteria)
                    .ThenInclude(c => c.MasterType);

            if (pageIndex.HasValue && pageSize.HasValue)
            {
                // Ensure the pageIndex and pageSize are valid
                int validPageIndex = pageIndex.Value > 0 ? pageIndex.Value - 1 : 0;
                int validPageSize = pageSize.Value > 0 ? pageSize.Value : 5;

                query = query.Skip(validPageIndex * validPageSize).Take(validPageSize);
            }
            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<List<int>> getPlantByRowId(int rowId)
        {
            var getListPlan = await _context.Plants.Where(x => x.LandRowId == rowId && x.IsDeleted == false).Select(x => x.PlantId).ToListAsync();
            return getListPlan;
        }
        /// <summary>
        /// hàm kiểm tra xem cây đã có ở trong giai đoạn phát triển nào chưa - Grafted/Harvest
        /// </summary>
        /// <param name="targetType">Grafted/Harvest</param>
        public async Task<bool> CheckIfPlantCanBeInTargetAsync(int plantId, string targetType)
        {
            // Lấy cây từ database
            var plant = await _context.Plants
                .Where( p => p.PlantId == plantId && p.IsDeleted == false && p.IsDead == false)
                //.Include(p => p.GrowthStage)
                .FirstOrDefaultAsync();

            // Kiểm tra cây có tồn tại không
            //if (plant == null)
            //{
            //    throw new ArgumentException("Plant not exist or is dead.");
            //}

            // Kiểm tra cây có giai đoạn sinh trưởng không
            if (plant.GrowthStageID == null)
            {
                return false; // Không có giai đoạn -> Không thể chiết
            }

            // Kiểm tra ActiveFunction có chứa "Grafted" không
            bool canBeGrafted = (Util.SplitByComma(plant.GrowthStage.ActiveFunction?.Trim()!)).Contains(targetType.ToLower());

            return canBeGrafted;
        }

        public async Task<List<Plant>> GetAllForBrService(int farmId)
        {
            var plants = await _context.Plants
                .Where(x => x.FarmId == farmId &&
                x.IsDead == false &&
                x.IsDeleted == false &&
                x.PlantingDate.HasValue)
                .AsNoTracking().ToListAsync();
            return plants;
        }
    }
}
