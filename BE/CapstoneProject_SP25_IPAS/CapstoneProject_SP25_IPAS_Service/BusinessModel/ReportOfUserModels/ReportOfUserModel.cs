using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportOfUserModels
{
    public class ReportOfUserModel
    {
        public int ReportID { get; set; }
        public string? ReportCode { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedDate { get; set; }
        public bool? IsTrainned { get; set; }
        public int? AnswererID { get; set; }
        public string? AnswererName { get; set; }
        public int? QuestionerID { get; set; }
        public string? QuestionerName { get; set; }
    }
}
