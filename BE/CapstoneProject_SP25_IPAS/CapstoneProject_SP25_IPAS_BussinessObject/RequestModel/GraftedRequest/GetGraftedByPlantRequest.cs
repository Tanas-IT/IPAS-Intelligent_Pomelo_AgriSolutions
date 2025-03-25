using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest
{
    public class GetGraftedByPlantRequest
    {
        // filter here
        public int PlantId { get; set; }

        public DateTime? GraftedDateFrom { get; set; }
        public DateTime? GraftedDateTo { get; set; }
    }
}
