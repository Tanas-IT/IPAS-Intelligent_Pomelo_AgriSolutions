using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
using Process = CapstoneProject_SP25_IPAS_BussinessObject.Entities.Process;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.SubProcessModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeDetail;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.TaskFeedbackModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PackageModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.GraftedModel;

namespace CapstoneProject_SP25_IPAS_Service.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Role, RoleModel>()
                .ReverseMap();
            CreateMap<User, UserModel>()
                 .ForMember(dest => dest.RoleName, opt => opt.MapFrom(x => x.Role!.RoleName))
                .ReverseMap();

            CreateMap<PlantLot, PlantLotModel>()
                .ForMember(dest => dest.PartnerName, opt => opt.MapFrom(x => x.Partner!.PartnerName))
               .ReverseMap();


            CreateMap<Farm, FarmModel>()
            //.ForMember(dest => dest.FarmCoordinations, opt => opt.MapFrom(src => src.FarmCoordinations))
            .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.UserFarms.FirstOrDefault(x => x.RoleId == (int)RoleEnum.OWNER)!.User))
            //.ForMember(dest => dest.Orders, opt => opt.MapFrom(src => src.Orders))
            //.ForMember(dest => dest.Processes, opt => opt.MapFrom(src => src.Processes))
            //.ForMember(dest => dest.UserFarms, opt => opt.MapFrom(src => src.UserFarms))
            .ReverseMap();
            //CreateMap<FarmCoordination, FarmCoordinationModel>();

            CreateMap<LandPlot, LandPlotModel>()
                .ForMember(dest => dest.LandPlotCoordinations, opt => opt.MapFrom(src => src.LandPlotCoordinations))
                .ForMember(dest => dest.FarmLongtitude, opt => opt.MapFrom(src => src.Farm.Longitude))
                .ForMember(dest => dest.FarmLatitude, opt => opt.MapFrom(src => src.Farm.Latitude))
                //.ForMember(dest => dest.LandPlotCrops, opt => opt.MapFrom(src => src.LandPlotCrops))
                .ReverseMap();

            CreateMap<UserFarm, UserFarmModel>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Farm, opt => opt.MapFrom(src => src.Farm))
                .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
                //.ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.Role!.RoleId))
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role!.RoleName))
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ReverseMap();


            CreateMap<Partner, PartnerModel>()
               .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role!.RoleName)).ReverseMap();

            CreateMap<GrowthStage, GrowthStageModel>()
                .ForMember(dest => dest.FarmName, opt => opt.MapFrom(x => x.Farm != null ? x.Farm.FarmName : ""))
                .ForMember(dest => dest.FarmId, opt => opt.MapFrom(x => x.Farm != null ? x.Farm.FarmId : 0))
                .ReverseMap();

            CreateMap<GrowthStage, GetForSelectGrowthStage>()
               .ForMember(dest => dest.GrowthStageName, opt => opt.MapFrom(x => x.GrowthStageName))
               .ForMember(dest => dest.GrowthStageID, opt => opt.MapFrom(x => x.GrowthStageID))
               .ReverseMap();

            CreateMap<Plan, UpdatePlanInProcessModel>()
               .ForMember(dest => dest.MasterTypeId, opt => opt.MapFrom(x => x.MasterTypeId))
               .ForMember(dest => dest.GrowthStageId, opt => opt.MapFrom(x => x.GrowthStageId))
               .ForMember(dest => dest.PlanName, opt => opt.MapFrom(x => x.PlanName))
               .ForMember(dest => dest.PlanNote, opt => opt.MapFrom(x => x.Notes))
               .ForMember(dest => dest.PlanDetail, opt => opt.MapFrom(x => x.PlanDetail))
               .ForMember(dest => dest.PlanId, opt => opt.MapFrom(x => x.PlanId))
              .ReverseMap();

            CreateMap<SubProcess, SubProcessInProcessModel>()
                 .ForMember(dest => dest.ListPlan, opt => opt.MapFrom(x => x.Plans))
                .ReverseMap();

            CreateMap<GrowthStage, ProcessGrowthStageModel>()
                .ForMember(dest => dest.GrowthStageId, opt => opt.MapFrom(src => src.GrowthStageID))
                .ForMember(dest => dest.GrowthStageName, opt => opt.MapFrom(src => src.GrowthStageName))
                .ReverseMap();

            CreateMap<MasterType, ProcessMasterTypeModel>()
               .ForMember(dest => dest.MasterTypeId, opt => opt.MapFrom(src => src.MasterTypeId))
               .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterTypeName))
               .ReverseMap();


            CreateMap<Process, ProcessModel>()
                 .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
                 .ForMember(dest => dest.ProcessMasterTypeModel, opt => opt.MapFrom(src => src.MasterType))
                 .ForMember(dest => dest.ProcessGrowthStageModel, opt => opt.MapFrom(src => src.GrowthStage))
                 .ForMember(dest => dest.ListPlan, opt => opt.MapFrom(src => src.Plans))
                 .ForMember(dest => dest.SubProcesses, opt => opt.MapFrom(src => src.SubProcesses.Where(x => x.ProcessId == src.ProcessId)))
                .ReverseMap();

            CreateMap<SubProcess, SubProcessModel>()
                .ForMember(dest => dest.ProcessName, opt => opt.MapFrom(src => src.Process!.ProcessName))
                .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType!.MasterTypeName))
                .ForMember(dest => dest.listChildSubProcess, opt => opt.MapFrom(src => src.ChildSubProcesses))
               .ReverseMap();

            CreateMap<LandPlotCoordination, LandPlotCoordinationModel>().ReverseMap();

            CreateMap<Criteria, CriteriaModel>()
                .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType.MasterTypeName))
                .ReverseMap();


            //CreateMap<MasterTypeDetail, MasterTypeDetailModel>().ReverseMap();
            CreateMap<MasterType, MasterTypeModel>()
                .ForMember(dest => dest.CriteriaModels, opt => opt.MapFrom(src => src.Criterias))
                .ReverseMap();
           

            CreateMap<LandRow, LandRowModel>()
                //.ForMember(dest => dest.Plants, opt => opt.MapFrom(src => src.Plants))
                .ForMember(dest => dest.LandPlotname, opt => opt.MapFrom(src => src.LandPlot.LandPlotName))
                .ReverseMap();

            CreateMap<Plant, PlantModel>()
                .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType!.MasterTypeName))
                .ForMember(dest => dest.RowIndex, opt => opt.MapFrom(src => src.LandRow!.RowIndex))
                .ForMember(dest => dest.LandPlotName, opt => opt.MapFrom(src => src.LandRow!.LandPlot!.LandPlotName));
                //.ForMember(dest => dest.Plans, opt => opt.MapFrom(src => src.Plans))
                //.ForMember(dest => dest.CriteriaSummary, opt => opt.MapFrom(src =>
                //    src.PlantCriterias.GroupBy(pc => pc.Criteria.MasterType)
                //    .Select(g => new
                //    {
                //        CriteriaType = g.Key!.MasterTypeName,
                //        CheckedCount = g.Count(pc => pc.IsChecked == true),
                //        TotalCount = g.Count()
                //    })
                //    .ToList())
                //);

            //CreateMap<PlantCriteria, PlantCriteriaModel>()
            //    .ForMember(dest => dest.CriteriaName, opt => opt.MapFrom(src => src.Criteria.CriteriaName))
            //    .ReverseMap();

           
            

            CreateMap<PlantGrowthHistory, PlantGrowthHistoryModel>()
                .ForMember(dest => dest.PlantResources, opt => opt.MapFrom(src => src.Resources))
                .ForMember(dest => dest.NumberImage, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat == FileFormatConst.IMAGE)))
                .ForMember(dest => dest.NumberVideos, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat == FileFormatConst.VIDEO)))
                .ReverseMap();

            CreateMap<Resource, ResourceModel>()
               .ReverseMap();

            CreateMap<User, ReporterModel>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.AvatarURL))
                .ReverseMap();

            CreateMap<WorkLog, WorkLogInPlanModel>()
                .ForMember(dest => dest.WorkLogID, opt => opt.MapFrom(src => src.WorkLogId))
                .ForMember(dest => dest.WorkLogName, opt => opt.MapFrom(src => src.WorkLogName))
                .ForMember(dest => dest.DateWork, opt => opt.MapFrom(src => src.Date))
                .ForMember(dest => dest.Reporter, opt => opt.MapFrom(src => src.UserWorkLogs.Where(x => x.IsReporter == true).Select(x => x.User.FullName).FirstOrDefault()))
                .ForMember(dest => dest.AvatarOfReporter, opt => opt.MapFrom(src => src.UserWorkLogs.Where(x => x.IsReporter == true).Select(x => x.User.AvatarURL).FirstOrDefault()))
               .ReverseMap();

            CreateMap<Plan, PlanModel>()
               .ForMember(dest => dest.AssignorName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : ""))
                .ForMember(dest => dest.LandPlotNames, opt => opt.MapFrom(src =>
                                                           src.PlanTargets.Where(pt => pt.LandPlot != null).Select(pt => pt.LandPlot.LandPlotName).Distinct().ToList()))
               .ForMember(dest => dest.PlantLotNames, opt => opt.MapFrom(src =>
                                                            src.PlanTargets.Where(pt => pt.PlantLot != null).Select(pt => pt.PlantLot.PlantLotName).Distinct().ToList()))
                .ForMember(dest => dest.PlantNames, opt => opt.MapFrom(src =>
                                                            src.PlanTargets.Where(pt => pt.Plant != null).Select(pt => pt.Plant.PlantName).Distinct().ToList()))
               .ForMember(dest => dest.ProcessName, opt => opt.MapFrom(src => src.Process != null ? src.Process.ProcessName : ""))
               .ForMember(dest => dest.CropName, opt => opt.MapFrom(src => src.Crop != null ? src.Crop.CropName : ""))
               .ForMember(dest => dest.GrowthStageName, opt => opt.MapFrom(src => src.GrowthStage != null ? src.GrowthStage.GrowthStageName : ""))
               .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType != null ? src.MasterType.MasterTypeName : ""))
               .ForMember(dest => dest.RowIndexs, opt => opt.MapFrom(src => src.PlanTargets.Where(pt => pt.LandRow != null).Select(pt => pt.LandRow.RowIndex).Distinct().ToList()))
               .ForMember(dest => dest.AvatarOfAssignor, opt => opt.MapFrom(src => src.User != null ? src.User.AvatarURL : ""))
               .ForMember(dest => dest.ListReporter, opt => opt.MapFrom(src =>
                                                                 src.CarePlanSchedule != null && src.CarePlanSchedule.WorkLogs != null
                                                                ? src.CarePlanSchedule.WorkLogs
                                                                    .SelectMany(wl => wl.UserWorkLogs)
                                                                    .Where(uwl => uwl.IsReporter == true)
                                                                    .Select(uwl => uwl.User)
                                                                    .Distinct()
                                                                    .ToList() : new List<User>()))
               .ForMember(dest => dest.ListEmployee, opt => opt.MapFrom(src =>
                                                                src.CarePlanSchedule != null && src.CarePlanSchedule.WorkLogs != null
                                                                ? src.CarePlanSchedule.WorkLogs
                                                                    .SelectMany(wl => wl.UserWorkLogs)
                                                                    .Where(uwl => uwl.IsReporter == false)
                                                                    .Select(uwl => uwl.User)
                                                                    .Distinct()
                                                                    .ToList(): new List<User>()))
               .ForMember(dest => dest.StarTime, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.StarTime : null))
               .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.EndTime: null))
               .ForMember(dest => dest.DayOfWeek, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.DayOfWeek : null))
               .ForMember(dest => dest.DayOfMonth, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.DayOfMonth : null))
               .ForMember(dest => dest.CustomDates, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.CustomDates : null))
               .ForMember(dest => dest.ListWorkLog, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.WorkLogs: null))
               .ReverseMap();

            CreateMap<LegalDocument, LegalDocumentModel>()
               .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
               .ForMember(dest => dest.Resources, opt => opt.MapFrom(src => src.Resources))
               .ReverseMap();

            CreateMap<Crop, CropModel>()
               .ForMember(dest => dest.HarvestHistories, opt => opt.MapFrom(src => src.HarvestHistories))
               .ForMember(dest => dest.LandPlotCrops, opt => opt.MapFrom(src => src.LandPlotCrops))
                .ReverseMap();

            CreateMap<LandPlotCrop, LandPlotCropModel>()
               .ForMember(dest => dest.Crop, opt => opt.MapFrom(src => src.Crop))
               .ForMember(dest => dest.LandPlotName, opt => opt.MapFrom(src => src.LandPlot.LandPlotName))
                .ReverseMap();

            CreateMap<TaskFeedback, TaskFeedbackModel>()
              .ForMember(dest => dest.ManagerName, opt => opt.MapFrom(src => src.Manager.FullName))
              .ForMember(dest => dest.WorkLogName, opt => opt.MapFrom(src => src.WorkLog.WorkLogName))
               .ReverseMap();

            CreateMap<HarvestHistory, HarvestHistoryModel>()
               .ForMember(dest => dest.HarvestTypeHistories, opt => opt.MapFrom(src => src.HarvestTypeHistories))
               .ForMember(dest => dest.CropName, opt => opt.MapFrom(src => src.Crop.CropName))
                .ReverseMap();

            CreateMap<HarvestTypeHistory, HarvestTypeHistoryModel>()
               .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.MasterType.TypeName))
               .ForMember(dest => dest.HarvestHistoryCode, opt => opt.MapFrom(src => src.HarvestHistory.HarvestHistoryCode))
                .ReverseMap();

            CreateMap<Order, OrderModel>()
               .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
               .ForMember(dest => dest.Package, opt => opt.MapFrom(src => src.Package))
                .ReverseMap();
            CreateMap<Package, PackageModel>()
               .ForMember(dest => dest.PackageDetails, opt => opt.MapFrom(src => src.PackageDetails))
                .ReverseMap();
            CreateMap<PackageDetail, PackageDetailModel>()
                .ReverseMap();

            CreateMap<LandPlot, ForSelectedModels>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.LandPlotId))
               .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.LandPlotCode))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.LandPlotName))
                .ReverseMap();

            CreateMap<Plan, ForSelectedModels>()
              .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PlanId))
              .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.PlanCode))
              .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.PlanName))
               .ReverseMap();

            CreateMap<GrowthStage, ForSelectedModels>()
             .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.GrowthStageID))
             .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.GrowthStageCode))
             .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.GrowthStageName))
              .ReverseMap();

            CreateMap<GraftedPlantNote, GraftedPlantModels>()
                .ForMember(dest => dest.Resources, opt => opt.MapFrom(src => src.Resources))
                .ForMember(dest => dest.NumberImage, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat == FileFormatConst.IMAGE)))
                .ForMember(dest => dest.NumberVideos, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat == FileFormatConst.VIDEO)))
                .ReverseMap();
        }
    }
}
