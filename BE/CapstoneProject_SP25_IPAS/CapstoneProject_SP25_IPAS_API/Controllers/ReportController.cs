using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet(APIRoutes.Report.CropCareReport, Name = "CropCareReport")]
        public async Task<IActionResult> CropCareReport(int landPlotId, int year)
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
        public async Task<IActionResult> DashboardReport(int farmId)
        {
            try
            {
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
        public async Task<IActionResult> MaterialInStore([FromRoute] int farmId, [FromQuery] int year)
        {
            try
            {
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
        public async Task<IActionResult> ProductivityByPlot([FromRoute] int farmId, [FromQuery] int year)
        {
            try
            {
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

    }

}
