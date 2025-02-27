using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using CapstoneProject_SP25_IPAS_Repository.Repository;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Mapping;
using CapstoneProject_SP25_IPAS_Service.Service;
using FluentValidation;
using Microsoft.Extensions.Configuration;

namespace CapstoneProject_SP25_IPAS_API.ProgramConfig
{
    public static class SystemServiceInstaller
    {
        public static void ConfigureServices(this IServiceCollection services, IConfiguration configuration)
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

            // read TypeName and Target of MasterType
            var masterTypeConfig = new MasterTypeConfig();
            configuration.GetSection("MasterTypeConfig").Bind(masterTypeConfig);
            // Trim khoảng trắng trong danh sách
            masterTypeConfig.TypeNames = masterTypeConfig.TypeNames.Select(x => x.Trim()).ToList();
            masterTypeConfig.Targets = masterTypeConfig.Targets.Select(x => x.Trim()).ToList();
            masterTypeConfig.GraftedTargetApply = masterTypeConfig.GraftedTargetApply.Select(x => x.Trim()).ToList();
            services.AddSingleton(masterTypeConfig);


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
            services.AddScoped<IMasterTypeRepository, MasterTypeRepository>();
            services.AddScoped<IPartnerRepository, PartnerRepository>();
            services.AddScoped<IGrowthStageRepository, GrowthStageRepository>();
            services.AddScoped<IProcessRepository, ProcessRepository>();
            services.AddScoped<ISubProcessRepository, SubProcessRepository>();
            services.AddScoped<ICriteriaRepository, CriteriaRepository>();
            services.AddScoped<ILandPlotRepository, LandPlotRepository>();
            services.AddScoped<ILandRowRepository, LandRowRepository>();
            //services.AddScoped<IMasterTypeDetailRepostiory, MasterTypeDetailRepostiory>();
            services.AddScoped<IPlantGrowthHistoryRepository, PlantGrowthHistoryRepository>();
            services.AddScoped<ICarePlanScheduleRepository, CarePlanScheduleRepository>();
            services.AddScoped<IWorkLogRepository, WorkLogRepository>();
            services.AddScoped<IResourceRepository, ResourceRepository>();
            services.AddScoped<ILegalDocumentRepository, LegalDocumentRepository>();
            services.AddScoped<ICropRepository, CropRepository>();
            services.AddScoped<IHarvestHistoryRepository, HarvestHistoryRepository>();
            services.AddScoped<IHarvestTypeHistoryRepository, HarvestTypeHistoryRepository>();
            services.AddScoped<ITaskFeedbackRepository, TaskFeedbackRepository>();
            services.AddScoped<IType_TypeRepository, Type_TypeRepository>();
            services.AddScoped<IOrdesRepository, OrdesRepository>();
            services.AddScoped<IPackageRepository, PackageRepository>();
            services.AddScoped<IPlanNotificationRepository, PlanNotificationRepository>();
            services.AddScoped<IGraftedPlantRepository, GraftedPlantRepository>();
            services.AddScoped<IPlanTargetRepository, PlanTargetRepository>();
            services.AddScoped<ICriteriaTargetRepository, CriteriaTargetRepository>();
            services.AddScoped<IGraftedPlantNoteRepository, GraftedPlantNoteRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();

            // Register servicies
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IMailService, MailService>();
            services.AddScoped<ICloudinaryService, CloudinaryService>();
            services.AddScoped<IPlantLotService, PlantLotService>();
            services.AddScoped<IFarmService, FarmService>();
            services.AddScoped<IMasterTypeService, MasterTypeService>();
            services.AddScoped<IPartnerService, PartnerService>();
            services.AddScoped<IGrowthStageService, GrowthStageService>();
            services.AddScoped<IProcessService, ProcessService>();
            services.AddScoped<ICriteriaService, CriteriaService>();
            services.AddScoped<ISubProcessService, SubProcessService>();
            services.AddScoped<IPlanService, PlanService>();
            services.AddScoped<ILandPlotService, LandPlotService>();
            services.AddScoped<ILandRowService, LandRowService>();
            //services.AddScoped<IMasterTypeDetailService, MasterTypeDetailService>();
            services.AddScoped<IPlantService, PlantService>();
            services.AddScoped<IPlantGrowthHistoryService, PlantGrowthHistoryService>();
            services.AddScoped<IUserWorkLogService, UserWorkLogService>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<ILegalDocumentService, LegalDocumentService>();
            services.AddScoped<ICropService, CropService>();
            services.AddScoped<IWorkLogService, WorkLogService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<ITaskFeedbackService, TaskFeedbackService>();
            services.AddScoped<IHarvestHistoryService, HarvestHistoryService>();

            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IPackageService, PackageService>();
            services.AddScoped<IValidator<IFormFile>, ExcelFileValidator>();
            services.AddScoped<IExcelReaderService, ExcelReaderService>();
            services.AddScoped<ICriteriaTargetService, CriteriaTargetService>();
            services.AddScoped<IGraftedPlantService, GraftedPlantService>();
            services.AddScoped<IGraftedPlantNoteService, GraftedPlantNoteService>();
            services.AddScoped<IPaymentService, PaymentService>();


            services.AddHttpClient();

        }
    }
}
