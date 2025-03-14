using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class LandPlotModel
    {
        public int LandPlotId { get; set; }

        public string? LandPlotCode { get; set; }

        public string? LandPlotName { get; set; }

        public double? Area { get; set; }

        public double? Length { get; set; }

        public double? Width { get; set; }

        public string? SoilType { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public string? Status { get; set; }

        public string? Description { get; set; }

        public int? FarmId { get; set; }

        public string? TargetMarket { get; set; }
        public double? FarmLongtitude { get; set; }
        public double? FarmLatitude { get; set; }
        public int? RowPerLine { get; set; }
        public double? RowSpacing { get; set; }
        public bool? IsRowHorizontal { get; set; }
        public double? LineSpacing { get; set; }
        public int? NumberOfRows { get; set; }
        public double? MinLength { get; set; }
        public double? MaxLength { get; set; }
        public double? MinWidth { get; set; }
        public double? MaxWidth { get; set; }
        public int? EmptySlot { get; set; }
        //public virtual ICollection<Crop> Crops { get; set; } = new List<Crop>();

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual ICollection<LandPlotCoordinationModel> LandPlotCoordinations { get; set; } = new List<LandPlotCoordinationModel>();

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public ICollection<LandRowModel> LandRows { get; set; } = new List<LandRowModel>();

        //public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();

        //public virtual ICollection<LandPlotCrop> LandPlotCrops { get; set; } = new List<LandPlotCrop>();
    }
}
