using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public class SystemConfiguration
    {
        public int? ConfigId { get; set; } 

        public string ConfigKey { get; set; } = null!; 

        public string ConfigValue { get; set; } = null!; 

        public string ValueType { get; set; } = null!; 

        public bool IsActive { get; set; } = true; 

        public bool? IsDeleteable { get; set; } = false; 

        public DateTime? EffectedDateFrom { get; set; } 

        public DateTime? EffectedDateTo { get; set; }

        public string? Description { get; set; } 

        public DateTime CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; } 
    }

}
