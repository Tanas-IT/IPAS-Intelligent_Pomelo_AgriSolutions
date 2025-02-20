using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlanController : ControllerBase
    {
        private readonly IPlanService _planService;

        public PlanController(IPlanService planService)
        {
            _planService = planService;
        }

        [HttpGet(APIRoutes.Plan.getPlanWithPagination, Name = "getAllPlanAsync")]
        public async Task<IActionResult> GetAllPlanWithPagination(PaginationParameter paginationParameter, PlanFilter planFilter)
        {
            try
            {
                var result = await _planService.GetAllPlanPagination(paginationParameter, planFilter);
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

        [HttpGet(APIRoutes.Plan.getPlanById, Name = "getPlanById")]
        public async Task<IActionResult> GetPlanById([FromRoute] int id)
        {
            try
            {
                var result = await _planService.GetPlanByID(id);
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

        [HttpGet(APIRoutes.Plan.getPlanByName, Name = "getPlanByName")]
        public async Task<IActionResult> GetPlanByName([FromRoute] string name)
        {
            try
            {
                var result = await _planService.GetPlanByName(name);
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


        [HttpPost(APIRoutes.Plan.createPlan, Name = "createPlanAsync")]
        public async Task<IActionResult> CreatePlanAsync([FromBody] CreatePlanModel createPlanModel)
        {
            try
            {
                var result = await _planService.CreatePlan(createPlanModel);
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


        [HttpPut(APIRoutes.Plan.updatePlanInfo, Name = "updatePlanAsync")]
        public async Task<IActionResult> UpdatePlanAsync([FromBody] UpdatePlanModel updatePlanModel)
        {
            try
            {
                var result = await _planService.UpdatePlanInfo(updatePlanModel);
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

        [HttpDelete(APIRoutes.Plan.deletePlan, Name = "deletePlanAsync")]
        public async Task<IActionResult> DeletePlan([FromRoute] int id)
        {
            try
            {
                var result = await _planService.PermanentlyDeletePlan(id);
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

        [HttpPatch(APIRoutes.Plan.softDeletePlan, Name = "softDeletePlanAsync")]
        public async Task<IActionResult> SoftDeletePlan([FromRoute] int id)
        {
            try
            {
                var result = await _planService.SoftDeletePlan(id);
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

        [HttpPatch(APIRoutes.Plan.unSoftDeletePlan, Name = "unSoftDeletePlanAsync")]
        public async Task<IActionResult> UnSoftDeletePlan([FromRoute] int id)
        {
            try
            {
                var result = await _planService.UnSoftDeletePlan(id);
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
