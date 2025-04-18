using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.AuthorizeConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AIRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Org.BouncyCastle.Asn1.Crmf;
using StackExchange.Redis;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IDistributedCache _distributedCache;
        public AIController(IAIService aiService, IJwtTokenService jwtTokenService, IDistributedCache distributedCache)
        {
            _aiService = aiService;
            _jwtTokenService = jwtTokenService;
            _distributedCache = distributedCache;
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.OWNER)},{nameof(RoleEnum.MANAGER)},{nameof(RoleEnum.EMPLOYEE)}")]
        [HttpPost(APIRoutes.AI.chatbox, Name = "askQuestion")]
        public async Task<IActionResult> GetAnswerAsync([FromForm] ChatRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Question))
                {
                    return BadRequest(new { Message = "Câu hỏi không được để trống." });
                }
                if (!request.farmId.HasValue)
                    request.farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                if (!request.userId.HasValue)
                    request.userId = _jwtTokenService.GetUserIdFromToken() ?? 0;
                var result = await _aiService.GetAnswerAsync(chatRequest: request, request.farmId, request.userId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPost(APIRoutes.AI.predictDiseaseByFile, Name = "predictDiseaseByFile")]
        public async Task<IActionResult> PredictDiseaseByFile([FromForm] PredictRequest request)
        {
            try
            {
                var result = await _aiService.PredictDiseaseByFile(request.Image);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPost(APIRoutes.AI.predictDiseaseByURL, Name = "predictDiseaseByURL")]
        public async Task<IActionResult> PredictDiseaseByURL([FromBody] PredictImageByURLRequest request)
        {
            try
            {
                var result = await _aiService.PredictDiseaseByURL(request.ImageURL);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpGet(APIRoutes.AI.getHistoryOfChat, Name = "getHistoryOfChat")]
        public async Task<IActionResult> HistoryOfChat([FromQuery] GetAllRoomModel paginationParameter, int? farmId, int? userId, int roomId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                if (!userId.HasValue)
                    userId = _jwtTokenService.GetUserIdFromToken() ?? 0;
                var result = await _aiService.GetHistoryChat(paginationParameter, farmId, userId, roomId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpGet(APIRoutes.AI.getAllTags, Name = "getAllTags")]
        public async Task<IActionResult> GetAllTags()
        {
            try
            {
                var result = await _aiService.GetTags();
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpPost(APIRoutes.AI.createTag, Name = "createTag")]
        public async Task<IActionResult> CreateTag([FromBody] CreateTagModel createTagModel)
        {
            try
            {
                var result = await _aiService.CreateTag(createTagModel.TagName);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpPost(APIRoutes.AI.uploadImageByFile, Name = "uploadImageByFile")]
        public async Task<IActionResult> UploadImageByFile([FromForm] UploadImageByFileModel uploadImageByFileModel)
        {
            try
            {
                var result = await _aiService.UploadImageByFileToCustomVision(uploadImageByFileModel);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpPost(APIRoutes.AI.uploadImageByLink, Name = "uploadImageByLink")]
        public async Task<IActionResult> UploadImageByLink([FromBody] UploadImageModel uploadImageModel)
        {
            try
            {
                var result = await _aiService.UploadImageByURLToCustomVision(uploadImageModel);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpDelete(APIRoutes.AI.deleteTag, Name = "deleteTag")]
        public async Task<IActionResult> DeleteTag([FromRoute] string tagId)
        {
            try
            {
                var result = await _aiService.DeleteTag(tagId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpGet(APIRoutes.AI.getAllImageAsync, Name = "getAllImageAsync")]
        public async Task<IActionResult> GetAllImageAsync([FromQuery] GetImagesModelWithPagination getImagesModelWithPagination)
        {
            try
            {
                var result = await _aiService.GetAllImageAsync(getImagesModelWithPagination);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpGet(APIRoutes.AI.getImageUntaggedAsync, Name = "getImageUntaggedAsync")]
        public async Task<IActionResult> GetImageUntaggedAsync([FromQuery] GetImagesWithTagged getImagesWithTagged)
        {
            try
            {
                var result = await _aiService.GetImagesUnTagged(getImagesWithTagged);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpGet(APIRoutes.AI.getImageTaggedAsync, Name = "getImageTaggedAsync")]
        public async Task<IActionResult> GetImageTaggedAsync([FromQuery] GetImagesWithTagged getImagesWithTagged)
        {
            try
            {
                var result = await _aiService.GetImagesTagged(getImagesWithTagged);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpDelete(APIRoutes.AI.deleteImage, Name = "deleteImage")]
        public async Task<IActionResult> DeleteImageAsync(DeleteImagesModel deleteImagesModel)
        {
            try
            {
                var result = await _aiService.DeleteImage(deleteImagesModel);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpPut(APIRoutes.AI.updateTag, Name = "updateTag")]
        public async Task<IActionResult> UpdateTagAsync([FromBody] UpdateTagModel updateTagModel)
        {
            try
            {
                var result = await _aiService.UpdateTag(updateTagModel);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
             
        //[HybridAuthorize($"{nameof(RoleEnum.ADMIN)},{nameof(RoleEnum.EXPERT)}")]
        [HttpPost(APIRoutes.AI.trainedProject, Name = "trainedProject")]
        public async Task<IActionResult> TrainedProjectAsync()
        {
            try
            {
                var result = await _aiService.TrainedProject();
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPost(APIRoutes.AI.publishIteration, Name = "publishIteration")]
        public async Task<IActionResult> PublishIterationAsync()
        {
            try
            {
                var result = await _aiService.PublishIterations();
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
        [HttpGet("set")]
        public async Task<IActionResult> SetCache()
        {
            await _distributedCache.SetStringAsync("test_key", "Hello from Redis!");
            return Ok("Set cache thành công!");
        }

        [HttpGet("get")]
        public async Task<IActionResult> GetCache()
        {
            var value = await _distributedCache.GetStringAsync("test_key");
            return Ok(!string.IsNullOrEmpty(value) ? value.ToString() : "Cache không tồn tại!");
        }

        [HttpGet(APIRoutes.AI.getAllRoom, Name = "getAllRoom")]
        public async Task<IActionResult> GetAllRoomAsync([FromQuery] GetAllRoomModel getAllRoomModel, int? farmId, int? userId)
        {
            try
            {
                if (!farmId.HasValue)
                    farmId = _jwtTokenService.GetFarmIdFromToken() ?? 0;
                if (!userId.HasValue)
                    userId = _jwtTokenService.GetUserIdFromToken() ?? 0;
                var result = await _aiService.GetAllRoomChat(getAllRoomModel, farmId, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPatch(APIRoutes.AI.changeNameOfRoom, Name = "changeNameOfRoom")]
        public async Task<IActionResult> ChangeNameOfRoom([FromBody] ChangeNameOfRoomModel changeNameOfRoomModel)
        {
            try
            {
                var result = await _aiService.ChangeNameOfRoom(changeNameOfRoomModel.RoomID, changeNameOfRoomModel.NewRoomName);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpDelete(APIRoutes.AI.deleteRoom, Name = "deleteRoom")]
        public async Task<IActionResult> DeleteRoom([FromQuery] int roomId)
        {
            try
            {
                var result = await _aiService.DeleteRoom(roomId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPut(APIRoutes.AI.updateTagOfImage, Name = "updateTagOfImage")]
        public async Task<IActionResult> UpdateTagOfImage([FromBody] UpdateTagOfImageModel updateTagOfImageModel)
        {
            try
            {
                var result = await _aiService.UpdateTagOfImage(updateTagOfImageModel.imageId, updateTagOfImageModel.tagId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpGet(APIRoutes.AI.getAllTagsWithPagin, Name = "getAllTagsWithPagin")]
        public async Task<IActionResult> GetAllTagsWithPaginAsync([FromQuery] PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _aiService.GetTagsWithPagin(paginationParameter);
                return Ok(result);
            }
            catch (Exception ex)
            {

                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
    }
}
