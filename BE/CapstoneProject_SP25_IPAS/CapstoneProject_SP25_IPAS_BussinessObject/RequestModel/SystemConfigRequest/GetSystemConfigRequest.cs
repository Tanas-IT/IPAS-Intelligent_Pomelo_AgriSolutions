using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.SystemConfigRequest
{
    public class GetSystemConfigRequest
    {
        public string? ConfigKeys { get; set; }

        public string? ConfigValue { get; set; }

        public bool? IsActive { get; set; }

        public DateTime? EffectedDateFrom { get; set; }

        public DateTime? EffectedDateTo { get; set; }

        public string? Description { get; set; }
    }
}
