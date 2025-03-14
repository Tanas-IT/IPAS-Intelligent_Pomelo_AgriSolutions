using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportOfUserModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class ReportOfUserService : IReportOfUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ReportOfUserService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CreateReportOfCustomer(CreateReportOfUserModel createReportOfUserModel)
        {
            try
            {
                var newReportOfUser = new Report()
                {
                    ReportCode = "RPT-" + DateTime.Now.Date,
                    CreatedDate = DateTime.Now,
                    AnswererID = createReportOfUserModel.AnswererID,
                    QuestionerID = createReportOfUserModel.QuestionerID,
                    Description = createReportOfUserModel.Description,
                    IsTrainned = false,
                };
                await _unitOfWork.ReportRepository.Insert(newReportOfUser);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(200, "Create Report Success", newReportOfUser);
                }
                return new BusinessResult(400, "Create Report Failed");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public Task<BusinessResult> GetAllReportOfCustomer(PaginationParameter paginationParameter)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> PermantlyDeleteReportOfCustomer(DeleteReportOfUserModel PermentlyDeleteReportOfUserModel)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> SoftDeleteReportOfCustomer(DeleteReportOfUserModel softDeleteReportOfUserModel)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> UpdateReportOfCustomer(UpdateReportOfUserModel updateReportOfUserModel)
        {
            throw new NotImplementedException();
        }
    }
}
