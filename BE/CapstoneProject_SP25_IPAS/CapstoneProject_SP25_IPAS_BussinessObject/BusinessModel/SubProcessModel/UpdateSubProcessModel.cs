using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SubProcessModel
{
    public class UpdateSubProcessModel
    {
        public int SubProcessId { get; set; }
        public string? SubProcessName { get; set; }

        public int? ParentSubProcessId { get; set; }

        public bool? IsDefault { get; set; }

        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int? ProcessId { get; set; }
        public int? MasterTypeId { get; set; }
    }
}
