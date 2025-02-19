using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
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
    public class PlanRepository : GenericRepository<Plan>, IPlanRepository
    {
        private readonly IpasContext _context;

        public PlanRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> GetLastPlanSequence()
        {
          var lastPlanId =  await _context.Plans
                 .OrderByDescending(p => p.PlanId) // Lấy mã lớn nhất
                 .Select(p => p.PlanId)
                 .FirstOrDefaultAsync();
            return lastPlanId;
        }
        public async Task<Plan> GetLastPlan()
        {
            var lastPlanId = await _context.Plans
                   .OrderByDescending(p => p.PlanId) // Lấy mã lớn nhất
                   .FirstOrDefaultAsync();
            return lastPlanId;
        }

        public int GetTotalTrees(int landPlotId, int year)
        {
            return _context.Plants.Count(p => p.LandRow.LandPlot.LandPlotId == landPlotId && p.PlantingDate.HasValue && p.PlantingDate.Value.Year == year);
        }

        public async Task<List<WorkLog>> GetWorkLogs(int landPlotId, int year)
        {
            return await _context.WorkLogs
                .Where(w => w.Schedule.CarePlan.PlanTargets.Any(x => x.LandPlot.LandPlotId == landPlotId) && w.Date.HasValue && w.Date.Value.Year == year)
                .ToListAsync();
        }

        public Dictionary<string ,int> GetTreeHealthStatus(int landPlotId)
        {
            return _context.Plants
            .Where(p => p.LandRow.LandPlot.LandPlotId == landPlotId)
            .GroupBy(p => p.HealthStatus)
            .ToDictionary(g => g.Key ?? "Unknown", g => g.Count());
        }

        public List<object> GetTreeNotes(int landPlotId)
        {
            return _context.PlantGrowthHistories
                .Where(pgh => pgh.Plant.LandRow.LandPlot.LandPlotId == landPlotId)
                .Select(pgh => new {
                    creator = pgh.NoteTaker,
                    code = pgh.PlantGrowthHistoryCode,
                    content = pgh.Content,
                    plantId = pgh.PlantId
                }).ToList<object>();
        }

        // Updated Get method with pagination
        public virtual async Task<IEnumerable<Plan>> GetPlanWithPagination(
            Expression<Func<Plan, bool>> filter = null!,
            Func<IQueryable<Plan>, IOrderedQueryable<Plan>> orderBy = null!,
            int? pageIndex = null, 
            int? pageSize = null) 
        {
            IQueryable<Plan> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }
            query = query
                    .Include(x => x.PlanTargets) // Gọi 1 lần
                        .ThenInclude(pt => pt.LandPlot)
                    .Include(x => x.PlanTargets)
                        .ThenInclude(pt => pt.PlantLot)
                    .Include(x => x.PlanTargets)
                        .ThenInclude(pt => pt.Plant)
                    .Include(x => x.PlanTargets)
                        .ThenInclude(pt => pt.GraftedPlant)
                    .Include(x => x.MasterType)
                    .Include(x => x.Process)
                    .Include(x => x.GrowthStage)
                    .Include(x => x.User)
                    .Include(x => x.Crop)
                    .Include(x => x.CarePlanSchedule)
                        .ThenInclude(cs => cs.WorkLogs)
                            .ThenInclude(wl => wl.UserWorkLogs)
                                .ThenInclude(uwl => uwl.User);


            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Implementing pagination
            if (pageIndex.HasValue && pageSize.HasValue)
            {
                // Ensure the pageIndex and pageSize are valid
                int validPageIndex = pageIndex.Value > 0 ? pageIndex.Value - 1 : 0;
                int validPageSize = pageSize.Value > 0 ? pageSize.Value : 10; // Assuming a default pageSize of 10 if an invalid value is passed

                query = query.Skip(validPageIndex * validPageSize).Take(validPageSize);
            }

            return await query.AsNoTracking().ToListAsync();
        }
    }
}
