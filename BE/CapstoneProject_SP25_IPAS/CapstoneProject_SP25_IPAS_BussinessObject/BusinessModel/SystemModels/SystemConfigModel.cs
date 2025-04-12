using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SystemModels
{
    public class SystemConfigModel
    {
        public int? ConfigId { get; set; }
        public string? ConfigGroup { get; set; }

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
        public int? ReferenceConfigID { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual ICollection<SystemConfigModel> DependentConfigurations { get; set; } = new List<SystemConfigModel>();
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual SystemConfigModel? ReferenceConfig { get; set; }
    }
}
