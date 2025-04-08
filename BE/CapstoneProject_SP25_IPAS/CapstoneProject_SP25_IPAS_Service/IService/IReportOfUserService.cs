using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportOfUserRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
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
        public Task<BusinessResult> GetAllReportOfCustomer(GetAllReportOfUserModel getAllReportOfUserModel);
        public Task<BusinessResult> UpdateReportOfCustomer(UpdateReportOfUserModel updateReportOfUserModel);
        public Task<BusinessResult> PermantlyDeleteReportOfCustomer(DeleteReportOfUserModel PermentlyDeleteReportOfUserModel);
        public Task<BusinessResult> AssignTagToImage(string tagId, int reportId, int? answerId);
        public Task<BusinessResult> GetReportOfUser(GetAllReportOfUserModel getAllReportOfUserModel, int questionerId);
        public Task<BusinessResult> AnswerReport(AnswerReportModel answerReportModel, int? answerId);
        public Task<BusinessResult> GetAllReportOfCustomerWithPagin(PaginationParameter paginationParameter, FilterGetAllRepoterPagin filterGetAllRepoterPagin);
    }
}
