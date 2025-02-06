using CapstoneProject_SP25_IPAS_Service.BusinessModel.AuthensModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.GoogleUser;
using Microsoft.AspNetCore.Authorization;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/authentication")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;

        public AuthenticationController(IUserService userService, IConfiguration config)
        {
            _userService = userService;
            _configuration = config;
        }

        [HttpPost(APIRoutes.Authentication.registerSendOtp, Name = "registerSendOtp")]
        public async Task<IActionResult> RegisterSendOTPAccount(EmailModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var result = await _userService.RegisterSendMailAsync(model.Email);
                    return Ok(result);
                }
                return ValidationProblem(ModelState);
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

        [HttpPost(APIRoutes.Authentication.registerVerifyOtp, Name = "registerVerifyOtp")]
        public IActionResult RegisterVerifyOTPAccount(VerifyOtpRequest model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var result = _userService.VerifyOtpRegisterAsync(model.Email, model.Otp);
                    return Ok(result);
                }
                return ValidationProblem(ModelState);
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

        [HttpPost(APIRoutes.Authentication.Register, Name = "Register")]
        public async Task<IActionResult> RegisterAccount(SignUpModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var result = await _userService.RegisterAsync(model);
                    return Ok(result);
                }
                return ValidationProblem(ModelState);
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

        [HttpPost(APIRoutes.Authentication.Login, Name = "Login")]
        public async Task<IActionResult> LoginWithEmailAndPassword([FromBody] AccountRequestModel accountRequestModel)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var result = await _userService.LoginByEmailAndPassword(accountRequestModel.Email, accountRequestModel.Password);
                    return Ok(result);
                }
                else
                {
                    return ValidationProblem(ModelState);
                }
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
        [HttpPost(APIRoutes.Authentication.loginWithGoogle, Name = "loginWithGoogle")]
        public async Task<IActionResult> LoginGoogle([FromBody] GoogleLoginRequest googleLoginRequest)
        {
            try
            {
                var Login = await _userService.LoginGoogleHandler(googleLoginRequest.GoogleToken);
                return Ok(Login);
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

        //[Authorize(Roles = "User")]
        [HttpPost(APIRoutes.Authentication.Logout, Name = "Logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenModel removeRefreshTokenModel)
        {
            try
            {
                var result = await _userService.Logout(removeRefreshTokenModel.RefreshToken);
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

        [HttpPost(APIRoutes.Authentication.refreshToken, Name = "refreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenModel removeRefreshTokenModel)
        {
            try
            {
                var result = await _userService.RefreshToken(removeRefreshTokenModel.RefreshToken);
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

        [HttpPost(APIRoutes.Authentication.forgetPassword, Name = "forgetPassword")]
        public async Task<IActionResult> RequestResetPassword([FromBody] EmailModel emailModel)
        {
            try
            {
                var result = await _userService.RequestResetPassword(emailModel.Email);
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

        [HttpPost(APIRoutes.Authentication.forgetPasswordConfirm, Name = "forgetPasswordConfirm")]
        public async Task<IActionResult> ConfirmResetPassword([FromBody] ConfirmOtpModel confirmOtpModel)
        {
            try
            {
                var result = await _userService.ConfirmResetPassword(confirmOtpModel);
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

        [HttpPost(APIRoutes.Authentication.forgetPasswordNewPassword, Name = "forgetPasswordNewPassword")]
        public async Task<IActionResult> NewPassword([FromBody] ResetPasswordModel resetPasswordModel)
        {
            try
            {
                var result = await _userService.ExecuteResetPassword(resetPasswordModel);
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

        [HttpPost(APIRoutes.Authentication.ValidateRoleUserInFarm, Name = "validateRoleUserInFarm")]
        public async Task<IActionResult> ValidateRoleUserInFarm([FromBody] ValidateRoleUserInFarm validateRoleUserInFarm)
        {
            try
            {
                var result = await _userService.ValidateRoleOfUserInFarm(validateRoleUserInFarm.RefreshToken, validateRoleUserInFarm.FarmId);
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


        [HttpPut(APIRoutes.Authentication.UpdateRoleInToken, Name = "updateRoleInToken")]
        public async Task<IActionResult> UpdateRoleInToken([FromBody] RefreshTokenModel updateRoleInToken)
        {
            try
            {
                var result = await _userService.UpdateTokenOfUser(updateRoleInToken.RefreshToken);
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

