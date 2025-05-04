using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Process = CapstoneProject_SP25_IPAS_BussinessObject.Entities.Process;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.GrowthStageModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SubProcessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.OrderModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.GraftedModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.HarvestModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeDetail;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.GrowthStageMasterTypeModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.TaskFeedbackModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GrowthStageRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SystemModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportOfUserModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.CarePlanScheduleModels;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AuthensRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel;

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
                .ForMember(dest => dest.SeedingName, opt => opt.MapFrom(x => x.MasterType!.MasterTypeName))
                .ForMember(dest => dest.AdditionalPlantLots, opt => opt.MapFrom(x => x.InversePlantLotReference))
               .ReverseMap();


            CreateMap<Farm, FarmModel>()
            //.ForMember(dest => dest.FarmCoordinations, opt => opt.MapFrom(src => src.FarmCoordinations))
            .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.UserFarms.FirstOrDefault(x => x.RoleId == (int)RoleEnum.OWNER)!.User))
            .ForMember(dest => dest.FarmExpiredDate, opt => opt.MapFrom(
                            src => src.Orders.Any(x => x.FarmId == src.FarmId && x.Status!.ToUpper().Equals(OrderStatusEnum.Paid.ToString().ToUpper()))
                                   ? src.Orders.Where(x => x.FarmId == src.FarmId && x.Status!.ToUpper().Equals(OrderStatusEnum.Paid.ToString().ToUpper()))
                                               .Max(x => x.ExpiredDate)
                                   : (DateTime?)null // Trả về null nếu không có đơn hàng nào
                            ))
             .ForMember(dest => dest.TotalOrderSuccess, opt => opt.MapFrom(src =>
                src.Orders.Count(x => x.FarmId == src.FarmId && x.Status!.ToUpper().Equals(OrderStatusEnum.Paid.ToString().ToUpper()))
            ))
            .ForMember(dest => dest.TotalPay, opt => opt.MapFrom(src =>
                src.Orders
                    .Where(x => x.FarmId == src.FarmId && x.Status!.ToUpper().Equals(OrderStatusEnum.Paid.ToString().ToUpper()))
                    .Sum(x => (double?)x.TotalPrice) ?? 0
            ))
            //.ForMember(dest => dest.FarmExpiredDate, opt => opt.MapFrom(src => src.Orders.Where(x => x.FarmId == src.FarmId && x.Status.ToUpper().Equals("PAID")).Max(x => x.ExpiredDate )))
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

            CreateMap<EmployeeSkill, SkillResponseModel>()
                 .ForMember(dest => dest.SkillID, opt => opt.MapFrom(src => src.WorkTypeID))
                 .ForMember(dest => dest.SkillName, opt => opt.MapFrom(src => src.WorkType.MasterTypeName))
                .ForMember(dest => dest.ScoreOfSkill, opt => opt.MapFrom(src => src.ScoreOfSkill))
                .ReverseMap();
            CreateMap<UserFarm, UserFarmModel>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Farm, opt => opt.MapFrom(src => src.Farm))
                .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
                //.ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.Role!.RoleId))
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role!.RoleName))
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ForMember(dest => dest.Skills, opt => opt.MapFrom(src => src.EmployeeSkills))
                .ForMember(dest => dest.FarmExpiredDate, opt => opt.MapFrom(src => src.Farm.Orders.Where(x => x.FarmId == src.FarmId).Max(x => x.ExpiredDate)))
                .ReverseMap();


            CreateMap<Partner, PartnerModel>()
               //.ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role!.RoleName))
               .ReverseMap();

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
               .ForMember(dest => dest.PlanName, opt => opt.MapFrom(x => x.PlanName))
               .ForMember(dest => dest.PlanNote, opt => opt.MapFrom(x => x.Notes))
               .ForMember(dest => dest.PlanDetail, opt => opt.MapFrom(x => x.PlanDetail))
               .ForMember(dest => dest.PlanId, opt => opt.MapFrom(x => x.PlanId))
              .ReverseMap();

            CreateMap<SubProcess, SubProcessInProcessModel>()
                 .ForMember(dest => dest.listPlanIsSampleTrue, opt => opt.MapFrom(x => x.Plans.Where(x => x.IsDeleted == false && x.IsSample == true)))
                 .ForMember(dest => dest.listPlanIsSampleFalse, opt => opt.MapFrom(x => x.Plans.Where(x => x.IsDeleted == false && x.IsSample == false)))
                 .ForMember(dest => dest.Order, opt => opt.MapFrom(x => x.Order))
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
                 .ForMember(dest => dest.MasterTypeId, opt => opt.MapFrom(src => src.MasterTypeId))
                 .ForMember(dest => dest.listPlanIsSampleTrue, opt => opt.MapFrom(src => src.Plans.Where(x => x.IsDeleted == false && x.IsSample == true)))
                 .ForMember(dest => dest.listPlanIsSampleFalse, opt => opt.MapFrom(src => src.Plans.Where(x => x.IsDeleted == false && x.IsSample == false)))
                 .ForMember(dest => dest.SubProcesses, opt => opt.MapFrom(src => src.SubProcesses.Where(x => x.ProcessId == src.ProcessId && x.IsDeleted == false)))
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
                .ForMember(dest => dest.Criterias, opt => opt.MapFrom(src => src.Criterias.Where(x => x.IsDeleted == false)))
                .ForMember(dest => dest.Type_Types, opt => opt.MapFrom(src => src.Products))
                .ReverseMap();


            CreateMap<LandRow, LandRowModel>()
                .ForMember(dest => dest.Plants, opt => opt.MapFrom(src => src.Plants))
                .ForMember(dest => dest.LandPlotname, opt => opt.MapFrom(src => src.LandPlot.LandPlotName))
                .ForMember(dest => dest.LandRowName, opt => opt.MapFrom(src => src.LandPlot!.LandPlotName + "-" + src.RowIndex.ToString()))
                .ForMember(dest => dest.IndexUsed, opt => opt.MapFrom(src => src.Plants.Count()))
                .ReverseMap();

            CreateMap<Plant, PlantModel>()
                .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType!.MasterTypeName))
                .ForMember(dest => dest.RowIndex, opt => opt.MapFrom(src => src.LandRow!.RowIndex))
                .ForMember(dest => dest.RowCode, opt => opt.MapFrom(src => src.LandRow!.LandRowCode))
                .ForMember(dest => dest.LandPlotId, opt => opt.MapFrom(src => src.LandRow!.LandPlot!.LandPlotId))
                .ForMember(dest => dest.LandPlotName, opt => opt.MapFrom(src => src.LandRow!.LandPlot!.LandPlotName))
                .ForMember(dest => dest.Characteristic, opt => opt.MapFrom(src => src.MasterType!.Characteristic))
                .ForMember(dest => dest.GrowthStageName, opt => opt.MapFrom(src => src.GrowthStage!.GrowthStageName))
                .ForMember(dest => dest.PlantReferenceCode, opt => opt.MapFrom(src => src.PlantReference.PlantCode))
                .ForMember(dest => dest.PlantReferenceName, opt => opt.MapFrom(src => src.PlantReference.PlantName))
                .ForMember(dest => dest.PlantLotCode, opt => opt.MapFrom(src => src.PlantLot.PlantLotCode))
                .ForMember(dest => dest.PlantLotName, opt => opt.MapFrom(src => src.PlantLot.PlantLotName))
            //.ForMember(dest => dest.CriteriaSummary, opt => opt.MapFrom(src => src.CriteriaTargets))
               .ForMember(dest => dest.CriteriaSummary, opt => opt.MapFrom(src =>
                    src.CriteriaTargets
                        .Where(pc => pc.Criteria != null && pc.Criteria.MasterType != null)
                        .GroupBy(pc => pc.Criteria.MasterType.MasterTypeName)
                        .Select(g => new CriteriaSummaryModel
                        {
                            CriteriaType = g.Key,
                            CheckedCount = g.Count(pc => pc.IsPassed == true),
                            TotalCount = g.Count()
                        })
                        .ToList()
                ))

                .ReverseMap();


            //CreateMap<PlantCriteria, PlantCriteriaModel>()
            //    .ForMember(dest => dest.CriteriaName, opt => opt.MapFrom(src => src.Criteria.CriteriaName))
            //    .ReverseMap();




            CreateMap<PlantGrowthHistory, PlantGrowthHistoryModel>()
                .ForMember(dest => dest.Resources, opt => opt.MapFrom(src => src.Resources))
                .ForMember(dest => dest.NoteTakerName, opt => opt.MapFrom(src => src.User!.FullName))
                .ForMember(dest => dest.NoteTakerAvatar, opt => opt.MapFrom(src => src.User!.AvatarURL))
                .ForMember(dest => dest.NumberImage, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat!.ToLower().Contains(FileFormatConst.IMAGE.ToLower()))))
                .ForMember(dest => dest.NumberVideos, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat!.ToLower().Contains(FileFormatConst.VIDEO.ToLower()))))
                .ReverseMap();

            CreateMap<Resource, ResourceModel>()
               .ReverseMap();

            CreateMap<User, ReporterModel>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.avatarURL, opt => opt.MapFrom(src => src.AvatarURL))
                .ReverseMap();

            CreateMap<WorkLog, WorkLogInPlanModel>()
                .ForMember(dest => dest.WorkLogID, opt => opt.MapFrom(src => src.WorkLogId))
                .ForMember(dest => dest.WorkLogName, opt => opt.MapFrom(src => src.WorkLogName))
                .ForMember(dest => dest.ActualStartTime, opt => opt.MapFrom(src => src.ActualStartTime))
                .ForMember(dest => dest.ActualEndTime, opt => opt.MapFrom(src => src.ActualEndTime))
                .ForMember(dest => dest.WorkLogName, opt => opt.MapFrom(src => src.WorkLogName))
                .ForMember(dest => dest.DateWork, opt => opt.MapFrom(src => src.Date))
                .ForMember(dest => dest.Reporter, opt => opt.MapFrom(src => src.UserWorkLogs.Where(x => x.IsReporter == true).Select(x => x.User.FullName).FirstOrDefault()))
                .ForMember(dest => dest.AvatarOfReporter, opt => opt.MapFrom(src => src.UserWorkLogs.Where(x => x.IsReporter == true).Select(x => x.User.AvatarURL).FirstOrDefault()))
               .ReverseMap();

            CreateMap<Plant, PlantDisplayModel>();
            CreateMap<LandRow, LandRowDisplayModel>()
                .ForMember(dest => dest.Plants, opt => opt.MapFrom(src => src.Plants));
            CreateMap<PlantLot, PlantLotDisplayModel>();
            CreateMap<GraftedPlant, GraftedPlantDisplayModel>();
            CreateMap<LandPlot, PlanTargetDisplayModel>()
                .ForMember(dest => dest.LandPlotName, opt => opt.MapFrom(src => src.LandPlotName))
                .ForMember(dest => dest.LandPlotId, opt => opt.MapFrom(src => src.LandPlotId));

            CreateMap<PlanTarget, PlanTargetDisplayModel>()
                .ForMember(dest => dest.LandPlotName, opt => opt.MapFrom(src => src.LandPlot != null ? src.LandPlot.LandPlotName : null))
                .ForMember(dest => dest.LandPlotId, opt => opt.MapFrom(src => src.LandPlotID))
                .ForMember(dest => dest.Rows, opt => opt.Ignore())
                .ForMember(dest => dest.Plants, opt => opt.Ignore())
                .ForMember(dest => dest.PlantLots, opt => opt.Ignore())
                .ForMember(dest => dest.GraftedPlants, opt => opt.Ignore());

            CreateMap<LandPlot, ForSelectedModels>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.LandPlotId))
               .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.LandPlotCode))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.LandPlotName))
                .ReverseMap();

            CreateMap<Crop, ForSelectedModels>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CropId))
               .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.CropCode))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.CropName))
                .ReverseMap();

            CreateMap<Plan, GetPlanForSelected>()
              .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PlanId))
              .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.PlanCode))
              .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.PlanName))
              .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
              .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate))
               .ReverseMap();

            CreateMap<Plan, PlanGetAllModel>()
              .ForMember(dest => dest.PlanId, opt => opt.MapFrom(src => src.PlanId))
              .ForMember(dest => dest.PlanCode, opt => opt.MapFrom(src => src.PlanCode))
              .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
              .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
              .ForMember(dest => dest.PlanName, opt => opt.MapFrom(src => src.PlanName))
              .ForMember(dest => dest.PlanDetail, opt => opt.MapFrom(src => src.PlanDetail))
              .ForMember(dest => dest.Frequency, opt => opt.MapFrom(src => src.Frequency))
              .ForMember(dest => dest.CreateDate, opt => opt.MapFrom(src => src.CreateDate))
              .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
              .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate))
              .ForMember(dest => dest.GrowthStages, opt => opt.MapFrom(src => src.GrowthStagePlans.Where(pt => pt.GrowthStage != null).Select(pt => new ForSelectedModels() { Id = pt.GrowthStage.GrowthStageID, Name = pt.GrowthStage.GrowthStageName }).Distinct().ToList()))
               .ReverseMap();

            CreateMap<Plan, PlanModel>()
               .ForMember(dest => dest.AssignorName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : (string?)null))
             .ForMember(dest => dest.Frequency,
                                                    opt => opt.MapFrom(src => src.CarePlanSchedule != null && src.CarePlanSchedule.CarePlan != null
                                                        ? src.CarePlanSchedule.CarePlan.Frequency
                                                        : (string?)null))
                .ForMember(dest => dest.LandPlotNames, opt => opt.MapFrom(src =>
                                                           src.PlanTargets.Where(pt => pt.LandPlot != null).Select(pt => pt.LandPlot.LandPlotName).Distinct().ToList()))
               .ForMember(dest => dest.PlantLotNames, opt => opt.MapFrom(src =>
                                                            src.PlanTargets.Where(pt => pt.PlantLot != null).Select(pt => pt.PlantLot.PlantLotName).Distinct().ToList()))
                .ForMember(dest => dest.PlantNames, opt => opt.MapFrom(src =>
                                                            src.PlanTargets.Where(pt => pt.Plant != null).Select(pt => pt.Plant.PlantName).Distinct().ToList()))
               .ForMember(dest => dest.ProcessName, opt => opt.MapFrom(src => src.Process != null ? src.Process.ProcessName : (string?)null))
               .ForMember(dest => dest.SubProcessName, opt => opt.MapFrom(src => src.SubProcess != null ? src.SubProcess.SubProcessName : (string?)null))
               .ForMember(dest => dest.CropName, opt => opt.MapFrom(src => src.Crop != null ? src.Crop.CropName : (string?)null))
              .ForMember(dest => dest.CropId, opt => opt.MapFrom(src => src.Crop != null ? src.Crop.CropId : (int?)null))
               .ForMember(dest => dest.ProcessId, opt => opt.MapFrom(src => src.Process != null ? src.Process.ProcessId : (int?)null))
               .ForMember(dest => dest.MasterTypeId, opt => opt.MapFrom(src => src.MasterType != null ? src.MasterType.MasterTypeId : (int?)null))
               .ForMember(dest => dest.GraftedPlantName, opt => opt.MapFrom(src =>
                                                            src.PlanTargets.Where(pt => pt.GraftedPlant != null).Select(pt => pt.GraftedPlant.GraftedPlantName).Distinct().ToList()))
               .ForMember(dest => dest.GrowthStages, opt => opt.MapFrom(src => src.GrowthStagePlans.Where(pt => pt.GrowthStage != null).Select(pt => new ForSelectedModels() { Id = pt.GrowthStage.GrowthStageID, Name = pt.GrowthStage.GrowthStageName }).Distinct().ToList()))
               .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType != null ? src.MasterType.MasterTypeName : (string?)null))
               .ForMember(dest => dest.MinTime, opt => opt.MapFrom(src => src.MasterType != null ? src.MasterType.MinTime : (int?)null))
               .ForMember(dest => dest.MaxTime, opt => opt.MapFrom(src => src.MasterType != null ? src.MasterType.MaxTime : (int?)null))
               .ForMember(dest => dest.RowIndexs, opt => opt.MapFrom(src => src.PlanTargets.Where(pt => pt.LandRow != null).Select(pt => pt.LandRow.RowIndex).Distinct().ToList()))
               .ForMember(dest => dest.AvatarOfAssignor, opt => opt.MapFrom(src => src.User != null ? src.User.AvatarURL : (string?)null))
              .ForMember(dest => dest.hasNonSampleProcess, opt => opt.MapFrom(src =>
                                                                (src.Process != null && src.Process.IsSample == false) ||
                                                                (src.SubProcess.Process != null && src.SubProcess.Process.IsSample == false)
                                                            ))
               //.ForMember(dest => dest.ListReporter, opt => opt.MapFrom(src =>
               //                                                  src.CarePlanSchedule != null && src.CarePlanSchedule.WorkLogs != null
               //                                                 ? src.CarePlanSchedule.WorkLogs
               //                                                     .SelectMany(wl => wl.UserWorkLogs)
               //                                                     .Where(uwl => uwl.IsReporter == true)
               //                                                     .Select(uwl => uwl.User)
               //                                                     .GroupBy(user => user.UserId)
               //                                                     .Select(group => group.First())
               //                                                     .ToList() : new List<User>()))
               //.ForMember(dest => dest.ListEmployee, opt => opt.MapFrom(src =>
               //                                                 src.CarePlanSchedule != null && src.CarePlanSchedule.WorkLogs != null
               //                                                 ? src.CarePlanSchedule.WorkLogs
               //                                                     .SelectMany(wl => wl.UserWorkLogs)
               //                                                     .Where(uwl => uwl.IsReporter == false)
               //                                                     .Select(uwl => uwl.User)
               //                                                     .GroupBy(user => user.UserId)
               //                                                     .Select(group => group.First())
               //                                                     .ToList() : new List<User>()))
               .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.StartTime : null))
               .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.EndTime : null))
               .ForMember(dest => dest.DayOfWeek, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.DayOfWeek : null))
               .ForMember(dest => dest.DayOfMonth, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.DayOfMonth : null))
               .ForMember(dest => dest.CustomDates, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.CustomDates : null))
               .ForMember(dest => dest.ListWorkLog, opt => opt.MapFrom(src => src.CarePlanSchedule != null ? src.CarePlanSchedule.WorkLogs : null))
               .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
               .ForMember(dest => dest.CreateDate, opt => opt.MapFrom(src => src.CreateDate))
               .ForMember(dest => dest.ListLandPlotOfCrop, opt => opt.MapFrom(src => src.Crop != null ? src.Crop.LandPlotCrops.Select(x => x.LandPlot) : new List<LandPlot>()))
               .ForMember(dest => dest.PlanTargetModels, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<LegalDocument, LegalDocumentModel>()
               .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
               .ForMember(dest => dest.Resources, opt => opt.MapFrom(src => src.Resources))
               .ReverseMap();



            CreateMap<Crop, CropModel>()
                //.ForMember(dest => dest.HarvestHistories, opt => opt.MapFrom(src => src.HarvestHistories))
                //.ForMember(dest => dest.LandPlotCrops, opt => opt.MapFrom(src => src.LandPlotCrops))
                .ForMember(dest => dest.NumberPlot, opt => opt.MapFrom(src => src.LandPlotCrops.Count()))
                .ForMember(dest => dest.NumberHarvest, opt => opt.MapFrom(src => src.HarvestHistories.Count(x => x.IsDeleted == false)))
                .ReverseMap();

            CreateMap<LandPlotCrop, LandPlotCropModel>()
               //.ForMember(dest => dest.Crop, opt => opt.MapFrom(src => src.Crop))
               .ForMember(dest => dest.LandPlotName, opt => opt.MapFrom(src => src.LandPlot.LandPlotName))
                .ReverseMap();

            CreateMap<TaskFeedback, TaskFeedbackModel>()
              .ForMember(dest => dest.ManagerName, opt => opt.MapFrom(src => src.Manager.FullName))
              .ForMember(dest => dest.TaskFeedbackId, opt => opt.MapFrom(src => src.TaskFeedbackId))
              .ForMember(dest => dest.TaskFeedbackCode, opt => opt.MapFrom(src => src.TaskFeedbackCode))
              .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
              .ForMember(dest => dest.ReasonDelay, opt => opt.MapFrom(src => src.WorkLog.ReasonDelay))
              .ForMember(dest => dest.CreateDate, opt => opt.MapFrom(src => src.CreateDate))
              .ForMember(dest => dest.WorkLogId, opt => opt.MapFrom(src => src.WorkLogId))
              .ForMember(dest => dest.ManagerId, opt => opt.MapFrom(src => src.ManagerId))
              .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Manager.FullName))
              .ForMember(dest => dest.AvatarURL, opt => opt.MapFrom(src => src.Manager.AvatarURL))
              .ForMember(dest => dest.WorkLogName, opt => opt.MapFrom(src => src.WorkLog.WorkLogName))
               .ReverseMap();

            CreateMap<HarvestHistory, HarvestHistoryModel>()
               .ForMember(dest => dest.ProductHarvestHistory, opt => opt.MapFrom(src => src.ProductHarvestHistories.Where(x => x.PlantId == null)))
               .ForMember(dest => dest.CropName, opt => opt.MapFrom(src => src.Crop!.CropName))
               .ForMember(dest => dest.YieldHasRecord, opt => opt.MapFrom(src => src.ProductHarvestHistories.Where(x => x.PlantId != null).Sum(x => x.ActualQuantity)))
               .ForMember(dest => dest.YieldHasRecord, opt => opt.MapFrom(src =>
                                src.ProductHarvestHistories != null
                                    ? src.ProductHarvestHistories.Where(x => x.PlantId != null).Sum(x => x.ActualQuantity)
                                    : 0))
               .ForMember(dest => dest.CarePlanSchedules, opt => opt.MapFrom(src => src.CarePlanSchedules.Where(x => x.IsDeleted != true)))
               .ForMember(dest => dest.AvatarOfAssignor, opt => opt.MapFrom(src => src.User != null ? src.User.AvatarURL : (string?)null))
               .ForMember(dest => dest.AssignorName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : (string?)null))
               .ReverseMap();

            CreateMap<CarePlanSchedule, CarePlanScheduleModel>()
               .ForMember(dest => dest.WorkLogs, opt => opt.MapFrom(src => src.WorkLogs))
                //       .ForMember(dest => dest.WorkLogs, opt => opt.MapFrom(src =>
                //src.WorkLogs ?? new List<WorkLog>())) // Tránh null
                .ReverseMap();

            CreateMap<WorkLog, WorkLogHarvestModel>()
               .ForMember(dest => dest.UserWorkLogs, opt => opt.MapFrom(src => src.UserWorkLogs))
                .ReverseMap();

            CreateMap<ProductHarvestHistory, ProductHarvestHistoryModel>()
               .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.MasterTypeName))
               .ForMember(dest => dest.HarvestHistoryCode, opt => opt.MapFrom(src => src.HarvestHistory.HarvestHistoryCode))
               .ForMember(dest => dest.PlantName, opt => opt.MapFrom(src => src.Plant!.PlantName))
               .ForMember(dest => dest.PlantCode, opt => opt.MapFrom(src => src.Plant!.PlantCode))
                .ForMember(dest => dest.PlantIndex, opt => opt.MapFrom(src => src.Plant!.PlantIndex))
                .ForMember(dest => dest.LandRowIndex, opt => opt.MapFrom(src => src.Plant.LandRow!.RowIndex))
                .ForMember(dest => dest.LandRowCode, opt => opt.MapFrom(src => src.Plant.LandRow!.LandRowCode))
                .ForMember(dest => dest.LantPlotName, opt => opt.MapFrom(src => src.Plant!.LandRow.LandPlot!.LandPlotName))
                .ForMember(dest => dest.LantPlotCode, opt => opt.MapFrom(src => src.Plant!.LandRow.LandPlot!.LandPlotCode))
                .ForMember(dest => dest.SellPrice, opt => opt.MapFrom(src => src.Revenue))
                //.ForMember(dest => dest.plantLogHarvest, opt => opt.MapFrom(src => src.Ignore()))
                .ReverseMap();

            CreateMap<ProductHarvestHistory, PlantLogHarvestModel>()
              .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.MasterTypeName))
              .ForMember(dest => dest.HarvestHistoryCode, opt => opt.MapFrom(src => src.HarvestHistory.HarvestHistoryCode))
              .ForMember(dest => dest.PlantName, opt => opt.MapFrom(src => src.Plant.PlantName))
              .ForMember(dest => dest.PlantCode, opt => opt.MapFrom(src => src.Plant.PlantCode))
               .ForMember(dest => dest.CropName, opt => opt.MapFrom(src => src.HarvestHistory.Crop.CropName))
               .ForMember(dest => dest.HarvestDate, opt => opt.MapFrom(src => src.HarvestHistory.DateHarvest))
               .ForMember(dest => dest.HarvestHistoryCode, opt => opt.MapFrom(src => src.HarvestHistory.HarvestHistoryCode))
              .ForMember(dest => dest.RecordBy, opt => opt.MapFrom(src => src.User.FullName))
              .ForMember(dest => dest.AvartarRecord, opt => opt.MapFrom(src => src.User.AvatarURL))
                .ForMember(dest => dest.PlantIndex, opt => opt.MapFrom(src => src.Plant!.PlantIndex))
               .ForMember(dest => dest.LandRowIndex, opt => opt.MapFrom(src => src.Plant.LandRow!.RowIndex))
                .ForMember(dest => dest.LandRowCode, opt => opt.MapFrom(src => src.Plant.LandRow!.LandRowCode))
                .ForMember(dest => dest.LantPlotName, opt => opt.MapFrom(src => src.Plant!.LandRow.LandPlot!.LandPlotName))
                .ForMember(dest => dest.LantPlotCode, opt => opt.MapFrom(src => src.Plant!.LandRow.LandPlot!.LandPlotCode))
               .ReverseMap();

            CreateMap<Order, OrderModel>()
               .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
               .ForMember(dest => dest.Package, opt => opt.MapFrom(src => src.Package))
               .ForMember(dest => dest.Payments, opt => opt.MapFrom(src => src.Payment))
                .ReverseMap();
            CreateMap<Package, PackageModel>()
               .ForMember(dest => dest.PackageDetails, opt => opt.MapFrom(src => src.PackageDetails))
                .ReverseMap();
            CreateMap<PackageDetail, PackageDetailModel>()
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

            CreateMap<PlantLot, ForSelectedModels>()
             .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PlantLotId))
             .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.PlantLotCode))
             .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.PlantLotName))
              .ReverseMap();

            CreateMap<HarvestHistory, ForSelectedModels>()
             .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.HarvestHistoryId))
             .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.HarvestHistoryCode))
             .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.HarvestHistoryNote))
              .ReverseMap();

            CreateMap<LandRow, ForSelectedModels>()
             .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.LandRowId))
             .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.LandRowCode))
             .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.LandPlot!.LandPlotName + "-" + src.RowIndex.ToString()))
              .ReverseMap();

            CreateMap<MasterType, ForSelectedModels>()
             .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.MasterTypeId))
             .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.MasterTypeCode))
             .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.MasterTypeName))
              .ReverseMap();

            CreateMap<Partner, ForSelectedModels>()
             .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PartnerId))
             .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.PartnerCode))
             .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.PartnerName))
              .ReverseMap();

            CreateMap<Plant, ForSelectedModels>()
             .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PlantId))
             .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.PlantCode))
             .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.PlantName))
              .ReverseMap();

            CreateMap<GraftedPlant, ForSelectedModels>()
           .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.GraftedPlantId))
           .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.GraftedPlantCode))
           .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.GraftedPlantName))
            .ReverseMap();

            CreateMap<GraftedPlantNote, GraftedPlantNoteModel>()
                .ForMember(dest => dest.Resources, opt => opt.MapFrom(src => src.Resources))
                .ForMember(dest => dest.NoteTakerName, opt => opt.MapFrom(src => src.User!.FullName))
                .ForMember(dest => dest.NoteTakerAvatar, opt => opt.MapFrom(src => src.User!.AvatarURL))
                .ForMember(dest => dest.NumberImage, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat!.ToLower().Contains(FileFormatConst.IMAGE.ToLower()))))
                .ForMember(dest => dest.NumberVideos, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat!.ToLower().Contains(FileFormatConst.VIDEO.ToLower()))))
                .ReverseMap();

            CreateMap<GraftedPlant, GraftedPlantModels>()
               .ForMember(dest => dest.PlantCode, opt => opt.MapFrom(src => src.Plant!.PlantCode))
               .ForMember(dest => dest.PlantName, opt => opt.MapFrom(src => src.Plant!.PlantName))
               .ForMember(dest => dest.PlantLotName, opt => opt.MapFrom(src => src.PlantLot!.PlantLotName))
               .ForMember(dest => dest.PlantLotCode, opt => opt.MapFrom(src => src.PlantLot!.PlantLotCode))
               .ForMember(dest => dest.CultivarId, opt => opt.MapFrom(src => src.Plant!.MasterTypeId))
               .ForMember(dest => dest.CultivarName, opt => opt.MapFrom(src => src.Plant!.MasterType!.MasterTypeName))
               .ForMember(dest => dest.MortherPlant, opt => opt.MapFrom(src => src.Plant))
               .ReverseMap();

            CreateMap<ChatMessage, ChatMessageModel>()
                 .ForMember(dest => dest.MessageId, opt => opt.MapFrom(src => src.MessageId))
                 .ForMember(dest => dest.Question, opt => opt.MapFrom(src => src.Question))
                 .ForMember(dest => dest.MessageType, opt => opt.MapFrom(src => src.MessageType))
                 .ForMember(dest => dest.Answer, opt => opt.MapFrom(src => src.MessageContent))
                 .ForMember(dest => dest.CreateDate, opt => opt.MapFrom(src => src.CreateDate))
                 .ForMember(dest => dest.UpdateDate, opt => opt.MapFrom(src => src.UpdateDate))
                 .ForMember(dest => dest.SenderId, opt => opt.MapFrom(src => src.SenderId))
                 .ForMember(dest => dest.resources, opt => opt.MapFrom(src => src.Resources))
                .ReverseMap();

            CreateMap<ChatRoom, ChatRoomModel>()
                .ForMember(dest => dest.RoomId, opt => opt.MapFrom(src => src.RoomId))
                .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src => src.RoomName))
                .ForMember(dest => dest.ChatMessages, opt => opt.MapFrom(src => src.ChatMessages))
               .ReverseMap();

            CreateMap<Resource, ResourceOfWorkLogModel>()
                .ReverseMap();

            CreateMap<UserWorkLog, NoteOfWorkLogModel>()
              .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
              .ForMember(dest => dest.AvatarURL, opt => opt.MapFrom(src => src.User.AvatarURL))
              .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes))
              .ForMember(dest => dest.Issue, opt => opt.MapFrom(src => src.Issue))
              .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.User.UserId))
              .ForMember(dest => dest.UserWorklogId, opt => opt.MapFrom(src => src.UserWorkLogID))
              .ForMember(dest => dest.CreateDate,
                opt => opt.MapFrom(src => src.CreateDate))
            .ForMember(dest => dest.ListResources,
                opt => opt.MapFrom(src => src.Resources ?? new List<Resource>()))
              .ReverseMap();


            CreateMap<WorkLog, WorkLogDetailModel>()
            .ForMember(dest => dest.WarningName, opt => opt.MapFrom(src => src.Warning.WarningName))
            .ForMember(dest => dest.CropName, opt => opt.MapFrom(src => src.Schedule.CarePlan.Crop.CropName))
            .ForMember(dest => dest.ProcessName, opt => opt.MapFrom(src => src.Schedule.CarePlan.Process != null ? src.Schedule.CarePlan.Process.ProcessName : src.Schedule.CarePlan.SubProcess.SubProcessName))
            .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.Schedule.CarePlan.MasterType.MasterTypeName))
            .ForMember(dest => dest.PlanName, opt => opt.MapFrom(src => src.Schedule.CarePlan.PlanName))
            .ForMember(dest => dest.MasterTypeId, opt => opt.MapFrom(src => src.Schedule.CarePlan.MasterTypeId))
            .ForMember(dest => dest.AssignorId, opt => opt.MapFrom(src => src.Schedule.CarePlan.AssignorId))
            .ForMember(dest => dest.AssignorName, opt => opt.MapFrom(src => src.Schedule.CarePlan.User.FullName))
            .ForMember(dest => dest.AssignorAvatarURL, opt => opt.MapFrom(src => src.Schedule.CarePlan.User.AvatarURL))
            .ForMember(dest => dest.PlanName, opt => opt.MapFrom(src => src.Schedule.CarePlan.PlanName))
            .ForMember(dest => dest.PlanCode, opt => opt.MapFrom(src => src.Schedule.CarePlan.PlanCode))
            .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.Schedule.CarePlan.StartDate))
            .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.Schedule.CarePlan.EndDate))
            .ForMember(dest => dest.PlanId, opt => opt.MapFrom(src => src.Schedule.CarePlan.PlanId))
            .ForMember(dest => dest.HarvestHistoryCode, opt => opt.MapFrom(src => src.Schedule.HarvestHistory.HarvestHistoryCode))
            .ForMember(dest => dest.HarvestHistoryId, opt => opt.MapFrom(src => src.Schedule.HarvestHistory.HarvestHistoryId))
            .ForMember(dest => dest.IsHarvest, opt => opt.MapFrom(src => src.Schedule.HarvestHistoryID != null ? true : false))
            .ForMember(dest => dest.IsTakeAttendance, opt =>
                                                    opt.MapFrom(src => src.UserWorkLogs != null
                                                        && src.UserWorkLogs.Any(x => x.StatusOfUserWorkLog == WorkLogStatusConst.RECEIVED)
                                                        && !src.UserWorkLogs.Any(x => x.StatusOfUserWorkLog == null)
                                                    )
                                                )
            .ForMember(dest => dest.PlanTargetModels, opt => opt.Ignore())
            .ForMember(dest => dest.TypeWork, opt => opt.MapFrom(src => src.Schedule.CarePlan.Process.ProcessName))
            .ForMember(dest => dest.WarningName, opt => opt.MapFrom(src => src.Warning.WarningName))
           .ForMember(dest => dest.ReplacementEmployee, opt => opt.MapFrom(src =>
                                                                src.UserWorkLogs
                                                                    .Where(uwl => src.UserWorkLogs.Any(r => r.ReplaceUserId == uwl.UserId && uwl.IsDeleted == false)) // Chỉ lấy nhân viên bị thay
                                                                    .Select(uwl => new ReplacementEmployeeModel
                                                                    {
                                                                        ReplaceUserId = uwl.UserId,
                                                                        ReplaceUserFullName = uwl.User.FullName,
                                                                        ReplaceUserAvatar = uwl.User.AvatarURL,
                                                                        ReplaceUserIsRepoter = uwl.IsReporter,
                                                                        // Lấy thông tin nhân viên thay thế
                                                                        UserId = src.UserWorkLogs
                                                                            .Where(r => r.ReplaceUserId == uwl.UserId)
                                                                            .Select(r => r.UserId)
                                                                            .FirstOrDefault(),

                                                                        FullName = src.UserWorkLogs
                                                                            .Where(r => r.ReplaceUserId == uwl.UserId)
                                                                            .Select(r => r.User.FullName)
                                                                            .FirstOrDefault(),

                                                                        Avatar = src.UserWorkLogs
                                                                            .Where(r => r.ReplaceUserId == uwl.UserId)
                                                                            .Select(r => r.User.AvatarURL)
                                                                            .FirstOrDefault()
                                                                    })
                                                                    .ToList()))
            .ForMember(dest => dest.ListEmployee, opt => opt.MapFrom(src => src.UserWorkLogs.Where(x => x.IsReporter == false && x.StatusOfUserWorkLog != WorkLogStatusConst.REPLACED)
                                                                    .GroupBy(user => user.UserId)
                                                                    .Select(group => new ReporterModel
                                                                    {
                                                                        UserId = group.First().User.UserId,
                                                                        FullName = group.First().User.FullName,
                                                                        avatarURL = group.First().User.AvatarURL,
                                                                        StatusOfUserWorkLog = group.First().StatusOfUserWorkLog,
                                                                        IsReporter = group.First().IsReporter
                                                                    }).ToList()))
            .ForMember(dest => dest.Reporter, opt => opt.MapFrom(src => src.UserWorkLogs.Where(x => x.IsReporter == true && x.StatusOfUserWorkLog != WorkLogStatusConst.REPLACED)
                                                                    .GroupBy(user => user.UserId)
                                                                    .Select(group => new ReporterModel
                                                                    {
                                                                        UserId = group.First().User.UserId,
                                                                        FullName = group.First().User.FullName,
                                                                        avatarURL = group.First().User.AvatarURL,
                                                                        StatusOfUserWorkLog = group.First().StatusOfUserWorkLog,
                                                                        IsReporter = group.First().IsReporter
                                                                    })
                                                                    .ToList()))
            .ForMember(dest => dest.ListGrowthStageName, opt =>
                                opt.MapFrom(src =>
                                    (src.Schedule != null && src.Schedule.CarePlan != null && src.Schedule.CarePlan.GrowthStagePlans != null)
                                    ? src.Schedule.CarePlan.GrowthStagePlans
                                        .Where(pt => pt.GrowthStage != null)
                                        .Select(pt => pt.GrowthStage.GrowthStageName)
                                        .Distinct()
                                        .ToList()
                                    : new List<string>() // Trả về danh sách rỗng nếu bất kỳ phần nào null
                                )
                            )

            .ForMember(dest => dest.ListTaskFeedback, opt => opt.MapFrom(src => src.TaskFeedbacks))
            .ForMember(dest => dest.ListNoteOfWorkLog, opt => opt.MapFrom(src => src.UserWorkLogs.Where(x => x.Issue != null || x.Notes != null)))
            .ReverseMap();

            CreateMap<Type_Type, TypeTypeModel>()
          .ForMember(dest => dest.CriteriaSet, opt => opt.MapFrom(src => src.CriteriaSet))
          .ForMember(dest => dest.Product, opt => opt.MapFrom(src => src.Product))
             .ReverseMap();

            CreateMap<Payment, PaymentModel>()
                .ReverseMap();

            CreateMap<Process, ForSelectedModels>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ProcessId))
               .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.ProcessCode))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.ProcessName))
                .ReverseMap();

            CreateMap<SystemConfiguration, SystemConfigModel>()
                .ReverseMap();

            CreateMap<SystemConfiguration, ForSelectedModels>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ConfigId))
               .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.ConfigKey))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.ConfigValue))
                .ReverseMap();

            CreateMap<Report, ReportOfUserModel>()
                .ForMember(dest => dest.ReportID, opt => opt.MapFrom(src => src.ReportID))
               .ForMember(dest => dest.ReportCode, opt => opt.MapFrom(src => src.ReportCode))
               .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
               .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate))
               .ForMember(dest => dest.IsTrainned, opt => opt.MapFrom(src => src.IsTrainned))
               .ForMember(dest => dest.ImageURL, opt => opt.MapFrom(src => src.ImageURL))
               .ForMember(dest => dest.AvatarOfQuestioner, opt => opt.MapFrom(src => src.Questioner.AvatarURL))
               .ForMember(dest => dest.AvatarOfAnswer, opt => opt.MapFrom(src => src.Answerer.AvatarURL))
               .ForMember(dest => dest.AnswererID, opt => opt.MapFrom(src => src.AnswererID))
               .ForMember(dest => dest.AnswererName, opt => opt.MapFrom(src => src.Answerer.FullName))
               .ForMember(dest => dest.QuestionerID, opt => opt.MapFrom(src => src.QuestionerID))
               .ForMember(dest => dest.QuestionerName, opt => opt.MapFrom(src => src.Questioner.FullName))
               .ForMember(dest => dest.QuestionOfUser, opt => opt.MapFrom(src => src.QuestionOfUser))
               .ForMember(dest => dest.AnswerFromExpert, opt => opt.MapFrom(src => src.AnswerFromExpert))
                .ReverseMap();

            CreateMap<Farm, ForSelectedModels>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.FarmId))
               .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.FarmCode))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FarmName))
                .ReverseMap();

            CreateMap<UserWorkLog, EmployeeTodayTask>()
              .ForMember(dest => dest.WorkLogId, opt => opt.MapFrom(src => src.WorkLogId))
              .ForMember(dest => dest.WorkLogName, opt => opt.MapFrom(src => src.WorkLog.WorkLogName))
              .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.WorkLog.Status))
               .ReverseMap();
        }
    }
}
