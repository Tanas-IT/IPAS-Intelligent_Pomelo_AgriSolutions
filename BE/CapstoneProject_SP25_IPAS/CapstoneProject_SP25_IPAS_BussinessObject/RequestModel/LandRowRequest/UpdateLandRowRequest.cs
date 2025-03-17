using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandRowRequest
{
    public class UpdateLandRowRequest
    {
        [Required]
        public int LandRowId { get; set; }
        public int? RowIndex { get; set; }
        public int? TreeAmount { get; set; }
        public double? Distance { get; set; }
        public double? Length { get; set; }
        public double? Width { get; set; }
        public string? Direction { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
    }
}
