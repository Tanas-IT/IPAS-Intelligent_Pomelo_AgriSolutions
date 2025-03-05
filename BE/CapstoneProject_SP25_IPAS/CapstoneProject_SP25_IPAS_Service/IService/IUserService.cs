using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.AuthensModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IUserService
    {
        public Task<BusinessResult> GetUserById(int userId);
        public Task<BusinessResult> GetUserByEmail(string email);
        public Task<BusinessResult> LoginByEmailAndPassword(string email, string password);
        public Task<BusinessResult> RegisterAsync(SignUpModel model);
        public Task<BusinessResult> RegisterSendMailAsync(string email);
        public BusinessResult VerifyOtpRegisterAsync(string email, string otp);

        public Task<BusinessResult> Logout(string refreshToken);

        public Task<BusinessResult> RefreshToken(string jwtToken);

        public Task<BusinessResult> RequestResetPassword(string email);
        public Task<BusinessResult> ConfirmResetPassword(ConfirmOtpModel confirmOtpModel);
        public Task<BusinessResult> ExecuteResetPassword(ResetPasswordModel resetPasswordModel);

        public Task<BusinessResult> UpdateUser(UpdateUserModel updateUserRequestModel);
        public Task<BusinessResult> SoftDeleteUser(int userId);
        public Task<BusinessResult> BannedUser(int userId);
        public Task<BusinessResult> DeleteUser(int userId);
        public Task<BusinessResult> CreateUser(CreateAccountModel createAccountModel);
        public Task<BusinessResult> UpdateAvatarOfUser(IFormFile avatarOfUser, int id);
        public Task<BusinessResult> GetAllUsersByRole(string roleName);
        public Task<BusinessResult> GetAllUsers(PaginationParameter paginationParameter);
        public Task<BusinessResult> LoginGoogleHandler(string GoogleToken);
        public Task<BusinessResult> ValidateRoleOfUserInFarm(string jwtToken, int farmId);
        public Task<BusinessResult> UpdateTokenOfUser(string jwtToken);
        public Task<BusinessResult> SearchByEmail(string? email);
    }
}
