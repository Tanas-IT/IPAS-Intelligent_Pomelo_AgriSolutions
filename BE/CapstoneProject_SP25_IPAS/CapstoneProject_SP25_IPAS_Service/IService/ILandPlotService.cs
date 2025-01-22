﻿using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlot;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ILandPlotService
    {
        public Task<BusinessResult> GetLandPlotById(int landPlotId);
        public Task<BusinessResult> GetAllLandPlotNoPagin(int farmId, string searchKey);
        public Task<BusinessResult> UpdateLandPlotCoordination(LandPlotUpdateCoordinationRequest updateLandPlotCoordinationRequest);
        public Task<BusinessResult> UpdateLandPlotInfo(LandPlotUpdateRequest updateLandPlotRequest);
        public Task<BusinessResult> deleteLandPlotOfFarm(int landplotId);
        public Task<BusinessResult> CreateLandPlot(LandPlotCreateRequest createRequest);
    }
}
