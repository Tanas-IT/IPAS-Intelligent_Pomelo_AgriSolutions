using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel;
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
            //return _context.PlantGrowthHistories
            //    .Where(pgh => pgh.Plant.LandRow.LandPlot.LandPlotId == landPlotId)
            //    .Select(pgh => new {
            //        creator = pgh.NoteTaker,
            //        code = pgh.PlantGrowthHistoryCode,
            //        content = pgh.Content,
            //        plantId = pgh.PlantId
            //    }).ToList<object>();
            return _context.PlantGrowthHistories
                .Include(x => x.User)
               .Where(pgh => pgh.Plant.LandRow.LandPlot.LandPlotId == landPlotId)
               .Select(pgh => new {
                   creator = pgh.User.FullName,
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
                    .Include(x => x.PlanTargets)
                        .ThenInclude(pt => pt.LandRow)
                        .ThenInclude(pt => pt.Plants)
                    .Include(x => x.MasterType)
                    .Include(x => x.Process)
                    .Include(x => x.User)
                    .Include(x => x.Crop)
                    .Include(x => x.CarePlanSchedule)
                        .ThenInclude(cs => cs.WorkLogs)
                            .ThenInclude(wl => wl.UserWorkLogs)
                                .ThenInclude(uwl => uwl.User)
                    .Include(x => x.GrowthStagePlans)
                    .ThenInclude(x => x.GrowthStage);


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

        public async Task<List<Plan>> GetListPlanByFarmId(int? farmId)
        {
            var result = await _context.Plans
                                .Where(x => x.FarmID == farmId && x.IsSample == false && x.IsDeleted == false).ToListAsync();
                                    

            return result;

        }

        public async Task<Plan> GetPlanByInclude(int planId)
        {
            var result = await _context.Plans
                                     .Include(x => x.PlanTargets)
                                         .ThenInclude(pt => pt.LandPlot)
                                     .Include(x => x.PlanTargets)
                                         .ThenInclude(pt => pt.PlantLot)
                                     .Include(x => x.PlanTargets)
                                         .ThenInclude(pt => pt.Plant)
                                     .Include(x => x.PlanTargets)
                                         .ThenInclude(pt => pt.GraftedPlant)
                                     .Include(x => x.PlanTargets)
                                         .ThenInclude(pt => pt.LandRow)
                                             .ThenInclude(lr => lr.Plants)
                                     .Include(x => x.MasterType)
                                     .Include(x => x.SubProcess)
                                     .Include(x => x.Process)
                                     .ThenInclude(x => x.SubProcesses)
                                     .Include(x => x.User)
                                     .Include(x => x.Crop)
                                     .ThenInclude(x => x.LandPlotCrops)
                                     .ThenInclude(x => x.LandPlot)
                                     .Include(x => x.CarePlanSchedule)
                                         .ThenInclude(cs => cs.WorkLogs)
                                             .ThenInclude(wl => wl.UserWorkLogs)
                                                 .ThenInclude(uwl => uwl.User)
                                     .Include(x => x.GrowthStagePlans)
                                         .ThenInclude(gsp => gsp.GrowthStage)
                                     .FirstOrDefaultAsync(x => x.PlanId == planId && x.IsDeleted == false);
            return result;
        }

        public async Task<List<Plan>> GetPlanIncludeByProcessId(int processId)
        {
            var result = await _context.Plans
                                     .Include(x => x.MasterType)
                                     .Include(x => x.Process)
                                     .Include(x => x.User)
                                     .Include(x => x.Crop)
                                     .ThenInclude(x => x.LandPlotCrops)
                                     .ThenInclude(x => x.LandPlot)
                                     .Include(x => x.CarePlanSchedule)
                                     .Include(x => x.GrowthStagePlans)
                                     .Where(x => x.ProcessId == processId && x.IsDeleted == false).ToListAsync();
            return result;
        }

        public async Task<bool> UpdatePlan(Plan plan)
        {
            var getPlanToUpdate = await _context.Plans.FirstOrDefaultAsync(x => x.PlanId == plan.PlanId);
            if (getPlanToUpdate != null)
            {
                 
                getPlanToUpdate.PlanDetail = plan.PlanDetail;
                getPlanToUpdate.Frequency = plan.Frequency;
                getPlanToUpdate.PlanName = plan.PlanName;
                getPlanToUpdate.Status = plan.Status;
                getPlanToUpdate.StartDate = plan.StartDate;
                getPlanToUpdate.EndDate = plan.EndDate;
                getPlanToUpdate.AssignorId = plan.AssignorId;
                getPlanToUpdate.PesticideName = plan.PesticideName;
                getPlanToUpdate.MaxVolume = plan.MaxVolume;
                getPlanToUpdate.MinVolume = plan.MinVolume;
                getPlanToUpdate.ProcessId = plan.ProcessId;
                getPlanToUpdate.SubProcessId = plan.SubProcessId;
                getPlanToUpdate.CropId = plan.CropId;
                getPlanToUpdate.IsDeleted = plan.IsDeleted;
                getPlanToUpdate.MasterTypeId = plan.MasterTypeId;
                getPlanToUpdate.ResponsibleBy = plan.ResponsibleBy;
                getPlanToUpdate.Notes = plan.Notes;
                getPlanToUpdate.UpdateDate = DateTime.Now;
                getPlanToUpdate.IsDeleted = plan.IsDeleted;
                _context.Plans.Update(getPlanToUpdate);
                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            return false;
        }

        public async Task<List<Plan>> GetPlanByGraftedPlantId(int graftedPlantId)
        {
            var getListPlant = await _context.Plans
                                .Include(x => x.PlanTargets)
                                .Include(x => x.CarePlanSchedule)
                                .ThenInclude(x => x.WorkLogs)
                                .ThenInclude(x => x.UserWorkLogs)
                                .Where(x => x.PlanTargets.Any(y => y.GraftedPlantID == graftedPlantId)).AsNoTracking().ToListAsync();
            return getListPlant;

        }

        public async Task<List<Plan>> GetPlanByPlantId(int plantId)
        {
            var getListPlant = await _context.Plans
                                .Include(x => x.PlanTargets)
                                .Include(x => x.CarePlanSchedule)
                                .ThenInclude(x => x.WorkLogs)
                                .ThenInclude(x => x.UserWorkLogs)
                                .Where(x => x.PlanTargets.Any(y => y.PlantID == plantId)).ToListAsync();
            return getListPlant;

        }

        public IQueryable<Plan> GetAllPlans()
        {
            return _context.Plans
                .Include(p => p.MasterType)
                .Where(p => p.IsDeleted != true && p.IsSample == false);
        }

        public async Task<Plan> GetPlanByIdAsync(int planId, int farmId)
        {
            var plan = await _context.Plans
                           .AsNoTracking()
                           .FirstOrDefaultAsync(p => p.PlanId == planId && p.IsDeleted == false && p.IsSample == false && p.FarmID == farmId);
            return plan;
        }

        public async Task<Process> GetProcessByPlan(Plan plan)
        {
            var processId = plan.ProcessId ?? await _context.SubProcesses
                    .Where(sp => sp.SubProcessID == plan.SubProcessId)
                    .Select(sp => sp.ProcessId)
                    .FirstOrDefaultAsync();

            var process = await _context.Processes
                                  .AsNoTracking()
                                  .Include(p => p.Plans.Where(p => p.IsDeleted == false && p.IsSample == false))
                                  .Include(p => p.SubProcesses.Where(sp => sp.IsDeleted == false))
                                      .ThenInclude(sp => sp.Plans.Where(p => p.IsDeleted == false))
                                  .FirstOrDefaultAsync(p => p.ProcessId == processId);
            return process;
        }

        public async Task<List<Plan>> GetListPlanByProcessId (int processId)
        {
            return await _context.Plans
                    .Include(p => p.SubProcess)
                    .Where(p => (p.ProcessId == processId || p.SubProcess!.ProcessId == processId) && p.IsDeleted == false)
                    .ToListAsync();
        }
        public async Task<List<Plan>> GetPlansBySubProcessIds(List<int> subProcessIds)
        {
            return await _context.Plans
                .Where(p => p.SubProcessId.HasValue && subProcessIds.Contains(p.SubProcessId.Value))
                .ToListAsync();
        }
        public async Task<Plan> GetPlanWithEmployeeSkill(int planId)
        {
            var result = await _context.Plans
         .Include(p => p.CarePlanSchedule)
             .ThenInclude(cps => cps.WorkLogs)
                 .ThenInclude(wl => wl.UserWorkLogs)
                     .ThenInclude(uwl => uwl.User)
                         .ThenInclude(u => u.UserFarms)
                             .ThenInclude(uf => uf.EmployeeSkills)
                                 .ThenInclude(es => es.WorkType)
         .FirstOrDefaultAsync(p => p.PlanId == planId);
            return result;
        }

        public async Task<Plan> GetPlanByWorkLogId(int workLogId)
        {
            var getPlan = await _context.Plans.Where(x => x.CarePlanSchedule.WorkLogs.Any(y => y.WorkLogId == workLogId)).FirstOrDefaultAsync();
            return getPlan;
        }
    }
}
