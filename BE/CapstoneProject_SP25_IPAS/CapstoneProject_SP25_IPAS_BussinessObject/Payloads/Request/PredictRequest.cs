using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request
{
    public class PredictRequest
    {
        [Required]
        public IFormFile Image { get; set; }
    }
}
