using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel
{
    public class PlanFilter
    {
        [FromQuery(Name = "crop")]
        public string? CropName { get; set; }
        [FromQuery(Name = "plan")]
        public string? PlanName { get; set; }
        [FromQuery(Name = "assignor")]
        public string? AssignorName { get; set; }
        [FromQuery(Name = "planDetail")]
        public string? PlanDetail { get; set; }
        [FromQuery(Name = "responsibleBy")]
        public string? ResponsibleBy { get; set; }

        [FromQuery(Name = "createDateFrom")]
        public DateTime? createDateFrom { get; set; }
        [FromQuery(Name = "createDateTo")]
        public DateTime? createDateTo { get; set; }
        [FromQuery(Name = "isActive")]
        public bool? isActive { get; set; }
        [FromQuery(Name = "isDelete")]
        public bool? isDelete { get; set; }
        [FromQuery(Name = "status")]
        public string? Status { get; set; }

        [FromQuery(Name = "growStages")]
        public string? GrowStages { get; set; }
        [FromQuery(Name = "processTypes")]
        public string? ProcessTypes { get; set; }
    }
}
