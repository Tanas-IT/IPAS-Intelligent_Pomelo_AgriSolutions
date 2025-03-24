using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ICriteriaTargetService
    {
        public Task<BusinessResult> ApplyCriteriasForTarget(ApplyCriteriaForTargetRequest createCriteriaTargerRequest);

        public Task<BusinessResult> UpdateCriteriaMultipleTarget(UpdateCriteriaTargerRequest updateRequest, bool allowOverride);

        public Task<BusinessResult> CheckingCriteriaForTarget(CheckPlantCriteriaRequest checkPlantCriteriaRequest);

        public Task<BusinessResult> UpdateCriteriaForSingleTarget(UpdateCriteriaTargetRequest updateRequest, bool allowOverride);

        public Task<BusinessResult> DelteteCriteriaForMultipleTarget(DeleteCriteriaTargetRequest createCriteriaTargerRequest);

        public Task<(bool enable, string ErrorMessage)> CheckCriteriaComplete(int? PlantId, int? GraftedId, int? PlantLotId,List<string> TargetsList);
        public Task<BusinessResult> ApplyCriteriasForPlant(ApplyCriteriaForPlantRequest request);

    }
}
