using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IProcessService
    {
        public Task<BusinessResult> GetProcessByID(int processId);

        public Task<BusinessResult> GetAllProcessPagination(PaginationParameter paginationParameter, ProcessFilters processFilters, int farmId);

        public Task<BusinessResult> GetProcessSelectedByMasterType(List<int> masterTypeId);

        public Task<BusinessResult> CreateProcess(CreateProcessModel createProcessModel, int? farmId);

        public Task<BusinessResult> UpdateProcessInfo(UpdateProcessModel updateProcessModel);

        public Task<BusinessResult> PermanentlyDeleteProcess(int processId);
        public Task<BusinessResult> SoftDeleteProcess(List<int> listProcessId);

        public Task<BusinessResult> GetProcessByName(string processName);
        public Task<BusinessResult> InsertManyProcess(List<CreateManyProcessModel> listCreateProcessModel, int? farmId);

        public Task<BusinessResult> GetForSelect(int farmId, string? search, bool? isSample);
        public Task<BusinessResult> GetProcessByTypeName(int farmId, string typeName);


    }
}
