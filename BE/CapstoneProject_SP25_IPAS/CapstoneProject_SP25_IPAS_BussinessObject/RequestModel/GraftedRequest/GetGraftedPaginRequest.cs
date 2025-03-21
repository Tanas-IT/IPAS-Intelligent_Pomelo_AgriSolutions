using CapstoneProject_SP25_IPAS_Common.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest
{
    public class GetGraftedPaginRequest
    {
        public int? FarmId { get; set; }
        //public PaginationParameter paginationParameter { get; set; } = new PaginationParameter();

        // filter here
        public string? PlantIds { get; set; }

        //public string? GrowthStage { get; set; }
        public DateTime? SeparatedDateFrom { get; set; }
        public DateTime? SeparatedDateTo { get; set; }
        public string? Status { get; set; }
        public DateTime? GraftedDateFrom { get; set; }
        public DateTime? GraftedDateTo { get; set; }
        public string? PlantLotIds { get; set; }
        public string? CultivarIds { get; set; }
        public bool? IsCompleted { get; set; }
    }
}
