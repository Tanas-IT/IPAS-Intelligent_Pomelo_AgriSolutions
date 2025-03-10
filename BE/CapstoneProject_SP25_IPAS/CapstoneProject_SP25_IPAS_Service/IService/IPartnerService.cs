using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PartnerRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PartnerModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IPartnerService
    {
        public Task<BusinessResult> GetPartnerByID(int partnerId);

        public Task<BusinessResult> GetAllPartnerPagination(GetPartnerFilterRequest filterRequest, PaginationParameter paginationParameter);

        public Task<BusinessResult> CreatePartner(CreatePartnerModel createPartnerModel);

        public Task<BusinessResult> UpdatePartnerInfo(UpdatePartnerModel updatePartnerModel);

        public Task<BusinessResult> PermanentlyDeletePartner(int partnerId);

        public Task<BusinessResult> GetPartnerByRoleName(string roleName);

        public Task<BusinessResult> GetPartnerForSelected(int farmId, string? Major);

        public Task<BusinessResult> SoftedMultipleDelete(List<int> partnerList);

    }
}
