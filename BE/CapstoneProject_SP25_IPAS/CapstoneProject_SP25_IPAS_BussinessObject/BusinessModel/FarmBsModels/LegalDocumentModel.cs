using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels
{
    public class LegalDocumentModel
    {
        public int LegalDocumentId { get; set; }

        public string? LegalDocumentCode { get; set; }

        public string? LegalDocumentType { get; set; }

        public string? LegalDocumentName { get; set; }

        public string? LegalDocumentURL { get; set; }

        public DateTime? IssueDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public string? Status { get; set; }

        public DateTime? CreateAt { get; set; }

        public DateTime? UpdateAt { get; set; }

        public int? FarmId { get; set; }

        public string? FarmName { get; set; }

        public ICollection<ResourceModel> Resources { get; set; } = new List<ResourceModel>();

    }
}
