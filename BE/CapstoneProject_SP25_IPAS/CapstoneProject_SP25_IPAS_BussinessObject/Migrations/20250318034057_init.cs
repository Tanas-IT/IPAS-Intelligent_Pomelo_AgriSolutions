using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CapstoneProject_SP25_IPAS_BussinessObject.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Farm",
                columns: table => new
                {
                    FarmID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FarmCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    FarmName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    LogoURL = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Area = table.Column<double>(type: "float", nullable: true),
                    SoilType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    ClimateZone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    isDeleted = table.Column<bool>(type: "bit", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Length = table.Column<double>(type: "float", nullable: true),
                    Width = table.Column<double>(type: "float", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    District = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Ward = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Province = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Farm__ED7BBA991346855A", x => x.FarmID);
                });

            migrationBuilder.CreateTable(
                name: "Package",
                columns: table => new
                {
                    PackageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PackageCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PackageName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PackagePrice = table.Column<double>(type: "float", nullable: true),
                    Duration = table.Column<double>(type: "float", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Package__322035EC04B44A12", x => x.PackageID);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    isSystem = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Role__8AFACE3A5BC7203D", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "Warning",
                columns: table => new
                {
                    WarningID = table.Column<int>(type: "int", nullable: false),
                    WarningCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    WarningName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Status = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Level = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    AffectedStage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Warning_PK", x => x.WarningID);
                });

            migrationBuilder.CreateTable(
                name: "Crop",
                columns: table => new
                {
                    CropID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CropCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CropName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    StartDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    CropExpectedTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    CropActualTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    HarvestSeason = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    EstimateYield = table.Column<double>(type: "float", nullable: true),
                    ActualYield = table.Column<double>(type: "float", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Notes = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    isDeleted = table.Column<bool>(type: "bit", nullable: true),
                    MarketPrice = table.Column<double>(type: "float", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Crop__923561351B1EF0E2", x => x.CropID);
                    table.ForeignKey(
                        name: "FK_Crop_Farm",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID");
                });

            migrationBuilder.CreateTable(
                name: "GrowthStage",
                columns: table => new
                {
                    GrowthStageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GrowthStageCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    GrowthStageName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    MonthAgeStart = table.Column<int>(type: "int", nullable: true),
                    MonthAgeEnd = table.Column<int>(type: "int", nullable: true),
                    isDefault = table.Column<bool>(type: "bit", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    isDeleted = table.Column<bool>(type: "bit", nullable: true),
                    ActiveFunction = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GrowthSt__B81FB6A5CB51E95C", x => x.GrowthStageID);
                    table.ForeignKey(
                        name: "FK_GrowthStage_Farm",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID");
                });

            migrationBuilder.CreateTable(
                name: "LandPlot",
                columns: table => new
                {
                    LandPlotID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LandPlotCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    LandPlotName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Area = table.Column<double>(type: "float", nullable: true),
                    Length = table.Column<double>(type: "float", nullable: true),
                    Width = table.Column<double>(type: "float", nullable: true),
                    SoilType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    isDeleted = table.Column<bool>(type: "bit", nullable: true),
                    IsRowHorizontal = table.Column<bool>(type: "bit", nullable: true),
                    TargetMarket = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    RowPerLine = table.Column<int>(type: "int", nullable: true),
                    RowSpacing = table.Column<double>(type: "float", nullable: true),
                    LineSpacing = table.Column<double>(type: "float", nullable: true),
                    NumberOfRows = table.Column<int>(type: "int", nullable: true),
                    MinLength = table.Column<double>(type: "float", nullable: true),
                    MaxLength = table.Column<double>(type: "float", nullable: true),
                    MinWidth = table.Column<double>(type: "float", nullable: true),
                    MaxWidth = table.Column<double>(type: "float", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LandPlot__ADDF712A976DFB93", x => x.LandPlotID);
                    table.ForeignKey(
                        name: "FK__LandPlot__FarmID__2739D489",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LegalDocument",
                columns: table => new
                {
                    LegalDocumentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LegalDocumentCode = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    LegalDocumentType = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    LegalDocumentName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    LegalDocumentURL = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    IssueDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    ExpiredDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LegalDocument__2EE578CA467DABB5", x => x.LegalDocumentID);
                    table.ForeignKey(
                        name: "FK__LegalDocument__Farm__29221CFB",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID");
                });

            migrationBuilder.CreateTable(
                name: "MasterType",
                columns: table => new
                {
                    MasterTypeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MasterTypeCode = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    MasterTypeName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    MasterTypeDescription = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    isActive = table.Column<bool>(type: "bit", nullable: true),
                    IsConflict = table.Column<bool>(type: "bit", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    TypeName = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    isDelete = table.Column<bool>(type: "bit", nullable: true),
                    isDefault = table.Column<bool>(type: "bit", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    BackgroundColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TextColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Target = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Characteristic = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("MasterType_PK", x => x.MasterTypeID);
                    table.ForeignKey(
                        name: "FK__Master_Type_Farm__22751F6C",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Partner",
                columns: table => new
                {
                    PartnerID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartnerCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PartnerName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Province = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    District = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ward = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Major = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BusinessField = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Email = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    National = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Partner__39FD6332F826F432", x => x.PartnerID);
                    table.ForeignKey(
                        name: "FK__Partner__Farm",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Order",
                columns: table => new
                {
                    OrderID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    OrderName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    TotalPrice = table.Column<double>(type: "float", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    OrderDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    EnrolledDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    ExpiredDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    PackageID = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Order__C3905BAF4F3F1E0A", x => x.OrderID);
                    table.ForeignKey(
                        name: "FK__Order__FarmID__251C81ED",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__Order__PackageID__2610A626",
                        column: x => x.PackageID,
                        principalTable: "Package",
                        principalColumn: "PackageID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PackageDetail",
                columns: table => new
                {
                    PackageDetailID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PackageDetailCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    FeatureName = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    FeatureDescription = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PackageID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PackageD__A7D8258A18A0833B", x => x.PackageDetailID);
                    table.ForeignKey(
                        name: "FK__PackageDe__Packa__2704CA5F",
                        column: x => x.PackageID,
                        principalTable: "Package",
                        principalColumn: "PackageID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Password = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Gender = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    DOB = table.Column<DateTime>(type: "datetime", nullable: true),
                    UserCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    IsDelete = table.Column<bool>(type: "bit", nullable: true),
                    DeleteDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    IsDependency = table.Column<int>(type: "int", nullable: true),
                    RoleID = table.Column<int>(type: "int", nullable: true),
                    AvatarURL = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Otp = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    ExpiredOtpTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    RemainDays = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__User__1788CCACFB4299F2", x => x.UserID);
                    table.ForeignKey(
                        name: "FK__User__RoleID__40C49C62",
                        column: x => x.RoleID,
                        principalTable: "Role",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HarvestHistory",
                columns: table => new
                {
                    HarvestHistoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HarvestHistoryCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    DateHarvest = table.Column<DateTime>(type: "datetime", nullable: true),
                    HarvestHistoryNote = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    TotalPrice = table.Column<double>(type: "float", nullable: true),
                    HarvestStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    isDelete = table.Column<bool>(type: "bit", nullable: true),
                    CropID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__HarvestH__F15734AD189BFCA2", x => x.HarvestHistoryID);
                    table.ForeignKey(
                        name: "HarvestHistory_Crop_FK",
                        column: x => x.CropID,
                        principalTable: "Crop",
                        principalColumn: "CropID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "LandPlotCoordination",
                columns: table => new
                {
                    LandPlotCoordinationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LandPlotCoordinationCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    LandPlotID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LandPlot__AA254567BAC71490", x => x.LandPlotCoordinationID);
                    table.ForeignKey(
                        name: "FK__LandPlotC__LandP__31B762FC",
                        column: x => x.LandPlotID,
                        principalTable: "LandPlot",
                        principalColumn: "LandPlotID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LandPlotCrop",
                columns: table => new
                {
                    CropID = table.Column<int>(type: "int", nullable: false),
                    LandPlotID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LandPlotCrop__995F74677DAC5", x => new { x.LandPlotID, x.CropID });
                    table.ForeignKey(
                        name: "FK__LandPlotCrop__LandPlotID__41B8C09B",
                        column: x => x.LandPlotID,
                        principalTable: "LandPlot",
                        principalColumn: "LandPlotID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "LandPlotCrop_Crop_FK",
                        column: x => x.CropID,
                        principalTable: "Crop",
                        principalColumn: "CropID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LandRow",
                columns: table => new
                {
                    LandRowID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LandRowCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    RowIndex = table.Column<int>(type: "int", nullable: true),
                    TreeAmount = table.Column<int>(type: "int", nullable: true),
                    Distance = table.Column<double>(type: "float", nullable: true),
                    Length = table.Column<double>(type: "float", nullable: true),
                    Width = table.Column<double>(type: "float", nullable: true),
                    Direction = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    isDeleted = table.Column<bool>(type: "bit", nullable: true),
                    MinLength = table.Column<double>(type: "float", nullable: true),
                    MaxLength = table.Column<double>(type: "float", nullable: true),
                    MinWidth = table.Column<double>(type: "float", nullable: true),
                    MaxWidth = table.Column<double>(type: "float", nullable: true),
                    MaxNumberOfPlant = table.Column<int>(type: "int", nullable: true),
                    LandPlotID = table.Column<int>(type: "int", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LandRow__0E72A6FAD7B08F4C", x => x.LandRowID);
                    table.ForeignKey(
                        name: "FK__LandRow__LandPlo__22751F6C",
                        column: x => x.LandPlotID,
                        principalTable: "LandPlot",
                        principalColumn: "LandPlotID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Criteria",
                columns: table => new
                {
                    CriteriaID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CriteriaCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CriteriaName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CriteriaDescription = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Priority = table.Column<int>(type: "int", nullable: true),
                    FrequencyDate = table.Column<int>(type: "int", nullable: true),
                    isActive = table.Column<bool>(type: "bit", nullable: true),
                    isDeleted = table.Column<bool>(type: "bit", nullable: true),
                    isDefault = table.Column<bool>(type: "bit", nullable: true),
                    MasterTypeID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Criteria__FE6ADB2D5F0540FD", x => x.CriteriaID);
                    table.ForeignKey(
                        name: "Criteria_Master_Type_FK",
                        column: x => x.MasterTypeID,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GrowthStageMasterType",
                columns: table => new
                {
                    GrowthStageMasterTypeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GrowthStageID = table.Column<int>(type: "int", nullable: true),
                    MasterTypeID = table.Column<int>(type: "int", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GrowthStageMasterType__23823GHYRT5", x => x.GrowthStageMasterTypeID);
                    table.ForeignKey(
                        name: "FK_GrowthStageMasterType_Farm__3234554C52",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID");
                    table.ForeignKey(
                        name: "FK_GrowthStageMasterType_GrowthStage__35232C52",
                        column: x => x.GrowthStageID,
                        principalTable: "GrowthStage",
                        principalColumn: "GrowthStageID");
                    table.ForeignKey(
                        name: "FK_GrowthStageMasterType_MasterType__323154C52",
                        column: x => x.MasterTypeID,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID");
                });

            migrationBuilder.CreateTable(
                name: "Process",
                columns: table => new
                {
                    ProcessID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProcessCode = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    ProcessName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    isDefault = table.Column<bool>(type: "bit", nullable: true),
                    isActive = table.Column<bool>(type: "bit", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    isDeleted = table.Column<bool>(type: "bit", nullable: true),
                    IsSample = table.Column<bool>(type: "bit", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    PlanTargetInProcess = table.Column<int>(type: "int", nullable: true),
                    GrowthStageID = table.Column<int>(type: "int", nullable: true),
                    MasterTypeID = table.Column<int>(type: "int", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Process__1B39A976EDEF5BD5", x => x.ProcessID);
                    table.ForeignKey(
                        name: "Process_Farm_FK",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "Process_GrowStage_FK",
                        column: x => x.GrowthStageID,
                        principalTable: "GrowthStage",
                        principalColumn: "GrowthStageID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "Process_MasterType_FK",
                        column: x => x.MasterTypeID,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Type_Type",
                columns: table => new
                {
                    MasterTypeID_1 = table.Column<int>(type: "int", nullable: false),
                    MasterTypeID_2 = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true),
                    MasterTypeId = table.Column<int>(type: "int", nullable: true),
                    MasterTypeId1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Type_Type__2F2CAR35609A834", x => new { x.MasterTypeID_1, x.MasterTypeID_2 });
                    table.ForeignKey(
                        name: "FK_Type_Type_MasterType_MasterTypeId",
                        column: x => x.MasterTypeId,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID");
                    table.ForeignKey(
                        name: "FK_Type_Type_MasterType_MasterTypeId1",
                        column: x => x.MasterTypeId1,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID");
                    table.ForeignKey(
                        name: "FK__Type_Type_1_MasterType__43A51090D",
                        column: x => x.MasterTypeID_1,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__Type_Type_2_Master_Type__24218C17",
                        column: x => x.MasterTypeID_2,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlantLot",
                columns: table => new
                {
                    PlantLotID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlantLotCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PlantLotName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PreviousQuantity = table.Column<int>(type: "int", nullable: true),
                    InputQuantity = table.Column<int>(type: "int", nullable: true),
                    LastQuantity = table.Column<int>(type: "int", nullable: true),
                    UsedQuantity = table.Column<int>(type: "int", nullable: true),
                    Unit = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    ImportedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PartnerID = table.Column<int>(type: "int", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    isDeleted = table.Column<bool>(type: "bit", nullable: true),
                    IsPassed = table.Column<bool>(type: "bit", nullable: true),
                    PassedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PlantLotReferenceID = table.Column<int>(type: "int", nullable: true),
                    MasterTypeId = table.Column<int>(type: "int", nullable: true),
                    IsFromGrafted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PlantLot__58D457ABDE17F2CF", x => x.PlantLotID);
                    table.ForeignKey(
                        name: "FK_PlantLot_Farm",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID");
                    table.ForeignKey(
                        name: "FK_PlantLot_Partner",
                        column: x => x.PartnerID,
                        principalTable: "Partner",
                        principalColumn: "PartnerID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "PlantLot_MasterType_FK",
                        column: x => x.MasterTypeId,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID");
                    table.ForeignKey(
                        name: "PlantLot_PlantLot_FK",
                        column: x => x.PlantLotReferenceID,
                        principalTable: "PlantLot",
                        principalColumn: "PlantLotID");
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                columns: table => new
                {
                    PaymentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    TransactionID = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    OrderID = table.Column<int>(type: "int", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payment__9B556A58F4F846AB", x => x.PaymentID);
                    table.ForeignKey(
                        name: "FK__Payment__OrderID__28ED12D1",
                        column: x => x.OrderID,
                        principalTable: "Order",
                        principalColumn: "OrderID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChatRoom",
                columns: table => new
                {
                    RoomID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    RoomName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    AIResponseID = table.Column<int>(type: "int", nullable: true),
                    CreateBy = table.Column<int>(type: "int", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    UserID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ChatRoom__32863919A904C9FC", x => x.RoomID);
                    table.ForeignKey(
                        name: "FK__ChatRoom__Create__17C286CF",
                        column: x => x.CreateBy,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notification",
                columns: table => new
                {
                    NotificationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NotificationCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Title = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Link = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    IsRead = table.Column<bool>(type: "bit", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    MasterTypeID = table.Column<int>(type: "int", nullable: true),
                    SenderID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notifica__20CF2E32F94B5C5B", x => x.NotificationID);
                    table.ForeignKey(
                        name: "FK_Notification_Sender",
                        column: x => x.SenderID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "Notification_MasterType_FK",
                        column: x => x.MasterTypeID,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshToken",
                columns: table => new
                {
                    RefreshTokenID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RefreshTokenCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    RefreshTokenValue = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    ExpiredDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    IsUsed = table.Column<bool>(type: "bit", nullable: true),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: true),
                    UserID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__RefreshT__F5845E59CBB4AB2D", x => x.RefreshTokenID);
                    table.ForeignKey(
                        name: "FK__RefreshTo__UserI__3BFFE745",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Report",
                columns: table => new
                {
                    ReportID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReportCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageURL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsTrainned = table.Column<bool>(type: "bit", nullable: true),
                    AnswererID = table.Column<int>(type: "int", nullable: true),
                    QuesttionerID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Report__22783GHYRT5", x => x.ReportID);
                    table.ForeignKey(
                        name: "FK_Report_Answerer__35227C52",
                        column: x => x.AnswererID,
                        principalTable: "User",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_Report_Questioner__3231267C52",
                        column: x => x.QuesttionerID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "UserFarm",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false),
                    FarmID = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: true),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserFarm__995F77051197DAC5", x => new { x.UserID, x.FarmID });
                    table.ForeignKey(
                        name: "FK__UserFarm__FarmID__41B8C09B",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__UserFarm__UserID__42ACE4D4",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "UserFarm_Role_FK",
                        column: x => x.RoleId,
                        principalTable: "Role",
                        principalColumn: "RoleID");
                });

            migrationBuilder.CreateTable(
                name: "Plant",
                columns: table => new
                {
                    PlantID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlantCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PlantName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PlantIndex = table.Column<int>(type: "int", nullable: true),
                    HealthStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    PlantingDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    PlantReferenceID = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    MasterTypeID = table.Column<int>(type: "int", nullable: true),
                    ImageURL = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    IsPassed = table.Column<bool>(type: "bit", nullable: true),
                    IsDead = table.Column<bool>(type: "bit", nullable: true),
                    PassedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LandRowID = table.Column<int>(type: "int", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    GrowthStageID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Plant__98FE46BC7EA4DAD0", x => x.PlantID);
                    table.ForeignKey(
                        name: "FK_Plant_Plant_PlantReferenceID",
                        column: x => x.PlantReferenceID,
                        principalTable: "Plant",
                        principalColumn: "PlantID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "Plant_GrowthStage_FK",
                        column: x => x.GrowthStageID,
                        principalTable: "GrowthStage",
                        principalColumn: "GrowthStageID");
                    table.ForeignKey(
                        name: "Plant_LandRow_FK",
                        column: x => x.LandRowID,
                        principalTable: "LandRow",
                        principalColumn: "LandRowID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "Plant_MasterType_FK",
                        column: x => x.MasterTypeID,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SubProcess",
                columns: table => new
                {
                    SubProcessID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubProcessCode = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    SubProcessName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentSubProcessID = table.Column<int>(type: "int", nullable: true),
                    isDefault = table.Column<bool>(type: "bit", nullable: true),
                    isActive = table.Column<bool>(type: "bit", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    isDeleted = table.Column<bool>(type: "bit", nullable: true),
                    ProcessID = table.Column<int>(type: "int", nullable: true),
                    MasterTypeID = table.Column<int>(type: "int", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__SubProce__F054A88CD66E5A59", x => x.SubProcessID);
                    table.ForeignKey(
                        name: "FK__SubProces__Proce__3CF40B7E",
                        column: x => x.ProcessID,
                        principalTable: "Process",
                        principalColumn: "ProcessID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "SubProcess_MasterType_FK",
                        column: x => x.MasterTypeID,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "SubProcess_SubProcess_FK_23AG53345",
                        column: x => x.ParentSubProcessID,
                        principalTable: "SubProcess",
                        principalColumn: "SubProcessID");
                });

            migrationBuilder.CreateTable(
                name: "ChatMessage",
                columns: table => new
                {
                    MessageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessageCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    MessageContent = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    SenderID = table.Column<int>(type: "int", nullable: true),
                    IsUser = table.Column<bool>(type: "bit", nullable: true),
                    MessageType = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    RoomID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ChatMess__C87C037C2C4F831C", x => x.MessageID);
                    table.ForeignKey(
                        name: "FK__ChatMessa__RoomI__16CE6296",
                        column: x => x.RoomID,
                        principalTable: "ChatRoom",
                        principalColumn: "RoomID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GraftedPlant",
                columns: table => new
                {
                    GraftedPlantID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GraftedPlantCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    GraftedPlantName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    SeparatedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    GraftedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    MotherPlantID = table.Column<int>(type: "int", nullable: true),
                    PlantLotID = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    FinishedPlantCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GraftedP__883CF82ACBB74009", x => x.GraftedPlantID);
                    table.ForeignKey(
                        name: "FK__GraftedPl__Plant__531856C7",
                        column: x => x.MotherPlantID,
                        principalTable: "Plant",
                        principalColumn: "PlantID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "GraftedPlant_PlantLot_FK",
                        column: x => x.PlantLotID,
                        principalTable: "PlantLot",
                        principalColumn: "PlantLotID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlantGrowthHistory",
                columns: table => new
                {
                    PlantGrowthHistoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlantGrowthHistoryCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    NoteTaker = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    PlantID = table.Column<int>(type: "int", nullable: true),
                    IssueName = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PlantGro__8F26DC48C9286D17", x => x.PlantGrowthHistoryID);
                    table.ForeignKey(
                        name: "FK__PlantNote__Plant__32AB8735",
                        column: x => x.PlantID,
                        principalTable: "Plant",
                        principalColumn: "PlantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductHarvestHistory",
                columns: table => new
                {
                    ProductHarvestHistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HarvestHistoryID = table.Column<int>(type: "int", nullable: false),
                    MasterTypeID = table.Column<int>(type: "int", nullable: false),
                    PlantID = table.Column<int>(type: "int", nullable: true),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SellPrice = table.Column<double>(type: "float", nullable: true),
                    CostPrice = table.Column<double>(type: "float", nullable: true),
                    QuantityNeed = table.Column<int>(type: "int", nullable: true),
                    ActualQuantity = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__HarvestT__CAE5744A780B99C5", x => x.ProductHarvestHistoryId);
                    table.ForeignKey(
                        name: "FK_ProductHarvestHistory_Plant",
                        column: x => x.PlantID,
                        principalTable: "Plant",
                        principalColumn: "PlantID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__HarvestTy__Harve__40058253",
                        column: x => x.HarvestHistoryID,
                        principalTable: "HarvestHistory",
                        principalColumn: "HarvestHistoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "ProductHarvestHistory_MasterType_FK",
                        column: x => x.MasterTypeID,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Plan",
                columns: table => new
                {
                    PlanID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PlanCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    isActive = table.Column<bool>(type: "bit", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PlanDetail = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    ResponsibleBy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Frequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    PlanName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignorID = table.Column<int>(type: "int", nullable: true),
                    PesticideName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    MaxVolume = table.Column<double>(type: "float", nullable: true),
                    MinVolume = table.Column<double>(type: "float", nullable: true),
                    ProcessID = table.Column<int>(type: "int", nullable: true),
                    SubProcessId = table.Column<int>(type: "int", nullable: true),
                    CropID = table.Column<int>(type: "int", nullable: true),
                    IsDelete = table.Column<bool>(type: "bit", nullable: true),
                    MasterTypeID = table.Column<int>(type: "int", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Plan__755C22D7C27C8EF5", x => x.PlanID);
                    table.ForeignKey(
                        name: "FK_Plan_Crop35612",
                        column: x => x.CropID,
                        principalTable: "Crop",
                        principalColumn: "CropID");
                    table.ForeignKey(
                        name: "FK_Plan_Farm",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID");
                    table.ForeignKey(
                        name: "FK_Plan_Plan",
                        column: x => x.AssignorID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Plan_Process",
                        column: x => x.ProcessID,
                        principalTable: "Process",
                        principalColumn: "ProcessID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Plan_SubProcess",
                        column: x => x.SubProcessId,
                        principalTable: "SubProcess",
                        principalColumn: "SubProcessID");
                    table.ForeignKey(
                        name: "Plan_MasterType_FK",
                        column: x => x.MasterTypeID,
                        principalTable: "MasterType",
                        principalColumn: "MasterTypeID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CriteriaTarget",
                columns: table => new
                {
                    CriteriaTargetID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    isChecked = table.Column<bool>(type: "bit", nullable: true),
                    IsPassed = table.Column<bool>(type: "bit", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Priority = table.Column<int>(type: "int", nullable: true),
                    PlantID = table.Column<int>(type: "int", nullable: true),
                    CriteriaID = table.Column<int>(type: "int", nullable: true),
                    GraftedPlantID = table.Column<int>(type: "int", nullable: true),
                    PlantLotID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CriteriaTarget__24324GHYRT5", x => x.CriteriaTargetID);
                    table.ForeignKey(
                        name: "FK_CriteriaTarget_Criteria__345267C52",
                        column: x => x.CriteriaID,
                        principalTable: "Criteria",
                        principalColumn: "CriteriaID");
                    table.ForeignKey(
                        name: "FK_CriteriaTarget_GraftedPlant__345234C52",
                        column: x => x.GraftedPlantID,
                        principalTable: "GraftedPlant",
                        principalColumn: "GraftedPlantID");
                    table.ForeignKey(
                        name: "FK_CriteriaTarget_PlantLot__345267C52",
                        column: x => x.PlantLotID,
                        principalTable: "PlantLot",
                        principalColumn: "PlantLotID");
                    table.ForeignKey(
                        name: "FK_CriteriaTarget_Plant__345245C52",
                        column: x => x.PlantID,
                        principalTable: "Plant",
                        principalColumn: "PlantID");
                });

            migrationBuilder.CreateTable(
                name: "GraftedPlantNote",
                columns: table => new
                {
                    GraftedPlantNoteID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GraftedPlantNoteCode = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    IssueName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    NoteTaker = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    GraftedPlantID = table.Column<int>(type: "int", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GraftedP__09DC047162079786", x => x.GraftedPlantNoteID);
                    table.ForeignKey(
                        name: "FK_GraftedPlantNote_GraftedPlant",
                        column: x => x.GraftedPlantID,
                        principalTable: "GraftedPlant",
                        principalColumn: "GraftedPlantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CarePlanSchedule",
                columns: table => new
                {
                    ScheduleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DayOfWeek = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    DayOfMonth = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomDates = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    CarePlanID = table.Column<int>(type: "int", nullable: true),
                    FarmID = table.Column<int>(type: "int", nullable: true),
                    HarvestHistoryID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CarePlan__9C8A5B694338D9F1", x => x.ScheduleID);
                    table.ForeignKey(
                        name: "FK_CarePlanSchedule_Farm",
                        column: x => x.FarmID,
                        principalTable: "Farm",
                        principalColumn: "FarmID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CarePlanSchedule_HarvestHistory",
                        column: x => x.HarvestHistoryID,
                        principalTable: "HarvestHistory",
                        principalColumn: "HarvestHistoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__CarePlanS__CareP__2180FB33",
                        column: x => x.CarePlanID,
                        principalTable: "Plan",
                        principalColumn: "PlanID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GrowthStagePlan",
                columns: table => new
                {
                    GrowthStagePlanID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GrowthStageID = table.Column<int>(type: "int", nullable: true),
                    PlanID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GrowthStagePlan__26743GHYRT5", x => x.GrowthStagePlanID);
                    table.ForeignKey(
                        name: "FK_GrowthStagePlan_GrowthStage__35672C52",
                        column: x => x.GrowthStageID,
                        principalTable: "GrowthStage",
                        principalColumn: "GrowthStageID");
                    table.ForeignKey(
                        name: "FK_GrowthStagePlan_Plan__32314C52",
                        column: x => x.PlanID,
                        principalTable: "Plan",
                        principalColumn: "PlanID");
                });

            migrationBuilder.CreateTable(
                name: "PlanNotification",
                columns: table => new
                {
                    PlanNotificationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanID = table.Column<int>(type: "int", nullable: true),
                    NotificationID = table.Column<int>(type: "int", nullable: true),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    isRead = table.Column<bool>(type: "bit", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PlanNotification__2EE54234ADBB5", x => x.PlanNotificationID);
                    table.ForeignKey(
                        name: "FK__PlanNotification__Notification__3B451819",
                        column: x => x.NotificationID,
                        principalTable: "Notification",
                        principalColumn: "NotificationID");
                    table.ForeignKey(
                        name: "FK__PlanNotification__Plan__32673C52",
                        column: x => x.PlanID,
                        principalTable: "Plan",
                        principalColumn: "PlanID");
                    table.ForeignKey(
                        name: "FK__PlanNotification__User__38H51819",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "PlanTarget",
                columns: table => new
                {
                    PlanTargetID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanID = table.Column<int>(type: "int", nullable: true),
                    LandRowID = table.Column<int>(type: "int", nullable: true),
                    LandPlotID = table.Column<int>(type: "int", nullable: true),
                    GraftedPlantID = table.Column<int>(type: "int", nullable: true),
                    PlantLotID = table.Column<int>(type: "int", nullable: true),
                    PlantID = table.Column<int>(type: "int", nullable: true),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PlanTarget__2456GHYRT5", x => x.PlanTargetID);
                    table.ForeignKey(
                        name: "FK_PlanTarget_GraftedPlant_3B445629",
                        column: x => x.GraftedPlantID,
                        principalTable: "GraftedPlant",
                        principalColumn: "GraftedPlantID");
                    table.ForeignKey(
                        name: "FK_PlanTarget_Plan__345619C52",
                        column: x => x.PlanID,
                        principalTable: "Plan",
                        principalColumn: "PlanID");
                    table.ForeignKey(
                        name: "FK__PlanTarget_LandPlot__39KH52829",
                        column: x => x.LandPlotID,
                        principalTable: "LandPlot",
                        principalColumn: "LandPlotID");
                    table.ForeignKey(
                        name: "FK__PlanTarget_LandRow__3256JH9",
                        column: x => x.LandRowID,
                        principalTable: "LandRow",
                        principalColumn: "LandRowID");
                    table.ForeignKey(
                        name: "FK__PlanTarget_PlantLot__4056AE34",
                        column: x => x.PlantLotID,
                        principalTable: "PlantLot",
                        principalColumn: "PlantLotID");
                    table.ForeignKey(
                        name: "FK__PlanTarget_Plant__352ET4678",
                        column: x => x.PlantID,
                        principalTable: "Plant",
                        principalColumn: "PlantID");
                });

            migrationBuilder.CreateTable(
                name: "WorkLog",
                columns: table => new
                {
                    WorkLogID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkLogCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    WorkLogName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReasonDelay = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Date = table.Column<DateTime>(type: "datetime", nullable: true),
                    ActualStartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    ActualEndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    IsConfirm = table.Column<bool>(type: "bit", nullable: true),
                    ScheduleID = table.Column<int>(type: "int", nullable: true),
                    WarningID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__WorkLog__FE542DC2BB0A0EA4", x => x.WorkLogID);
                    table.ForeignKey(
                        name: "FK__WorkLog__Schedul__236943A5",
                        column: x => x.ScheduleID,
                        principalTable: "CarePlanSchedule",
                        principalColumn: "ScheduleID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "WorkLog_Warning_FK",
                        column: x => x.WarningID,
                        principalTable: "Warning",
                        principalColumn: "WarningID");
                });

            migrationBuilder.CreateTable(
                name: "TaskFeedback",
                columns: table => new
                {
                    TaskFeedbackID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskFeedbackCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    WorkLogID = table.Column<int>(type: "int", nullable: true),
                    ManagerID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__TaskFeed__9CC94E1953C81F4C", x => x.TaskFeedbackID);
                    table.ForeignKey(
                        name: "FK__TaskFeedb__Manag__3EDC53F0",
                        column: x => x.ManagerID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__TaskFeedb__WorkL__339FAB6E",
                        column: x => x.WorkLogID,
                        principalTable: "WorkLog",
                        principalColumn: "WorkLogID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserWorkLog",
                columns: table => new
                {
                    UserWorkLogID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkLogID = table.Column<int>(type: "int", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Issue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsReporter = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserWork__2F2CA1082A09A834", x => x.UserWorkLogID);
                    table.ForeignKey(
                        name: "FK__UserWorkL__UserI__43A1090D",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__UserWorkL__WorkL__25518C17",
                        column: x => x.WorkLogID,
                        principalTable: "WorkLog",
                        principalColumn: "WorkLogID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Resource",
                columns: table => new
                {
                    ResourceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResourceCode = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    ResourceType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    ResourceURL = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FileFormat = table.Column<string>(type: "nvarchar(max)", nullable: true, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    CreateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UserWorkLogID = table.Column<int>(type: "int", nullable: true),
                    LegalDocumentID = table.Column<int>(type: "int", nullable: true),
                    GraftedPlantNoteID = table.Column<int>(type: "int", nullable: true),
                    PlantGrowthHistoryID = table.Column<int>(type: "int", nullable: true),
                    UserID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Res__1974A137217179D1", x => x.ResourceID);
                    table.ForeignKey(
                        name: "FK_Resource_GraftedPlantNote",
                        column: x => x.GraftedPlantNoteID,
                        principalTable: "GraftedPlantNote",
                        principalColumn: "GraftedPlantNoteID");
                    table.ForeignKey(
                        name: "FK_Resource_LegalDocument",
                        column: x => x.LegalDocumentID,
                        principalTable: "LegalDocument",
                        principalColumn: "LegalDocumentID");
                    table.ForeignKey(
                        name: "FK_Resource_PlantGrowthHistory",
                        column: x => x.PlantGrowthHistoryID,
                        principalTable: "PlantGrowthHistory",
                        principalColumn: "PlantGrowthHistoryID");
                    table.ForeignKey(
                        name: "FK_Resource_WorkLog",
                        column: x => x.UserWorkLogID,
                        principalTable: "UserWorkLog",
                        principalColumn: "UserWorkLogID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CarePlanSchedule_CarePlanID",
                table: "CarePlanSchedule",
                column: "CarePlanID",
                unique: true,
                filter: "[CarePlanID] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CarePlanSchedule_FarmID",
                table: "CarePlanSchedule",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_CarePlanSchedule_HarvestHistoryID",
                table: "CarePlanSchedule",
                column: "HarvestHistoryID");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_RoomID",
                table: "ChatMessage",
                column: "RoomID");

            migrationBuilder.CreateIndex(
                name: "IX_ChatRoom_CreateBy",
                table: "ChatRoom",
                column: "CreateBy");

            migrationBuilder.CreateIndex(
                name: "IX_Criteria_MasterTypeID",
                table: "Criteria",
                column: "MasterTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaTarget_CriteriaID",
                table: "CriteriaTarget",
                column: "CriteriaID");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaTarget_GraftedPlantID",
                table: "CriteriaTarget",
                column: "GraftedPlantID");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaTarget_PlantID",
                table: "CriteriaTarget",
                column: "PlantID");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaTarget_PlantLotID",
                table: "CriteriaTarget",
                column: "PlantLotID");

            migrationBuilder.CreateIndex(
                name: "IX_Crop_FarmID",
                table: "Crop",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_GraftedPlant_MotherPlantID",
                table: "GraftedPlant",
                column: "MotherPlantID");

            migrationBuilder.CreateIndex(
                name: "IX_GraftedPlant_PlantLotID",
                table: "GraftedPlant",
                column: "PlantLotID");

            migrationBuilder.CreateIndex(
                name: "IX_GraftedPlantNote_GraftedPlantID",
                table: "GraftedPlantNote",
                column: "GraftedPlantID");

            migrationBuilder.CreateIndex(
                name: "IX_GrowthStage_FarmID",
                table: "GrowthStage",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_GrowthStageMasterType_FarmID",
                table: "GrowthStageMasterType",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_GrowthStageMasterType_GrowthStageID",
                table: "GrowthStageMasterType",
                column: "GrowthStageID");

            migrationBuilder.CreateIndex(
                name: "IX_GrowthStageMasterType_MasterTypeID",
                table: "GrowthStageMasterType",
                column: "MasterTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_GrowthStagePlan_GrowthStageID",
                table: "GrowthStagePlan",
                column: "GrowthStageID");

            migrationBuilder.CreateIndex(
                name: "IX_GrowthStagePlan_PlanID",
                table: "GrowthStagePlan",
                column: "PlanID");

            migrationBuilder.CreateIndex(
                name: "IX_HarvestHistory_CropID",
                table: "HarvestHistory",
                column: "CropID");

            migrationBuilder.CreateIndex(
                name: "IX_LandPlot_FarmID",
                table: "LandPlot",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_LandPlotCoordination_LandPlotID",
                table: "LandPlotCoordination",
                column: "LandPlotID");

            migrationBuilder.CreateIndex(
                name: "IX_LandPlotCrop_CropID",
                table: "LandPlotCrop",
                column: "CropID");

            migrationBuilder.CreateIndex(
                name: "IX_LandRow_LandPlotID",
                table: "LandRow",
                column: "LandPlotID");

            migrationBuilder.CreateIndex(
                name: "IX_LegalDocument_FarmID",
                table: "LegalDocument",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_MasterType_FarmID",
                table: "MasterType",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_MasterTypeID",
                table: "Notification",
                column: "MasterTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_SenderID",
                table: "Notification",
                column: "SenderID");

            migrationBuilder.CreateIndex(
                name: "IX_Order_FarmID",
                table: "Order",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_Order_PackageID",
                table: "Order",
                column: "PackageID");

            migrationBuilder.CreateIndex(
                name: "IX_PackageDetail_PackageID",
                table: "PackageDetail",
                column: "PackageID");

            migrationBuilder.CreateIndex(
                name: "IX_Partner_FarmID",
                table: "Partner",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_OrderID",
                table: "Payment",
                column: "OrderID",
                unique: true,
                filter: "[OrderID] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Plan_AssignorID",
                table: "Plan",
                column: "AssignorID");

            migrationBuilder.CreateIndex(
                name: "IX_Plan_CropID",
                table: "Plan",
                column: "CropID");

            migrationBuilder.CreateIndex(
                name: "IX_Plan_FarmID",
                table: "Plan",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_Plan_MasterTypeID",
                table: "Plan",
                column: "MasterTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Plan_ProcessID",
                table: "Plan",
                column: "ProcessID");

            migrationBuilder.CreateIndex(
                name: "IX_Plan_SubProcessId",
                table: "Plan",
                column: "SubProcessId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanNotification_NotificationID",
                table: "PlanNotification",
                column: "NotificationID");

            migrationBuilder.CreateIndex(
                name: "IX_PlanNotification_PlanID",
                table: "PlanNotification",
                column: "PlanID");

            migrationBuilder.CreateIndex(
                name: "IX_PlanNotification_UserID",
                table: "PlanNotification",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Plant_GrowthStageID",
                table: "Plant",
                column: "GrowthStageID");

            migrationBuilder.CreateIndex(
                name: "IX_Plant_LandRowID",
                table: "Plant",
                column: "LandRowID");

            migrationBuilder.CreateIndex(
                name: "IX_Plant_MasterTypeID",
                table: "Plant",
                column: "MasterTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Plant_PlantReferenceID",
                table: "Plant",
                column: "PlantReferenceID");

            migrationBuilder.CreateIndex(
                name: "IX_PlanTarget_GraftedPlantID",
                table: "PlanTarget",
                column: "GraftedPlantID");

            migrationBuilder.CreateIndex(
                name: "IX_PlanTarget_LandPlotID",
                table: "PlanTarget",
                column: "LandPlotID");

            migrationBuilder.CreateIndex(
                name: "IX_PlanTarget_LandRowID",
                table: "PlanTarget",
                column: "LandRowID");

            migrationBuilder.CreateIndex(
                name: "IX_PlanTarget_PlanID",
                table: "PlanTarget",
                column: "PlanID");

            migrationBuilder.CreateIndex(
                name: "IX_PlanTarget_PlantID",
                table: "PlanTarget",
                column: "PlantID");

            migrationBuilder.CreateIndex(
                name: "IX_PlanTarget_PlantLotID",
                table: "PlanTarget",
                column: "PlantLotID");

            migrationBuilder.CreateIndex(
                name: "IX_PlantGrowthHistory_PlantID",
                table: "PlantGrowthHistory",
                column: "PlantID");

            migrationBuilder.CreateIndex(
                name: "IX_PlantLot_FarmID",
                table: "PlantLot",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_PlantLot_MasterTypeId",
                table: "PlantLot",
                column: "MasterTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_PlantLot_PartnerID",
                table: "PlantLot",
                column: "PartnerID");

            migrationBuilder.CreateIndex(
                name: "IX_PlantLot_PlantLotReferenceID",
                table: "PlantLot",
                column: "PlantLotReferenceID");

            migrationBuilder.CreateIndex(
                name: "IX_Process_FarmID",
                table: "Process",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_Process_GrowthStageID",
                table: "Process",
                column: "GrowthStageID");

            migrationBuilder.CreateIndex(
                name: "IX_Process_MasterTypeID",
                table: "Process",
                column: "MasterTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHarvestHistory_HarvestHistoryID",
                table: "ProductHarvestHistory",
                column: "HarvestHistoryID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHarvestHistory_MasterTypeID",
                table: "ProductHarvestHistory",
                column: "MasterTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHarvestHistory_PlantID",
                table: "ProductHarvestHistory",
                column: "PlantID");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UserID",
                table: "RefreshToken",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Report_AnswererID",
                table: "Report",
                column: "AnswererID");

            migrationBuilder.CreateIndex(
                name: "IX_Report_QuesttionerID",
                table: "Report",
                column: "QuesttionerID");

            migrationBuilder.CreateIndex(
                name: "IX_Resource_GraftedPlantNoteID",
                table: "Resource",
                column: "GraftedPlantNoteID");

            migrationBuilder.CreateIndex(
                name: "IX_Resource_LegalDocumentID",
                table: "Resource",
                column: "LegalDocumentID");

            migrationBuilder.CreateIndex(
                name: "IX_Resource_PlantGrowthHistoryID",
                table: "Resource",
                column: "PlantGrowthHistoryID");

            migrationBuilder.CreateIndex(
                name: "IX_Resource_UserWorkLogID",
                table: "Resource",
                column: "UserWorkLogID");

            migrationBuilder.CreateIndex(
                name: "IX_SubProcess_MasterTypeID",
                table: "SubProcess",
                column: "MasterTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_SubProcess_ParentSubProcessID",
                table: "SubProcess",
                column: "ParentSubProcessID");

            migrationBuilder.CreateIndex(
                name: "IX_SubProcess_ProcessID",
                table: "SubProcess",
                column: "ProcessID");

            migrationBuilder.CreateIndex(
                name: "IX_TaskFeedback_ManagerID",
                table: "TaskFeedback",
                column: "ManagerID");

            migrationBuilder.CreateIndex(
                name: "IX_TaskFeedback_WorkLogID",
                table: "TaskFeedback",
                column: "WorkLogID");

            migrationBuilder.CreateIndex(
                name: "IX_Type_Type_MasterTypeId",
                table: "Type_Type",
                column: "MasterTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Type_Type_MasterTypeID_2",
                table: "Type_Type",
                column: "MasterTypeID_2");

            migrationBuilder.CreateIndex(
                name: "IX_Type_Type_MasterTypeId1",
                table: "Type_Type",
                column: "MasterTypeId1");

            migrationBuilder.CreateIndex(
                name: "IX_User_RoleID",
                table: "User",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserFarm_FarmID",
                table: "UserFarm",
                column: "FarmID");

            migrationBuilder.CreateIndex(
                name: "IX_UserFarm_RoleId",
                table: "UserFarm",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkLog_UserID",
                table: "UserWorkLog",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkLog_WorkLogID",
                table: "UserWorkLog",
                column: "WorkLogID");

            migrationBuilder.CreateIndex(
                name: "IX_WorkLog_ScheduleID",
                table: "WorkLog",
                column: "ScheduleID");

            migrationBuilder.CreateIndex(
                name: "IX_WorkLog_WarningID",
                table: "WorkLog",
                column: "WarningID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessage");

            migrationBuilder.DropTable(
                name: "CriteriaTarget");

            migrationBuilder.DropTable(
                name: "GrowthStageMasterType");

            migrationBuilder.DropTable(
                name: "GrowthStagePlan");

            migrationBuilder.DropTable(
                name: "LandPlotCoordination");

            migrationBuilder.DropTable(
                name: "LandPlotCrop");

            migrationBuilder.DropTable(
                name: "PackageDetail");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "PlanNotification");

            migrationBuilder.DropTable(
                name: "PlanTarget");

            migrationBuilder.DropTable(
                name: "ProductHarvestHistory");

            migrationBuilder.DropTable(
                name: "RefreshToken");

            migrationBuilder.DropTable(
                name: "Report");

            migrationBuilder.DropTable(
                name: "Resource");

            migrationBuilder.DropTable(
                name: "TaskFeedback");

            migrationBuilder.DropTable(
                name: "Type_Type");

            migrationBuilder.DropTable(
                name: "UserFarm");

            migrationBuilder.DropTable(
                name: "ChatRoom");

            migrationBuilder.DropTable(
                name: "Criteria");

            migrationBuilder.DropTable(
                name: "Order");

            migrationBuilder.DropTable(
                name: "Notification");

            migrationBuilder.DropTable(
                name: "GraftedPlantNote");

            migrationBuilder.DropTable(
                name: "LegalDocument");

            migrationBuilder.DropTable(
                name: "PlantGrowthHistory");

            migrationBuilder.DropTable(
                name: "UserWorkLog");

            migrationBuilder.DropTable(
                name: "Package");

            migrationBuilder.DropTable(
                name: "GraftedPlant");

            migrationBuilder.DropTable(
                name: "WorkLog");

            migrationBuilder.DropTable(
                name: "Plant");

            migrationBuilder.DropTable(
                name: "PlantLot");

            migrationBuilder.DropTable(
                name: "CarePlanSchedule");

            migrationBuilder.DropTable(
                name: "Warning");

            migrationBuilder.DropTable(
                name: "LandRow");

            migrationBuilder.DropTable(
                name: "Partner");

            migrationBuilder.DropTable(
                name: "HarvestHistory");

            migrationBuilder.DropTable(
                name: "Plan");

            migrationBuilder.DropTable(
                name: "LandPlot");

            migrationBuilder.DropTable(
                name: "Crop");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "SubProcess");

            migrationBuilder.DropTable(
                name: "Role");

            migrationBuilder.DropTable(
                name: "Process");

            migrationBuilder.DropTable(
                name: "GrowthStage");

            migrationBuilder.DropTable(
                name: "MasterType");

            migrationBuilder.DropTable(
                name: "Farm");
        }
    }
}
