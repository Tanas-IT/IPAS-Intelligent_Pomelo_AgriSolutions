using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandRowRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_API.Middleware;

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

        [HttpGet(APIRoutes.LandRow.getLandRowById + "/{id}", Name = "getLandRowByIdAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.LandRow.getLandRowOfPlotNoPagin + "/{plotId}", Name = "getAllLandRowOfLandPlotNoPaginAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.LandRow.getLandRowForSelected + "/{plot-id}", Name = "getLandRowForSelectedAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.LandRow.getLandRowOfPlotPagin, Name = "getLandRowOfPlotPaginAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        /// <summary>
        /// lấy ra những index chưa có cây trồng theo hàng
        /// </summary>
        [HttpGet(APIRoutes.LandRow.getSelectedIndexEmptyInRow + "/{row-id}", Name = "getSelectedIndexEmptyInRowAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
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

        [HttpGet(APIRoutes.LandRow.exportCSV)]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> ExportRowCsv([FromQuery] GetPlantRowPaginRequest request)
        {
            var result = await _landRowService.ExportExcelByPlot(request);

            if (result.StatusCode != 200 || result.Data == null)
            {
                return Ok(result);
            }

            var file = result.Data as ExportFileResult;
            return File(file!.FileBytes, file.ContentType, file.FileName);
        }

    }
}
