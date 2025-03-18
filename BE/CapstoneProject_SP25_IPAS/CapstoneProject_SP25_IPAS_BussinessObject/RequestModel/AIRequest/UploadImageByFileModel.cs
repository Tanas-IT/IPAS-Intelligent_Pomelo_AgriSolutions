using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AIRequest
{
    public class UploadImageByFileModel
    {
        public List<IFormFile> FileImages { get; set; }
        public List<string> TagIds { get; set; }
    }
}
