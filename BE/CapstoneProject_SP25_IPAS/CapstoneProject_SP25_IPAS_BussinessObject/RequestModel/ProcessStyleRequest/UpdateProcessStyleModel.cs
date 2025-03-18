using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ProcessStyleRequest
{
    public class UpdateProcessStyleModel
    {
        public int ProcessStyleId { get; set; }

        public string? ProcessStyleName { get; set; }

        public string? Description { get; set; }

    }
}
