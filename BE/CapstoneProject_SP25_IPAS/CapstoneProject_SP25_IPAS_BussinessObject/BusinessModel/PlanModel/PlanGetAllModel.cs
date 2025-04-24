using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel
{
    public class PlanGetAllModel
    {
        public int PlanId { get; set; }
        public string? Status { get; set; }
        public bool? IsActive { get; set; }

        public string? PlanName { get; set; }

        public string? PlanCode { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? Frequency { get; set; }
        public string? PlanDetail { get; set; }

        public List<ForSelectedModels>? GrowthStages { get; set; }
        public string? Progress { get; set; }
    }
}
