using CapstoneProject_SP25_IPAS_Common.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantRequest
{
    public class GetPlantPaginRequest
    {
        public int? farmId { get; set; }
        public string? LandPlotIds { get; set; }
        public string? LandRowIds { get; set; }
        //[DefaultValue(true)]
        public bool? IsLocated { get; set; }
        //public PaginationParameter? paginationParameter { get; set; } = new PaginationParameter();
        public int? RowIndexFrom { get; set; }
        public int? RowIndexTo { get; set; }
        public int? PlantIndexFrom { get; set; }
        public int? PlantIndexTo { get; set; }
        public DateTime? PlantingDateFrom { get; set; }
        public DateTime? PlantingDateTo { get; set; }
        public string? HealthStatus { get; set; }
        public string? CultivarIds { get; set; }
        public string? GrowthStageIds { get; set; }
        public bool? IsDead { get; set; }
    }
}
