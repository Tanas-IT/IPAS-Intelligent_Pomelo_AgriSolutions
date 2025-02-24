using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.GraftedRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IGraftedPlantService
    {
        public Task<BusinessResult> createGraftedPlantAsync(CreateGraftedPlantRequest createRequest);
        public Task<BusinessResult> updateGraftedPlantAsync(UpdateGraftedPlantRequest updateRequest);
        public Task<BusinessResult> getGraftedOfPlantPaginAsync(GetGraftedPaginRequest getRequest);
        public Task<BusinessResult> getGraftedByIdAsync(int graftedPlantId);
        public Task<BusinessResult> deletePermanentlyGrafteAsync(List<int> graftedPlantId);
        public Task<BusinessResult> deteSoftedGraftedAsync(List<int> graftedPlantId);
    }
}
