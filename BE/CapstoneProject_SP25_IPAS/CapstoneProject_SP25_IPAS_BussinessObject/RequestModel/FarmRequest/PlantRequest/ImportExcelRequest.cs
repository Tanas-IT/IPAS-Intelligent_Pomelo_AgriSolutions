using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest
{
    public class ImportExcelRequest
    {
        [Required]
        public IFormFile fileExcel {  get; set; }
        public bool skipDuplicate {  get; set; } = false;
    }
}
