﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest
{
    public class CompletedGraftedPlantRequest
    {
        public int GraftedPlantId { get; set; }
        public int? FarmId { get; set; }
        public int? PlantLotId { get; set; }
    }
}
