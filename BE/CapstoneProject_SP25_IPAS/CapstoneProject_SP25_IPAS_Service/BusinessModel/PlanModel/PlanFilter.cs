using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel
{
    public class PlanFilter
    {
        [FromQuery(Name = "filter-crop")]
        public string? CropName { get; set; }
        [FromQuery(Name = "filter-plan")]
        public string? PlanName { get; set; }
        [FromQuery(Name = "filter-assignor")]
        public string? AssignorName { get; set; }
        [FromQuery(Name = "filter-plan-detail")]
        public string? PlanDetail { get; set; }
        [FromQuery(Name = "filter-responsible-by")]
        public string? ResponsibleBy { get; set; }

        [FromQuery(Name = "filter-create-date-from")]
        public DateTime? createDateFrom { get; set; }
        [FromQuery(Name = "filter-create-date-to")]
        public DateTime? createDateTo { get; set; }
        [FromQuery(Name = "filter-is-active")]
        public bool? isActive { get; set; }
        [FromQuery(Name = "filter-is-delete")]
        public bool? isDelete { get; set; }
        [FromQuery(Name = "filter-status")]
        public string? Status { get; set; }
    }
}
