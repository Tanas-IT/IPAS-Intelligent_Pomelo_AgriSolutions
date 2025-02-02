using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlot;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandRowRequest;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ILandRowService
    {
        public Task<BusinessResult> GetLandRowById(int landRowId);
        public Task<BusinessResult> GetAllLandRowOfLandPlotNoPagin(int plotId);
        public Task<BusinessResult> UpdateLandRowInfo(LandRowUpdateRequest updateLandRowRequest);
        public Task<BusinessResult> DeleteLandRowOfFarm(int rowId);
        public Task<BusinessResult> CreateLandRow(LandRowCreateRequest createRequest);
    }
}
