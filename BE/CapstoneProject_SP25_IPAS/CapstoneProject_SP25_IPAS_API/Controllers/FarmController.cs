using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.UserFarmRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_API.Middleware;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FarmController : ControllerBase
    {
        private readonly IFarmService _farmService;
        private readonly IJwtTokenService _jwtTokenService;
        public FarmController(IFarmService farmService, IJwtTokenService jwtTokenService)
        {
            _farmService = farmService;
            _jwtTokenService = jwtTokenService;
        }
        [HttpGet(APIRoutes.Farm.getFarmWithPagination, Name = "getAllFarmPaginationAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> GetAllFarmWithPaginationAsync([FromQuery] GetFarmFilterRequest getRequest, PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _farmService.GetAllFarmPagination(getRequest, paginationParameter);
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

        [HttpGet(APIRoutes.Farm.getFarmById + "/{farm-id}", Name = "getFarmByIdAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        public async Task<IActionResult> GetFarmByIdAsync([FromRoute(Name = "farm-id")] int? farmId)
        {
            try
            {
                if (farmId.HasValue && farmId == 0)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!farmId.HasValue)
                {
                    return BadRequest();
                }
                var result = await _farmService.GetFarmByID(farmId!.Value);
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

        [HttpGet(APIRoutes.Farm.getAllFarmOfUser + "/{user-id?}", Name = "getAllFarmOfUserAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)}")]
        public async Task<IActionResult> GetAllFarmOfUserAsync([FromRoute(Name = "user-id")] int? userId)
        {
            try
            {
                if (userId.HasValue && userId == 0)
                {
                    userId = _jwtTokenService.GetUserIdFromToken();
                }
                if (userId.HasValue && userId == 0)
                {
                    return Unauthorized();
                }
                var result = await _farmService.GetAllFarmOfUser(userId.Value);
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
        [HttpPost(APIRoutes.Farm.createFarm, Name = "createFarmAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)}")]
        public async Task<IActionResult> CreateFarmAsync([FromForm] FarmCreateRequest farmCreateModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var userId = _jwtTokenService.GetUserIdFromToken();
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }
                var result = await _farmService.CreateFarm(farmCreateModel, userId.Value);
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

        [HttpPut(APIRoutes.Farm.updateFarmInfo, Name = "updateFarmInfoAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)}")]
        public async Task<IActionResult> UpdateFarmInfoAsync([FromBody] FarmUpdateInfoRequest farmUpdateRequest)
        {
            try
            {
                if (!farmUpdateRequest.FarmId.HasValue)
                {
                    farmUpdateRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!ModelState.IsValid || !farmUpdateRequest.FarmId.HasValue)
                {
                    return BadRequest(ModelState);
                }
                var result = await _farmService.UpdateFarmInfo(farmUpdateRequest, farmId: farmUpdateRequest.FarmId!.Value);
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

        [HttpPut(APIRoutes.Farm.activateFarm, Name = "activateFarm")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> activateFarm([FromBody] List<int> farmIds)
        {
            try
            {
                var result = await _farmService.ActivateFarm(farmIds);
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

        //[HttpPut(APIRoutes.Farm.updateFarmCoordination, Name = "updateFarmCooridinationAsync")]
        //public async Task<IActionResult> UpdateFarmCoorAsync([FromBody] UpdateFarmCoordinationRequest updateFarmCoordinationRequest)
        //{
        //    try
        //    {
        //        if(!updateFarmCoordinationRequest.FarmId.HasValue)
        //         updateFarmCoordinationRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
        //        if (!ModelState.IsValid || !updateFarmCoordinationRequest.FarmId.HasValue)
        //        {
        //            return BadRequest(ModelState);
        //        }
        //        var result = await _farmService.UpdateFarmCoordination(farmId: updateFarmCoordinationRequest.FarmId.Value, farmCoordinationUpdate: updateFarmCoordinationRequest.FarmUpdateModel);
        //        return Ok(result);
        //    }
        //    catch (Exception ex)
        //    {
        //        var response = new BaseResponse()
        //        {
        //            StatusCode = StatusCodes.Status400BadRequest,
        //            Message = ex.Message
        //        };
        //        return BadRequest(response);
        //    }
        //}

        [HttpPatch(APIRoutes.Farm.softedDeleteFarm + "/{farm-id}", Name = "softedDeleteFarmAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> SoftDeleteFarmAsync([FromRoute(Name = "farm-id")] int farmId)
        {
            try
            {
                var result = await _farmService.SoftDeletedFarm(farmId);
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
        [HttpDelete(APIRoutes.Farm.permanenlyDelete + "/{farm-id}", Name = "permananlyDeleteFarmAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> DeleteFarm([FromRoute(Name = "farm-id")] int farmId)
        {
            try
            {
                var result = await _farmService.permanentlyDeleteFarm(farmId);
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
        [HttpPatch(APIRoutes.Farm.updateFarmLogo, Name = "updateFarmLogoAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)}")]
        [FarmExpired]
        public async Task<IActionResult> UpdateFarmLogoAsync([FromForm] FarmLogoUpdateRequest farmLogo)
        {
            try
            {
                if (!farmLogo.FarmId.HasValue)
                {
                    farmLogo.FarmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!ModelState.IsValid || !farmLogo.FarmId.HasValue)
                {
                    return BadRequest();
                }
                var result = await _farmService.UpdateFarmLogo(farmId: farmLogo.FarmId.Value, LogoURL: farmLogo.FarmLogo);
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
        /// Lấy NV của 1 trang trại theo RoleID --> selected
        /// </summary>
        [HttpGet(APIRoutes.Farm.getUserOfFarmByRole, Name = "GetAllUserOfFarmByRoleAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        //[CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> GetAllUserOfFarmByRoleAsync([FromQuery] int? farmId, [FromQuery] List<int> listRole)
        {
            try
            {
                if (!farmId.HasValue)
                {
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!ModelState.IsValid || !farmId.HasValue)
                {
                    return BadRequest();
                }
                var result = await _farmService.GetAllUserOfFarmByRoleAsync(farmId: farmId!.Value, roleIds: listRole);
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
        /// Lấy tất cả employee của 1 trang trại có pagin --> quản lí employee
        /// </summary>
        [HttpGet(APIRoutes.Farm.getUsersOfFarm, Name = "getUserOfFarmAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> getUserOfFarmAsync([FromQuery] GetUserFarmRequest userFarmRequest, [FromQuery] PaginationParameter paginationParameter)
        {
            try
            {
                if (!userFarmRequest.farmId.HasValue)
                    userFarmRequest.farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!userFarmRequest.farmId.HasValue)
                {
                    var response = new BaseResponse()
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Farm id is required"
                    };
                    return BadRequest(response);
                }
                var result = await _farmService.getUserOfFarm(userFarmRequest, paginationParameter);
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
        /// Lấy 1 NV trong 1 trang trại 
        /// </summary>
        [HttpGet(APIRoutes.Farm.getUsersOfFarmById, Name = "GetUsersOfFarmByIdAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> GetUsersOfFarmByIdAsync([FromQuery(Name = "farmId")] int? farmId, [FromQuery(Name = "userId")] int userId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue)
                    return BadRequest();
                var result = await _farmService.getUserFarmById(farmId: farmId!.Value, userId: userId);
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
        /// Xoá VV 1 NV
        /// </summary>
        [HttpDelete(APIRoutes.Farm.deleteUserFarm, Name = "deleteUserFarmAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> DeleteUserFarm([FromQuery(Name = "farmId")] int? farmId, [FromQuery(Name = "userId")] int userId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken();
                if (!farmId.HasValue)
                    return BadRequest();
                var result = await _farmService.deleteUserInFarm(farmId: farmId.Value, userId: userId);
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
        /// Thêm 1 employee vào trang trại
        /// </summary>
        [HttpPost(APIRoutes.Farm.addUserToFarm, Name = "AddUserToFarmAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> AddUserToFarmAsync([FromBody] UserFarmRequest userFarmCreate)
        {
            try
            {
                if (!userFarmCreate.FarmId.HasValue)
                    userFarmCreate.FarmId = _jwtTokenService.GetFarmIdFromToken();
                if (!userFarmCreate.FarmId.HasValue)
                {
                    return BadRequest();
                }
                var result = await _farmService.addUserToFarm(userFarmCreate);
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
        /// Cập nhật TT nhân viên (Role, IsActive)
        /// </summary>
        [HttpPut(APIRoutes.Farm.updateUserOfFarm, Name = "UpdateRoleOfEmployeeAsync")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)}")]
        [CheckUserFarmAccess]
        //[FarmExpired]
        public async Task<IActionResult> UpdateRoleOfEmployeeAsync([FromBody] UserFarmRequest userFarmUpdateRequest)
        {
            try
            {
                if (!userFarmUpdateRequest.FarmId.HasValue)
                {
                    userFarmUpdateRequest.FarmId = _jwtTokenService.GetFarmIdFromToken();
                }
                if (!ModelState.IsValid || !userFarmUpdateRequest.FarmId.HasValue)
                {
                    return BadRequest(ModelState);
                }
                var result = await _farmService.updateUserInFarm(userFarmUpdateRequest);
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

        [HttpGet(APIRoutes.Farm.getFarmForSelected , Name = "getFarmForSelected")]
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> getFarmForSelected()
        {
            try
            {
                var result = await _farmService.GetAllFarmForSelected();
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
