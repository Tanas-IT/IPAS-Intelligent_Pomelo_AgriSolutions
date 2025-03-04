using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlanController : ControllerBase
    {
        private readonly IPlanService _planService;
        private readonly IJwtTokenService _jwtTokenService;

        public PlanController(IPlanService planService, IJwtTokenService jwtTokenService)
        {
            _planService = planService;
            _jwtTokenService = jwtTokenService;

        }

        [HttpGet(APIRoutes.Plan.getPlanWithPagination, Name = "getAllPlanAsync")]
        public async Task<IActionResult> GetAllPlanWithPagination(PaginationParameter paginationParameter, PlanFilter planFilter, int? farmId)
        {
            try
            {

                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _planService.GetAllPlanPagination(paginationParameter, planFilter, farmId.Value);
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
        public async Task<IActionResult> GetPlanByName([FromRoute] string name, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue || string.IsNullOrEmpty(name))
                    return BadRequest();
                var result = await _planService.GetPlanByName(name, farmId);
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
        public async Task<IActionResult> CreatePlanAsync([FromBody] CreatePlanModel createPlanModel, int? farmId)
        {
            try
            {

                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _planService.CreatePlan(createPlanModel, farmId);
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

        [HttpGet(APIRoutes.Plan.getPlanByFarmId, Name = "getPlanByFarmId")]
        public async Task<IActionResult> GetPlanByFarmId([FromRoute(Name = "farm-id")] int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _planService.GetPlanByFarmId(farmId);
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

        [HttpPost(APIRoutes.Plan.filterByGrowthStage, Name = "filterByGrowthStage")]
        public async Task<IActionResult> FilterByGrowthStage([FromBody] ListGrowthStageModel listGrowthStageModel, int? farmId, string unit)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _planService.GetListPlantByFilterGrowthStage(listGrowthStageModel.ListGrowthStage, farmId.Value,unit);
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
