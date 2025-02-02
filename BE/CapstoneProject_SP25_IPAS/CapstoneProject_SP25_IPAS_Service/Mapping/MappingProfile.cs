using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessStyleModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
using Process = CapstoneProject_SP25_IPAS_BussinessObject.Entities.Process;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.SubProcessModel;

namespace CapstoneProject_SP25_IPAS_Service.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Role, RoleModel>()
                .ReverseMap();
            CreateMap<User, UserModel>()
                 .ForMember(dest => dest.RoleName, opt => opt.MapFrom(x => x.Role.RoleName))
                .ReverseMap();

            CreateMap<PlantLot, PlantLotModel>()
                .ForMember(dest => dest.PartnerName, opt => opt.MapFrom(x => x.Partner.PartnerName))
               .ReverseMap();
           

            CreateMap<Farm, FarmModel>()
            .ForMember(dest => dest.FarmCoordinations, opt => opt.MapFrom(src => src.FarmCoordinations))
            //.ForMember(dest => dest.LandPlots, opt => opt.MapFrom(src => src.LandPlots))
            //.ForMember(dest => dest.Orders, opt => opt.MapFrom(src => src.Orders))
            //.ForMember(dest => dest.Processes, opt => opt.MapFrom(src => src.Processes))
            .ForMember(dest => dest.UserFarms, opt => opt.MapFrom(src => src.UserFarms))
            .ReverseMap();
            CreateMap<FarmCoordination, FarmCoordinationModel>();

            CreateMap<LandPlot, LandPlotModel>()
                .ForMember(dest => dest.LandPlotCoordinations, opt => opt.MapFrom(src => src.LandPlotCoordinations))
                .ForMember(dest => dest.LandRows, opt => opt.MapFrom(src => src.LandRows))
                //.ForMember(dest => dest.Plans, opt => opt.MapFrom(src => src.Plans))
                //.ForMember(dest => dest.LandPlotCrops, opt => opt.MapFrom(src => src.LandPlotCrops))
                .ReverseMap();

            CreateMap<UserFarm, UserFarmModel>()
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User)) 
                .ForMember(dest => dest.Farm, opt => opt.MapFrom(src => src.Farm))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
                .ReverseMap();


            CreateMap<Partner, PartnerModel>()
               .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.RoleName)).ReverseMap();

            CreateMap<GrowthStage, GrowthStageModel>().ReverseMap();
            CreateMap<SubProcessInProcessModel, SubProcess>().ReverseMap();
            CreateMap<Process, ProcessModel>()
                 .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm.FarmName))
                 .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType.MasterTypeName))
                 .ForMember(dest => dest.GrowthStageName, opt => opt.MapFrom(src => src.GrowthStage.GrowthStageName))
                 .ForMember(dest => dest.SubProcesses, opt => opt.MapFrom(src => src.SubProcesses.Where(x => x.ProcessId == src.ProcessId)))
                .ReverseMap();

            CreateMap<SubProcess, SubProcessModel>()
                .ForMember(dest => dest.ProcessName, opt => opt.MapFrom(src => src.Process.ProcessName))
                .ForMember(dest => dest.MasterTypeName, opt => opt.MapFrom(src => src.MasterType.MasterTypeName))
               .ReverseMap();

            CreateMap<LandPlotCoordination, LandPlotCoordinationModel>().ReverseMap();

            CreateMap<Criteria, CriteriaModel>()
                //.ForMember(dest => dest.CriteriaType, opt => opt.MapFrom(src => src.CriteriaType))
                .ReverseMap();

            CreateMap<LandRow, LandRowModel>()
                .ForMember(dest => dest.Plants, opt => opt.MapFrom(src => src.Plants))
                .ReverseMap();

            CreateMap<Plant, PlantModel>()
                .ReverseMap();

        }
    }
}
