﻿using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProcessController : ControllerBase
    {
        private readonly IProcessService _processService;

        public ProcessController(IProcessService processService)
        {
            _processService = processService;
        }

        [HttpGet(APIRoutes.Process.getProcessWithPagination, Name = "getAllProcessPaginationAsync")]
        public async Task<IActionResult> GetAllProcess(PaginationParameter paginationParameter, ProcessFilters processFilters)
        {
            try
            {
                var result = await _processService.GetAllProcessPagination(paginationParameter, processFilters);
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

        [HttpGet(APIRoutes.Process.getProcessDataOfProcess, Name = "getProcessDataOfProcessAsync")]
        public async Task<IActionResult> GetProcessDataOfProcess([FromRoute] int id)
        {
            try
            {
                var result = await _processService.GetProcessDataByID(id);
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

        [HttpPost(APIRoutes.Process.createProcess, Name = "createProcessAsync")]
        public async Task<IActionResult> CreateProcess([FromForm] CreateProcessModel createProcessModel)
        {
            try
            {
                var result = await _processService.CreateProcess(createProcessModel);
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

        [HttpPost(APIRoutes.Process.createManyProcess, Name = "createManyProcessAsync")]
        public async Task<IActionResult> CreateManyProcess([FromForm] List<CreateProcessModel> listCreateProcessModel)
        {
            try
            {
                var result = await _processService.InsertManyProcess(listCreateProcessModel);
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
    }
}
