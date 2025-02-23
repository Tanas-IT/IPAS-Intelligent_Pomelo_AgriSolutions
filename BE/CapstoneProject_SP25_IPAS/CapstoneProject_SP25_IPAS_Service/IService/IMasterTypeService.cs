using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IMasterTypeService
    {
        public Task<BusinessResult> GetMasterTypeByID(int MasterTypeId);

        public Task<BusinessResult> GetAllMasterTypePagination(PaginationParameter paginationParameter, MasterTypeFilter masterTypeFilter, int farmId);

        public Task<BusinessResult> CreateMasterType(CreateMasterTypeRequestModel createMasterTypeModel);

        public Task<BusinessResult> UpdateMasterTypeInfo(UpdateMasterTypeModel updateriteriaTypeModel);

        public Task<BusinessResult> PermanentlyDeleteMasterType(int MasterTypeId);
        public Task<BusinessResult> SoftedMultipleDelete(List<int> MasterTypeIds);

        public Task<BusinessResult> GetMasterTypeByName(string MasterTypeName, int farmId);
        public Task<BusinessResult> PermanentlyDeleteManyMasterType(List<int> MasterTypeId);
    }
}
