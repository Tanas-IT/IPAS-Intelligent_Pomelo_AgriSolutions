using CapstoneProject_SP25_IPAS_Common.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest
{
    public class GetPlantPaginRequest
    {
        public int? farmId { get; set; }
        public int? LandPlotId { get; set;}
        public List<int> LandRowIds { get; set; } = new List<int>();
        //[DefaultValue(true)]
        public bool? IsLocated { get; set; }
        //public PaginationParameter? paginationParameter { get; set; } = new PaginationParameter();
        public int? RowIndexFrom { get; set; }
        public int? RowIndexTo { get; set; }
        public int? PlantIndexFrom { get; set; }
        public int? PlantIndexTo { get;set; }
        public DateTime? PlantingDateFrom { get; set; }
        public DateTime? PlantingDateTo { get; set; }
        public string? HealthStatus { get; set; }
        public List<int> CultivarIds { get; set; } = new List<int>();
        public List<int> GrowthStageIds { get; set; } = new List<int>();
    }
}
