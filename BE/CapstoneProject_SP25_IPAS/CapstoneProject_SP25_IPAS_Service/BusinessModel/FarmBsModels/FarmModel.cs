using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class FarmModel
    {
        public int FarmId { get; set; }

        public string? FarmCode { get; set; }

        public string? FarmName { get; set; }

        public string? Address { get; set; }

        public string? LogoUrl { get; set; }

        public double? Area { get; set; }

        public string? SoilType { get; set; }

        public string? ClimateZone { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public bool? IsDelete { get; set; }

        public string? Status { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }

        public double? Length { get; set; }

        public double? Width { get; set; }

        public string? Description { get; set; }

        public double? Longitude { get; set; }

        public double? Latitude { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public UserModel? Owner { get; set; }

        //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        //public ICollection<FarmCoordinationModel> FarmCoordinations { get; set; } = new List<FarmCoordinationModel>();
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public ICollection<LandPlotModel> LandPlots { get; set; } = new List<LandPlotModel>();

        //public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

        //public virtual ICollection<Process> Processes { get; set; } = new List<Process>();

        //public ICollection<UserFarmModel> UserFarms { get; set; } = new List<UserFarmModel>();
    }
}

