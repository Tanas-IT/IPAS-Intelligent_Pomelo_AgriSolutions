using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterTypeController : ControllerBase
    {

        private readonly IMasterTypeService _masterTypeService;
        private readonly IJwtTokenService _jwtTokenService;
        public MasterTypeController(IMasterTypeService masterTypeService, IJwtTokenService jwtTokenService)
        {
            _masterTypeService = masterTypeService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpGet(APIRoutes.MasterType.getMasterTypeWithPagination, Name = "getAllMasterType")]
        public async Task<IActionResult> GetAllMasterType(PaginationParameter paginationParameter, MasterTypeFilter masterTypeFilter, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _masterTypeService.GetAllMasterTypePagination(paginationParameter, masterTypeFilter, farmId!.Value);
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

        [HttpGet(APIRoutes.MasterType.getMasterTypeById, Name = "getMasterTypeById")]
        public async Task<IActionResult> GetMasterTypeById([FromRoute] int id)
        {
            try
            {
                var result = await _masterTypeService.GetMasterTypeByID(id);
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

        [HttpGet(APIRoutes.MasterType.getMasterTypeByName, Name = "getMasterTypeByName")]
        public async Task<IActionResult> GetMasterTypeByName([FromQuery(Name = "typeName")] string typeName, int? farmId)
        {
            try
            {
                if(!farmId.HasValue)
                farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue || string.IsNullOrEmpty(typeName))
                    return BadRequest();
                var result = await _masterTypeService.GetMasterTypeByName(typeName, farmId!.Value);
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

        [HttpPost(APIRoutes.MasterType.createMasterType, Name = "createMasterType")]
        public async Task<IActionResult> CreateMasterType([FromBody] CreateMasterTypeRequestModel createMasterTypeModel)
        {
            try
            {
                if (!createMasterTypeModel.FarmId.HasValue)
                    createMasterTypeModel.FarmId = _jwtTokenService.GetFarmIdFromToken();
                var result = await _masterTypeService.CreateMasterType(createMasterTypeModel);
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

        [HttpPut(APIRoutes.MasterType.updateMasterTypeInfo, Name = "updateMasterType")]
        public async Task<IActionResult> UpdateMasterType([FromBody] UpdateMasterTypeModel updateMasterTypeModel)
        {
            try
            {
                var result = await _masterTypeService.UpdateMasterTypeInfo(updateMasterTypeModel);
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

        [HttpDelete(APIRoutes.MasterType.permanenlyDelete, Name = "deleteMasterType")]
        public async Task<IActionResult> DeleteMasterType([FromRoute] int id)
        {
            try
            {
                var result = await _masterTypeService.PermanentlyDeleteMasterType(id);
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

        [HttpDelete(APIRoutes.MasterType.permanenlyDeletemanyMasterType, Name = "deleteManyMasterType")]
        public async Task<IActionResult> DeleteManyMasterType([FromBody] List<int> masterTypeId)
        {
            try
            {
                var result = await _masterTypeService.PermanentlyDeleteManyMasterType(masterTypeId);
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
        [HttpPatch(APIRoutes.MasterType.softedDelete, Name = "SoftedDeleteMasterType")]
        public async Task<IActionResult> SoftedDeleteMasterType([FromBody] List<int> MasterTypeIds)
        {
            try
            {
                var result = await _masterTypeService.SoftedMultipleDelete(MasterTypeIds);
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

        [HttpGet(APIRoutes.MasterType.getForSelected, Name = "getMasterTypeForSelected")]
        public async Task<IActionResult> getMasterTypeForSelected([FromQuery] string typeName,string target, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue || string.IsNullOrEmpty(typeName))
                    return BadRequest();
                var result = await _masterTypeService.GetMasterTypeForSelected(MasterTypeName: typeName, farmId:farmId!.Value, target: target);
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
