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
using MimeKit;
using GenerativeAI;
using GenerativeAI.Types;
using GenerativeAI.Methods;
using GenerativeAI.Models;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using Google.Apis.Logging;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.Models;
using System.IO;
using MimeKit.Cryptography;
using CapstoneProject_SP25_IPAS_Common.Enum;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction.Models;
using static System.Net.Mime.MediaTypeNames;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AIRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Common.Constants;
using System.Numerics;
using CapstoneProject_SP25_IPAS_BussinessObject.Migrations;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportOfUserModels;
using System.Text.Json;
using Newtonsoft.Json;
using Azure;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using CapstoneProject_SP25_IPAS_Common.Upload;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class AIService : IAIService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private ChatSession _chatSession;
        private readonly ICloudinaryService _cloudinaryService;

        private readonly string predictionEndpoint;
        private readonly string predictionKey;
        private readonly string trainingEndPoint;
        private readonly string trainingKey;
        private readonly string predictionResourceId;
        private readonly Guid projectId;
        private readonly CustomVisionTrainingClient trainingClient;
        private readonly CustomVisionPredictionClient predictionClient;

        public AIService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration cofig, ICloudinaryService cloudinaryService)
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
            predictionResourceId = customVisionConfig["PredictionResourceId"];

            trainingClient = new CustomVisionTrainingClient(new Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.ApiKeyServiceClientCredentials(trainingKey))
            {
                Endpoint = trainingEndPoint
            };

            predictionClient = new CustomVisionPredictionClient(new Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction.ApiKeyServiceClientCredentials(predictionKey))
            {
                Endpoint = predictionEndpoint
            };
            _cloudinaryService = cloudinaryService;
        }

        public async Task<BusinessResult> GetAnswerAsync(ChatRequest chatRequest, int? farmId, int? userId)
        {
            try
            {
                var getFarmInfo = await _unitOfWork.FarmRepository.GetFarmById(farmId.Value);
                var checkRoomExist = await _unitOfWork.ChatRoomRepository.GetByCondition(x => x.RoomId == chatRequest.RoomId);
                if (checkRoomExist == null)
                {
                    checkRoomExist = new ChatRoom()
                    {
                        RoomCode = "IPAS_" + getFarmInfo.FarmName + "_ChatIPAS_" + DateTime.Now.Date,
                        RoomName = chatRequest.Question.Length > 10 ? chatRequest.Question.Substring(0, 10) + "..." : chatRequest.Question,
                        CreateDate = DateTime.Now,
                        FarmID = farmId,
                        UserID = userId > 0 ? userId.Value : null,
                    };
                    await _unitOfWork.ChatRoomRepository.Insert(checkRoomExist);
                    await _unitOfWork.SaveAsync();
                }
                var promptBuilder = new StringBuilder();
                var newResource = new List<Resource>();
                if (chatRequest.Resource != null)
                {
                    foreach (var resource in chatRequest.Resource)
                    {
                        if (resource != null)
                        {
                            var cloudinaryUrl = await _cloudinaryService.UploadResourceAsync(resource, CloudinaryPath.AI_RESOURCE);
                            if (cloudinaryUrl.Data == null) continue;
                            string fileFormat;
                            if (Util.IsVideo(Path.GetExtension(resource.FileName)?.TrimStart('.').ToLower()))
                                fileFormat = FileFormatConst.VIDEO.ToLower();
                            else fileFormat = FileFormatConst.IMAGE.ToLower();
                            var aiResource = new Resource()
                            {
                                ResourceCode = CodeAliasEntityConst.RESOURCE + CodeHelper.GenerateCode(),
                                ResourceURL = (string)cloudinaryUrl.Data,
                                ResourceType = ResourceTypeConst.PLANT_GROWTH_HISTORY,
                                FileFormat = fileFormat,
                                CreateDate = DateTime.Now,
                                Description = resource.FileName,
                            };
                            newResource.Add(aiResource);
                        }
                    }
                    if (newResource.Any())
                    {
                        promptBuilder.AppendLine("Người dùng đã gửi kèm các tài nguyên sau (User has upload some resource after):");
                        foreach (var url in newResource)
                        {
                            promptBuilder.AppendLine($"- {url.ResourceURL}");
                        }
                    }
                }
                promptBuilder.AppendLine($"Câu hỏi(Question is): {chatRequest.Question}");
                var geminiApiResponse = await GetAnswerFromGeminiAsync(promptBuilder.ToString(), getFarmInfo, checkRoomExist.RoomId);
                var jsonCheck = Util.ExtractJson(geminiApiResponse!);
                var newChatMessage = new ChatMessage()
                {
                    CreateDate = DateTime.Now,
                    Question = chatRequest.Question,
                    MessageContent = jsonCheck ?? "Xin lỗi, tôi không thề tìm thấy câu trả lời",
                    UpdateDate = DateTime.Now,
                    SenderId = userId > 0 ? userId.Value : null,
                    RoomId = checkRoomExist.RoomId,
                    Resources = newResource
                };
                //try
                //{
                //    geminiApiResponse = Util.ExtractJson(geminiApiResponse);
                //    jsonCheck = JsonConvert.DeserializeObject<GeminiAnswerFormat>(geminiApiResponse); //không phải JSON
                //}
                //catch
                //{
                //    return new BusinessResult(500, "AI response not correct format");
                //}
                await _unitOfWork.ChatMessageRepository.Insert(newChatMessage);
                await _unitOfWork.SaveAsync();
                //var result = new ChatResponse()
                //{
                //    Question = chatRequest.Question,
                //    Answer = jsonCheck! /*?? "Xin lỗi, tôi không thề tìm thấy câu trả lời"*/
                //};
                var result = _mapper.Map<ChatMessageModel>(newChatMessage);
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

                    var predict = predictionClient.ClassifyImage(projectId, "AgricultureAIPomelo", stream);

                    var result = predict.Predictions.Select(p => new
                    {
                        probability = p.Probability,
                        tagId = p.TagId,
                        tagName = p.TagName,
                        BoundingBox = p.BoundingBox,
                        TagType = p.TagType,
                    });

                    var percentToGet = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.PREDICT_PERCENT.Trim(), (double)0.75);
                    result = result.Where(x => x.probability > percentToGet);

                    if (result != null)
                    {
                        if (result.Count() > 0)
                        {
                            return new BusinessResult(Const.SUCCESS_PREDICT_IMAGE_BY_FILE_CODE, Const.SUCCESS_PREDICT_IMAGE_BY_FILE_MSG, result);
                        }
                        else
                        {
                            return new BusinessResult(404, "Can not detect diseases on that image");

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
                if (!IsImageLink(imageURL))
                {
                    return new BusinessResult(Const.ERROR_EXCEPTION, "Pick images with these formats: png, jpg, bmp or gif.");
                }
                // Tạo đối tượng ImageUrl từ chuỗi URL
                var imageUrlObj = new Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction.Models.ImageUrl { Url = imageURL };

                // Gọi API dự đoán từ URL của hình ảnh
                var predict = await predictionClient.ClassifyImageUrlAsync(projectId, "AgricultureAIPomelo", imageUrlObj);

                var result = predict.Predictions.Select(p => new
                {
                    probability = p.Probability,
                    tagId = p.TagId,
                    tagName = p.TagName,
                    BoundingBox = p.BoundingBox,
                    TagType = p.TagType,
                });

                var percentToGet = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.PREDICT_PERCENT.Trim(), (double)0.75);
                result = result.Where(x => x.probability > percentToGet);

                // Trả về kết quả dự đoán
                if (result != null)
                {
                    if (result.Count() > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_PREDICT_IMAGE_BY_URL_CODE, Const.SUCCESS_PREDICT_IMAGE_BY_URL_MSG, result);
                    }
                    else
                    {
                        return new BusinessResult(404, "Can not detect diseases on that image");

                    }
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
        private async Task<string> GetAnswerFromGeminiAsync(string question, Farm getFarmInfo, int roomId)
        {
            try
            {

                string geminiKey = _config["GeminiSettings:ApiKey"];

                var generationConfig = new GenerationConfig
                {
                    Temperature = double.TryParse(_config["GeminiSettings:Temperature"], out var temp) ? temp : 0.6,
                    TopP = double.TryParse(_config["GeminiSettings:TopP"], out var topP) ? topP : 0.5,
                    TopK = int.TryParse(_config["GeminiSettings:TopK"], out var topK) ? topK : 40,
                    MaxOutputTokens = int.TryParse(_config["GeminiSettings:MaxOutputTokens"], out var maxTokens) ? maxTokens : 8192,
                };

                // Tạo lịch sử hội thoại (history)
                //         var history = new[]
                //{
                //     new InputContent
                //     {
                //         Role = "user",
                //         Parts = "Bạn là chuyên gia trong lĩnh vực trồng và chăm sóc cây bưởi ..."
                //     },
                //     new InputContent
                //     {
                //         Role = "user",
                //         Parts = "You are an expert in the field of planting and caring for grapefruit trees..."
                //     },
                //     new InputContent
                //     {
                //         Role = "user",
                //         Parts = "Bạn là IPAS (Intelligent Pomelo AgriSolutions), một chuyên gia về cây bưởi..."
                //     },
                //      new InputContent
                //     {
                //         Role = "user",
                //         Parts = "You are IPAS (Intelligent Pomelo AgriSolutions), a grapefruit expert..."
                //     },
                //     new InputContent
                //     {
                //         Role = "model",
                //         Parts = $"Xin chào! Tôi là IPAS, chuyên gia về cây bưởi, tôi có thể giúp gì cho bạn... "
                //     },
                //     new InputContent
                //     {
                //         Role = "model",
                //         Parts = $"Hello! I'm IPAS, grapefruit expert, how can I help you... "
                //     },
                //     new InputContent
                //     {
                //         Role = "model",
                //         Parts = "Đã hiểu. Tôi là IPAS, tôi sẽ cung cấp lời khuyên chuyên môn cho..."
                //     },
                //      new InputContent
                //     {
                //         Role = "model",
                //         Parts = "Got it. I'm IPAS, I'll provide professional advice for..."
                //     },
                //     new InputContent
                //     {
                //         Role = "model",
                //         Parts = $"Dựa vào đặc tính đất đai của trang trại của bạn là {getFarmInfo.SoilType}, tôi có thể đưa ra lời khuyên như sau..."
                //     },
                //      new InputContent
                //     {
                //         Role = "model",
                //         Parts = $"Based on your farm's soil characteristics {getFarmInfo.SoilType}, I can give you the following advice..."
                //     },
                //     new InputContent
                //     {
                //         Role = "user",
                //         Parts = "Bạn chỉ được trả lời các câu hỏi liên quan đến cây bưởi. Nếu người dùng hỏi về chủ đề khác, hãy từ chối trả lời."
                //     },
                //     new InputContent
                //     {
                //         Role = "user",
                //         Parts = "You may only answer questions related to pomelo trees. If a user asks about another topic, decline to answer."
                //     }
                // };
                var promptSections = _config.GetSection("GeminiSettings:PromptContext").Get<List<GeminiPrompt>>() ?? new();
                // Tạo lịch sử hội thoại (history)
                var history = promptSections.Select(p => new InputContent
                {
                    Role = p.Role,
                    Parts = p.Parts.Replace("{soilType}", getFarmInfo.SoilType ?? "")
                }).ToList();
                if (roomId > 0)
                {
                    var recentMessages = await _unitOfWork.ChatMessageRepository
                        .Get(m => m.RoomId == roomId && m.MessageContent != null, x => x.OrderByDescending(m => m.CreateDate), pageIndex: 1, pageSize: 10);

                    foreach (var msg in recentMessages)
                    {
                        history.Add(new InputContent
                        {
                            Role = "user",
                            Parts = msg.Question
                        });
                        history.Add(new InputContent
                        {
                            Role = "model",
                            Parts = msg.MessageContent
                        });
                    }
                }
                var startChatParams = new StartChatParams
                {
                    GenerationConfig = generationConfig,
                    History = history.ToArray()
                };
                var model = new GenerativeModel(geminiKey!, _config["GeminiSettings:Model"]!);
                var
                _chatSession = model.StartChat(startChatParams);
                var response = await _chatSession.SendMessageAsync(question);
                if (string.IsNullOrEmpty(response))
                {
                    return null!;
                }

                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<BusinessResult> GetHistoryChat(GetAllRoomModel paginationParameter, int? farmId, int? userId, int roomId)
        {
            try
            {
                Expression<Func<ChatRoom, bool>> filter = x => x.UserID == userId && x.FarmID == farmId && x.RoomId == roomId;
                Func<IQueryable<ChatRoom>, IOrderedQueryable<ChatRoom>> orderBy = x => x.OrderByDescending(x => x.CreateDate);
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.RoomId == validInt || x.CreateBy == validInt);
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = filter.And(x => x.CreateDate == validDate);
                    }

                    else
                    {
                        filter = x => x.RoomCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.RoomName.ToLower().Contains(paginationParameter.Search.ToLower());
                    }
                }

                if (!string.IsNullOrEmpty(paginationParameter.SortBy))
                {
                    switch (paginationParameter.SortBy.ToLower())
                    {
                        case "roomid":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.RoomId)
                                       : x => x.OrderBy(x => x.RoomId)) : x => x.OrderBy(x => x.RoomId);
                            break;
                        case "roomcode":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.RoomCode)
                                      : x => x.OrderBy(x => x.RoomCode)) : x => x.OrderBy(x => x.RoomCode);
                            break;
                        case "roomname":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.RoomName)
                                      : x => x.OrderBy(x => x.RoomName)) : x => x.OrderBy(x => x.RoomName);
                            break;
                        case "createdate":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.CreateDate)
                                      : x => x.OrderBy(x => x.CreateDate)) : x => x.OrderBy(x => x.CreateDate);
                            break;
                        case "airesponseid":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.AiresponseId)
                                      : x => x.OrderBy(x => x.AiresponseId)) : x => x.OrderBy(x => x.AiresponseId);
                            break;
                        case "farmid":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.FarmID)
                                      : x => x.OrderBy(x => x.FarmID)) : x => x.OrderBy(x => x.FarmID);
                            break;
                        case "userid":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.UserID)
                                      : x => x.OrderBy(x => x.UserID)) : x => x.OrderBy(x => x.UserID);
                            break;
                        case "createby":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                      ? x => x.OrderByDescending(x => x.CreateBy)
                                      : x => x.OrderBy(x => x.CreateBy)) : x => x.OrderBy(x => x.CreateBy);
                            break;
                        default:
                            orderBy = x => x.OrderByDescending(x => x.CreateDate);
                            break;
                    }
                }
                //string includeProperties = "ChatMessages";
                var entities = await _unitOfWork.ChatRoomRepository.Get(filter, orderBy);
                var listChatMessage = _mapper.Map<IEnumerable<ChatRoomModel>>(entities).ToList();
                if (listChatMessage.Any())
                {
                    var result = new BusinessResult(Const.SUCCESS_GET_HISTORY_CHAT_CODE, Const.SUCCESS_GET_HISTORY_CHAT_MSG, listChatMessage);
                    return result;
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_HISTORY_CHAT_CODE, Const.WARNIN_GET_HISTORY_CHAT_MSG, new PageEntity<ChatMessageModel>());
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetAllRoomChat(GetAllRoomModel getAllRoomModel, int? farmId, int? userId)
        {
            try
            {
                Expression<Func<ChatRoom, bool>> filter = x => x.UserID == userId && x.FarmID == farmId;
                Func<IQueryable<ChatRoom>, IOrderedQueryable<ChatRoom>> orderBy = x => x.OrderByDescending(x => x.CreateDate);
                if (!string.IsNullOrEmpty(getAllRoomModel.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(getAllRoomModel.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.RoomId == validInt || x.CreateBy == validInt);
                    }
                    else if (DateTime.TryParse(getAllRoomModel.Search, out validDate))
                    {
                        filter = filter.And(x => x.CreateDate == validDate);
                    }

                    else
                    {
                        filter = x => x.RoomCode.ToLower().Contains(getAllRoomModel.Search.ToLower())
                                      || x.RoomName.ToLower().Contains(getAllRoomModel.Search.ToLower());
                    }
                }

                if (!string.IsNullOrEmpty(getAllRoomModel.SortBy))
                {
                    switch (getAllRoomModel.SortBy.ToLower())
                    {
                        case "roomid":
                            orderBy = !string.IsNullOrEmpty(getAllRoomModel.Direction)
                                        ? (getAllRoomModel.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.RoomId)
                                       : x => x.OrderBy(x => x.RoomId)) : x => x.OrderBy(x => x.RoomId);
                            break;
                        case "roomcode":
                            orderBy = !string.IsNullOrEmpty(getAllRoomModel.Direction)
                                        ? (getAllRoomModel.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.RoomCode)
                                      : x => x.OrderBy(x => x.RoomCode)) : x => x.OrderBy(x => x.RoomCode);
                            break;
                        case "roomname":
                            orderBy = !string.IsNullOrEmpty(getAllRoomModel.Direction)
                                        ? (getAllRoomModel.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.RoomName)
                                      : x => x.OrderBy(x => x.RoomName)) : x => x.OrderBy(x => x.RoomName);
                            break;
                        case "createdate":
                            orderBy = !string.IsNullOrEmpty(getAllRoomModel.Direction)
                                        ? (getAllRoomModel.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.CreateDate)
                                      : x => x.OrderBy(x => x.CreateDate)) : x => x.OrderBy(x => x.CreateDate);
                            break;
                        case "airesponseId":
                            orderBy = !string.IsNullOrEmpty(getAllRoomModel.Direction)
                                        ? (getAllRoomModel.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.AiresponseId)
                                      : x => x.OrderBy(x => x.AiresponseId)) : x => x.OrderBy(x => x.AiresponseId);
                            break;
                        case "farmid":
                            orderBy = !string.IsNullOrEmpty(getAllRoomModel.Direction)
                                        ? (getAllRoomModel.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.FarmID)
                                      : x => x.OrderBy(x => x.FarmID)) : x => x.OrderBy(x => x.FarmID);
                            break;
                        case "userid":
                            orderBy = !string.IsNullOrEmpty(getAllRoomModel.Direction)
                                        ? (getAllRoomModel.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.UserID)
                                      : x => x.OrderBy(x => x.UserID)) : x => x.OrderBy(x => x.UserID);
                            break;
                        case "createby":
                            orderBy = !string.IsNullOrEmpty(getAllRoomModel.Direction)
                                        ? (getAllRoomModel.Direction.ToLower().Equals("desc")
                                      ? x => x.OrderByDescending(x => x.CreateBy)
                                      : x => x.OrderBy(x => x.CreateBy)) : x => x.OrderBy(x => x.CreateBy);
                            break;
                        default:
                            orderBy = x => x.OrderByDescending(x => x.CreateDate);
                            break;
                    }
                }
                var entities = await _unitOfWork.ChatRoomRepository.Get(filter, orderBy);

                if (entities.Any())
                {
                    var result = new BusinessResult(Const.SUCCESS_GET_HISTORY_CHAT_CODE, "Get all room chat success", entities);
                    return result;
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_HISTORY_CHAT_CODE, "Do not have any room chat", new List<GetAllRoomMapping>());
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ChangeNameOfRoom(int roomId, string newRoomName)
        {
            try
            {
                var getRoom = await _unitOfWork.ChatRoomRepository.GetByCondition(x => x.RoomId == roomId);
                if (getRoom == null)
                {
                    return new BusinessResult(400, "Room does not exist");
                }
                getRoom.RoomName = newRoomName;
                _unitOfWork.ChatRoomRepository.Update(getRoom);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(200, "Change Room Name Success");
                }
                else
                {
                    return new BusinessResult(400, "Change Room Name Failed");
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> DeleteRoom(int roomId)
        {
            try
            {
                var getListMessage = await _unitOfWork.ChatMessageRepository.GetChatMessagesByRoomId(roomId);
                _unitOfWork.ChatMessageRepository.RemoveRange(getListMessage);
                await _unitOfWork.SaveAsync();
                var getRoom = await _unitOfWork.ChatRoomRepository.GetByCondition(x => x.RoomId == roomId);
                _unitOfWork.ChatRoomRepository.Delete(getRoom);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(200, "Delete Room Success");
                }
                else
                {
                    return new BusinessResult(400, "Delete Room Failed");
                }
            }
            catch (Exception ex)
            {
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
                foreach (var uploadImage in uploadImageModel.ImageUrls)
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
                if (uploadImageByURL != null && uploadImageByURL.IsBatchSuccessful)
                {
                    return new BusinessResult(200, "Upload image to Custom Vision success", uploadImageByURL);
                }
                return new BusinessResult(400, "Image has been assigned to another tag");

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
                if (uploadImageByFileModel.FileImages == null || uploadImageByFileModel.FileImages.Count() == 0)
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

                if (uploadImageByFile != null && uploadImageByFile.IsBatchSuccessful)
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

                var getImageByTag = await trainingClient.GetImagesAsync(
                                                projectId
                                            );
                var result = getImageByTag
                               .Where(img => img.Tags != null && img.Tags.Any(tag => parseTag == tag.TagId))
                               .ToList();
                if (result != null && result.Count() > 0)
                {
                    return new BusinessResult(200, "Can not delete this tag, because another image assigned this tag", true);
                }
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
                var updateTagToCustomVision = await trainingClient.UpdateTagAsync(projectId, oldTagId, updateTag);
                if (updateTagToCustomVision != null)
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
                // Bước 1: Lấy danh sách tất cả các tag
                var tags = await trainingClient.GetTagsAsync(projectId);

                // Nếu TagNames có dữ liệu thì tách ra danh sách List<string>
                List<Guid> tagIds = new List<Guid>();
                if (!string.IsNullOrEmpty(getImagesModelWithPagination.TagName))
                {
                    var tagNamesList = getImagesModelWithPagination.TagName.Split(',')
                                               .Select(t => t.Trim()) // Xóa khoảng trắng thừa
                                               .Where(t => !string.IsNullOrEmpty(t))
                                               .ToList();

                    // Lấy danh sách TagId từ TagName
                    tagIds = tags.Where(t => tagNamesList.Contains(t.Name, StringComparer.OrdinalIgnoreCase))
                                 .Select(t => t.Id)
                                 .ToList();

                    if (tagIds.Count == 0)
                    {
                        return new BusinessResult(404, "No matching tags found");
                    }
                }

                var calculateTakeIndex = (getImagesModelWithPagination.PageIndex - 1) * getImagesModelWithPagination.PageSize;
                var getAllImages = await trainingClient.GetImagesAsync(
                                                projectId,
                                                orderBy: getImagesModelWithPagination.OrderBy,
                                                take: getImagesModelWithPagination.PageSize,
                                                skip: calculateTakeIndex
                                            );
                if (tagIds.Count > 0)
                {
                    getAllImages = getAllImages
                               .Where(img =>  img.Tags != null && img.Tags.Any(tag => tagIds.Contains(tag.TagId)))
                               .ToList();
                }

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

        public async Task<BusinessResult> TrainedProject()
        {
            try
            {
                // Kiểm tra ảnh hợp lệ trước khi train
                var images = await trainingClient.GetImagesAsync(projectId);
                if (images.Count == 0)
                {
                    return new BusinessResult(400, "No images available for training.");
                }

                var taggedImages = images.Where(img => img.Tags != null && img.Tags.Count > 0).ToList();
                if (taggedImages.Count == 0)
                {
                    return new BusinessResult(400, "All images must have at least one tag before training.");
                }

                // Kiểm tra project có đang training không
                var iterations = await trainingClient.GetIterationsAsync(projectId);
                var latestIteration = iterations.OrderByDescending(i => i.Created).FirstOrDefault();
                if (latestIteration != null && latestIteration.Status == "Training")
                {
                    return new BusinessResult(400, "Project is already training. Please wait.");
                }

                // Bắt đầu train
                var iteration = await trainingClient.TrainProjectAsync(projectId);

                // Chờ training hoàn tất
                while (iteration.Status == "Training" || iteration.Status == "Queued")
                {
                    await Task.Delay(3000); // Chờ 3 giây trước khi kiểm tra lại
                    iteration = await trainingClient.GetIterationAsync(projectId, iteration.Id);

                }

                if (iteration.Status != "Completed")
                {
                    return new BusinessResult(500, $"Training failed with status: {iteration.Status}");
                }


                await trainingClient.UpdateIterationAsync(projectId, iteration.Id, iteration);
                // Kiểm tra nếu đã có iteration được publish với cùng tên
                var existingIteration = iterations.FirstOrDefault(i => i.PublishName == "AgricultureAIPomelo");

                if (existingIteration != null)
                {
                    // **Hủy publish iteration cũ**
                    await trainingClient.UnpublishIterationAsync(projectId, existingIteration.Id);
                }
                await trainingClient.PublishIterationAsync(projectId, iteration.Id, "AgricultureAIPomelo", predictionResourceId);


                return new BusinessResult(200, "Training Project Success");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public bool IsImageLink(string url)
        {
            string[] validImageExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
            return validImageExtensions.Contains(Path.GetExtension(url).ToLower());
        }

        public async Task<BusinessResult> PublishIterations()
        {
            try
            {
                // Lấy danh sách tất cả các iteration của dự án
                var iterations = await trainingClient.GetIterationsAsync(projectId);

                if (iterations == null || iterations.Count == 0)
                {
                    return new BusinessResult(400, "No iterations found.");
                }

                // Lấy iteration mới nhất (dựa trên Created Date)
                var latestIteration = iterations.OrderByDescending(i => i.Created).FirstOrDefault();

                if (latestIteration == null)
                {
                    return new BusinessResult(400, "No valid iterations available.");
                }

                // Kiểm tra nếu đã có iteration được publish với cùng tên
                var existingIteration = iterations.FirstOrDefault(i => i.PublishName == "AgricultureAIPomelo");

                if (existingIteration != null)
                {
                    // **Hủy publish iteration cũ**
                    await trainingClient.UnpublishIterationAsync(projectId, existingIteration.Id);
                }

                // **Publish iteration mới nhất với tên `publishName`**
                await trainingClient.PublishIterationAsync(projectId, latestIteration.Id, "AgricultureAIPomelo", predictionResourceId);

                return new BusinessResult(200, $"Published latest iteration: {latestIteration.Name} as AgricultureAIPomelo");
            }
            catch (Exception ex)
            {
                return new BusinessResult(500, $"Exception: {ex.Message}");
            }
        }

        public async Task<BusinessResult> UpdateTagOfImage(string imageId, string tagId)
        {
            try
            {
                var listImage = new List<Guid>() { Guid.Parse(imageId) };
                var existingTags = await trainingClient.GetImagesByIdsAsync(projectId, listImage);
                var image = existingTags.FirstOrDefault();
                if (image != null)
                {
                    if(image.Tags != null)
                    {
                        var oldTagIds = image.Tags.Select(x => x.TagId).ToList();
                        await trainingClient.DeleteImageTagsAsync(projectId, listImage, oldTagIds);
                    }
                }

                var result = trainingClient.CreateImageTags(projectId, new ImageTagCreateBatch
                {
                    Tags = new List<ImageTagCreateEntry>
                    {
                            new ImageTagCreateEntry
                            {
                                ImageId = Guid.Parse(imageId),
                                TagId = Guid.Parse(tagId)
                            }
                    }
                    
                });
                return new BusinessResult(200, "Update Tag Of Image Sucess");
            }
            catch (Exception ex)
            {

                return new BusinessResult(500, $"Exception: {ex.Message}");
            }
        }

        public async Task<BusinessResult> GetTagsWithPagin(PaginationParameter paginationParameter)
        {
            try
            {
                var getListTags = await trainingClient.GetTagsAsync(projectId);
                        
                Func<IQueryable<Tag>, IOrderedQueryable<Tag>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    getListTags = getListTags.Where(x => x.Name.ToLower().Contains(paginationParameter.Search.ToLower())).ToList();
                }
                   

                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "tagid")
                {
                    case "id":
                        if(!string.IsNullOrEmpty(paginationParameter.Direction))
                        {
                            if(paginationParameter.Direction.ToLower().Equals("desc"))
                            {
                                getListTags.OrderByDescending(x => x.Id);
                            }
                            else
                            {
                                getListTags.OrderBy(x => x.Id);
                            }
                        }
                        else
                        {
                            getListTags.OrderByDescending(x => x.Id);
                        }
                        break;
                    case "name":
                        if (!string.IsNullOrEmpty(paginationParameter.Direction))
                        {
                            if (paginationParameter.Direction.ToLower().Equals("desc"))
                            {
                                getListTags.OrderByDescending(x => x.Name);
                            }
                            else
                            {
                                getListTags.OrderBy(x => x.Name);
                            }
                        }
                        else
                        {
                            getListTags.OrderBy(x => x.Name);
                        }
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.Id);
                        break;
                }
                int skipRecord = paginationParameter.PageIndex - 1;

                var entities =  getListTags.Skip(skipRecord * paginationParameter.PageSize).Take(paginationParameter.PageSize).ToList();
                var pagin = new PageEntity<Tag>();

              
                pagin.List = entities;
                pagin.TotalRecord = getListTags.Count();
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    var result = new BusinessResult(200, "Get all tag with pagin success", pagin);
                    return result;
                }
                else
                {
                    return new BusinessResult(200, "Do not have any tag", new PageEntity<PlanModel>());
                }
                
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
