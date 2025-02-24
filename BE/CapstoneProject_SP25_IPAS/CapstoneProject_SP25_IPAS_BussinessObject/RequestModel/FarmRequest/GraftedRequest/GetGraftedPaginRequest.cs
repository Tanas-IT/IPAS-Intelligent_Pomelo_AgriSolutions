using CapstoneProject_SP25_IPAS_Common.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.GraftedRequest
{
    public class GetGraftedPaginRequest
    {
        [Required]
        public int PlantId { get; set; }
        public PaginationParameter paginationParameter { get; set; } = new PaginationParameter();

        // filter here
        public string? GrowthStage { get; set; }

        public DateTime? SeparatedDateFrom { get; set; }
        public DateTime? SeparatedDateTo { get; set; }

        public string? Status { get; set; }

        public DateTime? GraftedDateFrom { get; set; }
        public DateTime? GraftedDateTo { get; set; }

        public int? PlantLotId { get; set; }

    }
}
