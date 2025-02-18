using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel
{
    public class UpdateProcessModel
    {
        public int ProcessId { get; set; }
        public string? ProcessName { get; set; }

        public bool? IsActive { get; set; }
        public bool? IsDefault { get; set; }

        public bool? IsDeleted { get; set; }

        public int? FarmId { get; set; }

        public int? MasterTypeId { get; set; }

        public int? GrowthStageID { get; set; }
        public int? Order { get; set; }

        [DefaultValue(new[] { "{SubProcessId: 0, SubProcessName: \"string\", ParentSubProcessId: 0, IsDefault: true, IsActive: true, ProcessStyleId: 0, Status: \"string\", Order: 0}" })]
        public List<string>? ListUpdateSubProcess { get; set; } = new List<string>();
        public IFormFile? UpdateProcessData { get; set; }
    }
}
