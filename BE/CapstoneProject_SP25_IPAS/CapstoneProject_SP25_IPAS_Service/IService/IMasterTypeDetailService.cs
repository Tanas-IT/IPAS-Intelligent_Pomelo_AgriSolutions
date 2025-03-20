using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.MasterTypeDetailRequest;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IMasterTypeDetailService
    {
        public Task<BusinessResult> GetMasterTypeDetailByID(int MasterTypeDetailId);

        public Task<BusinessResult> GetAllMasterTypeDetailPagination(PaginationParameter paginationParameter, MasterTypeDetailFilter masterTypeDetailFilter);

        public Task<BusinessResult> CreateMasterTypeDetail(CreateMasterTypeDetailModel createMasterTypeDetailModel);

        public Task<BusinessResult> UpdateMasterTypeDetailInfo(UpdateMasterTypeDetailModel updateMasterTypeModel);

        public Task<BusinessResult> PermanentlyDeleteMasterTypeDetail(int MasterTypeDetailId);

        public Task<BusinessResult> GetMasterTypeDetailByName(string MasterTypeDetailName);
    }
}
