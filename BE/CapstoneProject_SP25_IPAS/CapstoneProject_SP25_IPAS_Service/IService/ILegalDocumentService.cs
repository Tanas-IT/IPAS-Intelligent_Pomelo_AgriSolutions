using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LegalDocumentRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ILegalDocumentService
    {
        public Task<BusinessResult> createDocument(LegalDocumentCreateRequest documentCreateRequest);
        public Task<BusinessResult> updateDocument(LegalDocumentCreateRequest historyUpdateRequest, int documentId);
        public Task<BusinessResult> getDocument(int documentId);
        public Task<BusinessResult> getAllDocumentOfFarm(int farmId, string? searchValue);
        public Task<BusinessResult> deleteDocument(int documentId);
    }
}
