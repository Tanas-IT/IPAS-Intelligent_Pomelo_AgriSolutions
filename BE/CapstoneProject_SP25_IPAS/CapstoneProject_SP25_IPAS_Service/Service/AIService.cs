using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using CapstoneProject_SP25_IPAS_Service.Base;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training;
using CapstoneProject_SP25_IPAS_Common;
using MimeKit;
using GenerativeAI;
using GenerativeAI.Types;
using GenerativeAI.Methods;
using GenerativeAI.Models;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.AIModel;
using Google.Apis.Logging;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.Models;
using System.IO;
using MimeKit.Cryptography;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class AIService : IAIService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private ChatSession _chatSession;

        private readonly string predictionEndpoint;
        private readonly string predictionKey;
        private readonly string trainingEndPoint;
        private readonly string trainingKey;
        private readonly Guid projectId;

        private readonly CustomVisionTrainingClient trainingClient;
        private readonly CustomVisionPredictionClient predictionClient;

        public AIService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration cofig)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _config = cofig;

            var customVisionConfig = _config.GetSection("CustomVision");
            predictionEndpoint = customVisionConfig["PredictionEndpoint"];
            predictionKey = customVisionConfig["PredictionKey"];
            trainingEndPoint = customVisionConfig["TrainingEndpoint"];
            trainingKey = customVisionConfig["TrainingKey"];
            projectId = Guid.Parse(customVisionConfig["ProjectId"]);

            trainingClient = new CustomVisionTrainingClient(new Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.ApiKeyServiceClientCredentials(trainingKey))
            {
                Endpoint = trainingEndPoint
            };

            predictionClient = new CustomVisionPredictionClient(new Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction.ApiKeyServiceClientCredentials(predictionKey))
            {
                Endpoint = predictionEndpoint
            };
        }

        public async Task<BusinessResult> GetAnswerAsync(string question, int? farmId, int? userId)
        {
            try
            {
                var getFarmInfo = await _unitOfWork.FarmRepository.GetFarmById(farmId.Value);
                var checkRoomExist = await _unitOfWork.ChatRoomRepository.GetByCondition(x => x.FarmID == farmId || x.UserID == userId);
                if (checkRoomExist == null)
                {
                    checkRoomExist = new ChatRoom()
                    {
                        RoomCode = "IPAS_" + getFarmInfo.FarmName + "_ChatIPAS_" + DateTime.Now.Date,
                        RoomName = "Chat with IPAS",
                        CreateDate = DateTime.Now,
                        FarmID = farmId,
                        UserID = userId > 0 ? userId.Value : null,
                    };
                    await _unitOfWork.ChatRoomRepository.Insert(checkRoomExist);
                    await _unitOfWork.SaveAsync();
                }
                var geminiApiResponse = await GetAnswerFromGeminiAsync(question, getFarmInfo);
                var newChatMessage = new ChatMessage()
                {
                    CreateDate = DateTime.Now,
                    MessageCode = question,
                    MessageContent = geminiApiResponse ?? "Xin lỗi, tôi không thề tìm thấy câu trả lời",
                    UpdateDate = DateTime.Now,
                    IsUser = false,
                    SenderId = userId > 0 ? userId.Value : null,
                };
                checkRoomExist.ChatMessages.Add(newChatMessage);
                await _unitOfWork.SaveAsync();
                var result = new ChatResponse()
                {
                    Question = question,
                    Answer = geminiApiResponse ?? "Xin lỗi, tôi không thề tìm thấy câu trả lời"
                };
                if (result != null)
                {
                    return new BusinessResult(Const.SUCCESS_ASK_AI_CODE, Const.SUCCESS_ASK_AI_MSG, result);
                }
                return new BusinessResult(Const.FAIL_ASK_AI_CODE, Const.FAIL_ASK_AI_MSG);
            }
            catch (Exception ex)
            {
                // Xử lý lỗi
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }

        }

        public async Task<BusinessResult> PredictDiseaseByFile(IFormFile image)
        {
            try
            {
                if (image == null || image.Length < 0)
                {
                    return new BusinessResult(Const.WARNING_IMAGE_PREDICT_NOT_EXIST_CODE, Const.WARNING_IMAGE_PREDICT_NOT_EXIST_MSG);
                }
                using (var stream = new MemoryStream())
                {
                    await image.CopyToAsync(stream);
                    stream.Position = 0;

                    var predict = predictionClient.ClassifyImage(projectId, "AgricutureAIPomelo", stream);

                    var result = predict.Predictions.Select(p => new
                    {
                        probability = p.Probability,
                        tagId = p.TagId,
                        tagName = p.TagName,
                        BoundingBox = p.BoundingBox,
                        TagType = p.TagType,
                    });

                    result = result.Where(x => x.probability > 0.75);

                    if (result != null)
                    {
                        if (result.Count() > 0)
                        {
                            return new BusinessResult(Const.SUCCESS_PREDICT_IMAGE_BY_FILE_CODE, Const.SUCCESS_PREDICT_IMAGE_BY_FILE_MSG, result);
                        }
                        else
                        {
                            return new BusinessResult(404, "No data found");

                        }
                    }
                    return new BusinessResult(Const.FAIL_PREDICT_IMAGE_BY_FILE_CODE, Const.FAIL_PREDICT_IMAGE_BY_FILE_MSG);

                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PredictDiseaseByURL(string imageURL)
        {
            if (imageURL == null || imageURL.Length < 0)
            {
                return new BusinessResult(Const.WARNING_IMAGE_PREDICT_NOT_EXIST_CODE, Const.WARNING_IMAGE_PREDICT_NOT_EXIST_MSG);
            }

            try
            {

                // Tạo đối tượng ImageUrl từ chuỗi URL
                var imageUrlObj = new Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction.Models.ImageUrl { Url = imageURL };

                // Gọi API dự đoán từ URL của hình ảnh
                var result = await predictionClient.ClassifyImageUrlAsync(projectId, "AgricutureAIPomelo", imageUrlObj);

                // Trả về kết quả dự đoán
                if (result != null)
                {
                    return new BusinessResult(Const.SUCCESS_PREDICT_IMAGE_BY_URL_CODE, Const.SUCCESS_PREDICT_IMAGE_BY_URL_MSG, result.Predictions);
                }
                return new BusinessResult(Const.FAIL_PREDICT_IMAGE_BY_URL_CODE, Const.FAIL_PREDICT_IMAGE_BY_URL_MSG);
            }
            catch (Exception ex)
            {
                // Xử lý lỗi
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        /*
const generationConfig = {
     temperature: 0.6,
     topP: 0.5,
     topK: 40,
     maxOutputTokens: 8192,
     responseMimeType: "text/plain",
   };
*/
        private async Task<string> GetAnswerFromGeminiAsync(string question, Farm getFarmInfo)
        {
            try
            {

                string geminiKey = _config["GeminiSettings:ApiKey"];

                var generationConfig = new GenerationConfig
                {
                    Temperature = 0.6,
                    TopP = 0.5,
                    TopK = 40,
                    MaxOutputTokens = 8192
                };

                // Tạo lịch sử hội thoại (history)
                var history = new[]
       {
            new InputContent
            {
                Role = "user",
                Parts = "Bạn là chuyên gia trong lĩnh vực trồng và chăm sóc cây bưởi ..."
            }, 
            new InputContent
            {
                Role = "user",
                Parts = "You are an expert in the field of planting and caring for grapefruit trees..."
            },
            new InputContent
            {
                Role = "user",
                Parts = "Bạn là IPAS (Intelligent Pomelo AgriSolutions), một chuyên gia về cây bưởi..."
            },
             new InputContent
            {
                Role = "user",
                Parts = "You are IPAS (Intelligent Pomelo AgriSolutions), a grapefruit expert..."
            },
            new InputContent
            {
                Role = "model",
                Parts = $"Xin chào! Tôi là IPAS, chuyên gia về cây bưởi, tôi có thể giúp gì cho bạn... "
            },
            new InputContent
            {
                Role = "model",
                Parts = $"Hello! I'm IPAS, grapefruit expert, how can I help you... "
            },
            new InputContent
            {
                Role = "model",
                Parts = "Đã hiểu. Tôi là IPAS, tôi sẽ cung cấp lời khuyên chuyên môn cho..."
            },
             new InputContent
            {
                Role = "model",
                Parts = "Got it. I'm IPAS, I'll provide professional advice for..."
            },
            new InputContent
            {
                Role = "model",
                Parts = $"Dựa vào đặc tính đất đai của trang trại của bạn là {getFarmInfo.SoilType}, tôi có thể đưa ra lời khuyên như sau..."
            },
             new InputContent
            {
                Role = "model",
                Parts = $"Based on your farm's soil characteristics {getFarmInfo.SoilType}, I can give you the following advice..."
            },
            new InputContent
            {
                Role = "user",
                Parts = "Bạn chỉ được trả lời các câu hỏi liên quan đến cây bưởi. Nếu người dùng hỏi về chủ đề khác, hãy từ chối trả lời."
            },
            new InputContent
            {
                Role = "user",
                Parts = "You may only answer questions related to grapefruit trees. If a user asks about another topic, decline to answer."
            }
        };
                var startChatParams = new StartChatParams
                {
                    GenerationConfig = generationConfig,
                    History = history
                };
                var model = new GenerativeModel(geminiKey, "gemini-2.0-flash");
                var
                _chatSession = model.StartChat(startChatParams);
                var response = await _chatSession.SendMessageAsync(question);
                if (string.IsNullOrEmpty(response))
                {
                    return null;
                }

                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<BusinessResult> GetHistoryChat(PaginationParameter paginationParameter, int? farmId, int? userId)
        {
            try
            {
                Expression<Func<ChatMessage, bool>> filter = x => x.Room.UserID == userId && x.Room.FarmID == farmId;
                Func<IQueryable<ChatMessage>, IOrderedQueryable<ChatMessage>> orderBy = x => x.OrderByDescending(x => x.CreateDate);
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.RoomId == validInt || x.SenderId == validInt);
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = filter.And(x => x.CreateDate == validDate || x.UpdateDate == validDate);
                    }
                    else if (Boolean.TryParse(paginationParameter.Search, out validBool))
                    {
                        filter = filter.And(x => x.IsUser == validBool);
                    }
                    else
                    {
                        filter = x => x.MessageCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MessageContent.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MessageType.ToLower().Contains(paginationParameter.Search.ToLower());
                    }
                }

                if (!string.IsNullOrEmpty(paginationParameter.SortBy))
                {
                    switch (paginationParameter.SortBy.ToLower())
                    {
                        case "messageid":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MessageId)
                                       : x => x.OrderBy(x => x.MessageId)) : x => x.OrderBy(x => x.MessageId);
                            break;
                        case "messagecode":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MessageCode)
                                      : x => x.OrderBy(x => x.MessageCode)) : x => x.OrderBy(x => x.MessageCode);
                            break;
                        case "messagecontent":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MessageContent)
                                      : x => x.OrderBy(x => x.MessageContent)) : x => x.OrderBy(x => x.MessageContent);
                            break;
                        case "messagetype":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MessageType)
                                      : x => x.OrderBy(x => x.MessageType)) : x => x.OrderBy(x => x.MessageType);
                            break;
                        case "senderid":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.SenderId)
                                      : x => x.OrderBy(x => x.SenderId)) : x => x.OrderBy(x => x.SenderId);
                            break;
                        case "roomname":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.Room.RoomName)
                                      : x => x.OrderBy(x => x.Room.RoomName)) : x => x.OrderBy(x => x.Room.RoomName);
                            break;
                        case "createdate":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.CreateDate)
                                      : x => x.OrderBy(x => x.CreateDate)) : x => x.OrderBy(x => x.CreateDate);
                            break;
                        case "updatedate":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                      ? x => x.OrderByDescending(x => x.UpdateDate)
                                      : x => x.OrderBy(x => x.UpdateDate)) : x => x.OrderBy(x => x.UpdateDate);
                            break;
                        default:
                            orderBy = x => x.OrderByDescending(x => x.CreateDate);
                            break;
                    }
                }
                string includeProperties = "Room";
                var entities = await _unitOfWork.ChatMessageRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<ChatMessageModel>();
                pagin.List = _mapper.Map<IEnumerable<ChatMessageModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.ChatMessageRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_HISTORY_CHAT_CODE, Const.SUCCESS_GET_HISTORY_CHAT_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_HISTORY_CHAT_CODE, Const.WARNIN_GET_HISTORY_CHAT_MSG, new PageEntity<MasterTypeModel>());
                }
            }
            catch (Exception ex)
            {
                // Xử lý lỗi
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetTags()
        {
            try
            {
                var getListTags = await trainingClient.GetTagsAsync(projectId);
                if (getListTags != null && getListTags.Any())
                {
                    return new BusinessResult(200, "Get All Tags from Custom Vision success", getListTags);
                }
                return new BusinessResult(404, "Do not have any Tags");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> CreateTag(string tagName)
        {
            try
            {
                var createTag = await trainingClient.CreateTagAsync(projectId, tagName);
                if (createTag != null)
                {
                    return new BusinessResult(200, "Create tag for custom visiob success", createTag);
                }
                return new BusinessResult(404, "Create Tag failed");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UploadImageByURLToCustomVision(UploadImageModel uploadImageModel)
        {
            try
            {
                if (uploadImageModel.ImageUrls == null || uploadImageModel.ImageUrls.Count() == 0)
                    return new BusinessResult(400, "Image URL is required");

                if (uploadImageModel.TagIds == null || uploadImageModel.TagIds.Count() == 0)
                    return new BusinessResult(400, "Tag for image is required");

                List<ImageUrlCreateEntry> listImageUrlCreateEntry = new List<ImageUrlCreateEntry>();
                foreach(var uploadImage in uploadImageModel.ImageUrls)
                {
                    ImageUrlCreateEntry imageUrlCreateEntry = new ImageUrlCreateEntry()
                    {
                        Url = uploadImage,
                        TagIds = uploadImageModel.TagIds.Select(Guid.Parse).ToList()
                    };
                    listImageUrlCreateEntry.Add(imageUrlCreateEntry);
                }
                ImageUrlCreateBatch imageUrlCreateBatch = new ImageUrlCreateBatch()
                {
                    Images = listImageUrlCreateEntry,
                    TagIds = uploadImageModel.TagIds.Select(Guid.Parse).ToList(),
                };
                var uploadImageByURL = await trainingClient.CreateImagesFromUrlsAsync(projectId, imageUrlCreateBatch);
                if(uploadImageByURL != null && uploadImageByURL.IsBatchSuccessful)
                {
                    return new BusinessResult(200, "Upload image to Custom Vision success", uploadImageByURL);
                }
                return new BusinessResult(400, "Upload image to Custom Vision failed");

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UploadImageByFileToCustomVision(UploadImageByFileModel uploadImageByFileModel)
        {
            try
            {
                if(uploadImageByFileModel.FileImages == null || uploadImageByFileModel.FileImages.Count() == 0)
                {
                    return new BusinessResult(400, "File is required");
                }

                if (uploadImageByFileModel.TagIds == null || uploadImageByFileModel.TagIds.Count() == 0)
                    return new BusinessResult(400, "Tag for image is required");

                List<ImageFileCreateEntry> listImageFileCreateEntry = new List<ImageFileCreateEntry>();
               
                foreach (var uploadImage in uploadImageByFileModel.FileImages)
                {
                    using (var stream = uploadImage.OpenReadStream())
                    {
                        byte[] imageBytes;
                        using (var memoryStream = new MemoryStream())
                        {
                            await stream.CopyToAsync(memoryStream);
                            imageBytes = memoryStream.ToArray();
                        }
                        ImageFileCreateEntry imageFileCreateEntry = new ImageFileCreateEntry()
                        {
                            Contents = imageBytes,
                            Name = uploadImage.FileName,
                            TagIds = uploadImageByFileModel.TagIds.Select(Guid.Parse).ToList()
                        };
                        listImageFileCreateEntry.Add(imageFileCreateEntry);
                    }
                   
                }
                ImageFileCreateBatch imageFileCreateBatch = new ImageFileCreateBatch()
                {
                    Images = listImageFileCreateEntry,
                    TagIds = uploadImageByFileModel.TagIds.Select(Guid.Parse).ToList(),
                };

                var uploadImageByFile = await trainingClient.CreateImagesFromFilesAsync(projectId, imageFileCreateBatch);
                if(uploadImageByFile != null && uploadImageByFile.IsBatchSuccessful)
                {
                    return new BusinessResult(200, "Upload image to Custom Vision success", uploadImageByFile);
                }
                return new BusinessResult(200, "Upload image to Custom Vision failed");

            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> DeleteTag(string tagId)
        {
            try
            {
                var parseTag = Guid.Parse(tagId);
                await trainingClient.DeleteTagAsync(projectId, parseTag);
                return new BusinessResult(200, "Delete Tag Success", true);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateTag(UpdateTagModel updateTagModel)
        {
            try
            {
                Guid oldTagId = Guid.Parse(updateTagModel.UpdateTagId);
                Tag updateTag = new Tag()
                {
                    Name = updateTagModel.NewTagName,
                };
                var updateTagToCustomVision =  await trainingClient.UpdateTagAsync(projectId, oldTagId, updateTag);
                if(updateTagToCustomVision != null)
                {
                    return new BusinessResult(200, "Update tag success", updateTagToCustomVision);
                }
                return new BusinessResult(400, "Update tag failed");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetAllImageAsync(GetImagesModelWithPagination getImagesModelWithPagination)
        {
            try
            {
                var calculateTakeIndex = (getImagesModelWithPagination.PageIndex - 1) * getImagesModelWithPagination.PageSize;
                var getAllImages = await trainingClient.GetImagesAsync(projectId, taggingStatus: getImagesModelWithPagination.TaggingStatus, filter: getImagesModelWithPagination.Filter, orderBy: getImagesModelWithPagination.OrderBy, take: getImagesModelWithPagination.PageSize, skip: calculateTakeIndex);
                if(getAllImages != null && getAllImages.Count() > 0)
                {
                    return new BusinessResult(200, "Get All Images From Custom Vision Success", getAllImages);
                }
                return new BusinessResult(404, "Do not have any image");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> DeleteImage(DeleteImagesModel deleteImagesModel)
        {
            try
            {
                var imageDeletes = deleteImagesModel.ImageIds.Select(Guid.Parse).ToList();
                await trainingClient.DeleteImagesAsync(projectId, imageDeletes);
                return new BusinessResult(200, "Delete Image Success", true);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetImagesUnTagged(GetImagesWithTagged getImagesUntagged)
        {
            try
            {
                var calculateTakeIndex = (getImagesUntagged.PageIndex - 1) * getImagesUntagged.PageSize;
                var getAllImages = await trainingClient.GetUntaggedImagesAsync(projectId, orderBy: getImagesUntagged.OrderBy, take: getImagesUntagged.PageSize, skip: calculateTakeIndex);
                if (getAllImages != null && getAllImages.Count() > 0)
                {
                    return new BusinessResult(200, "Get All Images From Custom Vision Success", getAllImages);
                }
                return new BusinessResult(404, "Do not have any image");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetImagesTagged(GetImagesWithTagged getImagesTagged)
        {
            try
            {
                var calculateTakeIndex = (getImagesTagged.PageIndex - 1) * getImagesTagged.PageSize;
                var getAllImages = await trainingClient.GetTaggedImagesAsync(projectId, orderBy: getImagesTagged.OrderBy, take: getImagesTagged.PageSize, skip: calculateTakeIndex);
                if (getAllImages != null && getAllImages.Count() > 0)
                {
                    return new BusinessResult(200, "Get All Images From Custom Vision Success", getAllImages);
                }
                return new BusinessResult(404, "Do not have any image");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> QuickTestImageByURL(QuickTestImageByURLModel quickTestImageByURLModel)
        {
            try
            {
                ImageUrl imageUrl = new ImageUrl()
                {
                    Url = quickTestImageByURLModel.ImageURL
                };
                var quickTestImageByURL = await trainingClient.QuickTestImageUrlAsync(projectId, imageUrl);
                if(quickTestImageByURL != null)
                {
                    return new BusinessResult(200, "Quick Test Image By URL Success", quickTestImageByURL);
                }
                return new BusinessResult(400, "Quick Test Image By URL Failed");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> QuickTestImageByFile(QuickTestImageByFileModel quickTestImageByFileModel)
        {
            try
            {
                using (var stream = quickTestImageByFileModel.FileImage.OpenReadStream())
                {
                    byte[] imageBytes;
                    using (var memoryStream = new MemoryStream())
                    {
                        await stream.CopyToAsync(memoryStream);
                        imageBytes = memoryStream.ToArray();
                    }
                    var quickTestImageByFile = await trainingClient.QuickTestImageAsync(projectId, stream);
                    if (quickTestImageByFile != null)
                    {
                        return new BusinessResult(200, "Quick Test Image By File Success", quickTestImageByFile);
                    }
                    return new BusinessResult(400, "Quick Test Image By File Failed");
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> TrainedProject(TrainingProjectModel trainingProjectModel)
        {
            try
            {
                var trainedProject = await trainingClient.TrainProjectAsync(projectId, trainingProjectModel.TrainingType, trainingProjectModel.ReservedHours);
                return new BusinessResult(Const.ERROR_EXCEPTION, "");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
