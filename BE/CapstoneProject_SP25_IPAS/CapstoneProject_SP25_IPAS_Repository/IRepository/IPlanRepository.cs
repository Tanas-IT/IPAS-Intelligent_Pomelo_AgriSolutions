using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface IPlanRepository
    {
        public Task<int> GetLastPlanSequence();
        public Task<Plan> GetLastPlan();
    }
}
