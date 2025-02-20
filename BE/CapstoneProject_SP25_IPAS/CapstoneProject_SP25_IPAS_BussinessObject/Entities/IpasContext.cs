using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class IpasContext : DbContext
{
    public IpasContext()
    {
    }

    public IpasContext(DbContextOptions<IpasContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CarePlanSchedule> CarePlanSchedules { get; set; }

    public virtual DbSet<ChatMessage> ChatMessages { get; set; }

    public virtual DbSet<ChatRoom> ChatRooms { get; set; }

    public virtual DbSet<CriteriaGraftedPlant> CriteriaGraftedPlants { get; set; }

    public virtual DbSet<CriteriaHarvestType> CriteriaHarvestTypes { get; set; }

    public virtual DbSet<Criteria> Criteria { get; set; }

    public virtual DbSet<Crop> Crops { get; set; }

    public virtual DbSet<Farm> Farms { get; set; }

    //public virtual DbSet<FarmCoordination> FarmCoordinations { get; set; }

    public virtual DbSet<GraftedPlant> GraftedPlants { get; set; }

    public virtual DbSet<GraftedPlantNote> GraftedPlantNotes { get; set; }

    public virtual DbSet<GrowthStage> GrowthStages { get; set; }

    public virtual DbSet<HarvestHistory> HarvestHistories { get; set; }

    public virtual DbSet<HarvestTypeHistory> HarvestTypeHistories { get; set; }

    public virtual DbSet<LandPlot> LandPlots { get; set; }
    public virtual DbSet<LandPlotCrop> LandPlotCrops { get; set; }

    public virtual DbSet<LandPlotCoordination> LandPlotCoordinations { get; set; }

    public virtual DbSet<LandRow> LandRows { get; set; }

    public virtual DbSet<MasterType> MasterTypes { get; set; }

    public virtual DbSet<MasterTypeDetail> MasterTypeDetails { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<Package> Packages { get; set; }

    public virtual DbSet<PackageDetail> PackageDetails { get; set; }

    public virtual DbSet<Partner> Partners { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Plan> Plans { get; set; }

    public virtual DbSet<Plant> Plants { get; set; }

    public virtual DbSet<PlantCriteria> PlantCriteria { get; set; }

    public virtual DbSet<PlantGrowthHistory> PlantGrowthHistories { get; set; }

    public virtual DbSet<PlantLot> PlantLots { get; set; }

    public virtual DbSet<Resource> Resources { get; set; }
    public virtual DbSet<LegalDocument> LegalDocuments { get; set; }

    public virtual DbSet<Process> Processes { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<SubProcess> SubProcesses { get; set; }

    public virtual DbSet<TaskFeedback> TaskFeedbacks { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserFarm> UserFarms { get; set; }

    public virtual DbSet<UserWorkLog> UserWorkLogs { get; set; }

    public virtual DbSet<Warning> Warnings { get; set; }

    public virtual DbSet<WorkLog> WorkLogs { get; set; }
    public virtual DbSet<Type_Type> Type_Types { get; set; }
    public virtual DbSet<PlanNotification> PlanNotifications { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var configuration = new ConfigurationBuilder()
           .SetBasePath(Directory.GetCurrentDirectory())
           .AddJsonFile("appsettings.json")
           .Build();
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        optionsBuilder.UseSqlServer(connectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CarePlanSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__CarePlan__9C8A5B694338D9F1");

            entity.ToTable("CarePlanSchedule");

            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.CarePlanId).HasColumnName("CarePlanID");
            entity.Property(e => e.DayOfWeek)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.EndTime).HasColumnType("time");
            entity.Property(e => e.StarTime).HasColumnType("time");

            entity.HasOne(d => d.CarePlan).WithOne(p => p.CarePlanSchedule)
                .HasForeignKey<CarePlanSchedule>(d => d.CarePlanId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__CarePlanS__CareP__2180FB33");
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK__ChatMess__C87C037C2C4F831C");

            entity.ToTable("ChatMessage");

            entity.Property(e => e.MessageId).HasColumnName("MessageID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.MessageCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.MessageContent).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.MessageType)
                .HasMaxLength(1)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.RoomId).HasColumnName("RoomID");
            entity.Property(e => e.SenderId).HasColumnName("SenderID");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.Room).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__ChatMessa__RoomI__16CE6296");
        });

        modelBuilder.Entity<ChatRoom>(entity =>
        {
            entity.HasKey(e => e.RoomId).HasName("PK__ChatRoom__32863919A904C9FC");

            entity.ToTable("ChatRoom");

            entity.Property(e => e.RoomId).HasColumnName("RoomID");
            entity.Property(e => e.AiresponseId).HasColumnName("AIResponseID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.RoomCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.RoomName)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");

            entity.HasOne(d => d.CreateByNavigation).WithMany(p => p.ChatRooms)
                .HasForeignKey(d => d.CreateBy)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__ChatRoom__Create__17C286CF");
        });

        modelBuilder.Entity<CriteriaGraftedPlant>(entity =>
        {
            entity.HasKey(e => new { e.GraftedPlantId, e.CriteriaId }).HasName("PK__Criteria__47DA559824FE7603");

            entity.ToTable("CriteriaGraftedPlant");

            entity.Property(e => e.GraftedPlantId).HasColumnName("GraftedPlantID");
            entity.Property(e => e.CriteriaId).HasColumnName("CriteriaID");
            entity.Property(e => e.IsChecked).HasColumnName("isChecked");

            entity.HasOne(d => d.Criteria).WithMany(p => p.CriteriaGraftedPlants)
                .HasForeignKey(d => d.CriteriaId)
                .HasConstraintName("FK__CriteriaG__Crite__55F4C372");

            entity.HasOne(d => d.GraftedPlant).WithMany(p => p.CriteriaGraftedPlants)
                .HasForeignKey(d => d.GraftedPlantId)
                .HasConstraintName("FK__CriteriaG__Graft__55009F39");
        });

        modelBuilder.Entity<CriteriaHarvestType>(entity =>
        {
            entity.HasKey(e => new { e.CriteriaId, e.MasterTypeId }).HasName("PK__Criteria__30A6B59B7AC7D5D7");

            entity.ToTable("CriteriaHarvestType");

            entity.Property(e => e.CriteriaId).HasColumnName("CriteriaID");
            entity.Property(e => e.MasterTypeId).HasColumnName("MasterTypeID");
            entity.Property(e => e.IsChecked).HasColumnName("isChecked");

            entity.HasOne(d => d.Criteria).WithMany(p => p.CriteriaHarvestTypes)
                .HasForeignKey(d => d.CriteriaId)
                .HasConstraintName("FK_CriteriaHarvestType_Criteria");

            entity.HasOne(d => d.MasterType).WithMany(p => p.CriteriaHarvestTypes)
                .HasForeignKey(d => d.MasterTypeId)
                .HasConstraintName("CriteriaHarvestType_MasterType_FK");
        });

        modelBuilder.Entity<Criteria>(entity =>
        {
            entity.HasKey(e => e.CriteriaId).HasName("PK__Criteria__FE6ADB2D5F0540FD");

            entity.Property(e => e.CriteriaId).HasColumnName("CriteriaID");
            entity.Property(e => e.CriteriaCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CriteriaDescription).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CriteriaName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.IsChecked).HasColumnName("isChecked");
            entity.Property(e => e.IsDefault).HasColumnName("isDefault");

            entity.HasOne(d => d.MasterType).WithMany(p => p.Criterias)
               .HasForeignKey(d => d.MasterTypeID)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("Criteria_Master_Type_FK");
        });

        modelBuilder.Entity<Crop>(entity =>
        {
            entity.HasKey(e => e.CropId).HasName("PK__Crop__923561351B1EF0E2");

            entity.ToTable("Crop");

            entity.Property(e => e.CropId).HasColumnName("CropID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.CropActualTime).HasColumnType("datetime");
            entity.Property(e => e.Year).HasColumnType("int");
            entity.Property(e => e.CropCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CropExpectedTime).HasColumnType("datetime");
            entity.Property(e => e.CropName)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.HarvestSeason)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Notes)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");
            entity.Property(e => e.StartDate).HasColumnType("datetime");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.IsDeleted).HasColumnName("isDeleted");
            entity.Property(e => e.FarmId).HasColumnName("FarmID");

        });

        modelBuilder.Entity<Farm>(entity =>
        {
            entity.HasKey(e => e.FarmId).HasName("PK__Farm__ED7BBA991346855A");

            entity.ToTable("Farm");

            entity.Property(e => e.FarmId).HasColumnName("FarmID");
            entity.Property(e => e.Address).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.ClimateZone)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.District)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.FarmCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.FarmName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.IsDeleted).HasColumnName("isDeleted");
            //entity.Property(e => e.LandLeaseAgreement).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            //entity.Property(e => e.LandOwnershipCertificate).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            //entity.Property(e => e.OperatingLicense).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            //entity.Property(e => e.PesticideUseLicense).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.LogoUrl)
                .HasMaxLength(500)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS")
                .HasColumnName("LogoURL");
            entity.Property(e => e.Province)
                .HasMaxLength(300)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.SoilType)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");
            entity.Property(e => e.Ward)
                .HasMaxLength(300)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
        });

        //modelBuilder.Entity<FarmCoordination>(entity =>
        //{
        //    entity.HasKey(e => e.FarmCoordinationId).HasName("PK__FarmCoor__6BD490F93070DFBF");

        //    entity.ToTable("FarmCoordination");

        //    entity.Property(e => e.FarmCoordinationId).HasColumnName("FarmCoordinationID");
        //    entity.Property(e => e.FarmCoordinationCode)
        //        .HasMaxLength(50)
        //        .UseCollation("SQL_Latin1_General_CP1_CI_AS");
        //    entity.Property(e => e.FarmId).HasColumnName("FarmID");

        //    entity.HasOne(d => d.Farm).WithMany(p => p.FarmCoordinations)
        //        .HasForeignKey(d => d.FarmId)
        //        .OnDelete(DeleteBehavior.Cascade)
        //        .HasConstraintName("FK__FarmCoord__FarmI__18B6AB08");
        //});

        modelBuilder.Entity<GraftedPlant>(entity =>
        {
            entity.HasKey(e => e.GraftedPlantId).HasName("PK__GraftedP__883CF82ACBB74009");

            entity.ToTable("GraftedPlant");

            entity.Property(e => e.GraftedPlantId).HasColumnName("GraftedPlantID");
            entity.Property(e => e.GraftedDate).HasColumnType("datetime");
            entity.Property(e => e.GraftedPlantCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.GraftedPlantName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.GrowthStage)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Note).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PlantId).HasColumnName("PlantID");
            entity.Property(e => e.PlantLotId).HasColumnName("PlantLotID");
            entity.Property(e => e.SeparatedDate).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");

            entity.HasOne(d => d.Plant).WithMany(p => p.GraftedPlants)
                .HasForeignKey(d => d.PlantId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__GraftedPl__Plant__531856C7");

            entity.HasOne(d => d.PlantLot).WithMany(p => p.GraftedPlants)
                .HasForeignKey(d => d.PlantLotId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("GraftedPlant_PlantLot_FK");
        });

        modelBuilder.Entity<GraftedPlantNote>(entity =>
        {
            entity.HasKey(e => e.GraftedPlantNoteId).HasName("PK__GraftedP__09DC047162079786");

            entity.ToTable("GraftedPlantNote");

            entity.Property(e => e.GraftedPlantNoteId).HasColumnName("GraftedPlantNoteID");
            entity.Property(e => e.Content).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.GraftedPlantId).HasColumnName("GraftedPlantID");
            entity.Property(e => e.GraftedPlantNoteName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Image)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.NoteTaker)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.GraftedPlant).WithMany(p => p.GraftedPlantNotes)
                .HasForeignKey(d => d.GraftedPlantId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_GraftedPlantNote_GraftedPlant");
        });

        modelBuilder.Entity<GrowthStage>(entity =>
        {
            entity.HasKey(e => e.GrowthStageId).HasName("PK__GrowthSt__B81FB6A5CB51E95C");

            entity.ToTable("GrowthStage");

            entity.Property(e => e.GrowthStageId).HasColumnName("GrowthStageID");
            entity.Property(e => e.GrowthStageCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.GrowthStageName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.MonthAgeEnd);
            entity.Property(e => e.MonthAgeStart);
        });

        modelBuilder.Entity<HarvestHistory>(entity =>
        {
            entity.HasKey(e => e.HarvestHistoryId).HasName("PK__HarvestH__F15734AD189BFCA2");

            entity.ToTable("HarvestHistory");

            entity.Property(e => e.HarvestHistoryId).HasColumnName("HarvestHistoryID");
            entity.Property(e => e.CropId).HasColumnName("CropID");
            entity.Property(e => e.isDelete).HasColumnName("isDelete");
            entity.Property(e => e.DateHarvest).HasColumnType("datetime");
            entity.Property(e => e.HarvestHistoryCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.HarvestHistoryNote).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.HarvestStatus)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.HasOne(d => d.Crop).WithMany(p => p.HarvestHistories)
                .HasForeignKey(d => d.CropId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("HarvestHistory_Crop_FK");
        });

        modelBuilder.Entity<HarvestTypeHistory>(entity =>
        {
            entity.HasKey(e => new { e.HarvestTypeHistoryId }).HasName("PK__HarvestT__CAE5744A780B99C5");

            entity.ToTable("HarvestTypeHistory");

            entity.Property(e => e.MasterTypeId).HasColumnName("MasterTypeID");
            entity.Property(e => e.HarvestHistoryId).HasColumnName("HarvestHistoryID");
            entity.Property(e => e.PlantId).HasColumnName("PlantID");
            entity.Property(e => e.ProcessId).HasColumnName("ProcessID");
            entity.HasOne(d => d.HarvestHistory).WithMany(p => p.HarvestTypeHistories)
                .HasForeignKey(d => d.HarvestHistoryId)
                .HasConstraintName("FK__HarvestTy__Harve__40058253");

            entity.HasOne(d => d.MasterType).WithMany(p => p.HarvestTypeHistories)
                .HasForeignKey(d => d.MasterTypeId)
                .HasConstraintName("HarvestTypeHistory_MasterType_FK");

            entity.HasOne(d => d.Plant).WithMany(p => p.HarvestTypeHistories)
                .HasForeignKey(d => d.PlantId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_HarvestTypeHistory_Plant");

            entity.HasOne(d => d.Process).WithMany(p => p.HarvestTypeHistories)
               .HasForeignKey(d => d.ProcessId)
               .HasConstraintName("FK_Harvest_Type_History_Process");
        });

        modelBuilder.Entity<LandPlot>(entity =>
        {
            entity.HasKey(e => e.LandPlotId).HasName("PK__LandPlot__ADDF712A976DFB93");

            entity.ToTable("LandPlot");

            entity.Property(e => e.LandPlotId).HasColumnName("LandPlotID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.FarmId).HasColumnName("FarmID");
            entity.Property(e => e.LandPlotCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.LandPlotName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.SoilType)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.TargetMarket)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.Farm).WithMany(p => p.LandPlots)
                .HasForeignKey(d => d.FarmId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__LandPlot__FarmID__2739D489");
        });

        modelBuilder.Entity<LandPlotCrop>(entity =>
        {
            entity.HasKey(e => new { e.LandPlotId, e.CropID }).HasName("PK__LandPlotCrop__995F74677DAC5");

            entity.ToTable("LandPlotCrop");

            entity.Property(e => e.LandPlotId).HasColumnName("LandPlotID");
            entity.Property(e => e.CropID).HasColumnName("CropID");

            entity.HasOne(d => d.LandPlot).WithMany(p => p.LandPlotCrops)
                .HasForeignKey(d => d.LandPlotId)
                .HasConstraintName("FK__LandPlotCrop__LandPlotID__41B8C09B");

            entity.HasOne(d => d.Crop).WithMany(p => p.LandPlotCrops)
                .HasForeignKey(d => d.CropID)
                .HasConstraintName("LandPlotCrop_Crop_FK");
        });

        modelBuilder.Entity<LandPlotCoordination>(entity =>
        {
            entity.HasKey(e => e.LandPlotCoordinationId).HasName("PK__LandPlot__AA254567BAC71490");

            entity.ToTable("LandPlotCoordination");

            entity.Property(e => e.LandPlotCoordinationId).HasColumnName("LandPlotCoordinationID");
            entity.Property(e => e.LandPlotCoordinationCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.LandPlotId).HasColumnName("LandPlotID");

            entity.HasOne(d => d.LandPlot).WithMany(p => p.LandPlotCoordinations)
                .HasForeignKey(d => d.LandPlotId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__LandPlotC__LandP__31B762FC");
        });

        modelBuilder.Entity<LandRow>(entity =>
        {
            entity.HasKey(e => e.LandRowId).HasName("PK__LandRow__0E72A6FAD7B08F4C");

            entity.ToTable("LandRow");

            entity.Property(e => e.LandRowId).HasColumnName("LandRowID");
            entity.Property(e => e.FarmId).HasColumnName("FarmID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Direction)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.LandPlotId).HasColumnName("LandPlotID");
            entity.Property(e => e.LandRowCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.LandPlot).WithMany(p => p.LandRows)
                .HasForeignKey(d => d.LandPlotId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__LandRow__LandPlo__22751F6C");
        });

        modelBuilder.Entity<MasterType>(entity =>
        {
            entity.HasKey(e => e.MasterTypeId).HasName("MasterType_PK");

            entity.ToTable("MasterType");

            entity.Property(e => e.MasterTypeId).HasColumnName("MasterTypeID");
            entity.Property(e => e.CreateBy)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.IsDelete).HasColumnName("isDelete");
            entity.Property(e => e.IsDefault).HasColumnName("isDefault");
            entity.Property(e => e.MasterTypeCode)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.MasterTypeDescription).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.MasterTypeName)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.TypeName).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.Farm).WithMany(p => p.MasterTypes)
                .HasForeignKey(d => d.FarmID)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Master_Type_Farm__22751F6C");

            entity.HasOne(d => d.GrowthStage).WithMany(p => p.MasterTypes)
                .HasForeignKey(d => d.GrowthStageID)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Master_Type_GrowthStage__2274324F6C");
        });

        modelBuilder.Entity<MasterTypeDetail>(entity =>
        {
            entity.HasKey(e => e.MasterTypeDetailId).HasName("MasterTypeDetails_PK");

            entity.Property(e => e.MasterTypeDetailId).HasColumnName("MasterTypeDetailID");
           
            entity.Property(e => e.MasterTypeDetailCode)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.MasterTypeDetailName).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.MasterTypeId).HasColumnName("MasterTypeID");
            entity.Property(e => e.TypeOfValue)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Value).UseCollation("SQL_Latin1_General_CP1_CI_AS");

            entity.HasOne(d => d.MasterType).WithMany(p => p.MasterTypeDetails)
                .HasForeignKey(d => d.MasterTypeId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("MasterTypeDetails_MasterType_FK");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E32F94B5C5B");

            entity.ToTable("Notification");

            entity.Property(e => e.NotificationId).HasColumnName("NotificationID");
            entity.Property(e => e.Content).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.SenderID).HasColumnName("SenderID");
            entity.Property(e => e.Link)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.MasterTypeId).HasColumnName("MasterTypeID");
            entity.Property(e => e.NotificationCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Title)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");

            entity.HasOne(d => d.MasterType).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.MasterTypeId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("Notification_MasterType_FK");

            entity.HasOne(d => d.Sender).WithMany(p => p.NotificationSenders)
               .HasForeignKey(d => d.SenderID)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_Notification_Sender");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Order__C3905BAF4F3F1E0A");

            entity.ToTable("Order");

            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.EnrolledDate).HasColumnType("datetime");
            entity.Property(e => e.ExpiredDate).HasColumnType("datetime");
            entity.Property(e => e.FarmId).HasColumnName("FarmID");
            entity.Property(e => e.Notes).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.OrderCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.OrderDate).HasColumnType("datetime");
            entity.Property(e => e.OrderName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PackageId).HasColumnName("PackageID");

            entity.HasOne(d => d.Farm).WithMany(p => p.Orders)
                .HasForeignKey(d => d.FarmId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Order__FarmID__251C81ED");

            entity.HasOne(d => d.Package).WithMany(p => p.Orders)
                .HasForeignKey(d => d.PackageId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Order__PackageID__2610A626");
        });

        modelBuilder.Entity<Package>(entity =>
        {
            entity.HasKey(e => e.PackageId).HasName("PK__Package__322035EC04B44A12");

            entity.ToTable("Package");

            entity.Property(e => e.PackageId).HasColumnName("PackageID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.PackageCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PackageName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");
            entity.Property(e => e.IsActive);
        });

        modelBuilder.Entity<PackageDetail>(entity =>
        {
            entity.HasKey(e => e.PackageDetailId).HasName("PK__PackageD__A7D8258A18A0833B");

            entity.ToTable("PackageDetail");

            entity.Property(e => e.PackageDetailId).HasColumnName("PackageDetailID");
            entity.Property(e => e.FeatureDescription).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.FeatureName).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PackageDetailCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PackageId).HasColumnName("PackageID");

            entity.HasOne(d => d.Package).WithMany(p => p.PackageDetails)
                .HasForeignKey(d => d.PackageId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__PackageDe__Packa__2704CA5F");
        });

        modelBuilder.Entity<Partner>(entity =>
        {
            entity.HasKey(e => e.PartnerId).HasName("PK__Partner__39FD6332F826F432");

            entity.ToTable("Partner");

            entity.Property(e => e.PartnerId).HasColumnName("PartnerID");
            entity.Property(e => e.Province).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(20)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.National)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PartnerCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PartnerName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.Role).WithMany(p => p.Partners)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Partner__RoleID__27F8EE98");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__9B556A58F4F846AB");

            entity.ToTable("Payment");

            entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.PaymentCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.TransactionId)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS")
                .HasColumnName("TransactionID");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.Order)
                    .WithOne(p => p.Payment)
                    .HasForeignKey<Payment>(d => d.OrderId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK__Payment__OrderID__28ED12D1");
        });

        modelBuilder.Entity<Plan>(entity =>
        {
            entity.HasKey(e => e.PlanId).HasName("PK__Plan__755C22D7C27C8EF5");

            entity.ToTable("Plan");

            entity.Property(e => e.PlanId).HasColumnName("PlanID");
            entity.Property(e => e.AssignorId).HasColumnName("AssignorID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.CropId).HasColumnName("CropID");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.Frequency)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.GrowthStageId).HasColumnName("GrowthStageID");
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.MasterTypeId).HasColumnName("MasterTypeID");
            entity.Property(e => e.Notes)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PesticideName)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PlanCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PlanDetail).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.ProcessId).HasColumnName("ProcessID");
            entity.Property(e => e.ResponsibleBy)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.StartDate).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            

            entity.HasOne(d => d.MasterType).WithMany(p => p.Plans)
                .HasForeignKey(d => d.MasterTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Plan_MasterType_FK");

            entity.HasOne(d => d.GrowthStage).WithMany(p => p.Plans)
                .HasForeignKey(d => d.GrowthStageId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Plan_GrowStage_FK");

           

            entity.HasOne(d => d.Process).WithMany(p => p.Plans)
                .HasForeignKey(d => d.ProcessId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Plan_Process");

            entity.HasOne(d => d.User).WithMany(p => p.Plans)
               .HasForeignKey(d => d.AssignorId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_Plan_Plan");

            entity.HasOne(d => d.Crop).WithMany(p => p.Plans)
              .HasForeignKey(d => d.CropId)
              .HasConstraintName("FK_Plan_Crop");

            entity.HasOne(d => d.Crop).WithMany(p => p.Plans)
             .HasForeignKey(d => d.CropId)
             .HasConstraintName("FK_Plan_Crop35612");



        });

        modelBuilder.Entity<Plant>(entity =>
        {
            entity.HasKey(e => e.PlantId).HasName("PK__Plant__98FE46BC7EA4DAD0");

            entity.ToTable("Plant");

            entity.Property(e => e.PlantId).HasColumnName("PlantID");
            entity.Property(e => e.FarmId).HasColumnName("FarmID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.HealthStatus)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS")
                .HasColumnName("ImageURL");
            entity.Property(e => e.LandRowId).HasColumnName("LandRowID");
            entity.Property(e => e.MasterTypeId).HasColumnName("MasterTypeID");
            entity.Property(e => e.PlantCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PlantName)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PlantReferenceId).HasColumnName("PlantReferenceID");
            entity.Property(e => e.PlantingDate).HasColumnType("datetime");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.MasterType).WithMany(p => p.Plants)
                .HasForeignKey(d => d.MasterTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Plant_MasterType_FK");


            entity.HasOne(d => d.LandRow).WithMany(p => p.Plants)
                .HasForeignKey(d => d.LandRowId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Plant_LandRow_FK");

            entity.HasOne(d => d.GrowthStage).WithMany(p => p.Plants)
               .HasForeignKey(d => d.GrowthStageID)
               .HasConstraintName("Plant_GrowthStage_FK");
        });

        modelBuilder.Entity<PlantCriteria>(entity =>
        {
            entity.HasKey(e => new { e.PlantId, e.CriteriaId }).HasName("PK__PlantCri__5718EB0E819D7672");

            entity.Property(e => e.PlantId).HasColumnName("PlantID");
            entity.Property(e => e.CriteriaId).HasColumnName("CriteriaID");
            entity.Property(e => e.IsChecked).HasColumnName("isChecked");

            entity.HasOne(d => d.Criteria).WithMany(p => p.PlantCriteria)
                .HasForeignKey(d => d.CriteriaId)
                .HasConstraintName("FK__CriteriaT__Crite__37703C52");

            entity.HasOne(d => d.Plant).WithMany(p => p.PlantCriterias)
                .HasForeignKey(d => d.PlantId)
                .HasConstraintName("FK__CriteriaT__Plant__367C1819");
        });

        modelBuilder.Entity<PlantGrowthHistory>(entity =>
        {
            entity.HasKey(e => e.PlantGrowthHistoryId).HasName("PK__PlantGro__8F26DC48C9286D17");

            entity.ToTable("PlantGrowthHistory");

            entity.Property(e => e.PlantGrowthHistoryId).HasColumnName("PlantGrowthHistoryID");
            entity.Property(e => e.Content).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.IssueName).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.NoteTaker)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PlantGrowthHistoryCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PlantId).HasColumnName("PlantID");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.Plant).WithMany(p => p.PlantGrowthHistories)
                .HasForeignKey(d => d.PlantId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__PlantNote__Plant__32AB8735");
        });

        modelBuilder.Entity<PlantLot>(entity =>
        {
            entity.HasKey(e => e.PlantLotId).HasName("PK__PlantLot__58D457ABDE17F2CF");

            entity.ToTable("PlantLot");

            entity.Property(e => e.PlantLotId).HasColumnName("PlantLotID");
            entity.Property(e => e.ImportedDate).HasColumnType("datetime");
            entity.Property(e => e.Note).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PartnerId).HasColumnName("PartnerID");
            entity.Property(e => e.PlantLotCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PlantLotName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PlantLotReferenceId).HasColumnName("PlantLotReferenceID");
            entity.Property(e => e.Status)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Unit)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");

            entity.HasOne(d => d.Partner).WithMany(p => p.PlantLots)
                .HasForeignKey(d => d.PartnerId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_PlantLot_Partner");

            entity.HasOne(d => d.PlantLotReference).WithMany(p => p.InversePlantLotReference)
                .HasForeignKey(d => d.PlantLotReferenceId)
                .HasConstraintName("PlantLot_PlantLot_FK");
        });

        modelBuilder.Entity<Resource>(entity =>
        {
            entity.HasKey(e => e.ResourceID).HasName("PK__Res__1974A137217179D1");

            entity.ToTable("Resource");

            entity.Property(e => e.ResourceID).HasColumnName("ResourceID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.Description).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.ResourceCode)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.ResourceURL).HasMaxLength(200).HasColumnName("ResourceURL");
            entity.Property(e => e.ResourceType)
                .HasMaxLength(255)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.FileFormat)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS")
                .HasColumnName("FileFormat");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.Property(e => e.WorkLogID);
            entity.Property(e => e.LegalDocumentID);
            entity.Property(e => e.GraftedPlantID);
            entity.Property(e => e.PlantGrowthHistoryID);

            entity.HasOne(d => d.WorkLog).WithMany(p => p.Resources)
                .HasForeignKey(d => d.WorkLogID)
                .HasConstraintName("FK_Resource_WorkLog");

            entity.HasOne(d => d.LegalDocument).WithMany(p => p.Resources)
               .HasForeignKey(d => d.LegalDocumentID)
               .HasConstraintName("FK_Resource_LegalDocument");

            entity.HasOne(d => d.GraftedPlant).WithMany(p => p.Resources)
              .HasForeignKey(d => d.GraftedPlantID)
              .HasConstraintName("FK_Resource_GraftedPlant");

            entity.HasOne(d => d.PlantGrowthHistory).WithMany(p => p.Resources)
              .HasForeignKey(d => d.PlantGrowthHistoryID)
              .HasConstraintName("FK_Resource_PlantGrowthHistory");
        });

        modelBuilder.Entity<Process>(entity =>
        {
            entity.HasKey(e => e.ProcessId).HasName("PK__Process__1B39A976EDEF5BD5");

            entity.ToTable("Process");

            entity.Property(e => e.ProcessId).HasColumnName("ProcessID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.FarmId).HasColumnName("FarmID");
            entity.Property(e => e.GrowthStageId).HasColumnName("GrowthStageID");
            entity.Property(e => e.Input).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.IsDefault).HasColumnName("isDefault");
            entity.Property(e => e.IsDeleted).HasColumnName("isDeleted");
            entity.Property(e => e.MasterTypeId).HasColumnName("MasterTypeID");
            entity.Property(e => e.ProcessCode)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.ProcessName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.ResourceUrl)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS")
                .HasColumnName("ResourceURL");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.MasterType).WithMany(p => p.Processes)
                .HasForeignKey(d => d.MasterTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Process_MasterType_FK");

            entity.HasOne(d => d.GrowthStage).WithMany(p => p.Processes)
                .HasForeignKey(d => d.GrowthStageId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Process_GrowStage_FK");

            entity.HasOne(d => d.Farm).WithMany(p => p.Processes)
                .HasForeignKey(d => d.FarmId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Process_Farm_FK");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.RefreshTokenId).HasName("PK__RefreshT__F5845E59CBB4AB2D");

            entity.ToTable("RefreshToken");

            entity.Property(e => e.RefreshTokenId).HasColumnName("RefreshTokenID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.ExpiredDate).HasColumnType("datetime");
            entity.Property(e => e.RefreshTokenCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.RefreshTokenValue).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__RefreshTo__UserI__3BFFE745");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__8AFACE3A5BC7203D");

            entity.ToTable("Role");

            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.IsSystem).HasColumnName("isSystem");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
        });

        modelBuilder.Entity<SubProcess>(entity =>
        {
            entity.HasKey(e => e.SubProcessID).HasName("PK__SubProce__F054A88CD66E5A59");

            entity.ToTable("SubProcess");

            entity.Property(e => e.SubProcessID).HasColumnName("SubProcessID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.Input).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.IsDefault).HasColumnName("isDefault");
            entity.Property(e => e.IsDeleted).HasColumnName("isDeleted");
            entity.Property(e => e.MasterTypeId).HasColumnName("MasterTypeID");
            entity.Property(e => e.ParentSubProcessId).HasColumnName("ParentSubProcessID");
            entity.Property(e => e.ProcessId).HasColumnName("ProcessID");
            entity.Property(e => e.ResourceUrl)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS")
                .HasColumnName("ResourceURL");
            entity.Property(e => e.SubProcessCode)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.SubProcessName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");

            entity.HasOne(d => d.MasterType).WithMany(p => p.SubProcesses)
                .HasForeignKey(d => d.MasterTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("SubProcess_MasterType_FK");

            entity.HasOne(d => d.Process).WithMany(p => p.SubProcesses)
                .HasForeignKey(d => d.ProcessId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__SubProces__Proce__3CF40B7E");

            entity.HasOne(sp => sp.ParentSubProcess) // Quan hệ với chính nó
                   .WithMany(sp => sp.ChildSubProcesses) // Một SubProcess có nhiều Child
                   .HasForeignKey(sp => sp.ParentSubProcessId)
                   .HasConstraintName("SubProcess_SubProcess_FK_23AG53345");// Khóa ngoại
        });

        modelBuilder.Entity<TaskFeedback>(entity =>
        {
            entity.HasKey(e => e.TaskFeedbackId).HasName("PK__TaskFeed__9CC94E1953C81F4C");

            entity.ToTable("TaskFeedback");

            entity.Property(e => e.TaskFeedbackId).HasColumnName("TaskFeedbackID");
            entity.Property(e => e.Content).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.ManagerId).HasColumnName("ManagerID");
            entity.Property(e => e.TaskFeedbackCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.WorkLogId).HasColumnName("WorkLogID");

            entity.HasOne(d => d.Manager).WithMany(p => p.TaskFeedbacks)
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__TaskFeedb__Manag__3EDC53F0");

            entity.HasOne(d => d.WorkLog).WithMany(p => p.TaskFeedbacks)
                .HasForeignKey(d => d.WorkLogId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__TaskFeedb__WorkL__339FAB6E");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__1788CCACFB4299F2");

            entity.ToTable("User");

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.Address).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.AvatarURL)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS")
                .HasColumnName("AvatarURL");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.DeleteDate).HasColumnType("datetime");
            entity.Property(e => e.Dob)
                .HasColumnType("datetime")
                .HasColumnName("DOB");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.ExpiredOtpTime).HasColumnType("datetime");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Gender)
                .HasMaxLength(20)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Otp)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Password)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");
            entity.Property(e => e.UserCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__User__RoleID__40C49C62");
        });

        modelBuilder.Entity<UserFarm>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.FarmId }).HasName("PK__UserFarm__995F77051197DAC5");

            entity.ToTable("UserFarm");

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.FarmId).HasColumnName("FarmID");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.HasOne(d => d.Farm).WithMany(p => p.UserFarms)
                .HasForeignKey(d => d.FarmId)
                .HasConstraintName("FK__UserFarm__FarmID__41B8C09B");

            entity.HasOne(d => d.Role).WithMany(p => p.UserFarms)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("UserFarm_Role_FK");

            entity.HasOne(d => d.User).WithMany(p => p.UserFarms)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__UserFarm__UserID__42ACE4D4");
        });

        modelBuilder.Entity<UserWorkLog>(entity =>
        {
            entity.HasKey(e => new { e.WorkLogId, e.UserId }).HasName("PK__UserWork__2F2CA1082A09A834");

            entity.ToTable("UserWorkLog");

            entity.Property(e => e.WorkLogId).HasColumnName("WorkLogID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.UserWorkLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__UserWorkL__UserI__43A1090D");

            entity.HasOne(d => d.WorkLog).WithMany(p => p.UserWorkLogs)
                .HasForeignKey(d => d.WorkLogId)
                .HasConstraintName("FK__UserWorkL__WorkL__25518C17");
        });

        modelBuilder.Entity<Warning>(entity =>
        {
            entity.HasKey(e => e.WarningId).HasName("Warning_PK");

            entity.ToTable("Warning");

            entity.Property(e => e.WarningId)
                .ValueGeneratedNever()
                .HasColumnName("WarningID");
            entity.Property(e => e.CreateDate).HasColumnType("datetime");
            entity.Property(e => e.Description).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Level)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.Status)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");
            entity.Property(e => e.WarningCode)
                .HasMaxLength(100)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.WarningName)
                .HasMaxLength(200)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
        });

        modelBuilder.Entity<WorkLog>(entity =>
        {
            entity.HasKey(e => e.WorkLogId).HasName("PK__WorkLog__FE542DC2BB0A0EA4");

            entity.ToTable("WorkLog");

            entity.Property(e => e.WorkLogId).HasColumnName("WorkLogID");
            entity.Property(e => e.Date).HasColumnType("datetime");
            entity.Property(e => e.HarvestHistoryId).HasColumnName("HarvestHistoryID");
            entity.Property(e => e.Notes).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.WarningId).HasColumnName("WarningID");
            entity.Property(e => e.WorkLogCode)
                .HasMaxLength(50)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");

            entity.HasOne(d => d.HarvestHistory).WithMany(p => p.WorkLogs)
                .HasForeignKey(d => d.HarvestHistoryId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_WorkLog_HarvestHistory");

            entity.HasOne(d => d.Schedule).WithMany(p => p.WorkLogs)
                .HasForeignKey(d => d.ScheduleId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__WorkLog__Schedul__236943A5");

            entity.HasOne(d => d.Warning).WithMany(p => p.WorkLogs)
                .HasForeignKey(d => d.WarningId)
                .HasConstraintName("WorkLog_Warning_FK");
        });

        modelBuilder.Entity<LegalDocument>(entity =>
        {
            entity.HasKey(e => e.LegalDocumentId).HasName("PK__LegalDocument__2EE578CA467DABB5");

            entity.ToTable("LegalDocument");

            entity.Property(e => e.LegalDocumentId).HasColumnName("LegalDocumentID");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");
            entity.Property(e => e.IssueDate).HasColumnType("datetime");
            entity.Property(e => e.ExpiredDate).HasColumnType("datetime");
            entity.Property(e => e.LegalDocumentCode).HasMaxLength(200).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.LegalDocumentType)
                .HasMaxLength(300)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS");
            entity.Property(e => e.LegalDocumentName)
                .HasMaxLength(300)
                .UseCollation("SQL_Latin1_General_CP1_CI_AS")
                .HasColumnName("LegalDocumentName");
            entity.Property(e => e.LegalDocumentURL)
               .HasMaxLength(300)
               .UseCollation("SQL_Latin1_General_CP1_CI_AS")
               .HasColumnName("LegalDocumentURL");
            entity.Property(e => e.Status)
              .HasMaxLength(200)
              .UseCollation("SQL_Latin1_General_CP1_CI_AS")
              .HasColumnName("Status");
            entity.Property(e => e.FarmId).HasColumnName("FarmID");
          

            entity.HasOne(d => d.Farm).WithMany(p => p.LegalDocuments)
                .HasForeignKey(d => d.FarmId)
                .HasConstraintName("FK__LegalDocument__Farm__29221CFB");
        });

        modelBuilder.Entity<Type_Type>(entity =>
        {
            entity.HasKey(e => new { e.MasterTypeID_1, e.MasterTypeID_2 }).HasName("PK_Type_Type__2F2CAR35609A834");

            entity.ToTable("Type_Type");

            entity.Property(e => e.MasterTypeID_1).HasColumnName("MasterTypeID_1");
            entity.Property(e => e.MasterTypeID_2).HasColumnName("MasterTypeID_2");

            entity.HasOne(d => d.MasterType_1).WithMany(p => p.Type_Types_1)
                .HasForeignKey(d => d.MasterTypeID_1)
                .HasConstraintName("FK__Type_Type_1_MasterType__43A51090D");

            entity.HasOne(d => d.MasterType_2).WithMany(p => p.Type_Types_2)
                .HasForeignKey(d => d.MasterTypeID_2)
                .HasConstraintName("FK__Type_Type_2_Master_Type__24218C17");
        });

        modelBuilder.Entity<PlanNotification>(entity =>
        {
            entity.HasKey(e => e.PlanNotificationID).HasName("PK__PlanNotification__2EE54234ADBB5");

            entity.Property(e => e.PlanID).HasColumnName("PlanID");
            entity.Property(e => e.NotificationID).HasColumnName("NotificationID");
            entity.Property(e => e.UserID).HasColumnName("UserID");
            entity.Property(e => e.isRead).HasColumnName("isRead");
            entity.Property(e => e.CreatedDate).HasColumnName("CreateDate");

            entity.HasOne(d => d.Plan).WithMany(p => p.PlanNotifications)
                .HasForeignKey(d => d.PlanID)
                .HasConstraintName("FK__PlanNotification__Plan__32673C52");

            entity.HasOne(d => d.Notification).WithMany(p => p.PlanNotifications)
                .HasForeignKey(d => d.PlanID)
                .HasConstraintName("FK__PlanNotification__Notification__3B451819");

            entity.HasOne(d => d.User).WithMany(p => p.PlanNotifications)
               .HasForeignKey(d => d.UserID)
               .HasConstraintName("FK__PlanNotification__User__38H51819");
        });

        modelBuilder.Entity<PlanTarget>(entity =>
        {
            entity.HasKey(e => e.PlanTargetID).HasName("PK__PlanTarget__2456GHYRT5");

            entity.Property(e => e.PlanID).HasColumnName("PlanID");
            entity.Property(e => e.GraftedPlantID).HasColumnName("GraftedPlantID");
            entity.Property(e => e.LandPlotID).HasColumnName("LandPlotID");
            entity.Property(e => e.LandRowID).HasColumnName("LandRowID");
            entity.Property(e => e.PlantLotID).HasColumnName("PlantLotID");
            entity.Property(e => e.PlantID).HasColumnName("PlantID");

            entity.HasOne(d => d.Plan).WithMany(p => p.PlanTargets)
                .HasForeignKey(d => d.PlanID)
                .HasConstraintName("FK_PlanTarget_Plan__345619C52");

            entity.HasOne(d => d.GraftedPlant).WithMany(p => p.PlanTargets)
                .HasForeignKey(d => d.GraftedPlantID)
                .HasConstraintName("FK_PlanTarget_GraftedPlant_3B445629");

            entity.HasOne(d => d.LandPlot).WithMany(p => p.PlanTargets)
               .HasForeignKey(d => d.LandPlotID)
               .HasConstraintName("FK__PlanTarget_LandPlot__39KH52829");

            entity.HasOne(d => d.LandRow).WithMany(p => p.PlanTargets)
              .HasForeignKey(d => d.LandRowID)
              .HasConstraintName("FK__PlanTarget_LandRow__3256JH9");

            entity.HasOne(d => d.PlantLot).WithMany(p => p.PlanTargets)
              .HasForeignKey(d => d.PlantLotID)
              .HasConstraintName("FK__PlanTarget_PlantLot__4056AE34");

            entity.HasOne(d => d.Plant).WithMany(p => p.PlanTargets)
              .HasForeignKey(d => d.PlantID)
              .HasConstraintName("FK__PlanTarget_Plant__352ET4678");
        });
        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
