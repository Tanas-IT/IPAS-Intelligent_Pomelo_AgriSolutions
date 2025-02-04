using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlantController : ControllerBase
    {

        private readonly IPlantService _plantService;

        public PlantController(IPlantService plantService)
        {
            _plantService = plantService;
        }

        /// <summary>
        /// Lấy thông tin cây theo ID
        /// </summary>
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)}", $"{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpGet(APIRoutes.Plant.getPlantById + "/{plant-id}", Name = "GetPlantById")]
        public async Task<IActionResult> GetPlantById([FromRoute(Name = "plant-id")]int plantId)
        {
            try
            {
                var result = await _plantService.getById(plantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy tất cả cây của một mảnh đất có phân trang
        /// </summary>
        [HttpGet(APIRoutes.Plant.getPlantOfPlot + "/{landplot-id}")]
        public async Task<IActionResult> GetAllPlantsOfPlot([FromRoute(Name = "landplot-id")]int landplotId, [FromQuery] PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _plantService.getAllPlantOfPlot(landplotId, paginationParameter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy tất cả cây của một trang trại có phân trang
        /// </summary>
        [HttpGet(APIRoutes.Plant.getPlantOfFarm + "/{farm-id}")]
        public async Task<IActionResult> GetAllPlantsOfFarm([FromRoute(Name = "farm-id")]int farmId, [FromQuery] PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _plantService.getAllPlantOfFarm(farmId, paginationParameter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Tạo mới một cây trồng
        /// </summary>
        [HttpPost(APIRoutes.Plant.createPlant)]
        public async Task<IActionResult> CreatePlant([FromForm] PlantCreateRequest plantCreateRequest)
        {
            try
            {
                var result = await _plantService.createPlant(plantCreateRequest);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Cập nhật thông tin cây trồng
        /// </summary>
        [HttpPut(APIRoutes.Plant.updatePlantInfo)]
        public async Task<IActionResult> UpdatePlant([FromBody] PlantUpdateRequest plantUpdateRequest)
        {
            try
            {
                var result = await _plantService.updatePlant(plantUpdateRequest);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Xóa cây trồng theo ID
        /// </summary>
        [HttpDelete(APIRoutes.Plant.deletePlant+ "/{plant-id}")]
        public async Task<IActionResult> DeletePlant([FromRoute(Name = "plant-id")]int plantId)
        {
            try
            {
                var result = await _plantService.deletePlant(plantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Xóa nhiều cây trồng cùng lúc
        /// </summary>
        [HttpDelete(APIRoutes.Plant.deleteMultiplePlant)]
        public async Task<IActionResult> DeleteMultiplePlants([FromBody] List<int> plantIds)
        {
            try
            {
                var result = await _plantService.deleteMultiplePlant(plantIds);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                });
            }
        }
    }
}
