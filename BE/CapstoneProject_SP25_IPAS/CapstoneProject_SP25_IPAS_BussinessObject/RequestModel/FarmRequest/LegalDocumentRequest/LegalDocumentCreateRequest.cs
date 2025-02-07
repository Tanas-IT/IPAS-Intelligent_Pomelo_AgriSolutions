using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.ResourceRequest;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LegalDocumentRequest
{
    public class LegalDocumentCreateRequest
    {
        public string? LegalDocumentType { get; set; }

        public string? LegalDocumentName { get; set; }

        public string? LegalDocumentURL { get; set; }

        public DateTime? IssueDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public ICollection<ResourceCrUpRequest> Resources { get; set; } = new List<ResourceCrUpRequest>();

    }
}
