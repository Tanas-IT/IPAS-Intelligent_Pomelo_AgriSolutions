using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ResourceRequest;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class CreateNoteModel
    {
        public int? UserId { get; set; }
        public int WorkLogId { get; set; }
        public string? Note { get; set; }
        public string? Issue { get; set; }
        public ICollection<ResourceCrUpRequest> Resources { get; set; } = new List<ResourceCrUpRequest>();
    }
}
