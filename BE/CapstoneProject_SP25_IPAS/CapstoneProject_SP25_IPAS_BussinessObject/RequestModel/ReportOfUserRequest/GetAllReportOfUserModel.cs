using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportOfUserRequest
{
    public class GetAllReportOfUserModel
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public string? Direction { get; set; }
        public bool? IsTrainned { get; set; }
    }
}
