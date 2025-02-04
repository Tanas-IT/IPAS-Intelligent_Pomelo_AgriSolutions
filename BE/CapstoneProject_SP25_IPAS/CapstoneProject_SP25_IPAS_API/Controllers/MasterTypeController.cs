using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Payloads.Response;
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
        public MasterTypeController(IMasterTypeService masterTypeService)
        {
            _masterTypeService = masterTypeService;
        }

        [HttpGet(APIRoutes.MasterType.getMasterTypeWithPagination, Name = "getAllMasterType")]
        public async Task<IActionResult> GetAllMasterType(PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _masterTypeService.GetAllMasterTypePagination(paginationParameter);
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
        public async Task<IActionResult> GetMasterTypeByName([FromRoute] string name)
        {
            try
            {
                var result = await _masterTypeService.GetMasterTypeByName(name);
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
        public async Task<IActionResult> CreateMasterType([FromBody] CreateMasterTypeModel createMasterTypeModel)
        {
            try
            {
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

    }
}
