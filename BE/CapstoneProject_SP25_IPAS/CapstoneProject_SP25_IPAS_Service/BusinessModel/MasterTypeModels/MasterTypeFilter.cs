using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels
{
    public class MasterTypeFilter
    {
        [FromQuery(Name = "filter-create-by")]
        public string? CreateBy { get; set; }
        [FromQuery(Name = "filter-master-type-name")]
        public string? MasterTypeName { get; set; }
        [FromQuery(Name = "filter-type-name")]
        public string? TypeName { get; set; }

        [FromQuery(Name = "filter-create-date-from")]
        public DateTime? createDateFrom { get; set; }
        [FromQuery(Name = "filter-create-date-to")]
        public DateTime? createDateTo { get; set; }
        [FromQuery(Name = "filter-is-active")]
        public bool? isActive { get; set; }
        [FromQuery(Name = "filter-is-delete")]
        public bool? isDelete { get; set; }
    }
}
