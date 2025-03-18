using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.GrowthStageModel
{
    public class CreateGrowthStageModel
    {
        public string? GrowthStageName { get; set; }
        //[Required]
        //public int? MonthAgeStart { get; set; }
        [Required]
        public int? MonthAgeEnd { get; set; }
        //public DateTime? CreateDate { get; set; }
        public string? Description { get; set; }
        public string? ActiveFunction { get; set; }
    }
}
