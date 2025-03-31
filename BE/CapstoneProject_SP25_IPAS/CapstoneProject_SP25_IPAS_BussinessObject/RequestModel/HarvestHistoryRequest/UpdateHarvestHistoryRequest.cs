using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ScheduleRequest;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest
{
    public class UpdateHarvestHistoryRequest
    {
        [Required]
        public int HarvestHistoryId { get; set; }

        public DateTime? DateHarvest { get; set; }

        public string? HarvestHistoryNote { get; set; }

        public double? TotalPrice { get; set; }

        public string? HarvestStatus { get; set; }
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
       ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        public string? StartTime { get; set; }
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
           ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        public string? EndTime { get; set; }
        //public ChangeTimeOfScheduleModel UpdateSchedule { get; set; }
    }
}
