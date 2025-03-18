using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpGet(APIRoutes.User.getUserWithPagination, Name = "getAllUserPaginationAsync")]
        public async Task<IActionResult> GetAllUser(PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _userService.GetAllUsers(paginationParameter);
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
        public async Task<IActionResult> BannedUser([FromRoute] int userId)
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

        [HttpPatch(APIRoutes.User.softedDeleteUser, Name = "softedDeleteUser")]
        public async Task<IActionResult> SoftDeleteUser([FromRoute] int userId)
        {
            try
            {
                var result = await _userService.SoftDeleteUser(userId);
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
        public async Task<IActionResult> searchUserByEmail([FromQuery] string? emailSearch)
        {
            try
            {

                var result = await _userService.SearchByEmail(emailSearch);
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
