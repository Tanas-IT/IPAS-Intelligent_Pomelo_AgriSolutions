using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportOfUserRequest
{
    public class UpdateReportOfUserModel
    {
        public int ReportID { get; set; }
        public string? Description { get; set; }
        public IFormFile? ImageFile { get; set; }
        public bool? IsTrainned { get; set; }
        public int? AnswererID { get; set; }
        public int? QuestionerID { get; set; }
    }
}
