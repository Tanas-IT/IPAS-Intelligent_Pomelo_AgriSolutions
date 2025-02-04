using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel
{
    public class AddSubProcessModel
    {
        public string? SubProcessName { get; set; }

        public int? ParentSubProcessId { get; set; }

        public bool? IsDefault { get; set; }

        public bool? IsActive { get; set; }

        public int? MasterTypeId { get; set; }
    }
}
