using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SubProcessModel
{
    public class SubProcessModel
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

        public string? ProcessName { get; set; }

        public string? MasterTypeName { get; set; }
        public string? ResourceUrl { get; set; }

        public string? Input { get; set; }

        public List<SubProcessModel>? listChildSubProcess { get; set; }

        //public virtual ICollection<ProcessDataInSubProcessModel> ListSubProcessData { get; set; } = new List<ProcessDataInSubProcessModel>();

    }
}
