﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel
{
    public class CreatePlantLotModel
    {
        public int PartnerId { get; set; }
        public string Name { get; set; }
        public int ImportedQuantity { get; set; }
        public string Unit { get; set; }

        public string? Note { get; set; } = "";
    }
}
