using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel;
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpGet(APIRoutes.Report.DashboardReport, Name = "DashboardReport")]
        public async Task<IActionResult> DashboardReport(int? year, int? month, int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.Dashboard(year,month,farmId);
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
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
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [HttpGet(APIRoutes.Report.GetWeatherOfFarm, Name = "GetWeatherOfFarm")]
        public async Task<IActionResult> GetWeatherOfFarm([FromQuery] int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.GetWeatherOfFarm(farmId.Value);
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

        [HttpGet(APIRoutes.Report.StatisticEmployee, Name = "StatisticEmployee")]
        public async Task<IActionResult> StatisticEmployee([FromQuery] int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.StatisticEmployee(farmId.Value);
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

        [HttpGet(APIRoutes.Report.StatisticPlan, Name = "StatisticPlan")]
        public async Task<IActionResult> StatisticPlan([FromQuery] int? farmId, int? month, int? year)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.StatisticPlan(month, year, farmId);
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

        [HttpGet(APIRoutes.Report.WorkPerformance, Name = "WorkPerformance")]
        public async Task<IActionResult> WorkPerformance([FromQuery] int? farmId, [FromQuery] int? top, [FromQuery] string? search, [FromQuery] double? score )
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var workPerformance = new WorkPerformanceRequestDto()
                {
                    Score = score,
                    Search = search,
                    Top = top,
                };
                var result = await _reportService.GetWorkPerformanceAsync(workPerformance, farmId);
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

        [HttpPost(APIRoutes.Report.CompareWorkPerformance, Name = "CompareWorkPerformance")]
        public async Task<IActionResult> CompareWorkPerformance([FromQuery] int? farmId, [FromBody] WorkPerFormanceCompareDto workPerFormanceCompareDto)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _reportService.GetWorkPerformanceCompareAsync(workPerFormanceCompareDto, farmId);
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
