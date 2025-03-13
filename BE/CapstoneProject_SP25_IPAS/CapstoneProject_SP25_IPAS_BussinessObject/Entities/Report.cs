using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class Report
    {
        public int ReportID { get; set; }
        public string? ReportCode { get; set; }
        public string? Description { get; set; }
        public int? AnswererID { get; set; }
        public int? QuesttionerID { get; set ; }

        public virtual User? Answerer { get; set; }
        public virtual User? Questioner { get; set; }
    }
}
