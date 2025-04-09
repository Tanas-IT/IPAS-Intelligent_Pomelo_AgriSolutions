using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel;
using GenerativeAI.Models;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response
{
    public class ChatResponse
    {
        public string Question { get; set; }
        //public GeminiAnswerFormat Answer { get; set; }
        public string Answer { get; set; }
    }
}
