using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public class Resource
    {
        public int ResourceID { get; set; }

        public string? ResourceCode { get; set; }

        public string? Description { get; set; }

        public string? ResourceType { get; set; }

        public string? ResourceURL { get; set; }

        public string? FileFormat { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public int? WorkLogID { get; set; }
        public int? LegalDocumentID { get; set; }
        public int? GraftedPlantID { get; set; }
        public int? PlantGrowthHistoryID { get; set; }

        public virtual WorkLog? WorkLog { get; set; }
        public virtual LegalDocument? LegalDocument { get; set; }
        public virtual GraftedPlant? GraftedPlant { get; set; }
        public virtual PlantGrowthHistory? PlantGrowthHistory { get; set; }
    }
}
