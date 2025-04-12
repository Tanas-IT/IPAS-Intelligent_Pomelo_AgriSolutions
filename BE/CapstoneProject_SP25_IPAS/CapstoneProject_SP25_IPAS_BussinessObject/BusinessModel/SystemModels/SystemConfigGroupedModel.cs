using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SystemModels
{
    public class SystemConfigGroupedModel
    {
        public string ConfigKey { get; set; } = null!;
        public string? ConfigGroup {  get; set; }
        public List<SystemConfigItemModel> ConfigValues { get; set; } = new();
    }
    public class SystemConfigItemModel
    {
        public int? ConfigId { get; set; }
        public string ConfigValue { get; set; } = null!;
        public string ValueType { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime? EffectedDateFrom { get; set; }
        public DateTime? EffectedDateTo { get; set; }
        public string? Description { get; set; }
        public DateTime CreateDate { get; set; }
        public bool? IsDeleteable { get; set; } = false;

        //public virtual ICollection<SystemConfiguration> DependentConfigurations { get; set; } = new List<SystemConfiguration>();
        public string? ReferenceConfigGroup { get; set; }
        public string? ReferenceConfigKey { get; set; }
        public string? ReferenceConfigValue { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual SystemConfigModel? ReferenceConfig { get; set; }
    }

}
