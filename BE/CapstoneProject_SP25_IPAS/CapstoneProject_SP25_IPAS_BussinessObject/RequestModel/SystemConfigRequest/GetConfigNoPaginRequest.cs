using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.SystemConfigRequest
{
    public class GetConfigNoPaginRequest
    {
        public string? ConfigGroups { get; set; }
        public string? ConfigKeys { get; set; }

        public string? ConfigValue { get; set; }

        public bool? IsActive { get; set; }

        public DateTime? EffectedDateFrom { get; set; }

        public DateTime? EffectedDateTo { get; set; }

        public string? Description { get; set; }
        public string? Search {  get; set; }
        public string? SortBy { get; set; }
        public string? Direction { get; set; } = "desc";
    }
}
