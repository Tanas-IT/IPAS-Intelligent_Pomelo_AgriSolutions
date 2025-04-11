using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel
{
    public class WorkPerformanceResponseDto
    {
        public int EmployeeId { get; set; }
        public string Name { get; set; } = null!;
        public double Score { get; set; }
        public int TaskSuccess { get; set; }
        public int TaskFail { get; set; }
        public int TotalTask { get; set; }
        public string Avatar { get; set; }
    }
}
