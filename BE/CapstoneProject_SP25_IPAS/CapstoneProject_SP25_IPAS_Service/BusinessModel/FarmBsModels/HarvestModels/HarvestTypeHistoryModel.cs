using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.HarvestModels
{
    public class HarvestTypeHistoryModel
    {
        public int HarvestTypeHistoryId { get; set; }

        public int MasterTypeId { get; set; }

        public int? PlantId { get; set; }

        public string? Unit { get; set; }

        public double? Price { get; set; }

        public int? Quantity { get; set; }

        public int HarvestHistoryId { get; set; }

        public string? ProductName { get; set; }

        public string? HarvestHistoryCode { get; set; }
        public string? ProcessName { get; set; }
        public int? ProcessId { get; set; }

        //public virtual HarvestHistoryModel HarvestHistory { get; set; } = null!;

        //public virtual MasterTypeModel MasterType { get; set; } = null!;

        //public virtual PlantModel? Plant { get; set; }
    }
}
