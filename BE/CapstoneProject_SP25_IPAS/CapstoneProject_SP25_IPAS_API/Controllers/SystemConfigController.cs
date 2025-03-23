using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PartnerRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.SystemConfigRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemConfigController : ControllerBase
    {
        private readonly ISystemConfigService _systemConfigService;

        public SystemConfigController(ISystemConfigService systemConfigService)
        {
            _systemConfigService = systemConfigService;
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.SystemConfig.getSystemConfigPagination, Name = "getSystemConfigPagination")]
        public async Task<IActionResult> getSystemConfigPagination([FromQuery] GetSystemConfigRequest filterRequest, [FromQuery] PaginationParameter paginationParameter)
        {
            var result = await _systemConfigService.getAllSystemConfig(filterRequest, paginationParameter);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.SystemConfig.getSystemConfigById + "/{id}", Name = "getSystemConfigById")]
        public async Task<IActionResult> getSystemConfigById([FromRoute(Name = "id")] int id)
        {
            var result = await _systemConfigService.getSystemConfig(id);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.SystemConfig.createSystemConfig, Name = "createSystemConfig")]
        public async Task<IActionResult> createSystemConfig([FromBody] CreateSystemConfigRequest createModel)
        {
            var result = await _systemConfigService.createSystemConfig(createModel);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPut(APIRoutes.SystemConfig.updateSystemConfig, Name = "updateSystemConfig")]
        public async Task<IActionResult> updateSystemConfig([FromBody] UpdateSystemConfigRequest updateModel)
        {
            var result = await _systemConfigService.updateSystemConfig(updateModel);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.SystemConfig.permanenlyDelete + "/{id}", Name = "permanentlyDeleteSystemConfig")]
        public async Task<IActionResult> DeleteSystemConfig([FromRoute(Name = "id")] int id)
        {
            var result = await _systemConfigService.deleteSystemConfig(id);
            return Ok(result);
        }


        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        [HttpGet(APIRoutes.SystemConfig.getSystemConfigForSelected, Name = "getSystemConfigForSelected")]
        public async Task<IActionResult> getSystemConfigForSelected(string configKey)
        {
            var result = await _systemConfigService.GetSystemConfigsForSelected(configKey: configKey);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        [HttpGet(APIRoutes.SystemConfig.getSystemConfigAddable, Name = "getSystemConfigAddable")]
        public async Task<IActionResult> getSystemConfigAddable()
        {
            var result = await _systemConfigService.GetSystemConfigsAddable();
            return Ok(result);
        }
    }
}
