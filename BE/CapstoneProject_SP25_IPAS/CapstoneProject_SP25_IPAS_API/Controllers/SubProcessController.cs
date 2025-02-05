using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.SubProcessModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubProcessController : ControllerBase
    {
        private readonly ISubProcessService _subProcessService;

        public SubProcessController(ISubProcessService subProcessService)
        {
            _subProcessService = subProcessService;
        }

        [HttpGet(APIRoutes.SubProcess.getSubProcessWithPagination, Name = "getAllSubProcessPaginationAsync")]
        public async Task<IActionResult> GetAllSubProcess(PaginationParameter paginationParameter, SubProcessFilters subProcessFilters)
        {
            try
            {
                var result = await _subProcessService.GetAllSubProcessPagination(paginationParameter, subProcessFilters);
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

        [HttpGet(APIRoutes.SubProcess.getSubProcessById, Name = "getSubProcessByIdAsync")]
        public async Task<IActionResult> GetSubProcessById([FromRoute] int id)
        {
            try
            {
                var result = await _subProcessService.GetSubProcessByID(id);
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
        [HttpGet(APIRoutes.SubProcess.getSubProcessByName, Name = "getSubProcessByNameAsync")]
        public async Task<IActionResult> GetSubProcessByName([FromRoute] string name)
        {
            try
            {
                var result = await _subProcessService.GetSubProcessByName(name);
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
       
        [HttpPost(APIRoutes.SubProcess.createSubProcess, Name = "createSubProcessAsync")]
        public async Task<IActionResult> CreateSubProcess([FromForm] CreateSubProcessModel createSubProcessModel)
        {
            try
            {
                var result = await _subProcessService.CreateSubProcess(createSubProcessModel);
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

        [HttpPut(APIRoutes.SubProcess.updateSubProcessInfo, Name = "updateSubProcessAsync")]
        public async Task<IActionResult> UpdateSubProcess([FromForm] UpdateSubProcessModel updateSubProcessModel)
        {
            try
            {
                var result = await _subProcessService.UpdateSubProcessInfo(updateSubProcessModel);
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

        [HttpDelete(APIRoutes.SubProcess.permanenlyDelete, Name = "deleteSubProcessAsync")]
        public async Task<IActionResult> DeleteSubProcess([FromRoute] int id)
        {
            try
            {
                var result = await _subProcessService.PermanentlyDeleteSubProcess(id);
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

        [HttpDelete(APIRoutes.SubProcess.softDeleteSubProcess, Name = "softDeleteSubProcessAsync")]
        public async Task<IActionResult> SoftDeleteSubProcessAsync([FromRoute] int id)
        {
            try
            {
                var result = await _subProcessService.SoftDeleteSubProcess(id);
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
