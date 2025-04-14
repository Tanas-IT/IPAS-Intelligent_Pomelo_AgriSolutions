using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class CreateNoteModelUseFile
    {
        public int? UserId { get; set; }
        public int WorkLogId { get; set; }
        public string? Note { get; set; }
        public string? Issue { get; set; }
        public List<IFormFile>? Resources { get; set; }
    }
}
