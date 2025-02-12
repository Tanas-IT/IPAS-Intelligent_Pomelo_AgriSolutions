using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public class LandPlotCrop
    {
        public int CropID { get; set; }

        public int LandPlotId { get; set; }

        public virtual Crop Crop { get; set; } = null!;

        public virtual LandPlot LandPlot { get; set; } = null!;
    }
}
