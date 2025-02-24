using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportModel
{
    public class WorkProgressOverview
    {
        public string? TaskName { get; set; }
        public string? Status { get; set; }
        public DateTime? DueDate { get; set; }
        public List<EmployeeWorkProgressModel>? listEmployee { get; set; }
        public int? TaskId { get; set; }
    }

    public class EmployeeWorkProgressModel
    {
        public int? UserId { get; set; }
        public string? FullName { get; set; }
        public string? AvatarURL { get; set; }
        public bool? IsReporter { get; set; }
    }
}
