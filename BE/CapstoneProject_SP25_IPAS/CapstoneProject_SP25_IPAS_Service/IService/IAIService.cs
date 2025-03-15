using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.AIModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IAIService
    {
        public Task<BusinessResult> GetAnswerAsync(string question, int? farmId, int? userId);
        public Task<BusinessResult> PredictDiseaseByFile(IFormFile image);
        public Task<BusinessResult> PredictDiseaseByURL(string imageURL);
        public Task<BusinessResult> GetHistoryChat(PaginationParameter paginationParameter, int? farmId, int? userId);
        public Task<BusinessResult> GetTags();
        public Task<BusinessResult> CreateTag(string tagName);
        public Task<BusinessResult> UploadImageByURLToCustomVision(UploadImageModel uploadImageModel);
        public Task<BusinessResult> UploadImageByFileToCustomVision(UploadImageByFileModel uploadImageByFileModel);
        public Task<BusinessResult> DeleteTag(string tagId);
        public Task<BusinessResult> DeleteImage(DeleteImagesModel deleteImagesModel);
        public Task<BusinessResult> UpdateTag(UpdateTagModel updateTagModel);
        public Task<BusinessResult> GetAllImageAsync(GetImagesModelWithPagination getImagesModelWithPagination);
        public Task<BusinessResult> GetImagesUnTagged(GetImagesWithTagged getImagesUnTagged);
        public Task<BusinessResult> GetImagesTagged(GetImagesWithTagged getImagesTagged);
        public Task<BusinessResult> QuickTestImageByURL(QuickTestImageByURLModel quickTestImageByURLModel);
        public Task<BusinessResult> QuickTestImageByFile(QuickTestImageByFileModel quickTestImageByFileModel);
        public Task<BusinessResult> TrainedProject(TrainingProjectModel trainingProjectModel);

    }
}
