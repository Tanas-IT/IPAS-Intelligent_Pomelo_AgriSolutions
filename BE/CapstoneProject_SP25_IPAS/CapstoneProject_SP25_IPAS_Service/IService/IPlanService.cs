using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IPlanService
    {
        public Task<BusinessResult> GetPlanByID(int planId);

        public Task<BusinessResult> GetAllPlanPagination(PaginationParameter paginationParameter, PlanFilter planFilter);

        public Task<BusinessResult> CreatePlan(CreatePlanModel createPlanModel);

        public Task<BusinessResult> UpdatePlanInfo(UpdatePlanModel updatePlanModel);

        public Task<BusinessResult> PermanentlyDeletePlan(int planId);
        public Task<BusinessResult> SoftDeletePlan(int planId);

        public Task<BusinessResult> GetPlanByName(string planName);
        public Task<BusinessResult> UnSoftDeletePlan(int planId);
        public Task<BusinessResult> GetPlanByFarmId(int? farmId);
    }
}
