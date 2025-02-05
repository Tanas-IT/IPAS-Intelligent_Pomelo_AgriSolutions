using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CapstoneProject_SP25_IPAS_API.Payload;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadResourceController : ControllerBase
    {
        private readonly ICloudinaryService _cloudinaryService;

        public UploadResourceController(ICloudinaryService service)
        {
            _cloudinaryService = service;
        }

        [HttpPost(APIRoutes.Resource.uploadImage, Name = "uploadImage")]
        //[Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UploadImageToCloudinary(IFormFile uploadImageFile)
        {
            try
            {
                var linkURL = await _cloudinaryService.UploadImageAsync(uploadImageFile, null);
                if (linkURL != null)
                {
                    return Ok(new BusinessResult(Const.SUCCESS_UPLOAD_IMAGE_CODE, Const.SUCCESS_UPLOAD_IMAGE_MESSAGE, linkURL));
                }
                else
                {
                    return Ok(new BusinessResult(Const.FAIL_UPLOAD_IMAGE_CODE, Const.FAIL_UPLOAD_IMAGE_MESSAGE));
                }

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

        [HttpPost(APIRoutes.Resource.uploadResource, Name = "uploadResource")]
        //[Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UploadResourceToCloudinary(IFormFile uploadResourceFile)
        {
            try
            {
                var result = await _cloudinaryService.UploadResourceAsync(uploadResourceFile, null);
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

        [HttpDelete(APIRoutes.Resource.deleteImageByURL, Name = "deleteImageByURL")]
        public async Task<IActionResult> DeleteImageByURL([FromBody] DeleteImageURLModel deleteImageURLModel)
        {
            try
            {
                var result = await _cloudinaryService.DeleteImageByUrlAsync(deleteImageURLModel.ImageURL);
                if (result)
                {
                    return Ok(new BusinessResult(Const.SUCCESS_DELETE_IMAGE_CODE, Const.SUCCESS_DELETE_IMAGE_MESSAGE, true));
                }
                else
                {
                    return Ok(new BusinessResult(Const.FAIL_DELETE_IMAGE_CODE, Const.FAIL_DELETE_IMAGE_MESSAGE, false));
                }
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

        [HttpDelete(APIRoutes.Resource.deleteResourceByURL, Name = "deleteResourceByURL")]
        public async Task<IActionResult> DeleteResourceByURL([FromBody] DeleteReousceURLModel deleteResourceURLModel)
        {
            try
            {
                var result = await _cloudinaryService.DeleteResourceByUrlAsync(deleteResourceURLModel.ResourceURL);

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


        [HttpPost(APIRoutes.Resource.uploadvideo, Name = "uploadVideo")]
        public async Task<IActionResult> UploadVideo(IFormFile uploadVideoFile)
        {
            if (uploadVideoFile == null || uploadVideoFile.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            try
            {
                var videoUrl = await _cloudinaryService.UploadVideoAsync(uploadVideoFile, null);
                if (videoUrl != null)
                {
                    return Ok(new BusinessResult(Const.SUCCESS_UPLOAD_VIDEO_CODE, Const.SUCCESS_UPLOAD_VIDEO_MESSAGE, videoUrl));
                }
                else
                {
                    return Ok(new BusinessResult(Const.FAIL_UPLOAD_VIDEO_CODE, Const.FAIL_UPLOAD_VIDEO_MESSAGE, false));
                }
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

        [HttpDelete(APIRoutes.Resource.deleteVideoByURL, Name = "deleteVideoByURL")]
        public async Task<IActionResult> DeleteVideoByURL([FromBody] DeleteVideoURLModel deleteVideoURLModel)
        {
            try
            {
                var result = await _cloudinaryService.DeleteVideoByUrlAsync(deleteVideoURLModel.VideoURL);
                if (result)
                {
                    return Ok(new BusinessResult(Const.SUCCESS_DELETE_VIDEO_CODE, Const.SUCCESS_DELETE_VIDEO_MESSAGE, result));
                }
                else
                {
                    return Ok(new BusinessResult(Const.FAIL_DELETE_VIDEO_CODE, Const.FAIL_DELETE_VIDEO_MESSAGE, false));
                }

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
