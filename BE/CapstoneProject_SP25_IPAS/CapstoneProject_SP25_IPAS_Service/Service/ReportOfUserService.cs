using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportOfUserModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AIRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportOfUserRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
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
        private readonly IAIService _aIService;

        public ReportOfUserService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService, IAIService aIService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _aIService = aIService;
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
                    QuestionOfUser = createReportOfUserModel.QuestionOfUser,
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

            if(getAllReportOfUserModel.IsTrainned != null)
            {
                filter = filter.And(x => x.IsTrainned == getAllReportOfUserModel.IsTrainned);
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
                return new BusinessResult(200, "Get all report of user success", result);
            }
            else
            {
                return new BusinessResult(404, "Do not have any report of user");
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
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
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
                    if (!string.IsNullOrEmpty(updateReportOfUserModel.QuestionOfUser))
                    {
                        getUpdateReport.QuestionOfUser = updateReportOfUserModel.QuestionOfUser;
                    }
                    if (!string.IsNullOrEmpty(updateReportOfUserModel.AnswerFromExpert))
                    {
                        getUpdateReport.AnswerFromExpert = updateReportOfUserModel.AnswerFromExpert;
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
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
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

        public async Task<BusinessResult> AssignTagToImage(string tagId, int reportId, int? answerId)
        {
            try
            {
                var getReportOfUserByImageURL = await _unitOfWork.ReportRepository.GetByID(reportId);
                
                if(getReportOfUserByImageURL != null)
                {
                    var uploadImageModel = new UploadImageModel()
                    {
                        ImageUrls = new List<string> { getReportOfUserByImageURL.ImageURL! },
                        TagIds = new List<string> { tagId }
                    };
                    var uploadImage =  await _aIService.UploadImageByURLToCustomVision(uploadImageModel);
                    if(uploadImage.StatusCode == 200)
                    {
                        var getProfessional = await _unitOfWork.UserRepository.GetByID(answerId.Value);
                        if(getProfessional != null)
                        {
                            getReportOfUserByImageURL.AnswererID = answerId;
                        }
                        getReportOfUserByImageURL.IsTrainned = true;
                        _unitOfWork.ReportRepository.Update(getReportOfUserByImageURL);
                        var result = await _unitOfWork.SaveAsync();
                        if(result > 0)
                        {
                            return new BusinessResult(200, "Assign tag to image success");
                        }
                        else
                        {
                            return new BusinessResult(400, "Assign tag to image failed");
                        }
                    }
                    return new BusinessResult(400, "Assign tag to image failed");
                }
                return new BusinessResult(400, "Can not find any report");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetReportOfUser(GetAllReportOfUserModel getAllReportOfUserModel, int questionerId)
        {
            try
            {
                Expression<Func<Report, bool>> filter = x => x.QuestionerID == questionerId!;
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

                if (getAllReportOfUserModel.IsTrainned != null)
                {
                    filter = filter.And(x => x.IsTrainned == getAllReportOfUserModel.IsTrainned);
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
                    return new BusinessResult(200, "Get all report of user success", result);
                }
                else
                {
                    return new BusinessResult(404, "Do not have any report of user");
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> AnswerReport(AnswerReportModel answerReportModel, int? answerId)
        {
            try
            {
                var getReportToAnswer = await _unitOfWork.ReportRepository.GetByID(answerReportModel.ReportId);
                if (getReportToAnswer == null)
                {
                    return new BusinessResult(200, "Can not find any report");
                }
                getReportToAnswer.AnswerFromExpert = answerReportModel.Answer;
                getReportToAnswer.AnswererID = answerId;
                 _unitOfWork.ReportRepository.Update(getReportToAnswer);
                var result = await _unitOfWork.SaveAsync();
                if(result > 0)
                {
                    return new BusinessResult(200, "Answer Report Success");
                }
                return new BusinessResult(400, "Answer Report Failed");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
