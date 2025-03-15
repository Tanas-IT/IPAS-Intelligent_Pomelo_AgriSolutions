using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.TaskFeedbackModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskFeedbackController : ControllerBase
    {
        private readonly ITaskFeedbackService _taskFeedbackService;

        public TaskFeedbackController(ITaskFeedbackService taskFeedbackService)
        {
            _taskFeedbackService = taskFeedbackService;
        }

        [HttpGet(APIRoutes.TaskFeedback.getTaskFeedbackWithPagination, Name = "GetAllTaskFeedback")]
        public async Task<IActionResult> GetAllTaskFeedback(PaginationParameter paginationParameter, TaskFeedbackFilter taskFeedbackFilter)
        {
            try
            {
                var result = await _taskFeedbackService.GetAllTaskFeedbackPagination(paginationParameter, taskFeedbackFilter);
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

        [HttpGet(APIRoutes.TaskFeedback.getTaskFeedbackById, Name = "GetTaskFeedbackById")]
        public async Task<IActionResult> GetTaskFeedbackById([FromRoute] int id)
        {
            try
            {
                var result = await _taskFeedbackService.GetTaskFeedbackByID(id);
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

        [HttpGet(APIRoutes.TaskFeedback.getTaskFeedbackByManagerId, Name = "GetTaskFeedbackByManagerId")]
        public async Task<IActionResult> GetTaskFeedbackByManagerId([FromRoute] int id)
        {
            try
            {
                var result = await _taskFeedbackService.GetTaskFeedbackByManagerId(id);
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

        [HttpGet(APIRoutes.TaskFeedback.getTaskFeedbackByWorkLogId, Name = "GetTaskFeedbackByWorkLogId")]
        public async Task<IActionResult> GetTaskFeedbackByWorkLogId([FromRoute] int id)
        {
            try
            {
                var result = await _taskFeedbackService.GetTaskFeedbackByWorkLogId(id);
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

        [HttpPost(APIRoutes.TaskFeedback.createTaskFeedback, Name = "createTaskFeedback")]
        public async Task<IActionResult> CreateTaskFeedback([FromBody] CreateTaskFeedbackModel createTaskFeedbackModel)
        {
            try
            {
                var result = await _taskFeedbackService.CreateTaskFeedback(createTaskFeedbackModel);
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

        [HttpPut(APIRoutes.TaskFeedback.updateTaskFeedbackInfo, Name = "updateTaskFeedback")]
        public async Task<IActionResult> UpdateTaskFeedback([FromBody] UpdateTaskFeedbackModel updateTaskFeedbackModel)
        {
            try
            {
                var result = await _taskFeedbackService.UpdateTaskFeedbackInfo(updateTaskFeedbackModel);
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

        [HttpDelete(APIRoutes.TaskFeedback.deleteTaskFeedback, Name = "deleteTaskFeedback")]
        public async Task<IActionResult> DeleteTaskFeedback([FromRoute] int id)
        {
            try
            {
                var result = await _taskFeedbackService.PermanentlyDeleteTaskFeedback(id);
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
