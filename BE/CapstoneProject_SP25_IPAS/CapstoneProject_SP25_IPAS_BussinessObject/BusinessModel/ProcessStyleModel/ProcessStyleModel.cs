using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessStyleModel
{
    public class ProcessStyleModel
    {
        public int ProcessStyleId { get; set; }

        public string? ProcessStyleCode { get; set; }

        public string? ProcessStyleName { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public string? Description { get; set; }

    }
}
