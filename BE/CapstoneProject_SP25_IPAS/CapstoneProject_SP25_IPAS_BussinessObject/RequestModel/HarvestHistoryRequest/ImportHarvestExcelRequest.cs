using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest
{
    public class ImportHarvestExcelRequest
    {
        [Required]
        public IFormFile fileExcel { get; set; }
        //public bool skipDuplicate { get; set; } = false;
        public int? harvestId { get; set; }
        public int? userId { get; set; }
    }
}
