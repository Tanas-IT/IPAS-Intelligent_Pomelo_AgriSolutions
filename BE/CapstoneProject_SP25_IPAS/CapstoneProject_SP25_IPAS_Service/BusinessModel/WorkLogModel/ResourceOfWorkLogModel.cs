using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel
{
    public class ResourceOfWorkLogModel
    {
        public int ResourceID { get; set; }

        public string? ResourceCode { get; set; }

        public string? Description { get; set; }

        public string? ResourceType { get; set; }

        public string? ResourceURL { get; set; }

    }
}
