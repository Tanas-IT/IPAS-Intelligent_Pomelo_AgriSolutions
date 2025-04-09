using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest.GraftedNoteRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IGraftedPlantNoteService
    {
        public Task<BusinessResult> getGraftedNoteById(int GraftedPlantNoteId);
        public Task<BusinessResult> getAllNoteOfGraftedById(int graftedPlantId);
        public Task<BusinessResult> deleteGraftedNote(int graftedPlantNoteId);
        public Task<BusinessResult> updateGraftedNote(UpdateGraftedNoteRequest historyUpdateRequest);
        public Task<BusinessResult> createGraftedNote(CreateGraftedNoteRequest historyCreateRequest);
        public Task<BusinessResult> getAllNoteOfGraftedPagin(GetGraftedNoteRequest fitlerRequest, PaginationParameter paginationParameter);
        public Task<(byte[] FileBytes, string FileName, string ContentType)> ExportNotesByGraftedPlantId(int graftedPlantId);


    }
}
