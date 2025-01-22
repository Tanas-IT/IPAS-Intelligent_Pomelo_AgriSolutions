﻿using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
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

        public Task<BusinessResult> GetAllFarmPagination(PaginationParameter paginationParameter);

        public Task<BusinessResult> CreateFarm(FarmCreateRequest farmCreateModel);

        public Task<BusinessResult> UpdateFarmInfo(FarmUpdateRequest farmUpdateModel);

        public Task<BusinessResult> SoftDeletedFarm(int farmId);

        public Task<BusinessResult> permanentlyDeleteFarm(int farmId);

        public Task<BusinessResult> GetAllFarmOfUser(int userId);

        public Task<BusinessResult> UpdateFarmLogo(int farmId, IFormFile LogoURL);

        public Task<BusinessResult> UpdateFarmCoordination(int farmId, List<CoordinationCreateRequest> farmCoordinationUpdate);

        public Task<UserFarmModel> GetUserFarmRole(int farmId, int userId);
    }
}
