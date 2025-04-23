using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
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

        [HttpGet(APIRoutes.Plan.getPlanWithPagination, Name = "getAllPlanAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
                if (!string.IsNullOrEmpty(createPlanModel.StartTime))
                {
                    var normalizedStartTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(createPlanModel.StartTime);
                    if (normalizedStartTime != null)
                    {
                        createPlanModel.StartTime = normalizedStartTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid StartTime here
                        throw new InvalidOperationException("StartTime is invalid.");
                    }
                }

                // Validate and normalize EndTime
                if (!string.IsNullOrEmpty(createPlanModel.EndTime))
                {
                    var normalizedEndTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(createPlanModel.EndTime);
                    if (normalizedEndTime != null)
                    {
                        createPlanModel.EndTime = normalizedEndTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid EndTime here
                        throw new InvalidOperationException("EndTime is invalid.");
                    }
                }
                var result = await _planService.CreatePlan(createPlanModel, farmId, true, null);

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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> UpdatePlanAsync([FromBody] UpdatePlanModel updatePlanModel)
        {
            try
            {
                if (!string.IsNullOrEmpty(updatePlanModel.StartTime))
                {
                    var normalizedStartTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(updatePlanModel.StartTime);
                    if (normalizedStartTime != null)
                    {
                        updatePlanModel.StartTime = normalizedStartTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid StartTime here
                        throw new InvalidOperationException("StartTime is invalid.");
                    }
                }

                // Validate and normalize EndTime
                if (!string.IsNullOrEmpty(updatePlanModel.EndTime))
                {
                    var normalizedEndTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(updatePlanModel.EndTime);
                    if (normalizedEndTime != null)
                    {
                        updatePlanModel.EndTime = normalizedEndTime; // Gán giá trị chuẩn hóa lại
                    }
                    else
                    {
                        // Handle invalid EndTime here
                        throw new InvalidOperationException("EndTime is invalid.");
                    }
                }
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HttpDelete(APIRoutes.Plan.deleteManyPlan, Name = "deleteManyPlanAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HttpPatch(APIRoutes.Plan.softDeletePlan, Name = "softDeletePlanAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpPatch(APIRoutes.Plan.unSoftDeletePlan, Name = "unSoftDeletePlanAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpPost(APIRoutes.Plan.filterTypeWorkByGrowthStage, Name = "filterTypeWorkByGrowthStage")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpPost(APIRoutes.Plan.createManyPlan, Name = "createManyPlan")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> createManyPlan([FromBody] List<CreatePlanModel> createPlanModel, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                foreach(var planModel in createPlanModel)
                {
                    if (!string.IsNullOrEmpty(planModel.StartTime))
                    {
                        var normalizedStartTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(planModel.StartTime);
                        if (normalizedStartTime != null)
                        {
                            planModel.StartTime = normalizedStartTime; // Gán giá trị chuẩn hóa lại
                        }
                        else
                        {
                            // Handle invalid StartTime here
                            throw new InvalidOperationException("StartTime is invalid.");
                        }
                    }

                    // Validate and normalize EndTime
                    if (!string.IsNullOrEmpty(planModel.EndTime))
                    {
                        var normalizedEndTime = FlexibleTimeAttribute.NormalizeTo24HourFormat(planModel.EndTime);
                        if (normalizedEndTime != null)
                        {
                            planModel.EndTime = normalizedEndTime; // Gán giá trị chuẩn hóa lại
                        }
                        else
                        {
                            // Handle invalid EndTime here
                            throw new InvalidOperationException("EndTime is invalid.");
                        }
                    }
                }
                var result = await _planService.CreateManyPlan(createPlanModel, farmId);
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
        [HttpGet(APIRoutes.Plan.getPlanByProcessId, Name = "getPlanByProcessId")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getPlanByProcessId([FromRoute] int id)
        {
            try
            {
                var result = await _planService.GetPlanByProcessID(id);
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


        [HttpGet(APIRoutes.Plan.getPlanOfTarget, Name = "getPlanOfTarget")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getPlanOfTarget([FromQuery]GetPlanOfTargetRequest filterRequest, PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _planService.GetPlanOfTarget(filterRequest, paginationParameter);
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

        [HttpGet(APIRoutes.Plan.getProcessByPlanId, Name = "getProcessByPlanId")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getProcessByPlanId([FromRoute] int id, [FromQuery] int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _planService.GetProcessByPlanId(id, farmId.Value);
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
