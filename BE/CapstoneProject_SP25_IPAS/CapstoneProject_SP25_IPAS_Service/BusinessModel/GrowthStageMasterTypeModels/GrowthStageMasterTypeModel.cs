using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageMasterTypeModels
{
    public class GrowthStageMasterTypeModel
    {
        public int GrowthStageMasterTypeID { get; set; }
        public int? GrowthStageID { get; set; }
        public string? GrowthStageName { get; set; }
        public int? MasterTypeID { get; set; }
        public string? MasterTypeName { get; set; }
    }
}
