using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;
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

        public Task<BusinessResult> GetAllPlanPagination(PaginationParameter paginationParameter, PlanFilter planFilter, int farmId);

        public Task<BusinessResult> CreatePlan(CreatePlanModel createPlanModel, int? farmId);

        public Task<BusinessResult> UpdatePlanInfo(UpdatePlanModel updatePlanModel);

        public Task<BusinessResult> PermanentlyDeletePlan(int planId);
        public Task<BusinessResult> SoftDeleteMultiplePlan(List<int> listPlanId);

        public Task<BusinessResult> GetPlanByName(string planName, int? farmId);
        public Task<BusinessResult> UnSoftDeletePlan(int planId);
        public Task<BusinessResult> GetPlanByFarmId(int? farmId);
        public Task<BusinessResult> GetListPlantByFilterGrowthStage(List<int?> growthStageId, int farmId, string unit);
        public Task<BusinessResult> PermanentlyDeleteManyPlan(List<int> planIds);
    }
}
