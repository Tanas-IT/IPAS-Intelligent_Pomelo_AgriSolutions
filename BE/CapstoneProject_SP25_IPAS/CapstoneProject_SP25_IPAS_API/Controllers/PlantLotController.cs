using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlantLotController : ControllerBase
    {
        private readonly IPlantLotService _plantLotService;

        public PlantLotController(IPlantLotService plantLotService)
        {
            _plantLotService = plantLotService;
        }

        [HttpGet(APIRoutes.PlantLot.getPlantLotWithPagination, Name = "getPlantLotWithPagination")]
        public async Task<IActionResult> GetAllPlantLot(PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _plantLotService.GetAllPlantLots(paginationParameter);
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

        [HttpGet(APIRoutes.PlantLot.getPlantLotById, Name = "getPlantLotById")]
        public async Task<IActionResult> GetPlantLotById([FromRoute] int id)
        {
            try
            {
                var result = await _plantLotService.GetPlantLotById(id);
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

        [HttpPost(APIRoutes.PlantLot.createPlantLot, Name = "createPlantLot")]
        public async Task<IActionResult> CreatePlantLot([FromBody] CreatePlantLotModel createPlantLotModel)
        {
            try
            {
                var result = await _plantLotService.CreatePlantLot(createPlantLotModel);
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

        [HttpPut(APIRoutes.PlantLot.updatePlantLotInfo, Name = "updatePlantLotInfo")]
        public async Task<IActionResult> UpdatePlantLot([FromBody] UpdatePlantLotModel updatePlantLotModel)
        {
            try
            {
                var result = await _plantLotService.UpdatePlantLot(updatePlantLotModel);
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
        [HttpDelete(APIRoutes.PlantLot.permanenlyDelete, Name = "permanentlyDeletePlantLot")]
        public async Task<IActionResult> DeletePlantLot([FromRoute] int id)
        {
            try
            {
                var result = await _plantLotService.DeletePlantLot(id);
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

        [HttpPost(APIRoutes.PlantLot.createManyPlantFromPlantLot, Name = "createmanyPlantFromPlantLot")]
        public async Task<IActionResult> CreateManyPlant([FromBody] List<CriteriaForPlantLotRequestModel> criteriaForPlantLotRequestModels, [FromQuery] int quantity)
        {
            try
            {
                var result = await _plantLotService.CreateManyPlant(criteriaForPlantLotRequestModels, quantity);
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

        [HttpPost(APIRoutes.PlantLot.FillPlantToPlot, Name = "FillPlantToPlotAsync")]
        public async Task<IActionResult> FillPlantToPlotAsync([FromBody] FillPlanToPlotRequest fillRequest)
        {
            try
            {
                var result = await _plantLotService.FillPlantToPlot(fillRequest);
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

        [HttpGet(APIRoutes.PlantLot.GetPlantPlotForSelected, Name = "GetPlantPlotForSelected")]
        public async Task<IActionResult> GetPlantPlotForSelected([FromQuery] int id)
        {
            try
            {
                var result = await _plantLotService.GetPlantLotById(id);
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
