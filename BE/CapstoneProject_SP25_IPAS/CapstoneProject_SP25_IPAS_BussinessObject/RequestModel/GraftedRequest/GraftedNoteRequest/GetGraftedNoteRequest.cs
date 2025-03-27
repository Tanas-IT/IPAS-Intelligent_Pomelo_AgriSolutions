using CapstoneProject_SP25_IPAS_Common.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest.GraftedNoteRequest
{
    public class GetGraftedNoteRequest
    {
        public int GraftedPlantId { get; set; }

        public DateTime? CreateFrom { get; set; }
        public DateTime? CreateTo { get; set; }

    }
}
