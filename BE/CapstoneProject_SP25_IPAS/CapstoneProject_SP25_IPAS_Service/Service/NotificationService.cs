using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.NotifcationModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public NotificationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CreateNotification(CreateNotificationModel createNotificationModel, int farmId)
        {
            try
            {
                using(var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var newNotification = new Notification()
                    {
                        NotificationCode = "NTF-" + DateTime.Now.Date,
                        CreateDate = DateTime.Now,
                        Content = createNotificationModel.Content,
                        IsRead = false,
                        Link = createNotificationModel.Link,
                        MasterTypeId = createNotificationModel.MasterTypeId,
                        SenderID = createNotificationModel.SenderID,
                        Title = createNotificationModel.Title,
                    };
                    await _unitOfWork.NotificationRepository.Insert(newNotification);
                    var result = await _unitOfWork.SaveAsync();
                    if(result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(200, "Create notification success", newNotification);
                    }
                    return new BusinessResult(400, "Create notification failed");

                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public Task<BusinessResult> GetAllNotificationPagination(PaginationParameter paginationParameter, int farmId)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> GetNotificationByUserId(int? userId)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> GetNotificationByID(int NotificationId)
        {
            throw new NotImplementedException();
        }

        public List<BusinessResult> MarkisRead(List<int> notificationIds)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> PermanentlyDeleteManyNotification(List<int> NotificationsId)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> PermanentlyDeleteNotification(int NotificationId)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> SoftedMultipleDelete(List<int> NotificationsId, int farmId)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> UpdateNotificationInfo(UpdateNotificationModel updateriteriaTypeModel)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> UpdatePlantNotification(List<int> plantIds, int? newGrowthStageId)
        {
            throw new NotImplementedException();
        }
    }
}
