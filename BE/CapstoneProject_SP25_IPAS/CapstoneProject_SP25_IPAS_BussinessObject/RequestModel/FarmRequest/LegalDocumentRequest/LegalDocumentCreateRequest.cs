using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ResourceRequest;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LegalDocumentRequest
{
    public class LegalDocumentCreateRequest
    {
        public int? FarmId { get; set; }
        [Required]
        public string? LegalDocumentType { get; set; }
        [Required]
        public string? LegalDocumentName { get; set; }

        public string? LegalDocumentURL { get; set; }

        public DateTime? IssueDate { get; set; }

        public DateTime? ExpiredDate { get; set; }
        public List<ResourceCrUpRequest> Resources { get; set; } = new List<ResourceCrUpRequest>();

    }
}
