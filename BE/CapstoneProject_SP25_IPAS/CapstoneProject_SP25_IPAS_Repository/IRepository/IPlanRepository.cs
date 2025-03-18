using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IPlanRepository
    {
        public Task<int> GetLastPlanSequence();
        public Task<Plan> GetLastPlan();
        public int GetTotalTrees(int landPlotId, int year);
        public Task<List<WorkLog>> GetWorkLogs(int landPlotId, int year);
        public Dictionary<string, int> GetTreeHealthStatus(int landPlotId);
        public List<object> GetTreeNotes(int landPlotId);
        public Task<IEnumerable<Plan>> GetPlanWithPagination(
           Expression<Func<Plan, bool>> filter = null!,
           Func<IQueryable<Plan>, IOrderedQueryable<Plan>> orderBy = null!,
           int? pageIndex = null,
           int? pageSize = null);

        public Task<List<PlanTarget>> GetListPlanByFarmId(int? farmId);
        public Task<Plan> GetPlanByInclude(int planId);
        public Task<bool> UpdatePlan(Plan plan);


    }
}
