using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandRowRequest;
using CapstoneProject_SP25_IPAS_Service.Base;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ILandRowService
    {
        public Task<BusinessResult> GetLandRowById(int landRowId);
        public Task<BusinessResult> GetAllLandRowOfLandPlotNoPagin(int plotId);
        public Task<BusinessResult> UpdateLandRowInfo(LandRowUpdateRequest updateLandRowRequest);
        public Task<BusinessResult> DeleteLandRowOfFarm(int rowId);
        public Task<BusinessResult> CreateLandRow(LandRowCreateRequest createRequest);
        public Task<int> CreateMultipleRow(List<LandRowCreateRequest> createRequest);
        public Task<BusinessResult> GetLandRowForSelectedByPlotId(int landplotId);

    }
}
