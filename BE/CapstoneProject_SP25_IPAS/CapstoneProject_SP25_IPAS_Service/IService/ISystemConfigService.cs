using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.SystemConfigRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ISystemConfigService
    {
        public Task<BusinessResult> createSystemConfig(CreateSystemConfigRequest request);
        public Task<BusinessResult> updateSystemConfig(UpdateSystemConfigRequest historyUpdateRequest);
        public Task<BusinessResult> getSystemConfig(int configId);
        public Task<BusinessResult> getSystemConfigPagin(GetSystemConfigRequest filterRequest, PaginationParameter paginationParameter);
        public Task<BusinessResult> deleteSystemConfig(int configId);
        public Task<BusinessResult> GetSystemConfigsForSelected(string configKey);
        public Task<BusinessResult> GetSystemConfigsAddable();
        public Task<BusinessResult> GetSystemConfigGroupsForSelected();
        public Task<BusinessResult> getAllSystemConfigNoPagin(GetConfigNoPaginRequest filterRequest);
        public Task<BusinessResult> getAllSystemConfigForSelected(string configGroup, string? configKey);


    }
}
