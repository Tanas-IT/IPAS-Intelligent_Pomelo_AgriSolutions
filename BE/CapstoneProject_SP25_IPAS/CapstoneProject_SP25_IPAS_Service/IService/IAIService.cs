using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IAIService
    {
        public Task<BusinessResult> GetAnswerAsync(string question, int? farmId, int? userId);
        public Task<BusinessResult> PredictDiseaseByFile(IFormFile image);
        public Task<BusinessResult> PredictDiseaseByURL(string imageURL);
        public Task<BusinessResult> GetHistoryChat(PaginationParameter paginationParameter, int? farmId, int? userId);
    }
}
