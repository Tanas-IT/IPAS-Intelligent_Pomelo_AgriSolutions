using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel
{
    public class UpdatePlanModel
    {
        public int PlanId { get; set; }

        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool? IsActive { get; set; }

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
    }
}
