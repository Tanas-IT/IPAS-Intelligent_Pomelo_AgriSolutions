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
                .Where(w => w.Schedule.CarePlan.LandPlot.LandPlotId == landPlotId && w.Date.HasValue && w.Date.Value.Year == year)
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
    }
}
