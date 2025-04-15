using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.UserFarmRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IFarmService
    {
        public Task<BusinessResult> GetFarmByID(int farmId);

        public Task<BusinessResult> GetAllFarmPagination(GetFarmFilterRequest getRequest, PaginationParameter paginationParameter);

        public Task<BusinessResult> CreateFarm(FarmCreateRequest farmCreateModel, int userId);

        public Task<BusinessResult> UpdateFarmInfo(FarmUpdateInfoRequest farmUpdateModel, int farmId);

        public Task<BusinessResult> SoftDeletedFarm(int farmId);

        public Task<BusinessResult> permanentlyDeleteFarm(int farmId);

        public Task<BusinessResult> GetAllFarmOfUser(int userId);

        public Task<BusinessResult> UpdateFarmLogo(int farmId, IFormFile LogoURL);

        //public Task<BusinessResult> UpdateFarmCoordination(int farmId, List<CoordinationCreateRequest> farmCoordinationUpdate);

        public Task<UserFarmModel> GetUserFarmRole(int farmId, int userId);

        public Task<BusinessResult> GetAllUserOfFarmByRoleAsync(int farmId, List<int> roleIds);

        public Task<BusinessResult> getUserOfFarm(GetUserFarmRequest getRequest, PaginationParameter paginationParameter);

        public Task<BusinessResult> updateUserInFarm(UserFarmRequest updateRequest);

        public Task<BusinessResult> deleteUserInFarm(int farmId, int userId);

        public Task<BusinessResult> addUserToFarm(UserFarmRequest createRequest);

        public Task<BusinessResult> getUserFarmById(int farmId, int userId);

        public Task<FarmModel> CheckFarmExist(int farmId);

        public Task<BusinessResult> ActivateFarm(List<int> FarmIds);

        public  Task<BusinessResult> GetAllFarmForSelected();

    }
}
