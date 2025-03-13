using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageMasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GrowthStageMasterTypeController : ControllerBase
    {
        private readonly IGrowthStageMasterTypeService _growthStageMasterTypeService;
        private readonly IJwtTokenService _jwtTokenService;
        public GrowthStageMasterTypeController(IGrowthStageMasterTypeService growthStageMasterTypeService, IJwtTokenService jwtTokenService)
        {
            _growthStageMasterTypeService = growthStageMasterTypeService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost(APIRoutes.GrowthStageMasterType.createGrowthStageMasterType, Name = "createGrowthStageMasterType")]
        public async Task<IActionResult> CreateGrowthStageMasterTypeAsync([FromBody] List<CreateGrowthStageMasterTypeModel> createGrowthStageMasterTypeModel, int? farmId)
        {
            try
            {
                if(!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _growthStageMasterTypeService.CreateGrowthStageMasterType(createGrowthStageMasterTypeModel, farmId.Value);
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

        [HttpGet(APIRoutes.GrowthStageMasterType.getGrowthStageMasterType, Name = "getGrowthStageMasterType")]
        public async Task<IActionResult> GetGrowthStageMasterTypeAsync(int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _growthStageMasterTypeService.GetGrowthStageMasterTypeByFarmId(farmId.Value);
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


        [HttpPut(APIRoutes.GrowthStageMasterType.updateGrowthStageMasterTypeInfo, Name = "updateGrowthStageMasterTypeInfo")]
        public async Task<IActionResult> UpdateGrowthStageMasterTypeAsync([FromBody] UpdateGrowthStageMasterTypeModel updateGrowthStageMasterTypeModel, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                var result = await _growthStageMasterTypeService.UpdateGrowthStageMasterType(updateGrowthStageMasterTypeModel, farmId.Value);
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

        [HttpPut(APIRoutes.GrowthStageMasterType.deleteGrowthStageMasterType, Name = "deleteGrowthStageMasterType")]
        public async Task<IActionResult> DeleteGrowthStageMasterTypeAsync([FromBody] List<int> deleteGrowthStageIds)
        {
            try
            {
                var result = await _growthStageMasterTypeService.DeleteGrowthStageMasterType(deleteGrowthStageIds);
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
