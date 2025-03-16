using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json;
using System.Net.WebSockets;
using System.Text;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlanController : ControllerBase
    {
        private readonly IPlanService _planService;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IWebSocketService _webSocketService;

        public PlanController(IPlanService planService, IJwtTokenService jwtTokenService, IWebSocketService webSocketService)
        {
            _planService = planService;
            _jwtTokenService = jwtTokenService;
            _webSocketService = webSocketService;
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
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


        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.Plan.createPlan, Name = "createPlanAsync")]
        public async Task<IActionResult> CreatePlanAsync([FromBody] CreatePlanModel createPlanModel, int? farmId)
        {
            try
            {

                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue)
                {
                    var response = new BaseResponse
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Farm Id is Requried"
                    };
                }
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


        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpDelete(APIRoutes.Plan.deleteManyPlan, Name = "deleteManyPlanAsync")]
        public async Task<IActionResult> DeleteManyPlan([FromBody] List<int> planIds)
        {
            try
            {
                var result = await _planService.PermanentlyDeleteManyPlan(planIds);
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
        [HttpPatch(APIRoutes.Plan.softDeletePlan, Name = "softDeletePlanAsync")]
        public async Task<IActionResult> SoftDeletePlan([FromBody] List<int> PlanIds)
        {
            try
            {
                var result = await _planService.SoftDeleteMultiplePlan(PlanIds);
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
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

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpPost(APIRoutes.Plan.filterByGrowthStage, Name = "filterByGrowthStage")]
        public async Task<IActionResult> FilterByGrowthStage([FromBody] ListGrowthStageModel listGrowthStageModel, int? farmId, string unit)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _planService.GetListPlantByFilterGrowthStage(listGrowthStageModel.ListGrowthStage, farmId.Value, unit);
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
        [HttpPost(APIRoutes.Plan.filterTypeWorkByGrowthStage, Name = "filterTypeWorkByGrowthStage")]
        public async Task<IActionResult> FilterTypeWorkByGrowthStage([FromBody] ListGrowthStageModel listGrowthStageModel)
        {
            try
            {
                var result = await _planService.FilterTypeOfWorkByGrowthStageIds(listGrowthStageModel.ListGrowthStage);
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

        [HttpPost(APIRoutes.Plan.filterTypeNameByGrowthStage, Name = "filterTypeNameByGrowthStage")]
        public async Task<IActionResult> FilterTypeNameByGrowthStage([FromBody] ListFilterGrowthStageModel listFilterGrowthStageModel)
        {
            try
            {
                var result = await _planService.FilterMasterTypeByGrowthStageIds(listFilterGrowthStageModel.ListGrowthStage, listFilterGrowthStageModel.TypeName);
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
