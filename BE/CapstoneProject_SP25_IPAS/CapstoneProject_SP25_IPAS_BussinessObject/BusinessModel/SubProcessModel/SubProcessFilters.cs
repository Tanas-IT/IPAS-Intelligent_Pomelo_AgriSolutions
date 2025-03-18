using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SubProcessModel
{
    public class SubProcessFilters
    {
        [FromQuery(Name = "processName")]
        public string? ProcessName { get; set; }
        [FromQuery(Name = "masterType")]
        public string? MasterType { get; set; }

        [FromQuery(Name = "createDateFrom")]
        public DateTime? createDateFrom { get; set; }
        [FromQuery(Name = "createDateTo")]
        public DateTime? createDateTo { get; set; }
        [FromQuery(Name = "isActive")]
        public bool? isActive { get; set; }
    }
}
