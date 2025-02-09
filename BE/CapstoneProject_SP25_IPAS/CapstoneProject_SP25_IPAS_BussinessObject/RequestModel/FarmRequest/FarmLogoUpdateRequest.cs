using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest
{
    public class FarmLogoUpdateRequest
    {
        public int? FarmId { get; set; }
        [Required]
        public IFormFile FarmLogo { get; set; }
    }
}
