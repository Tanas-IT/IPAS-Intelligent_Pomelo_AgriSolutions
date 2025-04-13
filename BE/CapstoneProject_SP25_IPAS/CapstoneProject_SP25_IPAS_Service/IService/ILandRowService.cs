using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandRowRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ILandRowService
    {
        public Task<BusinessResult> GetLandRowById(int landRowId);
        public Task<BusinessResult> GetAllLandRowOfLandPlotNoPagin(int plotId);
        public Task<BusinessResult> UpdateLandRowInfo(UpdateLandRowRequest updateLandRowRequest);
        public Task<BusinessResult> DeleteLandRowOfFarm(int rowId);
        public Task<BusinessResult> CreateLandRow(CreateLandRowRequest createRequest);
        public Task<int> CreateMultipleRow(List<CreateLandRowRequest> createRequest);
        public Task<BusinessResult> GetLandRowForSelectedByPlotId(int landplotId);
        public Task<BusinessResult> GetRowPaginByPlot(GetPlantRowPaginRequest request, PaginationParameter paginationParameter);
        public Task<BusinessResult> SoftedMultipleDelete(List<int> rowIds);
        public Task<BusinessResult> GetForSelectedIndexEmptyInRow(int rowId);
        public Task<BusinessResult> ExportExcelByPlot(GetPlantRowPaginRequest request);

    }
}
