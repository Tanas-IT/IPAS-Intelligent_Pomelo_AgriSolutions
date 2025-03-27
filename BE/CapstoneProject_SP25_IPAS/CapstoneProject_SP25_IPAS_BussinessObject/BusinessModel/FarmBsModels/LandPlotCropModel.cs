using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels
{
    public class LandPlotCropModel
    {
        public int CropID { get; set; }

        public int LandPlotID { get; set; }
        public string? LandPlotName { get; set; }

        public string? CropName { get; set; }

        public int? CropYear { get; set; }

        //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        //public CropModel Crop { get; set; } = null!;
        //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        //public LandPlotModel LandPlot { get; set; } = null!;
    }
}
