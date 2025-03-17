using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LegalDocumentRequest;
using CapstoneProject_SP25_IPAS_Service.Base;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ILegalDocumentService
    {
        public Task<BusinessResult> createDocument(LegalDocumentCreateRequest documentCreateRequest, int farmId);
        public Task<BusinessResult> updateDocument(LegalDocumentUpdateRequest historyUpdateRequest);
        public Task<BusinessResult> getDocument(int documentId);
        public Task<BusinessResult> getAllDocumentOfFarm(int farmId, string? searchValue);
        public Task<BusinessResult> deleteDocument(int documentId);
    }
}
