using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class ResourceModel
    {
        public int ResourceID { get; set; }

        public string? ResourceCode { get; set; }

        public string? Description { get; set; }

        public string? ResourceType { get; set; }

        public string? ResourceURL { get; set; }

        public string? FileFormat { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }
    }
}
