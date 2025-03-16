using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportOfUserModels;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class ReportOfUserService : IReportOfUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;

        public ReportOfUserService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<BusinessResult> CreateReportOfCustomer(CreateReportOfUserModel createReportOfUserModel)
        {
            try
            {
                var imageUpload = "";
                if(createReportOfUserModel.ImageFile != null && createReportOfUserModel.ImageFile.Length > 0)
                {
                    if(IsImageFile(createReportOfUserModel.ImageFile))
                    {
                        imageUpload = await _cloudinaryService.UploadImageAsync(createReportOfUserModel.ImageFile, "reportOfUser");
                    }
                }
                var newReportOfUser = new Report()
                {
                    ReportCode = "RPT-" + DateTime.Now.Date,
                    CreatedDate = DateTime.Now,
                    AnswererID = createReportOfUserModel.AnswererID,
                    QuestionerID = createReportOfUserModel.QuestionerID,
                    Description = createReportOfUserModel.Description,
                    IsTrainned = false,
                    ImageURL = imageUpload,
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

        public async Task<BusinessResult> GetAllReportOfCustomer(GetAllReportOfUserModel getAllReportOfUserModel)
        {
            Expression<Func<Report, bool>> filter = null! ;
            Func<IQueryable<Report>, IOrderedQueryable<Report>> orderBy = null!;
            if (!string.IsNullOrEmpty(getAllReportOfUserModel.Search))
            {
                int validInt = 0;
                var checkInt = int.TryParse(getAllReportOfUserModel.Search, out validInt);
                DateTime validDate = DateTime.Now;
                bool validBool = false;
                if (checkInt)
                {
                    filter = filter.And(x => x.ReportID == validInt);
                }
                else if (DateTime.TryParse(getAllReportOfUserModel.Search, out validDate))
                {
                    filter = filter.And(x => x.CreatedDate == validDate);
                }
                else if (Boolean.TryParse(getAllReportOfUserModel.Search, out validBool))
                {
                    filter = filter.And(x => x.IsTrainned == validBool);
                }
                else
                {
                    filter = filter.And(x => x.ReportCode.ToLower().Contains(getAllReportOfUserModel.Search.ToLower())
                                  || x.ImageURL.ToLower().Contains(getAllReportOfUserModel.Search.ToLower())
                                  || x.Answerer.FullName.ToLower().Contains(getAllReportOfUserModel.Search.ToLower())
                                  || x.Questioner.FullName.ToLower().Contains(getAllReportOfUserModel.Search.ToLower()));
                }
            }

          
            switch (getAllReportOfUserModel.SortBy != null ? getAllReportOfUserModel.SortBy.ToLower() : "defaultSortBy")
            {
                case "reportid":
                    orderBy = !string.IsNullOrEmpty(getAllReportOfUserModel.Direction)
                                ? (getAllReportOfUserModel.Direction.ToLower().Equals("desc")
                               ? x => x.OrderByDescending(x => x.ReportID)
                               : x => x.OrderBy(x => x.ReportID)) : x => x.OrderBy(x => x.ReportID);
                    break;
                case "reportcode":
                    orderBy = !string.IsNullOrEmpty(getAllReportOfUserModel.Direction)
                                ? (getAllReportOfUserModel.Direction.ToLower().Equals("desc")
                               ? x => x.OrderByDescending(x => x.ReportCode)
                               : x => x.OrderBy(x => x.ReportCode)) : x => x.OrderBy(x => x.ReportCode);
                    break;
            
                case "istrained":
                    orderBy = !string.IsNullOrEmpty(getAllReportOfUserModel.Direction)
                                ? (getAllReportOfUserModel.Direction.ToLower().Equals("desc")
                               ? x => x.OrderByDescending(x => x.IsTrainned)
                               : x => x.OrderBy(x => x.IsTrainned)) : x => x.OrderBy(x => x.IsTrainned);
                    break;
                case "createdate":
                    orderBy = !string.IsNullOrEmpty(getAllReportOfUserModel.Direction)
                                ? (getAllReportOfUserModel.Direction.ToLower().Equals("desc")
                               ? x => x.OrderByDescending(x => x.CreatedDate)
                               : x => x.OrderBy(x => x.CreatedDate)) : x => x.OrderBy(x => x.CreatedDate);
                    break;
                case "answerer":
                    orderBy = !string.IsNullOrEmpty(getAllReportOfUserModel.Direction)
                                ? (getAllReportOfUserModel.Direction.ToLower().Equals("desc")
                               ? x => x.OrderByDescending(x => x.Answerer.FullName)
                               : x => x.OrderBy(x => x.Answerer.FullName)) : x => x.OrderBy(x => x.Answerer.FullName);
                    break;
                default:
                    orderBy = x => x.OrderByDescending(x => x.ReportID);
                    break;
            }
            string includeProperties = "Answerer,Questioner";
            var entities = await _unitOfWork.ReportRepository.Get(filter, orderBy, includeProperties);
            var result = _mapper.Map<IEnumerable<ReportOfUserModel>>(entities).ToList();
            if (result.Any())
            {
                return new BusinessResult(Const.SUCCESS_GET_ALL_PROCESS_CODE, Const.SUCCESS_GET_ALL_PROCESS_MESSAGE, result);
            }
            else
            {
                return new BusinessResult(Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG, new PageEntity<ReportOfUserModel>());
            }
        }

        public async Task<BusinessResult> PermantlyDeleteReportOfCustomer(DeleteReportOfUserModel PermentlyDeleteReportOfUserModel)
        {
            try
            {
                foreach(var permentlyDeleteReport in PermentlyDeleteReportOfUserModel.ListReportOfUserId)
                {
                    var deleteReport = await _unitOfWork.ReportRepository.GetByID(permentlyDeleteReport);  
                    if (deleteReport != null)
                    {
                        _unitOfWork.ReportRepository.Delete(permentlyDeleteReport);
                    }
                }
                var result = await _unitOfWork.SaveAsync();
                if(result > 0)
                {
                    return new BusinessResult(200, "Delete of report of user success", result);
                }
                return new BusinessResult(400, "Delete of report of user failed");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG, new PageEntity<ReportOfUserModel>());

            }
        }

        public async Task<BusinessResult> UpdateReportOfCustomer(UpdateReportOfUserModel updateReportOfUserModel)
        {
            try
            {
                var getUpdateReport = await _unitOfWork.ReportRepository.GetByID(updateReportOfUserModel.ReportID);
                if(getUpdateReport != null)
                {
                    if(string.IsNullOrEmpty(updateReportOfUserModel.Description))
                    {
                        getUpdateReport.Description = updateReportOfUserModel.Description;
                    }
                    if(updateReportOfUserModel.ImageFile != null && updateReportOfUserModel.ImageFile.Length > 0)
                    {
                        if(IsImageFile(updateReportOfUserModel.ImageFile))
                        {
                            var getLinkDownLoad = await _cloudinaryService.UploadImageAsync(updateReportOfUserModel.ImageFile, "reportOfUser");
                            getUpdateReport.ImageURL = getLinkDownLoad;
                        }
                    }
                    if(updateReportOfUserModel.QuestionerID != null)
                    {
                        getUpdateReport.QuestionerID = updateReportOfUserModel.QuestionerID;
                    }
                    if (updateReportOfUserModel.AnswererID != null)
                    {
                        getUpdateReport.AnswererID = updateReportOfUserModel.AnswererID;
                    }
                    if (updateReportOfUserModel.IsTrainned != null)
                    {
                        getUpdateReport.IsTrainned = updateReportOfUserModel.IsTrainned;
                    }
                     _unitOfWork.ReportRepository.Update(getUpdateReport);
                    var result = await _unitOfWork.SaveAsync();
                    if(result > 0)
                    {
                        return new BusinessResult(200, "Update Report Success", result);
                    }
                    else
                    {
                        return new BusinessResult(400, "Update Report Failed");
                    }
                }
                return new BusinessResult(404, "Can not find any report");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG, new PageEntity<ReportOfUserModel>());

            }
        }

        public bool IsImageFile(IFormFile file)
        {
            string[] validImageTypes = { "image/jpeg", "image/png", "image/gif" };
            string[] validImageExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

            string contentType = file.ContentType.ToLower();
            string extension = Path.GetExtension(file.FileName)?.ToLower();

            return validImageTypes.Contains(contentType) && validImageExtensions.Contains(extension);
        }
    }
}
