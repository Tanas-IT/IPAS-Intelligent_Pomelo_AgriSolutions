using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest
{
    public class GroupingGraftedRequest
    {
        public List<int> graftedPlantIds { get; set; } = new List<int>();
        public int plantLotId { get; set; }
    }
}
