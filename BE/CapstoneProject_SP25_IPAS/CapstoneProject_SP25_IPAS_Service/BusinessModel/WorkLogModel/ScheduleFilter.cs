using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel
{
    public class ScheduleFilter
    {
        [FromQuery(Name = "workDateFrom")]
        public DateTime? FromDate { get; set; }
        [FromQuery(Name = "workDateTo")]
        public DateTime? ToDate { get; set; }

        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
            ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        [FromQuery(Name = "fromTime")]
        public string? FromTime { get; set; }

        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
            ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        [FromQuery(Name = "toTime")]
        public string? ToTime { get; set; }

        [FromQuery(Name = "typePlan")]
        public string? TypePlan { get; set; }
        [FromQuery(Name = "employees")]
        public string? Assignee { get; set; }
        [FromQuery(Name = "status")]
        public string? Status { get; set; }
        [FromQuery(Name = "growthStage")]
        public string? GrowthStage { get; set; }
    }
}
