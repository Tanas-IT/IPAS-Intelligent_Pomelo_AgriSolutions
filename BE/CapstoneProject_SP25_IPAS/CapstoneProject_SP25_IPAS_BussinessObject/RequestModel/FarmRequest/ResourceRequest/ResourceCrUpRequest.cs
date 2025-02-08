using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ResourceRequest
{
    public class ResourceCrUpRequest
    {
        public int? ResourceID { get; set; }
        public string? Description { get; set; }
        public string? ResourceURL { get; set; }
        public string? FileFormat { get; set; }
        public IFormFile? File { get; set; }
    }
}
