using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportOfUserModels;
using Org.BouncyCastle.Bcpg.OpenPgp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IReportOfUserService
    {
        public Task<BusinessResult> CreateReportOfCustomer(CreateReportOfUserModel createReportOfUserModel);
        public Task<BusinessResult> GetAllReportOfCustomer(PaginationParameter paginationParameter);
        public Task<BusinessResult> UpdateReportOfCustomer(UpdateReportOfUserModel updateReportOfUserModel);
        public Task<BusinessResult> SoftDeleteReportOfCustomer(DeleteReportOfUserModel softDeleteReportOfUserModel);
        public Task<BusinessResult> PermantlyDeleteReportOfCustomer(DeleteReportOfUserModel PermentlyDeleteReportOfUserModel);
    }
}
