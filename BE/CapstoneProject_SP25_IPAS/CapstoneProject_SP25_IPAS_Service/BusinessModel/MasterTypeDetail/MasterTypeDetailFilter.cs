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
        [FromQuery(Name = "filter-master-type-detail-name")]
        public string? MasterTypeDetailName { get; set; }
        [FromQuery(Name = "filter-master-type-name")]
        public string? MasterTypeName { get; set; }
        public string? Value { get; set; }
        [FromQuery(Name = "filter-type-of-value")]
        public string? TypeOfValue { get; set; }
        [FromQuery(Name = "filter-foreign-key-id")]
        public int? ForeignKeyId { get; set; }
        [FromQuery(Name = "filter-foreign-table")]
        public string? ForeignTable { get; set; }
    }
}
