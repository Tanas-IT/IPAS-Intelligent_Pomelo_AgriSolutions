using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeDetail
{
    public class MasterTypeDetailFilter
    {
        [FromQuery(Name = "masterTypeDetailName")]
        public string? MasterTypeDetailName { get; set; }
        [FromQuery(Name = "masterTypeName")]
        public string? MasterTypeName { get; set; }
        public string? Value { get; set; }
        [FromQuery(Name = "typeOfValue")]
        public string? TypeOfValue { get; set; }
        [FromQuery(Name = "foreignKeyId")]
        public int? ForeignKeyId { get; set; }
        [FromQuery(Name = "foreignTable")]
        public string? ForeignTable { get; set; }
    }
}
