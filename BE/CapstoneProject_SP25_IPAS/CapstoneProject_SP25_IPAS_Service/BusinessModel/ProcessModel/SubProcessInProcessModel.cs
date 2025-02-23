using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel
{
    public class SubProcessInProcessModel
    {
        public int SubProcessId { get; set; }

        public string? SubProcessCode { get; set; }

        public string? SubProcessName { get; set; }

        public int? ParentSubProcessId { get; set; }

        public bool? IsDefault { get; set; }

        public bool? IsActive { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public bool? IsDeleted { get; set; }

        public int? ProcessId { get; set; }

        public int? ProcessStyleId { get; set; }

        public int? Order {  get; set; }

        public List<UpdatePlanInProcessModel>? ListPlan { get; set; } = new List<UpdatePlanInProcessModel>();
        //public List<ProcessDataInProcessModel>? ListSubProcessData { get; set; } = new List<ProcessDataInProcessModel>();
    }
}
