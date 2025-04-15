using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportOfUserModels
{
    public class ReportOfUserModel
    {
        public int ReportID { get; set; }
        public string? ReportCode { get; set; }
        public string? Description { get; set; }
        public string? ImageURL { get; set; }
        public string? AvatarOfQuestioner { get; set; }
        public string? AvatarOfAnswer { get; set; }
        public DateTime? CreatedDate { get; set; }
        public bool? IsTrainned { get; set; }
        public int? AnswererID { get; set; }
        public string? AnswererName { get; set; }
        public int? QuestionerID { get; set; }
        public string? QuestionerName { get; set; }
        public string? QuestionOfUser { get; set; }
        public string? AnswerFromExpert { get; set; }
    }
}
