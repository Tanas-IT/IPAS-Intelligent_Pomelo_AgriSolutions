using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.NotifcationModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface INotificationService
    {
        public Task<BusinessResult> GetNotificationByID(int NotificationId);

        public Task<BusinessResult> GetAllNotificationPagination(PaginationParameter paginationParameter, int farmId);

        public Task<BusinessResult> CreateNotification(CreateNotificationModel createNotificationModel, int farmId);

        public Task<BusinessResult> UpdateNotificationInfo(UpdateNotificationModel updateriteriaTypeModel);

        public Task<BusinessResult> PermanentlyDeleteNotification(int NotificationId);
        public Task<BusinessResult> GetNotificationByUserId(int UserId, bool? isRead);
        public Task<BusinessResult> SoftedMultipleDelete(List<int> NotificationsId, int farmId);
        public Task<BusinessResult> PermanentlyDeleteManyNotification(List<int> NotificationsId);

        public Task<BusinessResult> MarkisRead(MarkNotificationIsReadModel markNotificationIsReadModel, int? userId);

        public Task<BusinessResult> UpdatePlantNotification(List<int> plantIds, int? newGrowthStageId);
    }
}
