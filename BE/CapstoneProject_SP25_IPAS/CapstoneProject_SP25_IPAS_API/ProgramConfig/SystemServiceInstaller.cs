﻿using AutoMapper;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using CapstoneProject_SP25_IPAS_Repository.Repository;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Mapping;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.Extensions.Configuration;

namespace CapstoneProject_SP25_IPAS_API.ProgramConfig
{
    public static class SystemServiceInstaller
    {
        public static void ConfigureServices(this IServiceCollection services)
        {
            // Add services to the container.
            services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            services.AddHttpContextAccessor();
            // Add Mapping profiles
            var mapper = new MapperConfiguration(mc =>
            {
                mc.AddProfile<MappingProfile>();
            });

            services.AddSingleton(mapper.CreateMapper());

            // Register repositories
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUserRepostiory, UserRepository>();
            services.AddScoped<IFarmRepository, FarmRepository>();
            services.AddScoped<IUserFarmRepository, UserFarmRepository>();
            services.AddScoped<IUserWorkLogRepository, UserWorkLogRepository>();
            services.AddScoped<IUserFarmRepository, UserFarmRepository>();
            services.AddScoped<IPlanRepository, PlanRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<ITaskFeedbackRepository, TaskFeedbackRepository>();
            services.AddScoped<IChatRoomRepository, ChatRoomRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<IPlantLotRepository, PlantLotRepository>();
            services.AddScoped<IPlantRepository, PlantRepository>();
            services.AddScoped<ICriteriaTypeRepository, CriteriaTypeRepository>();
            services.AddScoped<IPartnerRepository, PartnerRepository>();

            // Register servicies
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IMailService, MailService>();
            services.AddScoped<ICloudinaryService, CloudinaryService>();
            services.AddScoped<IPlantLotService, PlantLotService>();
            services.AddScoped<IFarmService, FarmService>();
            services.AddScoped<ICriteriaTypeService, CriteriaTypeService>();
            services.AddScoped<IPartnerService, PartnerService>();

            services.AddHttpClient();

        }
    }
}
