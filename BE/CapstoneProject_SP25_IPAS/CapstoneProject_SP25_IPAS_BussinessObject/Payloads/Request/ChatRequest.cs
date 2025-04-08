using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request
{
    public class ChatRequest
    {
        public int? farmId { get; set; }
        public int? userId { get; set; }
        public string Question { get; set; }
        public int? RoomId { get; set; }
        public List<IFormFile>? Resource { get; set; }
    }
}
