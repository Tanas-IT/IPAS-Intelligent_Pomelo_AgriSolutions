using CapstoneProject_SP25_IPAS_Common.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandRowRequest
{
    public class GetPlantRowPaginRequest
    {
        [Required]
        public int LandPlotId { get; set; }
        //public PaginationParameter paginationParameter { get; set; } = new PaginationParameter();
        public int? RowIndexFrom { get; set; }
        public int? RowIndexTo { get; set; }
        public int? TreeAmountFrom { get; set; }
        public int? TreeAmountTo { get; set; }
        public string? Direction { get; set; }
        public string? Status { get; set; }
    }
}
