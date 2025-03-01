using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandRowRequest;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_Common.Utils;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LandRowController : ControllerBase
    {
        private readonly ILandRowService _landRowService;

        public LandRowController(ILandRowService landRowService)
        {
            _landRowService = landRowService;
        }

        //[HybridAuthorize("Admin,User", "Owner,Manager")]
        [HttpGet(APIRoutes.LandRow.getLandRowById + "/{id}", Name = "getLandRowByIdAsync")]
        public async Task<IActionResult> GetLandRowByIdAsync([FromRoute(Name = "id")] int landRowId)
        {
            try
            {
                var result = await _landRowService.GetLandRowById(landRowId);
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

        //[HybridAuthorize("Admin,User", "Owner,Manager")]
        [HttpGet(APIRoutes.LandRow.getLandRowOfPlotNoPagin + "/{plotId}", Name = "getAllLandRowOfLandPlotNoPaginAsync")]
        public async Task<IActionResult> GetAllLandRowOfLandPlotNoPaginAsync([FromRoute(Name = "plotId")] int plotId)
        {
            try
            {
                var result = await _landRowService.GetAllLandRowOfLandPlotNoPagin(plotId);
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

        [HttpPost(APIRoutes.LandRow.createLandRow, Name = "createLandRowAsync")]
        public async Task<IActionResult> CreateLandRowAsync([FromBody] CreateLandRowRequest createRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _landRowService.CreateLandRow(createRequest);
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

        [HttpPut(APIRoutes.LandRow.updateLandRowInfo, Name = "updateLandRowInfoAsync")]
        public async Task<IActionResult> UpdateLandRowInfoAsync([FromBody] UpdateLandRowRequest updateRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _landRowService.UpdateLandRowInfo(updateRequest);
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

        [HttpDelete(APIRoutes.LandRow.deleteLandRow + "/{id}", Name = "deleteLandRowOfFarmAsync")]
        public async Task<IActionResult> DeleteLandRowOfFarmAsync([FromRoute(Name = "id")] int rowId)
        {
            try
            {
                var result = await _landRowService.DeleteLandRowOfFarm(rowId);
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

        //[HybridAuthorize("Admin,User", "Owner,Manager")]
        [HttpGet(APIRoutes.LandRow.getLandRowForSelected + "/{plot-id}", Name = "getLandRowForSelectedAsync")]
        public async Task<IActionResult> getLandRowForSelectedAsync([FromRoute(Name = "plot-id")] int plotId)
        {
            try
            {
                var result = await _landRowService.GetLandRowForSelectedByPlotId(plotId);
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

        //[HybridAuthorize("Admin,User", "Owner,Manager")]
        [HttpGet(APIRoutes.LandRow.getLandRowOfPlotPagin, Name = "getLandRowOfPlotPaginAsync")]
        public async Task<IActionResult> getLandRowOfPlotPaginAsync([FromQuery] GetPlantRowPaginRequest request, PaginationParameter paginationParameter)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = errors.ToString(),

                    });
                }
                var result = await _landRowService.GetRowPaginByPlot(request, paginationParameter: paginationParameter);
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

        [HttpPatch(APIRoutes.LandRow.softedDeleteMultipleRow, Name = "softedDeleteMultipleRow")]
        public async Task<IActionResult> softedDeleteMultipleRow([FromBody] List<int> rowIds)
        {
            try
            {
                var result = await _landRowService.SoftedMultipleDelete(rowIds);
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

        //[HybridAuthorize("Admin,User", "Owner,Manager")]
        [HttpGet(APIRoutes.LandRow.getSelectedIndexEmptyInRow + "/{row-id}", Name = "getSelectedIndexEmptyInRowAsync")]
        public async Task<IActionResult> getSelectedIndexEmptyInRowAsync([FromRoute(Name = "row-id")] int rowId)
        {
            try
            {
                var result = await _landRowService.GetForSelectedIndexEmptyInRow(rowId);
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
