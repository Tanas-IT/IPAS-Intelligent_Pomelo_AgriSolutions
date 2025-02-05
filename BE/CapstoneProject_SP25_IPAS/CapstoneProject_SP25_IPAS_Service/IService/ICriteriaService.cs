using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ICriteriaService
    {
        public Task<BusinessResult> GetCriteriaById(int criteriaId);
        public Task<BusinessResult> UpdateListCriteriaInType(ListCriteriaUpdateRequest listCriteriaUpdateRequest);
        public Task<BusinessResult> UpdateOneCriteriaInType(CriteriaUpdateRequest criteriaUpdateRequests);

    }
}
