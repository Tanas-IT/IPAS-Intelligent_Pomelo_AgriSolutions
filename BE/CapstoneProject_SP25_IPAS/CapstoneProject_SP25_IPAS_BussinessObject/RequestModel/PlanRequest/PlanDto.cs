using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest
{
    public class PlanDto
    {
        public int? PlanId { get; set; }
        public string? PlanName { get; set; }
        public string? PlanNote { get; set; }
        public string? PlanDetail { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsSelected { get; set; }
    }

    public class SubProcessDto
    {
        public int SubProcessID { get; set; }
        public string? SubProcessName { get; set; }
        public int? Order { get; set; }
        public int? ParentSubProcessID { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<PlanDto>? Plans { get; set; }
        public List<SubProcessDto> Children { get; set; } = new();
    }

    public class ProcessDto
    {
        public int? ProcessId { get; set; }
        public string? ProcessName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? Order { get; set; }
        public List<PlanDto>? Plans { get; set; }
        public List<SubProcessDto>? SubProcesses { get; set; }
    }
    public class ProcessWithDetailsDto
    {
        public int? ProcessId { get; set; }
        public string? ProcessName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? Order { get; set; }
        public List<PlanDto>? Plans { get; set; }
        public List<SubProcessDto>? SubProcesses { get; set; }
    }
}
