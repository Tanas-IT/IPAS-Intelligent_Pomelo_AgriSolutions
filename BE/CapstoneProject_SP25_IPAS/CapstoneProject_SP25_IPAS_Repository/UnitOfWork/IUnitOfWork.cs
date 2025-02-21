using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using CapstoneProject_SP25_IPAS_Repository.Repository;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.UnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task CommitAsync();
        Task RollBackAsync();
        void Save();
        Task<int> SaveAsync();
        public UserRepository UserRepository { get; }
        public RoleRepository RoleRepository { get; }
        public RefreshTokenRepository RefreshTokenRepository { get; }
        public ChatRoomRepository ChatRoomRepository { get; }
        public FarmRepository FarmRepository { get; }
        public TaskFeedbackRepository TaskFeedbackRepository { get; }
        public UserWorkLogRepository UserWorkLogRepository { get; }
        public PlanRepository PlanRepository { get; }
        public NotificationRepository NotificationRepository { get; }
        public UserFarmRepository UserFarmRepository { get; }
        //public FarmCoordinationRepository FarmCoordinationRepository { get; }
        public PlantLotRepository PlantLotRepository { get; }
        public PlantRepository PlantRepository { get; }
        public MasterTypeRepository MasterTypeRepository { get; }
        public CriteriaRepository CriteriaRepository { get; }
        public PartnerRepository PartnerRepository { get; }
        public GrowthStageRepository GrowthStageRepository { get; }
        public ProcessRepository ProcessRepository { get; }
        public SubProcessRepository SubProcessRepository { get; }
        public LandPlotRepository LandPlotRepository { get; }
        public LandPlotCoordinationRepository LandPlotCoordinationRepository { get; }
        public CriteriaTargetRepository CriteriaTargetRepository { get; }
        public LandRowRepository LandRowRepository { get; }
        public PlantGrowthHistoryRepository PlantGrowthHistoryRepository { get; }
        public CarePlanScheduleRepository CarePlanScheduleRepository { get; }
        public WorkLogRepository WorkLogRepository { get; }
        public ResourceRepository ResourceRepository { get; }
        public LegalDocumentRepository LegalDocumentRepository { get; }
        public CropRepository CropRepository { get; }
        public Type_TypeRepository Type_TypeRepository { get; }
        public HarvestHistoryRepository HarvestHistoryRepository { get; }
        public HarvestTypeHistoryRepository HarvestTypeHistoryRepository { get; }
        public LandPlotCropRepository LandPlotCropRepository { get; }
        public PackageRepository PackageRepository { get; }

        public OrdesRepository OrdesRepository { get; }
        public PlanNotificationRepository PlanNotificationRepository { get; }
        public GraftedPlantRepository GraftedPlantRepository { get; }
        public PlanTargetRepository PlanTargetRepository { get; }
    }
}
