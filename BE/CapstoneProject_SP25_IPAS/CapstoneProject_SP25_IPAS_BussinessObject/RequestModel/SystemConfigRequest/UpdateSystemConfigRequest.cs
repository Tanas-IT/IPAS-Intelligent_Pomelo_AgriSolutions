using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.SystemConfigRequest
{
    public class UpdateSystemConfigRequest
    {
        public int? ConfigId { get; set; }

        public string? ConfigValue { get; set; } = null!;

        public bool? IsActive { get; set; } = true;

        public DateTime? EffectedDateFrom { get; set; }

        public DateTime? EffectedDateTo { get; set; }

        public string? Description { get; set; }

    }
}
