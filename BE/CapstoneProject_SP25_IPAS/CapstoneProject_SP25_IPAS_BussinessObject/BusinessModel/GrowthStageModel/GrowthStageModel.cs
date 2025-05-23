﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.GrowthStageModel
{
    public class GrowthStageModel
    {
        public int GrowthStageId { get; set; }

        public string? GrowthStageCode { get; set; }

        public string? GrowthStageName { get; set; }

        public int? MonthAgeStart { get; set; }

        public int? MonthAgeEnd { get; set; }
        public bool? isDefault { get; set; }
        public bool? isDeleted { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? Description { get; set; }
        public string? FarmName { get; set; }
        public string? FarmId { get; set; }
        public string? ActiveFunction { get; set; }
    }
}
