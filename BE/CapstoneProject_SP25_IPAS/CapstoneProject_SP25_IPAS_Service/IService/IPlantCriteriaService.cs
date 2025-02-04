using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantCriteriaRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IPlantCriteriaService
    {
        public Task<BusinessResult> ApplyCriteriasForPlants(PlantCriteriaCreateRequest plantCriteriaCreateRequest);

        public Task<BusinessResult> UpdateCriteriaForPlant(int plantId, int criteriaId);

        public Task<BusinessResult> CheckCriteriaForPlant(CheckPlantCriteriaRequest checkPlantCriteriaRequest);
    }
}
