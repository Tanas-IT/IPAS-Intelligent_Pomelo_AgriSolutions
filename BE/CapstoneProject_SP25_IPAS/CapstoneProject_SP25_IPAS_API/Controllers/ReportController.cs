using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly IJwtTokenService _jwtTokenService;

        public ReportController(IReportService reportService, IJwtTokenService jwtTokenService)
        {
            _reportService = reportService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpGet(APIRoutes.Report.CropCareReport, Name = "CropCareReport")]
        public async Task<IActionResult> CropCareReport([FromQuery]int landPlotId, [FromQuery] int year)
        {
            try
            {
                var result = await _reportService.CropCareReport(landPlotId, year);
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

        [HttpGet(APIRoutes.Report.DashboardReport, Name = "DashboardReport")]
        public async Task<IActionResult> DashboardReport(int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.Dashboard(farmId);
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

        [HttpGet(APIRoutes.Report.MaterialsInStore, Name = "MaterialInStore")]
        public async Task<IActionResult> MaterialInStore([FromQuery] int? farmId, [FromQuery] int year)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.MaterialsInStore(year: year, farmId: farmId);
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

        [HttpGet(APIRoutes.Report.ProductivityByPlot, Name = "ProductivityByPlot")]
        public async Task<IActionResult> ProductivityByPlot([FromQuery] int? farmId, [FromQuery] int year)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.ProductivityByPlot(farmId: farmId, year: year);
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

        [HttpGet(APIRoutes.Report.PomeloQualityBreakdown, Name = "PomeloQualityReport")]
        public async Task<IActionResult> PomeloQualityBreakdown([FromQuery] int? farmId, [FromQuery] int year)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.PomeloQualityBreakDown(farmId: farmId, year: year);
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

        [HttpGet(APIRoutes.Report.SeasonYield, Name = "SeasonYield")]
        public async Task<IActionResult> SeasonYield([FromQuery] int? farmId, [FromQuery] int year)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.SeasonYield(farmId: farmId, year: year);
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
