using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class UpdateStatusWorkLogModel
    {
        public int? WorkLogId { get; set; }
        public string? Status { get; set; }
        public int? UserId { get; set; }
    }
}
