using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.UserRequest;
using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IJwtTokenService _jwtTokenService;

        public UserController(IUserService userService, IJwtTokenService jwtTokenService)
        {
            _userService = userService;
            _jwtTokenService = jwtTokenService;
        }


        [HttpGet(APIRoutes.User.getUserWithPagination, Name = "getAllUserPaginationAsync")]
        public async Task<IActionResult> GetAllUser([FromQuery] FilterUserRequest filterRequest,PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _userService.GetAllUsers(filterRequest, paginationParameter);
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

        [HttpGet(APIRoutes.User.getUserById, Name = "getUserById")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)},{nameof(RoleEnum.EXPERT)}")]
        public async Task<IActionResult> GetUserById([FromRoute] int userId)
        {
            try
            {

                var result = await _userService.GetUserById(userId);
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

        [HttpGet(APIRoutes.User.getUserByEmail, Name = "getUserByEmail")]
        public async Task<IActionResult> GetUserByEmail([FromRoute] string email)
        {
            try
            {
                var result = await _userService.GetUserByEmail(email);
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
        [HttpPost(APIRoutes.User.createUser, Name = "createUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> CreateUserInternal([FromBody] CreateAccountModel createAccountRequestModel)
        {
            try
            {
                var result = await _userService.CreateUser(createAccountRequestModel);
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

        [HttpPut(APIRoutes.User.updateUserInfo, Name = "updateUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)},{nameof(RoleEnum.EXPERT)}")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserModel updateUserRequestModel)
        {
            try
            {
                var result = await _userService.UpdateUser(updateUserRequestModel);
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
        [HttpPut(APIRoutes.User.bannedUser, Name = "bannedUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> BannedUser([FromBody] List<int> userId)
        {
            try
            {
                var result = await _userService.BannedUser(userId);
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

        [HttpPut(APIRoutes.User.unBannedUser, Name = "UnbannedUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> UnBannedUser([FromBody] List<int> userId)
        {
            try
            {
                var result = await _userService.UnBannedUser(userId);
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

        [HttpPatch(APIRoutes.User.softedDeleteUser, Name = "softedDeleteUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> SoftDeleteUser([FromBody] List<int> userIds)
        {
            try
            {
                var result = await _userService.SoftDeleteUser(userIds);
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

        [HttpDelete(APIRoutes.User.permanenlyDelete, Name = "deletedUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}")]
        public async Task<IActionResult> DeleteUser([FromRoute] int userId)
        {
            try
            {
                var result = await _userService.DeleteUser(userId);
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

        [HttpPut(APIRoutes.User.updateUserAvatar, Name = "updateAvatarUser")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.USER)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)},{nameof(RoleEnum.EXPERT)}")]
        public async Task<IActionResult> UpdateAvatarOfUser(IFormFile avatarOfUser, [FromRoute] int userId)
        {
            try
            {
                var result = await _userService.UpdateAvatarOfUser(avatarOfUser, userId);
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

        [HttpGet(APIRoutes.User.getAllUserByRole, Name = "getAllUserByRole")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.OWNER)}")]
        public async Task<IActionResult> GetAllUserByRoleName([FromRoute] string roleName)
        {
            try
            {
                var result = await _userService.GetAllUsersByRole(roleName);
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

        [HttpGet(APIRoutes.User.searchUserByEmail, Name = "searchUserByEmail")]
        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)}, {nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)}")]
        public async Task<IActionResult> searchUserByEmail([FromQuery] string? emailSearch, [FromQuery] int? farmId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                var result = await _userService.SearchByEmail(emailSearch, farmId);
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

        [HttpPut(APIRoutes.User.changePassword, Name = "changePassword")]
        public async Task<IActionResult> ChangePassword([FromQuery] int? userId, [FromBody] ChangePasswordModel changePasswordModel)
        {
            try
            {
                if (!userId.HasValue)
                    userId = _jwtTokenService.GetUserIdFromToken() ?? 0;
                var result = await _userService.ChangePassword(userId.Value, changePasswordModel);
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

        [HttpPut(APIRoutes.User.updateFCM, Name = "updateFCM")]
        public async Task<IActionResult> UpdateFCM([FromBody] UpdateFcmTokenModel updateFcmTokenModel)
        {
            try
            {
                var result = await _userService.UpdateFcmTokenAsync(updateFcmTokenModel.Email, updateFcmTokenModel.FcmToken);
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
