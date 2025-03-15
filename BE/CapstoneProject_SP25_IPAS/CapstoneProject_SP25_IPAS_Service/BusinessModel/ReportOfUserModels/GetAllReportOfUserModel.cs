using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportOfUserModels
{
    public class GetAllReportOfUserModel
    {
        public string? Search {  get; set; }
        public string? SortBy { get; set; }
        public string? Direction { get; set; }
    }
}
