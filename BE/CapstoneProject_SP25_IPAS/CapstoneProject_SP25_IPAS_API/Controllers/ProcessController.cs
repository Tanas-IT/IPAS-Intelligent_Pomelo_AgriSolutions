using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_Service.Service;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_Common.Enum;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProcessController : ControllerBase
    {
        private readonly IProcessService _processService;
        private readonly IJwtTokenService _jwtTokenService;
        public ProcessController(IProcessService processService, IJwtTokenService jwtTokenService)
        {
            _processService = processService;
            _jwtTokenService = jwtTokenService;
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Process.getProcessWithPagination, Name = "getAllProcessPaginationAsync")]
        public async Task<IActionResult> GetAllProcess(PaginationParameter paginationParameter, ProcessFilters processFilters, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _processService.GetAllProcessPagination(paginationParameter, processFilters, farmId.Value);
                return Ok(result);

            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Process.getProcessByName, Name = "getProcessByNameAsync")]
        public async Task<IActionResult> GetProcessByName([FromRoute] string name)
        {
            try
            {
                var result = await _processService.GetProcessByName(name);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }



        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Process.getProcessById, Name = "getProcessByIdAsync")]
        public async Task<IActionResult> GetProcessByIdAsync([FromRoute] int id)
        {
            try
            {
                var result = await _processService.GetProcessByID(id);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.Process.createProcess, Name = "createProcessAsync")]
        public async Task<IActionResult> CreateProcess([FromForm] CreateProcessModel createProcessModel, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _processService.CreateProcess(createProcessModel, farmId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.Process.createManyProcess, Name = "createManyProcessAsync")]
        public async Task<IActionResult> CreateManyProcess([FromBody] List<CreateManyProcessModel> listCreateProcessModel, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _processService.InsertManyProcess(listCreateProcessModel, farmId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPut(APIRoutes.Process.updateProcessInfo, Name = "updateProcessInfoAsync")]
        public async Task<IActionResult> UpdateProcessAsync([FromForm] UpdateProcessModel updateProcessModel)
        {
            try
            {
                var result = await _processService.UpdateProcessInfo(updateProcessModel);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.Process.permanenlyDelete, Name = "deleteProcessAsync")]
        public async Task<IActionResult> DeleteProcessAsync([FromRoute] int id)
        {
            try
            {
                var result = await _processService.PermanentlyDeleteProcess(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPatch(APIRoutes.Process.softDeleteProcess, Name = "softDeleteProcessAsync")]
        public async Task<IActionResult> SoftDeleteProcessAsync([FromBody] List<int> listProcessId)
        {
            try
            {
                var result = await _processService.SoftDeleteProcess(listProcessId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpGet(APIRoutes.Process.getProcessesForSelect, Name = "getProcessesForSelectAsync")]
        public async Task<IActionResult> getProcessesForSelect(int? farmId, string? searchValue, bool? isSample)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _processService.GetForSelect(farmId!.Value, searchValue, isSample);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpGet(APIRoutes.Process.getProccessByTypeName, Name = "getProccessByTypeName")]
        public async Task<IActionResult> getProccessByTypeName(int? farmId, string typeName)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _processService.GetProcessByTypeName(farmId!.Value, typeName);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
    }
}
