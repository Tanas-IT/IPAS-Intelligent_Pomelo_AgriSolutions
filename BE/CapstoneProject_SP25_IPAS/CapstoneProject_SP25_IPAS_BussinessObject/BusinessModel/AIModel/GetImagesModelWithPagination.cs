using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel
{
    public class GetImagesModelWithPagination
    {
        [FromQuery(Name = "taggingStatus")]
        public string? TaggingStatus { get; set; }
        [FromQuery(Name = "filter")]
        public string? Filter { get; set; }
        [FromQuery(Name = "orderBy")]
        public string? OrderBy { get; set; }
        [FromQuery(Name = "pageIndex")]
        public int? PageIndex { get; set; } = 1;
        [FromQuery(Name = "pageSize")]
        public int? PageSize { get; set; } = 50;
    }
}
