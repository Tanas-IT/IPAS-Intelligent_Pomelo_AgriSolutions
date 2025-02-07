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
                .ForMember(dest => dest.LandRows, opt => opt.MapFrom(src => src.LandRows))
                //.ForMember(dest => dest.Plans, opt => opt.MapFrom(src => src.Plans))
                //.ForMember(dest => dest.LandPlotCrops, opt => opt.MapFrom(src => src.LandPlotCrops))
                .ReverseMap();

            CreateMap<UserFarm, UserFarmModel>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Farm, opt => opt.MapFrom(src => src.Farm))
                .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
                //.ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.Role!.RoleId))
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role!.RoleName))
                .ReverseMap();


            CreateMap<Partner, PartnerModel>()
               .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role!.RoleName)).ReverseMap();

            CreateMap<GrowthStage, GrowthStageModel>().ReverseMap();
            CreateMap<SubProcessInProcessModel, SubProcess>().ReverseMap();
            CreateMap<Process, ProcessModel>()
                 .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
                 .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType!.MasterTypeName))
                 .ForMember(dest => dest.GrowthStageName, opt => opt.MapFrom(src => src.GrowthStage!.GrowthStageName))
                 .ForMember(dest => dest.SubProcesses, opt => opt.MapFrom(src => src.SubProcesses.Where(x => x.ProcessId == src.ProcessId)))
                .ReverseMap();

            CreateMap<SubProcess, SubProcessModel>()
                .ForMember(dest => dest.ProcessName, opt => opt.MapFrom(src => src.Process!.ProcessName))
                .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType!.MasterTypeName))
               .ReverseMap();

            CreateMap<LandPlotCoordination, LandPlotCoordinationModel>().ReverseMap();

            CreateMap<Criteria, CriteriaModel>()
                .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType.MasterTypeName))
                .ReverseMap();

            CreateMap<MasterType, MasterTypeModel>().ReverseMap();
            CreateMap<MasterTypeDetail, MasterTypeDetailModel>().ReverseMap();

            CreateMap<LandRow, LandRowModel>()
                //.ForMember(dest => dest.Plants, opt => opt.MapFrom(src => src.Plants))
                .ForMember(dest => dest.LandPlotname, opt => opt.MapFrom(src => src.LandPlot.LandPlotName))
                .ReverseMap();

            CreateMap<Plant, PlantModel>()
                .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType!.MasterTypeName))
                .ForMember(dest => dest.RowIndex, opt => opt.MapFrom(src => src.LandRow!.RowIndex))
                .ForMember(dest => dest.LandPlotName, opt => opt.MapFrom(src => src.LandRow!.LandPlot!.LandPlotName))
                //.ForMember(dest => dest.Plans, opt => opt.MapFrom(src => src.Plans))
                .ForMember(dest => dest.CriteriaSummary, opt => opt.MapFrom(src =>
                    src.PlantCriterias.GroupBy(pc => pc.Criteria.MasterType)
                    .Select(g => new
                    {
                        CriteriaType = g.Key!.MasterTypeName,
                        CheckedCount = g.Count(pc => pc.IsChecked == true),
                        TotalCount = g.Count()
                    })
                    .ToList()
                    ));

            CreateMap<PlantCriteria, PlantCriteriaModel>()
                .ForMember(dest => dest.CriteriaName, opt => opt.MapFrom(src => src.Criteria.CriteriaName))
                .ReverseMap();

            CreateMap<MasterType, MasterTypeModel>()
                .ForMember(dest => dest.Criteria, opt => opt.MapFrom(src => src.Criteria))
                .ReverseMap();

            CreateMap<PlantGrowthHistory, PlantGrowthHistoryModel>()
                .ForMember(dest => dest.PlantResources, opt => opt.MapFrom(src => src.Resources))
                .ForMember(dest => dest.NumberImage, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat == FileFormatConst.IMAGE)))
                .ForMember(dest => dest.NumberVideos, opt => opt.MapFrom(src => src.Resources.Count(x => x.FileFormat == FileFormatConst.VIDEO)))
                .ReverseMap();

            CreateMap<Resource, ResourceModel>()
               .ReverseMap();
          
            CreateMap<Plan, PlanModel>()
               .ForMember(dest => dest.AssignorName, opt => opt.MapFrom(src => src.User.FullName))
               .ForMember(dest => dest.LandPlotName, opt => opt.MapFrom(src => src.LandPlot.LandPlotName))
               .ForMember(dest => dest.PlantLotName, opt => opt.MapFrom(src => src.PlantLot.PlantLotName))
               .ForMember(dest => dest.PlantName, opt => opt.MapFrom(src => src.Plant.PlantName))
               .ForMember(dest => dest.ProcessName, opt => opt.MapFrom(src => src.Process.ProcessName))
               .ForMember(dest => dest.CropName, opt => opt.MapFrom(src => src.Crop.CropName))
               .ForMember(dest => dest.GrowthStageName, opt => opt.MapFrom(src => src.GrowthStage.GrowthStageName))
               .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType.MasterTypeName))
               .ReverseMap();

            CreateMap<LegalDocument, LegalDocumentModel>()
               .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm!.FarmName))
               .ForMember(dest => dest.Resources, opt => opt.MapFrom(src => src.Resources))
               .ReverseMap();
        }
    }
}
