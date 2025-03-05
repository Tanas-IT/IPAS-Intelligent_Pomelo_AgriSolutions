using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Mail;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.AuthensModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet.Core;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Org.BouncyCastle.Crypto.Parameters;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_BussinessObject.GoogleUser;
using System.Net.Http.Headers;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Constants;
using Google.Apis.Auth;
using System.Security.Cryptography;
using CapstoneProject_SP25_IPAS_Common.ObjectStatus;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        private readonly IMailService _mailService;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IMapper _mapper;
        private readonly HttpClient _httpClient;

        public UserService(IUnitOfWork unitOfWork, IConfiguration configuration, IMailService mailService, ICloudinaryService cloudinaryService, IMapper mapper, HttpClient httpClient)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _mailService = mailService;
            _cloudinaryService = cloudinaryService;
            _mapper = mapper;
            _httpClient = httpClient;
        }

        public async Task<BusinessResult> BannedUser(int userId)
        {
            var existUser = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);
            if (existUser != null)
            {
                if (!existUser.Status.ToLower().Equals("banned"))
                {
                    existUser.Status = "Banned";

                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_BANNED_USER_CODE, Const.SUCCESS_BANNED_USER_MSG);
                    }
                }
                else
                {
                    existUser.Status = "Active";

                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_BANNED_USER_CODE, Const.SUCCESS_UNBANNED_USER_MSG);
                    }
                }

                return new BusinessResult(Const.FAIL_BANNED_USER_CODE, Const.FAIL_BANNED_USER_MSG);
            }
            return new BusinessResult(Const.WARNING_BANNED_USER_CODE, Const.WARNING_BANNED_USER_MSG);

        }

        public async Task<BusinessResult> ConfirmResetPassword(ConfirmOtpModel confirmOtpModel)
        {
            try
            {
                var checkExistUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(confirmOtpModel.Email);
                if (checkExistUser != null && checkExistUser.Otp != null)
                {
                    if (checkExistUser.Otp.Equals(confirmOtpModel.OtpCode) && checkExistUser.ExpiredOtpTime >= DateTime.Now)
                    {
                        return new BusinessResult(Const.SUCCESS_CONFIRM_RESET_PASSWORD_CODE, Const.SUCCESS_CONFIRM_RESET_PASSWORD_MESSAGE, true);
                    }
                    return new BusinessResult(Const.FAIL_CONFIRM_RESET_PASSWORD_CODE, Const.FAIL_CONFIRM_RESET_PASSWORD_MESSAGE, false);
                }
                return new BusinessResult(Const.WARNING_SIGN_IN_CODE, Const.WARNING_SIGN_IN_MSG, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message, false);
            }
        }

        public async Task<BusinessResult> CreateUser(CreateAccountModel createAccountModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    User user = new User()
                    {
                        Email = createAccountModel.Email,
                        UserCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.USER),
                        FullName = createAccountModel.FullName,
                        Status = nameof(UserStatus.Active),
                        RoleId = (int)createAccountModel.Role,
                        IsDelete = false,
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        AvatarURL = createAccountModel.AvatarUrl ?? "",
                        Gender = createAccountModel.Gender
                    };

                    var existUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(createAccountModel.Email);
                    if (existUser != null)
                    {
                        return new BusinessResult(Const.WARNING_ACCOUNT_IS_EXISTED_CODE, Const.WARNING_ACCOUNT_IS_EXISTED_MSG, false);
                    }
                    if (createAccountModel.Password != null)
                    {
                        user.Password = PasswordHelper.HashPassword(createAccountModel.Password);
                    }
                    var role = await _unitOfWork.RoleRepository.GetRoleById((int)createAccountModel.Role);
                    if (role != null)
                    {
                        user.RoleId = role.RoleId;
                    }
                    else
                    {
                        return new BusinessResult(Const.WARNING_ROLE_IS_NOT_EXISTED_CODE, Const.WARNING_ROLE_IS_NOT_EXISTED_MSG);
                    }
                    await _unitOfWork.UserRepository.AddUserAsync(user);
                    await transaction.CommitAsync();
                    return new BusinessResult(Const.SUCCESS_REGISTER_CODE, Const.SUCCESS_REGISTER_MSG);

                }
                catch (Exception ex)
                {

                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> DeleteUser(int userId)
        {
            string includeProperties = "Plans,TaskFeedbacks,UserWorkLogs,ChatRooms,UserFarms,Notifications,RefreshTokens";
            var entityDeleteUser = await _unitOfWork.UserRepository.GetByCondition(x => x.UserId == userId, includeProperties);
            if (entityDeleteUser == null)
            {
                return new BusinessResult(Const.WARNING_USER_DOES_NOT_EXIST_CODE, Const.WARNING_USER_DOES_NOT_EXIST_MSG, false);
            }
            foreach (var plan in entityDeleteUser!.Plans.ToList())
            {
                _unitOfWork.PlanRepository.Delete(plan);
            }
            entityDeleteUser.Plans.Clear();
            foreach (var taskFeedback in entityDeleteUser!.TaskFeedbacks.ToList())
            {
                _unitOfWork.TaskFeedbackRepository.Delete(taskFeedback);
            }
            foreach (var userWorkLog in entityDeleteUser!.UserWorkLogs.ToList())
            {
                _unitOfWork.UserWorkLogRepository.Delete(userWorkLog);
            }
            foreach (var chatRoom in entityDeleteUser!.ChatRooms.ToList())
            {
                _unitOfWork.ChatRoomRepository.Delete(chatRoom);
            }
            foreach (var userFarm in entityDeleteUser!.UserFarms.ToList())
            {
                var listFarm = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == userFarm.FarmId);
                _unitOfWork.FarmRepository.Delete(listFarm);
                _unitOfWork.UserFarmRepository.Delete(userFarm);
            }
            foreach (var notification in entityDeleteUser!.NotificationSenders.ToList())
            {
                _unitOfWork.NotificationRepository.Delete(notification);
            }
            foreach (var refreshToken in entityDeleteUser!.RefreshTokens.ToList())
            {
                _unitOfWork.RefreshTokenRepository.Delete(refreshToken);
            }

            _unitOfWork.UserRepository.Delete(entityDeleteUser);
            await _unitOfWork.SaveAsync();

            try
            {
                if (entityDeleteUser.AvatarURL != null && entityDeleteUser.AvatarURL.Contains("cloudinary"))
                {
                    await _cloudinaryService.DeleteImageByUrlAsync(entityDeleteUser.AvatarURL);
                }

            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message, false);
            }
            return new BusinessResult(Const.SUCCESS_DELETE_USER_CODE, Const.SUCCESS_DELETE_USER_MESSAGE, true);

        }

        public async Task<BusinessResult> ExecuteResetPassword(ResetPasswordModel resetPasswordModel)
        {
            try
            {
                var checkUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(resetPasswordModel.Email);
                if (checkUser != null && checkUser.Otp.Equals(resetPasswordModel.OtpCode))
                {
                    checkUser.Password = PasswordHelper.HashPassword(resetPasswordModel.NewPassword);
                    var result = await _unitOfWork.UserRepository.UpdateUserAsync(checkUser);
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_RESET_PASSWORD_CODE, Const.SUCCESS_RESET_PASSWORD_MSG, true);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_RESET_PASSWORD_CODE, Const.FAIL_RESET_PASSWORD_MSG, false);
                    }

                }
                return new BusinessResult(Const.WARNING_RESET_PASSWORD_CODE, Const.WARNING_RESET_PASSWORD_MSG, false);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message, false);
            }
        }

        public async Task<BusinessResult> GetAllUsersByRole(string roleName)
        {
            try
            {
                var result = await _unitOfWork.UserRepository.GetAllUsersByRole(roleName);
                if (result.Count > 0)
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_USER_BY_ROLE_CODE, Const.SUCCESS_GET_ALL_USER_BY_ROLE_MESSAGE, result);
                }
                return new BusinessResult(Const.FAIL_GET_ALL_USER_BY_ROLE_CODE, Const.FAIL_GET_ALL_USER_BY_ROLE_MESSAGE, false);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message, false);
            }
        }

        public async Task<BusinessResult> GetUserByEmail(string email)
        {
            var getUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
            if (getUser != null)
            {
                var result = _mapper.Map<UserModel>(getUser);
                return new BusinessResult(Const.SUCCESS_GET_USER_CODE, Const.SUCCESS_GET_USER_BY_EMAIL_MSG, result);
            }
            return new BusinessResult(Const.FAIL_GET_USER_CODE, Const.FAIL_GET_USER_BY_EMAIL_MSG, null);
        }

        public async Task<BusinessResult> GetUserById(int userId)
        {
            var getUser = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);
            if (getUser != null)
            {
                var result = _mapper.Map<UserModel>(getUser);
                return new BusinessResult(Const.SUCCESS_GET_USER_CODE, Const.FAIL_GET_USER_BY_ID_MSG, result);
            }
            return new BusinessResult(Const.FAIL_GET_USER_CODE, Const.FAIL_GET_USER_BY_ID_MSG, null);
        }

        public async Task<BusinessResult> LoginByEmailAndPassword(string email, string password)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var existUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
                    if (existUser == null)
                    {
                        return new BusinessResult(Const.WARNING_SIGN_IN_CODE, Const.WARNING_SIGN_IN_MSG);
                    }

                    var verifyPassword = PasswordHelper.VerifyPassword(password, existUser.Password);
                    if (verifyPassword || existUser.Password == null)
                    {
                        if (existUser.Status.ToLower().Equals("Banned".ToLower()))
                        {
                            return new BusinessResult(Const.WARNING_ACCOUNT_BANNED_CODE, Const.WARNING_ACCOUNT_BANNED_MSG);
                        }
                        if (existUser.IsDelete == true)
                        {
                            return new BusinessResult(Const.WARNING_ACCOUNT_DELETED_CODE, Const.WARNING_ACCOUNT_DELETED_MSG);
                        }
                        _ = int.TryParse(_configuration["JWT:TokenValidityInMinutes"], out int tokenValidityInMinutes);
                        string accessToken = await GenerateAccessToken(email, existUser, -1, -1);

                        _ = int.TryParse(_configuration["JWT:RefreshTokenValidityInDays"], out int tokenValidityInDays);
                        string refreshToken = await GenerateRefreshToken(email, null, tokenValidityInDays, -1, -1);


                        await _unitOfWork.RefreshTokenRepository.AddRefreshToken(new RefreshToken()
                        {
                            UserId = existUser.UserId,
                            RefreshTokenCode = NumberHelper.GenerateRandomCode("RFT"),
                            RefreshTokenValue = refreshToken,
                            CreateDate = DateTime.Now,
                            ExpiredDate = DateTime.Now.AddDays(tokenValidityInDays)
                        });
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_LOGIN_CODE, Const.SUCCESS_LOGIN_MSG, new
                        {
                            AuthenModel = new AuthenModel()
                            {
                                AccessToken = accessToken,
                                RefreshToken = refreshToken
                            },
                            Avatar = existUser.AvatarURL,
                            Fullname = existUser.FullName,
                        });
                    }
                    else
                        return new BusinessResult(Const.WARNING_PASSWORD_INCORRECT_CODE, Const.WARNING__PASSWORD_INCORRECT_MSG);
                }
                catch (Exception ex)
                {

                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_CREATE_CODE, ex.Message);
                }
            }
        }


        public async Task<BusinessResult> Logout(string refreshToken)
        {
            var checkExistRefreshToken = await _unitOfWork.RefreshTokenRepository.GetRefrshTokenByRefreshTokenValue(refreshToken);
            if (checkExistRefreshToken != null)
            {
                var result = await _unitOfWork.RefreshTokenRepository.DeleteToken(refreshToken);
                if (result)
                {
                    return new BusinessResult(Const.SUCCESS_LOGOUT_CODE, Const.SUCCESS_LOGOUT_MSG);
                }
                else
                {
                    return new BusinessResult(Const.FAIL_LOGOUT_CODE, Const.FAIL_LOGOUT_MSG);
                }
            }
            return new BusinessResult(Const.WARNING_RFT_NOT_EXIST_CODE, Const.WARNING_RFT_NOT_EXIST_MSG);
        }

        public async Task<BusinessResult> RefreshToken(string jwtToken)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:SecretKey"]));
            var handler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = authSigningKey,
                ValidateIssuer = true,
                ValidIssuer = _configuration["JWT:ValidIssuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["JWT:ValidAudience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
            };
            try
            {
                SecurityToken validatedToken;
                var principal = handler.ValidateToken(jwtToken, validationParameters, out validatedToken);
                var email = principal.Claims.FirstOrDefault(x => x.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress").Value;
                //var roleInFarm = int.Parse(principal.Claims.FirstOrDefault(x => x.Type == "roleId")!.Value);
                //var farmId = int.Parse(principal.Claims.FirstOrDefault(x => x.Type == "farmId").Value);
                int? roleInFarm = null;
                if (int.TryParse(principal.Claims.FirstOrDefault(x => x.Type == "roleId")?.Value, out int parsedRoleInFarm))
                {
                    roleInFarm = parsedRoleInFarm;
                }

                int? farmId = null;
                if (int.TryParse(principal.Claims.FirstOrDefault(x => x.Type == "farmId")?.Value, out int parsedFarmId))
                {
                    farmId = parsedFarmId;
                }
                if (email != null)
                {
                    if (principal != null)
                    {
                        var existUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
                        if (existUser != null)
                        {
                            var checkExistRefreshToken = await _unitOfWork.RefreshTokenRepository.GetRefrshTokenByRefreshTokenValue(jwtToken);
                            if (checkExistRefreshToken == null)
                            {
                                return new BusinessResult(Const.WARNING_RFT_NOT_EXIST_CODE, Const.WARNING_RFT_NOT_EXIST_MSG);

                            }
                            else
                            {
                                if (checkExistRefreshToken.ExpiredDate >= DateTime.Now)
                                {
                                    await _unitOfWork.RefreshTokenRepository.DeleteToken(checkExistRefreshToken.RefreshTokenValue);
                                    var newAccessToken = await GenerateAccessToken(email, existUser, roleInFarm ?? 0, farmId ?? 0);
                                    _ = int.TryParse(_configuration["JWT:TokenValidityInMinutes"], out int newTokenValidityInMinutes);

                                    var newRefreshToken = await GenerateRefreshToken(email, checkExistRefreshToken.ExpiredDate, 0, roleInFarm ?? 0, farmId ?? 0);
                                    _ = int.TryParse(_configuration["JWT:RefreshTokenValidityInDays"], out int tokenValidityInDays);

                                    await _unitOfWork.RefreshTokenRepository.AddRefreshToken(new RefreshToken()
                                    {
                                        UserId = checkExistRefreshToken.UserId,
                                        RefreshTokenCode = NumberHelper.GenerateRandomCode("RFT"),
                                        RefreshTokenValue = newRefreshToken,
                                        CreateDate = DateTime.Now,
                                        ExpiredDate = checkExistRefreshToken.ExpiredDate
                                    });
                                    return new BusinessResult(Const.SUCCESS_RFT_CODE, Const.SUCCESS_RFT_MSG, new
                                    {
                                        AuthenModel = new AuthenModel
                                        {
                                            AccessToken = newAccessToken,   
                                            RefreshToken = newRefreshToken
                                        },
                                        Avartar = existUser.AvatarURL,
                                        Fullname = existUser.FullName,
                                    });

                                }
                                else
                                {
                                    await _unitOfWork.RefreshTokenRepository.DeleteToken(jwtToken);
                                    return new BusinessResult(Const.WARNING_INVALID_REFRESH_TOKEN_CODE, Const.WARNING_INVALID_REFRESH_TOKEN_MSG);
                                }
                            }
                        }
                    }
                }
                return new BusinessResult(Const.WARNING_SIGN_IN_CODE, Const.WARNING_SIGN_IN_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> RegisterAsync(SignUpModel model)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var newUser = new User()
                    {
                        Email = model.Email,
                        UserCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.USER),
                        FullName = model.FullName,
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        Gender = model.Gender,
                        PhoneNumber = model.Phone,
                        Dob = model.Dob,
                        Status = "Active",
                        IsDelete = false,
                    };

                    var checkExistUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(model.Email);
                    if (checkExistUser != null)
                    {
                        return new BusinessResult(Const.WARNING_ACCOUNT_IS_EXISTED_CODE, Const.WARNING_ACCOUNT_IS_EXISTED_MSG);
                    }
                    if (model.Password != null)
                    {
                        newUser.Password = PasswordHelper.HashPassword(model.Password);
                    }
                    var role = await _unitOfWork.RoleRepository.GetRoleById((int)RoleEnum.USER);
                    if (role != null)
                    {
                        newUser.RoleId = role.RoleId;
                    }
                    else
                    {
                        return new BusinessResult(Const.WARNING_ROLE_IS_NOT_EXISTED_CODE, Const.WARNING_ROLE_IS_NOT_EXISTED_MSG);
                    }

                    await _unitOfWork.UserRepository.AddUserAsync(newUser);
                    _ = int.TryParse(_configuration["JWT:TokenValidityInMinutes"], out int tokenValidityInMinutes);
                    string accessToken = await GenerateAccessToken(newUser.Email, newUser, -1, -1);

                    _ = int.TryParse(_configuration["JWT:RefreshTokenValidityInDays"], out int tokenValidityInDays);
                    string refreshToken = await GenerateRefreshToken(newUser.Email, null, tokenValidityInDays, -1, -1);

                    await _unitOfWork.RefreshTokenRepository.AddRefreshToken(new RefreshToken()
                    {
                        UserId = newUser.UserId,
                        RefreshTokenCode = NumberHelper.GenerateRandomCode("RFT"),
                        RefreshTokenValue = refreshToken,
                        CreateDate = DateTime.Now,
                        ExpiredDate = DateTime.Now.AddDays(tokenValidityInDays)
                    });
                    await transaction.CommitAsync();
                    return new BusinessResult(Const.SUCCESS_REGISTER_CODE, Const.SUCCESS_REGISTER_MSG, new
                    {
                        AuthenModel = new AuthenModel()
                        {
                            AccessToken = accessToken,
                            RefreshToken = refreshToken
                        },
                        Avatar = newUser.AvatarURL,
                        Fullname = newUser.FullName,
                    });

                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> RequestResetPassword(string email)
        {
            var existUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
            if (existUser != null)
            {
                if (existUser.Status.ToLower() == "Active".ToLower() && existUser.IsDelete == false)
                {
                    bool checkSendOtp = await CreateOtpAsync(email);
                    return new BusinessResult(Const.SUCCESS_SEND_OTP_RESET_PASSWORD_CODE, Const.SUCCESS_SEND_OTP_RESET_PASSWORD_USER_MSG, true);
                }
            }
            return new BusinessResult(Const.WARNING_SIGN_IN_CODE, Const.WARNING_SIGN_IN_MSG, false);
        }

        public async Task<BusinessResult> SoftDeleteUser(int userId)
        {
            try
            {
                var softDeleteUser = await _unitOfWork.UserRepository.SoftDeleteUserAsync(userId);
                if (softDeleteUser > 0)
                {
                    return new BusinessResult(Const.SUCCESS_SOFT_DELETE_USER_CODE, Const.SUCCESS_SOFT_DELETE_USER_MSG);
                }
                return new BusinessResult(Const.FAIL_SOFT_DELETE_USER_CODE, Const.FAIL_SOFT_DELETE_USER_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateAvatarOfUser(IFormFile avatarOfUser, int id)
        {
            try
            {
                var checkExistUser = await _unitOfWork.UserRepository.GetUserByIdAsync(id);
                if (checkExistUser == null)
                {
                    return new BusinessResult(Const.WARNING_USER_DOES_NOT_EXIST_CODE, Const.WARNING_USER_DOES_NOT_EXIST_MSG);
                }
                var uploadImageLink = await _cloudinaryService.UploadImageAsync(avatarOfUser, CloudinaryPath.USER_AVARTAR);
                if (uploadImageLink != null)
                {
                    if (checkExistUser.AvatarURL != null || checkExistUser.AvatarURL.Equals(_configuration["SystemDefault:ResourceDefault"]) || checkExistUser.AvatarURL.Equals(_configuration["SystemDefault:AvatarDefault"]))
                    {
                        await _cloudinaryService.DeleteImageByUrlAsync(checkExistUser.AvatarURL);
                    }
                    checkExistUser.AvatarURL = uploadImageLink;
                    var result = await _unitOfWork.SaveAsync();
                    return new BusinessResult(Const.SUCCESS_UPLOAD_IMAGE_CODE, Const.SUCCESS_UPLOAD_IMAGE_MESSAGE, result > 0);
                }
                return new BusinessResult(Const.FAIL_UPLOAD_IMAGE_CODE, Const.FAIL_UPLOAD_IMAGE_MESSAGE, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateUser(UpdateUserModel updateUserRequestModel)
        {
            try
            {
                var existUser = await _unitOfWork.UserRepository.GetUserByIdAsync(updateUserRequestModel.UserId);
                if (existUser != null)
                {
                    // update account
                    if (updateUserRequestModel.FullName != null)
                    {
                        existUser.FullName = updateUserRequestModel.FullName;
                    }
                    if (updateUserRequestModel.Address != null)
                    {
                        existUser.Address = updateUserRequestModel.Address;
                    }
                    if (updateUserRequestModel.PhoneNumber != null)
                    {
                        existUser.PhoneNumber = updateUserRequestModel.PhoneNumber;
                    }
                    if (updateUserRequestModel.Dob != null)
                    {
                        existUser.Dob = updateUserRequestModel.Dob;
                    }
                    if (updateUserRequestModel.Gender != null)
                    {
                        existUser.Gender = updateUserRequestModel.Gender;
                    }
                    if (updateUserRequestModel.AvatarURL != null)
                    {
                        existUser.AvatarURL = updateUserRequestModel.AvatarURL;
                    }
                    if (updateUserRequestModel.Role != null)
                    {
                        var checkRole = Enum.IsDefined(typeof(RoleEnum), updateUserRequestModel.Role);
                        if (checkRole)
                        {
                            existUser.RoleId = (int)updateUserRequestModel.Role;
                        }
                        else
                        {
                            return new BusinessResult(Const.WARNING_ROLE_IS_NOT_EXISTED_CODE, Const.WARNING_ROLE_IS_NOT_EXISTED_MSG, false);
                        }
                    }
                    if (existUser.IsDelete != null)
                    {
                        existUser.IsDelete = updateUserRequestModel.IsDeleted;
                    }
                    existUser.UpdateDate = DateTime.Now;

                    if (!string.IsNullOrEmpty(updateUserRequestModel.Password))
                    {
                        bool checkOldPassword = PasswordHelper.VerifyPassword(updateUserRequestModel.Password, existUser.Password);
                        if (checkOldPassword)
                        {
                            string newPassword = PasswordHelper.HashPassword(updateUserRequestModel.Password);
                            existUser.Password = newPassword;
                        }
                    }
                    var result = await _unitOfWork.UserRepository.UpdateUserAsync(existUser);
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_UPDATE_USER_CODE, Const.SUCCESS_UPLOAD_IMAGE_MESSAGE, existUser);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_USER_CODE, Const.FAIL_UPDATE_USER_MESSAGE, false);
                    }
                }
                return new BusinessResult(Const.WARNING_USER_DOES_NOT_EXIST_CODE, Const.WARNING_USER_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private async Task<string> GenerateAccessToken(string email, User user, int roleInFarm, int farmId)
        {
            var role = await _unitOfWork.RoleRepository.GetRoleById(user.RoleId);
            var getRoleInFarm = await _unitOfWork.RoleRepository.GetRoleById(roleInFarm);
            var authClaims = new List<Claim>();
            if (role != null)
            {
                authClaims.Add(new Claim("email", email));
                //authClaims.Add(new Claim("role", role.RoleName));
                if (getRoleInFarm == null)
                {
                    authClaims.Add(new Claim("roleId", role.RoleId.ToString()));
                    authClaims.Add(new Claim(ClaimTypes.Role, role.RoleName!));
                }
                else
                {
                    authClaims.Add(new Claim("roleId", getRoleInFarm.RoleId.ToString()));
                    authClaims.Add(new Claim(ClaimTypes.Role, getRoleInFarm.RoleName!));
                    authClaims.Add(new Claim("farmId", farmId.ToString()));

                }
                authClaims.Add(new Claim("UserId", user.UserId.ToString()));
                authClaims.Add(new Claim("Status", user.Status!.ToString()));
                authClaims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));

            }
            var accessToken = GenerateJWTToken.CreateAccessToken(authClaims, _configuration, DateTime.UtcNow);
            return new JwtSecurityTokenHandler().WriteToken(accessToken);
        }

        private async Task<string> GenerateRefreshToken(string email, DateTime? beginTimeRefreshToken, int expiredDays, int roleInFarm, int farmId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
            var role = await _unitOfWork.RoleRepository.GetRoleById(user.RoleId);
            var getRoleInFarm = await _unitOfWork.RoleRepository.GetRoleById(roleInFarm);
            var authClaims = new List<Claim>();
            if (getRoleInFarm == null)
            {
                authClaims = new List<Claim>
              {
                     new Claim("email", email),
                     new Claim("role", role.RoleName),
                     new Claim("roleId", role.RoleId.ToString()),
                     new Claim("UserId", user.UserId.ToString()),
                     new Claim("Status", user.Status.ToString()),
                     new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
              };
            }
            else
            {
                authClaims = new List<Claim>
                {
                     new Claim("email", email),
                     new Claim("role", getRoleInFarm.RoleName),
                     new Claim("roleId", getRoleInFarm.RoleId.ToString()),
                     new Claim("farmId", farmId.ToString()),
                     new Claim("UserId", user.UserId.ToString()),
                     new Claim("Status", user.Status.ToString()),
                     new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };
            }

            JwtSecurityToken refreshToken = null;
            if (beginTimeRefreshToken != null)
            {
                DateTime utcTime = (beginTimeRefreshToken ?? DateTime.UtcNow).ToUniversalTime();
                refreshToken = GenerateJWTToken.CreateRefreshToken(authClaims, _configuration, utcTime, expiredDays);
            }
            else
            {
                refreshToken = GenerateJWTToken.CreateRefreshToken(authClaims, _configuration, DateTime.UtcNow, expiredDays);
            }
            return new JwtSecurityTokenHandler().WriteToken(refreshToken).ToString();
        }

        private async Task<bool> CreateOtpAsync(string email)
        {
            try
            {
                string otpCode = NumberHelper.GenerateSixDigitNumber().ToString();
                var expiredTime = DateTime.Now.AddMinutes(5);
                var checkExistUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
                if (checkExistUser != null)
                {
                    if (checkExistUser.Otp != null)
                    {
                        checkExistUser.Otp = otpCode;
                        checkExistUser.ExpiredOtpTime = expiredTime;
                        await _unitOfWork.UserRepository.UpdateUserAsync(checkExistUser);
                    }
                    else
                    {
                        await _unitOfWork.UserRepository.AddOtpToUser(email, otpCode, expiredTime);
                    }
                    bool checkSendMail = await SendOtpResetPasswordAsync(email, otpCode);
                    return checkSendMail;
                }
                else
                {
                    throw new Exception("Account does not exist. Can not send Otp");
                }
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
        }

        private async Task<bool> SendOtpResetPasswordAsync(string email, string otpCode)
        {
            // create new email
            MailRequest newEmail = new MailRequest()
            {
                ToEmail = email,
                Subject = "IPAS Reset Password",
                Body = SendOTPTemplate.EmailSendOTPResetPassword(email, otpCode)
            };

            // send email
            await _mailService.SendEmailAsync(newEmail);
            return true;
        }

        public async Task<BusinessResult> RegisterSendMailAsync(string email)
        {
            var checkExistAccount = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
            if (checkExistAccount != null)
            {
                return new BusinessResult(Const.WARNING_ACCOUNT_IS_EXISTED_CODE, Const.WARNING_ACCOUNT_IS_EXISTED_MSG, false);
            }
            string sendOtp = await CreateOtpRegisterAsync(email);
            return new BusinessResult(Const.SUCCESS_SEND_OTP_RESET_PASSWORD_CODE, Const.SUCCESS_SEND_OTP_RESET_PASSWORD_USER_MSG, new RegisterSendOtpResponse()
            {
                otpHash = sendOtp
            });
        }

        public BusinessResult VerifyOtpRegisterAsync(string email, string otp)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(otp))
                return new BusinessResult(Const.WARNING_CHECK_MAIL_REGISTER_CODE, Const.WARNING_CHECK_MAIL_REGISER_MSG, false);

            var expectedOtp = NumberHelper.GenerateOtp();

            if (otp == expectedOtp)
                return new BusinessResult(Const.SUCCESS_OTP_VALID_CODE, Const.SUCCESS_OTP_VALID_MESSAGE, true);
            else
                return new BusinessResult(Const.FAIL_CONFIRM_RESET_PASSWORD_CODE, Const.FAIL_CONFIRM_RESET_PASSWORD_MESSAGE, false);
        }


        private async Task<string> CreateOtpRegisterAsync(string email)
        {
            try
            {
                string otpCode = NumberHelper.GenerateOtp().ToString();
                bool checkSendMail = await SendOtpRegisterAccountAsync(email, otpCode);
                using (var sha256 = SHA256.Create())
                {
                    var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(otpCode));
                    return Convert.ToBase64String(hashedBytes);
                }

            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
        }

        private async Task<bool> SendOtpRegisterAccountAsync(string email, string otpCode)
        {
            // create new email
            MailRequest newEmail = new MailRequest()
            {
                ToEmail = email,
                Subject = "IPAS Register Account",
                Body = RegisterOTPTemplate.EmailSendOTPRegisterAccount(email, otpCode)
            };

            // send email
            await _mailService.SendEmailAsync(newEmail);
            return true;
        }

        public async Task<BusinessResult> GetAllUsers(PaginationParameter paginationParameter)
        {
            try
            {
                Expression<Func<User, bool>> filter = null!;
                Func<IQueryable<User>, IOrderedQueryable<User>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    if (checkInt)
                    {
                        filter = x => x.UserId == validInt;
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = x => x.CreateDate == validDate
                                      || x.UpdateDate == validDate || x.Dob == validDate;
                    }
                    else
                    {
                        filter = x => x.UserCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.FullName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Email.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Status.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Gender.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.PhoneNumber.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Address.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Status.ToLower().Contains(paginationParameter.Search.ToLower());
                    }
                }
                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "userid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.UserId)
                                   : x => x.OrderBy(x => x.UserId)) : x => x.OrderBy(x => x.UserId);
                        break;
                    case "usercode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.UserCode)
                                   : x => x.OrderBy(x => x.UserCode)) : x => x.OrderBy(x => x.UserCode);
                        break;
                    case "fullname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.FullName)
                                   : x => x.OrderBy(x => x.FullName)) : x => x.OrderBy(x => x.FullName);
                        break;
                    case "status":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Status)
                                   : x => x.OrderBy(x => x.Status)) : x => x.OrderBy(x => x.Status);
                        break;
                    case "gender":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Gender)
                                   : x => x.OrderBy(x => x.Gender)) : x => x.OrderBy(x => x.Gender);
                        break;
                    case "email":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Email)
                                   : x => x.OrderBy(x => x.Email)) : x => x.OrderBy(x => x.Email);
                        break;
                    case "role":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Role.RoleName)
                                   : x => x.OrderBy(x => x.Role.RoleName)) : x => x.OrderBy(x => x.Role.RoleName);
                        break;
                    case "phone":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.PhoneNumber)
                                   : x => x.OrderBy(x => x.PhoneNumber)) : x => x.OrderBy(x => x.PhoneNumber);
                        break;
                    case "address":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.Address)
                                   : x => x.OrderBy(x => x.Address)) : x => x.OrderBy(x => x.Address);
                        break;
                    case "createDate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.CreateDate)
                                   : x => x.OrderBy(x => x.CreateDate)) : x => x.OrderBy(x => x.CreateDate);
                        break;
                    case "updateDate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.UpdateDate)
                                   : x => x.OrderBy(x => x.UpdateDate)) : x => x.OrderBy(x => x.UpdateDate);
                        break;
                    case "dob":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.Dob)
                                   : x => x.OrderBy(x => x.Dob)) : x => x.OrderBy(x => x.Dob);
                        break;
                    default:
                        orderBy = x => x.OrderBy(x => x.UserId);
                        break;
                }
                string includeProperties = "Role";
                var entities = await _unitOfWork.UserRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<UserModel>();
                pagin.List = _mapper.Map<List<UserModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.UserRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_USER_CODE, Const.SUCCESS_GET_ALL_USER_MESSAGE, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_USER_DOES_NOT_EXIST_CODE, Const.WARNING_USER_DOES_NOT_EXIST_MSG, new PageEntity<UserModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }

        }


        public async Task<BusinessResult> LoginGoogleHandler(string googleToken)
        {
            try
            {
                // Validate Google Token and fetch user info
                var userInfo = await ValidateGoogleTokenAsync(googleToken);
                // neu token khong hop le
                if (userInfo == null)
                    return new BusinessResult(Const.FAIL_VALIDATE_GOOGLE_TOKEN_INVALID_CODE, Const.FAIL_VALIDATE_GOOGLE_TOKEN_INVALID_MSG);

                //var userInfo = (GoogleTokenInfo)googleResult.Data!;
                // kiem tra neu email duoc lay thanh cong thi tiep tuc 

                if (string.IsNullOrEmpty(userInfo!.Email))
                {
                    return new BusinessResult(Const.FAIL_VALIDATE_GOOGLE_TOKEN_INVALID_CODE, Const.FAIL_VALIDATE_GOOGLE_TOKEN_INVALID_MSG);
                }
                else
                {
                    using (var transaction = await _unitOfWork.BeginTransactionAsync())
                    {
                        // Kiểm tra người dùng tồn tại
                        var existUser = await _unitOfWork.UserRepository.GetByCondition(x => x.Email.Equals(userInfo.Email));
                        // nếu người dùng không tồn tại --> cho tao moi nguoi dung
                        if (existUser == null)
                        {
                            //lay thong tin user tu token gg
                            //var userInfoGG = await FetchGoogleUserInfoAsync(googleToken);
                            string avatarUrl = "";
                            if (string.IsNullOrEmpty(userInfo.Picture))
                            {
                                userInfo.Picture = _configuration["SystemDefault:AvatarDefault"]!;
                                avatarUrl = userInfo.Picture!;
                            }
                            else
                            {
                                // Nếu ảnh không phải ảnh mặc định, thì tải lên Cloudinary
                                //if (avatarUrl != _configuration["SystemDefault:AvatarDefault"])
                                //{
                                using (var imageStream = await _cloudinaryService.DownloadImageFromUrlAsync(userInfo.Picture!))
                                {
                                    avatarUrl = await _cloudinaryService.UploadImageAsync(imageStream, $"avatar_{Guid.NewGuid()}.jpg", CloudinaryPath.USER_AVARTAR);
                                }
                                //}
                            }

                            User newUser = new User()
                            {
                                Email = userInfo.Email,
                                UserCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.USER),
                                FullName = userInfo.Name,
                                Status = nameof(UserStatus.Active),
                                IsDelete = false,
                                CreateDate = DateTime.Now,
                                UpdateDate = DateTime.Now,
                                AvatarURL = avatarUrl,
                                Gender = "",
                                PhoneNumber = "",
                                Dob = null
                            };
                            var role = await _unitOfWork.RoleRepository.GetRoleById((int)RoleEnum.USER);
                            if (role != null)
                            {
                                newUser.RoleId = role.RoleId;
                            }
                            else
                            {
                                return new BusinessResult(Const.WARNING_ROLE_IS_NOT_EXISTED_CODE, Const.WARNING_ROLE_IS_NOT_EXISTED_MSG);
                            }
                            await _unitOfWork.UserRepository.AddUserAsync(newUser);
                            _ = int.TryParse(_configuration["JWT:TokenValidityInMinutes"], out int tokenValidityInMinutes1);
                            string accessToken1 = await GenerateAccessToken(newUser.Email, newUser, -1, -1);

                            _ = int.TryParse(_configuration["JWT:RefreshTokenValidityInDays"], out int tokenValidityInDays1);
                            string refreshToken1 = await GenerateRefreshToken(newUser.Email, null, tokenValidityInDays1, -1, -1);


                            await _unitOfWork.RefreshTokenRepository.AddRefreshToken(new RefreshToken()
                            {
                                UserId = newUser.UserId,
                                RefreshTokenCode = NumberHelper.GenerateRandomCode("RFT"),
                                RefreshTokenValue = refreshToken1,
                                CreateDate = DateTime.Now,
                                ExpiredDate = DateTime.Now.AddDays(tokenValidityInDays1)
                            });
                            await transaction.CommitAsync();
                            return new BusinessResult(Const.SUCCESS_LOGIN_CODE, Const.SUCCESS_LOGIN_MSG, new
                            {
                                AuthenModel = new AuthenModel()
                                {
                                    AccessToken = accessToken1,
                                    RefreshToken = refreshToken1
                                },
                                Avatar = newUser.AvatarURL,
                                Fullname = newUser.FullName,
                            });
                        }
                        // nếu người dùng bị ban
                        if (existUser.Status!.ToLower().Equals(nameof(UserStatus.Banned).ToLower()) || existUser.IsDelete == true)
                        {
                            return new BusinessResult(Const.WARNING_ACCOUNT_BANNED_CODE, Const.WARNING_ACCOUNT_BANNED_MSG);
                        }
                        // nếu tồn tại
                        _ = int.TryParse(_configuration["JWT:TokenValidityInMinutes"], out int tokenValidityInMinutes);
                        string accessToken = await GenerateAccessToken(userInfo.Email, existUser, -1, -1);

                        _ = int.TryParse(_configuration["JWT:RefreshTokenValidityInDays"], out int tokenValidityInDays);
                        string refreshToken = await GenerateRefreshToken(userInfo.Email, null, tokenValidityInDays, -1, -1);


                        await _unitOfWork.RefreshTokenRepository.AddRefreshToken(new RefreshToken()
                        {
                            UserId = existUser.UserId,
                            RefreshTokenCode = NumberHelper.GenerateRandomCode("RFT"),
                            RefreshTokenValue = refreshToken,
                            CreateDate = DateTime.Now,
                            ExpiredDate = DateTime.Now.AddDays(tokenValidityInDays)
                        });
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_LOGIN_CODE, Const.SUCCESS_LOGIN_MSG, new
                        {
                            AuthenModel = new AuthenModel()
                            {
                                AccessToken = accessToken,
                                RefreshToken = refreshToken
                            },
                            Avatar = existUser.AvatarURL,
                            Fullname = existUser.FullName,
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        //private async Task<GoogleTokenInfo> ValidateGoogleTokenAsync(string googleToken)
        //{
        //    var validationUrl = $"{_configuration["Authentication:Google:validateGoogleTokenEndpoint"]}id_token={googleToken}";
        //    var response = await _httpClient.GetAsync(validationUrl);

        //    if (!response.IsSuccessStatusCode) return null;

        //    var content = await response.Content.ReadAsStringAsync();
        //    Console.WriteLine($"Google API Response: {content}");
        //    var usertoken = JsonConvert.DeserializeObject<GoogleTokenInfo>(content);
        //    return usertoken!;
        //}


        private async Task<GoogleTokenInfo?> ValidateGoogleTokenAsync(string googleToken)
        {
            try
            {

                string cliendid = $"{_configuration["Authentication:Google:ClientId"]} ";
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new List<string> { $"{_configuration["Authentication:Google:ClientId"]}" },
                };
                var payload = await GoogleJsonWebSignature.ValidateAsync(googleToken, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new List<string> { $"{_configuration["Authentication:Google:ClientId"]}" }
                });
                // Xử lý payload, ví dụ:
                Console.WriteLine($"User ID: {payload.Subject}");
                Console.WriteLine($"Email: {payload.Email}");
                Console.WriteLine(JsonConvert.SerializeObject(payload, Formatting.Indented)); // Debug kiểm tra payload

                if (payload == null)
                {
                    Console.WriteLine("Invalid Google Token!");
                    return null;
                }

                var tokenInfo = new GoogleTokenInfo
                {
                    Issuer = payload.Issuer,
                    Audience = (string)payload.Audience,
                    Subject = payload.Subject,
                    Email = payload.Email,
                    EmailVerified = payload.EmailVerified,
                    Name = payload.Name,
                    Picture = payload.Picture,
                    GivenName = payload.GivenName,
                    FamilyName = payload.FamilyName,
                    IssuedAt = payload.IssuedAtTimeSeconds!.Value,
                    Expiration = payload.ExpirationTimeSeconds!.Value,
                };

                return tokenInfo;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error validating Google token: {ex.Message}");
                return null;
            }
        }


        private async Task<GoogleUserInfo> FetchGoogleUserInfoAsync(string googleToken)
        {
            try
            {

                var peopleApiUrl = _configuration["Authentication:Google:userDetectEndpoint"];
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", googleToken);

                var response = await _httpClient.GetAsync(peopleApiUrl);
                if (!response.IsSuccessStatusCode) return null;

                var content = await response.Content.ReadAsStringAsync();
                var userGoogleInfo = JsonConvert.DeserializeObject<GoogleUserInfo>(content);
                return userGoogleInfo;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error validating Google token: {ex.Message}");
                return null;
            }
        }

        public async Task<BusinessResult> ValidateRoleOfUserInFarm(string jwtToken, int farmId)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:SecretKey"]));
            var handler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = authSigningKey,
                ValidateIssuer = true,
                ValidIssuer = _configuration["JWT:ValidIssuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["JWT:ValidAudience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
            };
            try
            {
                SecurityToken validatedToken;
                var principal = handler.ValidateToken(jwtToken, validationParameters, out validatedToken);
                var email = principal.Claims.FirstOrDefault(x => x.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress").Value;
                if (email != null)
                {
                    if (principal != null)
                    {
                        var existUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
                        if (existUser != null)
                        {
                            var checkExistRefreshToken = await _unitOfWork.RefreshTokenRepository.GetRefrshTokenByRefreshTokenValue(jwtToken);
                            if (checkExistRefreshToken == null)
                            {
                                return new BusinessResult(Const.WARNING_RFT_NOT_EXIST_CODE, Const.WARNING_RFT_NOT_EXIST_MSG);

                            }
                            else
                            {
                                if (checkExistRefreshToken.ExpiredDate >= DateTime.Now)
                                {
                                    var getRoleOfUserInFarm = await _unitOfWork.UserFarmRepository.getRoleOfUserInFarm(existUser.UserId, farmId);

                                    var newAccessToken = await GenerateAccessToken(email, existUser, getRoleOfUserInFarm, farmId);
                                    _ = int.TryParse(_configuration["JWT:TokenValidityInMinutes"], out int newTokenValidityInMinutes);

                                    var newRefreshToken = await GenerateRefreshToken(email, checkExistRefreshToken.ExpiredDate, 0, getRoleOfUserInFarm, farmId);
                                    _ = int.TryParse(_configuration["JWT:RefreshTokenValidityInDays"], out int tokenValidityInDays);

                                    var getFarm = await _unitOfWork.FarmRepository.GetByID(farmId);

                                    await _unitOfWork.RefreshTokenRepository.AddRefreshToken(new RefreshToken()
                                    {
                                        UserId = checkExistRefreshToken.UserId,
                                        RefreshTokenCode = NumberHelper.GenerateRandomCode("RFT"),
                                        RefreshTokenValue = newRefreshToken,
                                        CreateDate = DateTime.Now,
                                        ExpiredDate = checkExistRefreshToken.ExpiredDate
                                    });
                                    await _unitOfWork.RefreshTokenRepository.DeleteToken(jwtToken);
                                    return new BusinessResult(Const.SUCCESS_RFT_CODE, Const.SUCCESS_RFT_MSG, new ReIssueToken
                                    {
                                        AccessToken = newAccessToken,
                                        RefreshToken = newRefreshToken,
                                        FarmName = getFarm.FarmName,
                                        FarmLogo = getFarm.LogoUrl
                                    });

                                }
                                else
                                {
                                    await _unitOfWork.RefreshTokenRepository.DeleteToken(jwtToken);
                                    return new BusinessResult(Const.WARNING_INVALID_REFRESH_TOKEN_CODE, Const.WARNING_INVALID_REFRESH_TOKEN_MSG);
                                }
                            }
                        }
                    }
                }
                return new BusinessResult(Const.WARNING_SIGN_IN_CODE, Const.WARNING_SIGN_IN_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateTokenOfUser(string jwtToken)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:SecretKey"]));
            var handler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = authSigningKey,
                ValidateIssuer = true,
                ValidIssuer = _configuration["JWT:ValidIssuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["JWT:ValidAudience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
            };
            try
            {
                SecurityToken validatedToken;
                var principal = handler.ValidateToken(jwtToken, validationParameters, out validatedToken);
                var email = principal.Claims.FirstOrDefault(x => x.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress").Value;
                if (email != null)
                {
                    if (principal != null)
                    {
                        var existUser = await _unitOfWork.UserRepository.GetUserByEmailAsync(email);
                        if (existUser != null)
                        {
                            var checkExistRefreshToken = await _unitOfWork.RefreshTokenRepository.GetRefrshTokenByRefreshTokenValue(jwtToken);
                            if (checkExistRefreshToken == null)
                            {
                                return new BusinessResult(Const.WARNING_RFT_NOT_EXIST_CODE, Const.WARNING_RFT_NOT_EXIST_MSG);

                            }
                            else
                            {
                                if (checkExistRefreshToken.ExpiredDate >= DateTime.Now)
                                {
                                    _ = int.TryParse(_configuration["JWT:TokenValidityInMinutes"], out int tokenValidityInMinutes);
                                    string accessToken = await GenerateAccessToken(email, existUser, -1, -1);

                                    _ = int.TryParse(_configuration["JWT:RefreshTokenValidityInDays"], out int tokenValidityInDays);
                                    string refreshToken = await GenerateRefreshToken(email, null, tokenValidityInDays, -1, -1);


                                    await _unitOfWork.RefreshTokenRepository.AddRefreshToken(new RefreshToken()
                                    {
                                        UserId = existUser.UserId,
                                        RefreshTokenCode = NumberHelper.GenerateRandomCode("RFT"),
                                        RefreshTokenValue = refreshToken,
                                        CreateDate = DateTime.Now,
                                        ExpiredDate = DateTime.Now.AddDays(tokenValidityInDays)
                                    });
                                    return new BusinessResult(Const.SUCCESS_UPDATE_TOKEN_CODE, Const.SUCCESS_UPDATE_TOKEN_MESSAGE, new
                                    {
                                        AuthenModel = new AuthenModel()
                                        {
                                            AccessToken = accessToken,
                                            RefreshToken = refreshToken
                                        },
                                        Avatar = existUser.AvatarURL,
                                        Fullname = existUser.FullName,
                                    });

                                }
                                else
                                {
                                    await _unitOfWork.RefreshTokenRepository.DeleteToken(jwtToken);
                                    return new BusinessResult(Const.WARNING_INVALID_REFRESH_TOKEN_CODE, Const.WARNING_INVALID_REFRESH_TOKEN_MSG);
                                }
                            }
                        }
                    }
                }
                return new BusinessResult(Const.WARNING_SIGN_IN_CODE, Const.WARNING_SIGN_IN_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> SearchByEmail(string? searchEmail)
        {
            if (string.IsNullOrEmpty(searchEmail))
                return new BusinessResult(200, "No resource found");
            var getUser = await _unitOfWork.UserRepository.SearchByEmail(searchEmail);
            if (getUser != null)
            {
                var result = _mapper.Map<IEnumerable<UserModel>>(getUser);
                return new BusinessResult(Const.SUCCESS_GET_USER_CODE, Const.SUCCESS_GET_USER_BY_EMAIL_MSG, result);
            }
            return new BusinessResult(Const.FAIL_GET_USER_CODE, Const.FAIL_GET_USER_BY_EMAIL_MSG, null);
        }

    }
}
