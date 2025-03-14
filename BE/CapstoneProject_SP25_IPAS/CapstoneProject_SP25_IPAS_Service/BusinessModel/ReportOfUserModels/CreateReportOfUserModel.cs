using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportOfUserModels
{
    public class CreateReportOfUserModel
    {
        public string? Description { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? AnswererID { get; set; }
        public int? QuestionerID { get; set; }
    }
}
