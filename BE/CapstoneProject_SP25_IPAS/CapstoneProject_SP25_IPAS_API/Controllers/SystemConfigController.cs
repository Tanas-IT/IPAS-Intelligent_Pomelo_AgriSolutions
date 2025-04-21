using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PartnerRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.SystemConfigRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
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
        [HttpGet(APIRoutes.SystemConfig.getSystemConfigPagination, Name = "getSystemConfigPagination")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> getSystemConfigPagination([FromQuery] GetSystemConfigRequest filterRequest, [FromQuery] PaginationParameter paginationParameter)
        {
            var result = await _systemConfigService.getSystemConfigPagin(filterRequest, paginationParameter);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        [HttpGet(APIRoutes.SystemConfig.getSystemConfigById + "/{id}", Name = "getSystemConfigById")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> getSystemConfigById([FromRoute(Name = "id")] int id)
        {
            var result = await _systemConfigService.getSystemConfig(id);
            return Ok(result);
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        [HttpPost(APIRoutes.SystemConfig.createSystemConfig, Name = "createSystemConfig")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> createSystemConfig([FromBody] CreateSystemConfigRequest createModel)
        {
            var result = await _systemConfigService.createSystemConfig(createModel);
            return Ok(result);
        }

        [HttpPut(APIRoutes.SystemConfig.updateSystemConfig, Name = "updateSystemConfig")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]

        public async Task<IActionResult> updateSystemConfig([FromBody] UpdateSystemConfigRequest updateModel)
        {
            var result = await _systemConfigService.updateSystemConfig(updateModel);
            return Ok(result);
        }

        [HttpDelete(APIRoutes.SystemConfig.permanenlyDelete + "/{id}", Name = "permanentlyDeleteSystemConfig")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> DeleteSystemConfig([FromRoute(Name = "id")] int id)
        {
            var result = await _systemConfigService.deleteSystemConfig(id);
            return Ok(result);
        }


        [HttpGet(APIRoutes.SystemConfig.getSystemConfigForSelected, Name = "getSystemConfigForSelected")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]

        public async Task<IActionResult> getSystemConfigForSelected(string configGroup,string? configKey)
        {
            var result = await _systemConfigService.getAllSystemConfigForSelected(configGroup: configGroup,configKey: configKey);
            return Ok(result);
        }

        [HttpGet(APIRoutes.SystemConfig.getSystemConfigAddable, Name = "getSystemConfigAddable")]
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> getSystemConfigAddable()
        {
            var result = await _systemConfigService.GetSystemConfigsAddable();
            return Ok(result);
        }

        [HttpGet(APIRoutes.SystemConfig.getSystemConfigGroup, Name = "getSystemConfigGroup")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)}, {nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        public async Task<IActionResult> getSystemConfigGroup()
        {
            var result = await _systemConfigService.GetSystemConfigGroupsForSelected();
            return Ok(result);
        }

        [HttpGet(APIRoutes.SystemConfig.getSystemConfigNoPagin, Name = "getSystemConfigNoPagin")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)}, {nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        public async Task<IActionResult> getSystemConfigNoPagin([FromQuery] GetConfigNoPaginRequest filterRequest)
        {
            var result = await _systemConfigService.getAllSystemConfigNoPagin(filterRequest);
            return Ok(result);
        }
    }
}
