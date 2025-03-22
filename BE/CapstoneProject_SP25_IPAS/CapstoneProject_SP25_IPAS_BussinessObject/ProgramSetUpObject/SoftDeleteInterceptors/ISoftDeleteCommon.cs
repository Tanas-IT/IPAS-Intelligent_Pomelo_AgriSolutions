using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject.SoftDeleteInterceptors
{
    public interface ISoftDeleteCommon
    {
        public Task<bool> SoftDeleteFarm(int farmId);
        public Task<bool> SoftDeletePlan(int planId);
    }
}
