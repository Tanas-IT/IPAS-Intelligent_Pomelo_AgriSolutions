using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class LegalDocument
    {
        public int LegalDocumentId { get; set; }

        public string? LegalDocumentCode { get; set; }

        public string? LegalDocumentType { get; set; }

        public string? LegalDocumentName { get; set; }

        public string? LegalDocumentURL { get; set; }

        public DateTime? IssueDate { get; set; }

        public DateTime? ExpiredDate { get; set; }

        public string? Status { get; set; }

        public DateTime? CreateAt { get; set; }

        public DateTime? UpdateAt { get; set; }

        public int? FarmId { get; set; }

        public virtual Farm? Farm { get; set; }
        public virtual ICollection<Resource> Resources { get; set; } = new List<Resource>();
    }
}
