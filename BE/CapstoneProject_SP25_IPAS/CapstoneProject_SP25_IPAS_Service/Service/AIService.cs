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
                if (getFarmInfo == null)
                {
                    return new BusinessResult(Const.FAIL_ASK_AI_CODE, "Can not find any farm with this farmId");
                }
                var checkRoomExist = await _unitOfWork.ChatRoomRepository.GetByCondition(x => x.FarmID == farmId || x.UserID == userId);
                if (checkRoomExist == null)
                {
                    checkRoomExist = new ChatRoom()
                    {
                        RoomCode = "IPAS_" + getFarmInfo.FarmName + "_ChatGemini_" + DateTime.Now.Date,
                        RoomName = "Chat with Gemini",
                        CreateDate = DateTime.Now,
                        FarmID = getFarmInfo.FarmId,
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
                var result =  new ChatResponse()
                {
                    Question = question,
                    Answer = geminiApiResponse ?? "Xin lỗi, tôi không thề tìm thấy câu trả lời"
                };
                if(result != null)
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

                    if (result != null)
                    {
                        return new BusinessResult(Const.SUCCESS_PREDICT_IMAGE_BY_FILE_CODE, Const.SUCCESS_PREDICT_IMAGE_BY_FILE_MSG, result);
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
        private async Task<string> GetAnswerFromGeminiAsync(string question, Farm farmInfo)
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
                Parts = "Bạn là IPAS (Intelligent Pomelo AgriSolutions), một chuyên gia về cây bưởi..."
            },
            new InputContent
            {
                Role = "model",
                Parts = $"Xin chào! Tôi là IPAS, chuyên gia về cây bưởi, tôi có thể giúp gì cho trang trại {farmInfo.FarmName}... "
            },
            new InputContent
            {
                Role = "model",
                Parts = "Đã hiểu. Tôi là IPAS, tôi sẽ cung cấp lời khuyên chuyên môn cho..."
            },
            new InputContent
            {
                Role = "user",
                Parts = "Bạn chỉ được trả lời các câu hỏi liên quan đến cây bưởi. Nếu người dùng hỏi về chủ đề khác, hãy từ chối trả lời."
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
                return new BusinessResult();
            }
            catch (Exception ex)
            {

                // Xử lý lỗi
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
