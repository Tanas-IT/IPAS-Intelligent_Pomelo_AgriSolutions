using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportOfUserRequest
{
    public class AssignTagToImageModel
    {
        public string ImageURL { get; set; }
        public string TagId { get; set; }
        public int? AnswererId { get; set; }
    }
}
