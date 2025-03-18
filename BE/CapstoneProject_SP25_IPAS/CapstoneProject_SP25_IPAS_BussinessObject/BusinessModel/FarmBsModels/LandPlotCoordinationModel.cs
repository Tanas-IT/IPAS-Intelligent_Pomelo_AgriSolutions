using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels
{
    public class LandPlotCoordinationModel
    {
        public int LandPlotCoordinationId { get; set; }

        public string? LandPlotCoordinationCode { get; set; }

        public double? Longitude { get; set; }

        public double? Latitude { get; set; }

        public int? LandPlotId { get; set; }
    }
}
