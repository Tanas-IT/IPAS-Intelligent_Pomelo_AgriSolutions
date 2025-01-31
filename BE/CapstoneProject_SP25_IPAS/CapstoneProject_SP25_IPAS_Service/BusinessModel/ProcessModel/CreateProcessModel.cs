using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel
{
    public class CreateProcessModel
    {
        public string? ProcessName { get; set; }

        public bool? IsActive { get; set; }

        public bool? IsDeleted { get; set; }

        public int? FarmId { get; set; }

        public int? MasterTypeId { get; set; }

        public int? GrowthStageID { get; set; }

        [DefaultValue(new[] { "{SubProcessName: \"string\", ParentSubProcessId: 0, IsDefault: true, IsActive: true, ProcessStyleId: 0}" })]
        public List<string>? ListSubProcess { get; set; }
        public IFormFile? ProcessData { get; set; }
    }
}
