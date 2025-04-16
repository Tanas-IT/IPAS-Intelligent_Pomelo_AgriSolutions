using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel
{
    public class GetAdminDashBoardRequest
    {
        public int? YearRevenue { get; set; }
        public int? YearFarm { get; set; }
        public int? TopNNewestUser { get; set; }
        public int? TopNNewestOrder { get; set; }
        public int? TopNNewestFarm { get; set; }
    }
}
