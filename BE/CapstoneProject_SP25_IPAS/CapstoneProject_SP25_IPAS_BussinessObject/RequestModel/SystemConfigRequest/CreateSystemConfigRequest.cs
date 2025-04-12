using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.SystemConfigRequest
{
    public class CreateSystemConfigRequest
    {

        public string ConfigKey { get; set; }
        public string? ConfigGroup { get; set; }

        public string? ConfigValue { get; set; } 

        //public string ValueType { get; set; } = null!;

        public DateTime? EffectedDateFrom { get; set; }

        public DateTime? EffectedDateTo { get; set; }

        public string? Description { get; set; }

        public int? ReferenceKeyId { get; set; }

    }
}
