using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel
{
    public class CreatePlanModel
    {
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
        public bool? IsActive { get; set; }
        public string? PlanName { get; set; }

        public string? Notes { get; set; }

        public string? PlanDetail { get; set; }

        public string? ResponsibleBy { get; set; }

        public string? Frequency { get; set; }

        public int? PlantId { get; set; }

        public int? LandPlotId { get; set; }

        public int? AssignorId { get; set; }

        public string? PesticideName { get; set; }

        public double? MaxVolume { get; set; }

        public double? MinVolume { get; set; }

        public int? ProcessId { get; set; }

        public int? CropId { get; set; }

        public int? GrowthStageId { get; set; }

        public int? PlantLotId { get; set; }

        public bool? IsDelete { get; set; }

        public int? MasterTypeId { get; set; }
        public List<int>? DayOfWeek { get; set; }
        public List<int>? DayOfMonth { get; set; }
        public List<DateTime>? CustomDates { get; set; }
        public List<EmployeeModel> ListEmployee { get; set; } = new List<EmployeeModel>();

        [Required]
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
            ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        public string StartTime { get; set; }

        [Required]
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
            ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        public string EndTime { get; set; }
    }
}
