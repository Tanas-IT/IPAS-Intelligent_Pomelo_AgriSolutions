using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.MasterTypeRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
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
        public Task<BusinessResult> GetCriteriasByMasterTypeId (int masterTypeId);
        public Task<BusinessResult> GetCriteriaById(int criteriaId);

        public Task<BusinessResult> UpdateListCriteriaInType(ListCriteriaUpdateRequest listCriteriaUpdateRequest);
        public Task<BusinessResult> UpdateOneCriteriaInType(CriteriaUpdateRequest criteriaUpdateRequests);
        public Task<BusinessResult> GetCriteriaOfTarget(GetCriteriaOfTargetRequest reqeust);
        public Task<BusinessResult> CreateCriteriaWithMasterType(CreateCriteriaMasterTypeRequest request);
        public (bool IsValid, string ErrorMessage) ValidateCriteriaPriorities(List<CriteriaCreateRequest> criteriaList);

        public Task<BusinessResult> GetAllCriteriaSetPagination(PaginationParameter paginationParameter, MasterTypeFilter masterTypeFilter, int farmId);
        //public Task<string> CheckCriteriaSetExist(int? farmId, List<string> Targetlist);
        public Task<BusinessResult> GetCriteriaSetPlantLotNotApply(int plantlotId, int farmId, string target = null);
        public Task<BusinessResult> GetCriteriaSetGraftedNotApply(int graftedId, int farmId, string target);
        public Task<BusinessResult> GetCriteriaSetPlantNotApply(int plantId, int farmId, string target);
        public Task<BusinessResult> GetCriteriaSetProductNotApply(int productId, int farmId, string target);
        public Task<BusinessResult> ExportExcel(int FarmId);
        public Task<BusinessResult> ExportExcelForObject(GetCriteriaOfTargetRequest request);

    }
}
