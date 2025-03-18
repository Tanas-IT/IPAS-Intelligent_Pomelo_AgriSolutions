using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.MasterTypeRequest
{
    public class MasterTypeFilter
    {
        //[FromQuery(Name = "createBy")]
        //public string? CreateBy { get; set; }
        [FromQuery(Name = "masterTypeName")]
        public string? MasterTypeName { get; set; }
        [FromQuery(Name = "typeName")]
        public string? TypeName { get; set; }

        [FromQuery(Name = "createDatefrom")]
        public DateTime? createDateFrom { get; set; }
        [FromQuery(Name = "createDateTo")]
        public DateTime? createDateTo { get; set; }
        [FromQuery(Name = "isActive")]
        public bool? isActive { get; set; }
        //[FromQuery(Name = "isDelete")]
        //public bool? isDelete { get; set; }
    }
}
