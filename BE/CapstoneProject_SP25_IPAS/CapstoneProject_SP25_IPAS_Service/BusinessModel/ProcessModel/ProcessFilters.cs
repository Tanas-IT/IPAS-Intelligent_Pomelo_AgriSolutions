using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel
{
    public class ProcessFilters
    {
        [FromQuery(Name = "filter-growth-stage")]
        public string? GrowthStage { get; set; }
        [FromQuery(Name = "filter-master-type")]
        public string? MasterType { get; set; }

        [FromQuery(Name = "filter-create-date-from")]
        public DateTime? createDateFrom { get; set; }
        [FromQuery(Name = "filter-create-date-to")]
        public DateTime? createDateTo { get; set; }
        [FromQuery(Name = "filter-is-active")]
        public bool? isActive { get; set; }
    }
}
