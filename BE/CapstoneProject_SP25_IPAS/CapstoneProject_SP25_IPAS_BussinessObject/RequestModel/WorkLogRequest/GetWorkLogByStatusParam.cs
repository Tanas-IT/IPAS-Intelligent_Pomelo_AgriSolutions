using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class GetWorkLogByStatusParam
    {
        public int UserId { get; set; }
        public string Status {  get; set; }
    }
}
