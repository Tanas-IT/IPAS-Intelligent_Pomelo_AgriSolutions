using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels
{
    public class MasterTypeFilter
    {
       
        [FromQuery(Name = "typeName")]
        public string? TypeName { get; set; }

        [FromQuery(Name = "createDatefrom")]
        public DateTime? createDateFrom { get; set; }
        [FromQuery(Name = "createDateTo")]
        public DateTime? createDateTo { get; set; }
       
    }
}
