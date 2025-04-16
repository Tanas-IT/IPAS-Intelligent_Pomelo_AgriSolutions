using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackageController : ControllerBase
    {
        private readonly IPackageService _packageService;

        public PackageController(IPackageService packageService)
        {
            _packageService = packageService;
        }

        [HttpGet(APIRoutes.Package.getPackageById + "/{package-id}", Name = "getPackageById")]
        public async Task<IActionResult> GetPackageByIdAsync([FromRoute(Name = "package-id")] int packageId)
        {
            try
            {
                var result = await _packageService.GetPackageById(packageId);
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

        [HttpGet(APIRoutes.Package.getPackageToBuy , Name = "getPackageToBuyAsync")]
        public async Task<IActionResult> getPackageToBuyAsync()
        {
            try
            {
                var result = await _packageService.GetListPackageToBuy();
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

        [HttpGet(APIRoutes.Package.getPackage , Name = "getPackage")]
        //[HybridAuthorize(nameof(RoleEnum.ADMIN))]
        public async Task<IActionResult> getPackageAsync()
        {
            try
            {
                var result = await _packageService.GetAllPackage();
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

        [HttpPut(APIRoutes.Package.updatePackage, Name = "updatePackage")]
        //[HybridAuthorize(nameof(RoleEnum.ADMIN))]
        public async Task<IActionResult> updatePackageAsync(UpdatePackageRequest request)
        {
            try
            {
                var result = await _packageService.UpdatePackageAsync(request);
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

        [HttpPost(APIRoutes.Package.createPackage, Name = "createPackage")]
        //[HybridAuthorize(nameof(RoleEnum.ADMIN))]
        public async Task<IActionResult> createPackage(CreatePackageRequest request)
        {
            try
            {
                var result = await _packageService.CreatePackageAsync(request);
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

        [HttpDelete(APIRoutes.Package.deletePackage, Name = "deletePackage")]
        //[HybridAuthorize(nameof(RoleEnum.ADMIN))]
        public async Task<IActionResult> deletePackage(int packageId)
        {
            try
            {
                var result = await _packageService.DeletePackageAsync(packageId);
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
