using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class LandRowModel
    {
        public int LandRowId { get; set; }

        public string? LandRowCode { get; set; }

        public int? RowIndex { get; set; }

        public int? TreeAmount { get; set; }

        public double? Distance { get; set; }

        public double? Length { get; set; }

        public double? Width { get; set; }

        public string? Direction { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public string? Status { get; set; }

        public string? Description { get; set; }

        public int? LandPlotId { get; set; }

        public string? LandPlotname { get; set; }
        //public virtual LandPlotModel? LandPlot { get; set; }

        //public virtual ICollection<PlantModel> Plants { get; set; } = new List<PlantModel>();
    }
}
