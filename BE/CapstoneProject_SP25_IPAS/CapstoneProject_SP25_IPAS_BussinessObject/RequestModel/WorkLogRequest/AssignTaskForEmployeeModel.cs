using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class AssignTaskForEmployeeModel
    {
        public int userId {  get; set; }
        public int workLogId { get; set; }
        public bool? isRepoter { get; set; }
    }
}
