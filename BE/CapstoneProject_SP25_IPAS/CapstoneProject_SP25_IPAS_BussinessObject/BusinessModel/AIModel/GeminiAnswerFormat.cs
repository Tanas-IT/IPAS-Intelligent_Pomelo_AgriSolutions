using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel
{
    public class GeminiAnswerFormat
    {
        public string Title { get; set; }
        public string Summary { get; set; }
        public string Details { get; set; }
        public string Note { get; set; }
        public string? Confidence { get; set; }
    }
}
