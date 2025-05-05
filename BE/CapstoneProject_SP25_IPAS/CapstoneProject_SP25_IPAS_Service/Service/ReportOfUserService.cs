using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportOfUserModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AIRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportOfUserRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CapstoneProject_SP25_IPAS_Service.Service.CompareImage;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.Models;
using Org.BouncyCastle.Pqc.Crypto.Lms;
using System;
using System.Collections;
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
        private readonly IWebSocketService _webSocketService;
        private readonly IImageHashCompareService _imageHashCompareService;

        public ReportOfUserService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService, IAIService aIService, IWebSocketService webSocketService, IImageHashCompareService imageHashCompareService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _aIService = aIService;
            _webSocketService = webSocketService;
            _imageHashCompareService = imageHashCompareService;
        }

        public async Task<BusinessResult> CreateReportOfCustomer(CreateReportOfUserModel createReportOfUserModel)
        {
            try
            {
                if (createReportOfUserModel.ImageFile != null && createReportOfUserModel.ImageFile.Length > 0)
                {
                    if(!IsImageLink(createReportOfUserModel.ImageFile))
                    {
                        return new BusinessResult(400, "Image does not valid. Please use .png, .jpeg, .bmp");
                    }
                }
                var getAllReport = await _unitOfWork.ReportRepository.GetAllNoPaging();
                var newImageHash = await _imageHashCompareService.GetHashFromUrlAsync(createReportOfUserModel.ImageFile);
                foreach (var report in getAllReport)
                {
                    ulong existingHash;

                    if (!string.IsNullOrEmpty(report.ImageURL))
                    {
                        existingHash = await _imageHashCompareService.GetHashFromUrlAsync(report.ImageURL);
                        report.ImageURL = existingHash.ToString(); 
                        var distance = _imageHashCompareService.CalculateDistance(newImageHash, existingHash);
                        if(distance >= 90)
                        {
                            return new BusinessResult(400, "This image appears to be a duplicate \n of an existing image in the system.");
                        }
                    }

                }
                var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                var today = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone);
                var newReportOfUser = new Report()
                {
                    ReportCode = "RPT-" + today,
                    CreatedDate = today,
                    QuestionOfUser = createReportOfUserModel.QuestionOfUser,
                    QuestionerID = createReportOfUserModel.QuestionerID,
                    Description = createReportOfUserModel.Description,
                    IsTrainned = false,
                    ImageURL = createReportOfUserModel.ImageFile,
                };
                await _unitOfWork.ReportRepository.Insert(newReportOfUser);
                var getListExpert = await _unitOfWork.UserFarmRepository.GetExpertOffarm();

                foreach (var expert in getListExpert)
                {
                    var addNotification = new Notification()
                    {
                        Content = "Question: " + createReportOfUserModel.QuestionOfUser + " has just been created",
                        Title = "Validate Information Of AI",
                        IsRead = false,
                        MasterTypeId = 36,
                        CreateDate = DateTime.Now,
                        NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                    };
                    await _unitOfWork.NotificationRepository.Insert(addNotification);
                    await _unitOfWork.SaveAsync();
                    await _webSocketService.SendToUser(expert.UserId, addNotification);
                }
                var addNewNotification = new Notification()
                {
                    Content = "Question: " + createReportOfUserModel.QuestionOfUser + " has just been created",
                    Title = "Validate Information Of AI",
                    IsRead = false,
                    MasterTypeId = 36,
                    CreateDate = DateTime.Now,
                    NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                };
                await _unitOfWork.NotificationRepository.Insert(addNewNotification);
                await _webSocketService.SendToUser(createReportOfUserModel.QuestionerID.Value, addNewNotification);
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
            if (getAllReportOfUserModel.isUnanswered != null)
            {
                if(getAllReportOfUserModel.isUnanswered == true)
                {
                    filter = filter.And(x => x.AnswererID == null);
                }
                else
                {
                    filter = filter.And(x => x.AnswererID != null);
                }
            }


            switch (getAllReportOfUserModel.SortBy != null ? getAllReportOfUserModel.SortBy.ToLower() : "defaultSortBy")
            {
                case "reportid":
                    orderBy = !string.IsNullOrEmpty(getAllReportOfUserModel.Direction)
                                ? (getAllReportOfUserModel.Direction.ToLower().Equals("desc")
                               ? x => x.OrderBy(x => x.ReportID)
                               : x => x.OrderByDescending(x => x.ReportID)) : x => x.OrderByDescending(x => x.ReportID);
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
                case "defaultSortBy":
                    orderBy = x => x.OrderByDescending(x => x.ReportID);
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
                return new BusinessResult(200, "Do not have any report of user");
            }
        }

        public async Task<BusinessResult> GetAllReportOfCustomerWithPagin(PaginationParameter paginationParameter, FilterGetAllRepoterPagin filterGetAllRepoterPagin)
        {
            Expression<Func<Report, bool>> filter = null!;
            Func<IQueryable<Report>, IOrderedQueryable<Report>> orderBy = null!;
            if (!string.IsNullOrEmpty(paginationParameter.Search))
            {
                int validInt = 0;
                var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                DateTime validDate = DateTime.Now;
                bool validBool = false;
                if (checkInt)
                {
                    filter = filter.And(x => x.ReportID == validInt);
                }
                else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                {
                    filter = filter.And(x => x.CreatedDate == validDate);
                }
                else if (Boolean.TryParse(paginationParameter.Search, out validBool))
                {
                    filter = filter.And(x => x.IsTrainned == validBool);
                }
                else
                {
                    filter = filter.And(x => x.ReportCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Description.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.QuestionOfUser.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.AnswerFromExpert.ToLower().Contains(paginationParameter.Search.ToLower()));
                }
            }

            if (filterGetAllRepoterPagin.isTrainned != null)
            {
                filter = filter.And(x => x.IsTrainned == filterGetAllRepoterPagin.isTrainned);
            }
            if (filterGetAllRepoterPagin.isUnanswered != null)
            {
                if (filterGetAllRepoterPagin.isUnanswered == true)
                {
                    filter = filter.And(x => x.AnswererID == null);
                }
                else
                {
                    filter = filter.And(x => x.AnswererID != null);
                }
            }


            switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
            {
                case "reportid":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                ? (paginationParameter.Direction.ToLower().Equals("desc")
                               ? x => x.OrderBy(x => x.ReportID)
                               : x => x.OrderByDescending(x => x.ReportID)) : x => x.OrderByDescending(x => x.ReportID);
                    break;
                case "reportcode":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                ? (paginationParameter.Direction.ToLower().Equals("desc")
                               ? x => x.OrderByDescending(x => x.ReportCode)
                               : x => x.OrderBy(x => x.ReportCode)) : x => x.OrderBy(x => x.ReportCode);
                    break;

                case "istrained":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                ? (paginationParameter.Direction.ToLower().Equals("desc")
                               ? x => x.OrderByDescending(x => x.IsTrainned)
                               : x => x.OrderBy(x => x.IsTrainned)) : x => x.OrderBy(x => x.IsTrainned);
                    break;
                case "createdate":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                ? (paginationParameter.Direction.ToLower().Equals("desc")
                               ? x => x.OrderByDescending(x => x.CreatedDate)
                               : x => x.OrderBy(x => x.CreatedDate)) : x => x.OrderBy(x => x.CreatedDate);
                    break;
                case "answerer":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                ? (paginationParameter.Direction.ToLower().Equals("desc")
                               ? x => x.OrderByDescending(x => x.Answerer.FullName)
                               : x => x.OrderBy(x => x.Answerer.FullName)) : x => x.OrderBy(x => x.Answerer.FullName);
                    break;
                case "defaultSortBy":
                    orderBy = x => x.OrderByDescending(x => x.ReportID);
                    break;
                default:
                    orderBy = x => x.OrderByDescending(x => x.ReportID);
                    break;
            }
            string includeProperties = "Answerer,Questioner";
            var entities = await _unitOfWork.ReportRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
            var pagin = new PageEntity<ReportOfUserModel>();
            pagin.List = _mapper.Map<IEnumerable<ReportOfUserModel>>(entities).ToList();
            pagin.TotalRecord = await _unitOfWork.ReportRepository.Count(filter);
            pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
            if (pagin.List.Any())
            {
                return new BusinessResult(200, "Get all report of user success", pagin);
            }
            else
            {
                return new BusinessResult(200, "Do not have any report of user");
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

        public bool IsImageLink(string url)
        {
            string[] validImageExtensions = { ".jpg", ".jpeg", ".bmp" };
            return url.Contains("/image/") || validImageExtensions.Contains(Path.GetExtension(url).ToLower());
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
                    var getAllTags =  await _aIService.GetTags();
                    var getTag = (List<Tag>)getAllTags.Data;

                    if (uploadImage.StatusCode == 200)
                    {
                        getReportOfUserByImageURL.IsTrainned = true;
                        getReportOfUserByImageURL.TagID = tagId;
                        var getUploadImage = (ImageCreateSummary)uploadImage.Data;
                        var getTagName = getTag.FirstOrDefault(x => x.Id == Guid.Parse(tagId));
                        getReportOfUserByImageURL.TagName = getTagName.Name;
                        getReportOfUserByImageURL.ImageID = getUploadImage.Images.Select(x => x.Image.Id.ToString()).FirstOrDefault();
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
                if (getAllReportOfUserModel.isUnanswered != null)
                {
                    if(getAllReportOfUserModel.isUnanswered == true)
                    {
                        filter = filter.And(x => x.AnswererID == null);
                    }
                    else
                    {
                        filter = filter.And(x => x.AnswererID != null);
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
                    case "defaultSortBy":
                        orderBy = x => x.OrderByDescending(x => x.ReportID);
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
                var addNotificationForExpert = new Notification()
                {
                    Content = "Answer: " + getReportToAnswer.QuestionOfUser + " has been finished",
                    Title = "Validate Information Of AI",
                    IsRead = false,
                    MasterTypeId = 36,
                    CreateDate = DateTime.Now,
                    NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()

                };

                var addNotificationForUser = new Notification()
                {
                    Content = "Expert answered " + getReportToAnswer.QuestionOfUser,
                    Title = "Validate Information Of AI",
                    IsRead = false,
                    MasterTypeId = 36,
                    CreateDate = DateTime.Now,
                    NotificationCode = "NTF " + "_" + DateTime.Now.Date.ToString()
                };
                await _unitOfWork.NotificationRepository.Insert(addNotificationForUser);
                await _unitOfWork.NotificationRepository.Insert(addNotificationForExpert);
                await _unitOfWork.SaveAsync();
                await _webSocketService.SendToUser(getReportToAnswer.QuestionerID.Value, addNotificationForUser);
                await _webSocketService.SendToUser(getReportToAnswer.AnswererID.Value, addNotificationForExpert);

                if (result > 0)
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
