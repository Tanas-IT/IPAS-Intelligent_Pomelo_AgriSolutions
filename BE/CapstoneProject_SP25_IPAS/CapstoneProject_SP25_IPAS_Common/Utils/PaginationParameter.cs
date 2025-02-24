using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Common.Utils
{
    public class PaginationParameter
    {
        [FromQuery(Name = "pageIndex")]
        public int PageIndex { get; set; } = 1;
        [FromQuery(Name = "pageSize")]
        public int PageSize { get; set; } = 5;
        [FromQuery(Name = "searchKey")]
        public string? Search { get; set; }
        [FromQuery(Name = "sortBy")]
        public string? SortBy { get; set; }
        [FromQuery(Name = "direction")]
        public string? Direction { get; set; } = "desc";

    }
}
