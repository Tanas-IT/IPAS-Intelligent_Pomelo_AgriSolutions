using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageModel
{
    public class UpdateGrowthStageModel
    {
        public int GrowthStageId { get; set; }

        public string? GrowthStageName { get; set; }

        public int? MonthAgeStart { get; set; }
        public int? MonthAgeEnd { get; set; }
        //public bool? isDefault { get; set; }
        //public bool? isDeleted { get; set; }
        public string? Description { get; set; }
        public int? FarmId { get; set; }
        public string? ActiveFunction { get; set; }
    }
}
