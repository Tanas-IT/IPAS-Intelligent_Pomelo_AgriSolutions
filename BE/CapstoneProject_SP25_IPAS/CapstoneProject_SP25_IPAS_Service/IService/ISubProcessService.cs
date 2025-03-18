using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SubProcessModel;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ISubProcessService
    {
        public Task<BusinessResult> GetSubProcessByID(int subProcessId);

        public Task<BusinessResult> GetAllSubProcessPagination(PaginationParameter paginationParameter, SubProcessFilters subProcessFilters);

        public Task<BusinessResult> CreateSubProcess(CreateSubProcessModel createSubProcessModel);

        public Task<BusinessResult> UpdateSubProcessInfo(UpdateSubProcessModel updateSubProcessModel);

        public Task<BusinessResult> PermanentlyDeleteSubProcess(int subProcessId);
        public Task<BusinessResult> SoftDeleteSubProcess(int subProcessId);

        public Task<BusinessResult> GetSubProcessByName(string subProcessName);

    }
}
