using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel
{
    public class LandRowFilterModel
    {
        public int LandRowId { get; set; }

        public string? LandRowCode { get; set; }

        public int? RowIndex { get; set; }

        public int? TreeAmount { get; set; }


        public List<PlantFilterModel> Plants { get; set; } = new List<PlantFilterModel>();
    }
}
