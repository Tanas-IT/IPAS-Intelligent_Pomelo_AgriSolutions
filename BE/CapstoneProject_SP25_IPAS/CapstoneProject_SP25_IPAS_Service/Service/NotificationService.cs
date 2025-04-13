using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.NotifcationModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.NotificationRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using FluentValidation.Validators;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
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
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var newNotification = new Notification()
                    {
                        NotificationCode = "NTF-" + DateTime.Now,
                        CreateDate = DateTime.Now,
                        Content = createNotificationModel.Content,
                        IsRead = false,
                        Link = createNotificationModel.Link,
                        MasterTypeId = createNotificationModel.MasterTypeId,
                        SenderID = createNotificationModel.SenderID,
                        Title = createNotificationModel.Title,
                    };
                    if (createNotificationModel.ListReceiverId != null && createNotificationModel.ListReceiverId.Count > 0)
                    {
                        foreach (var item in createNotificationModel.ListReceiverId)
                        {
                            var newPlanNotification = new PlanNotification()
                            {
                                CreatedDate = DateTime.Now,
                                isRead = false,
                                UserID = item,
                            };
                            newNotification.PlanNotifications.Add(newPlanNotification);
                        }
                    }
                    await _unitOfWork.NotificationRepository.Insert(newNotification);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
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

        public async Task NotificationWeather(List<CreateNotificationRequest> createNotificationRequests)
        {
            if (createNotificationRequests == null || !createNotificationRequests.Any())
                return; // Không có gì để xử lý
            try
            {
                List<Notification> createNoti = new List<Notification>();
                //using (var transaction = await _unitOfWork.BeginTransactionAsync())
                //{
                foreach (var item in createNotificationRequests)
                {
                    var newNotification = new Notification()
                    {
                        NotificationCode = "NTF-" + DateTime.Now,
                        CreateDate = DateTime.Now,
                        Content = item.Content,
                        IsRead = false,
                        Link = item.Link,
                        MasterTypeId = item.MasterTypeId,
                        SenderID = item.UserId,
                        Title = item.Title,
                    };
                    createNoti.Add(newNotification);
                }

                if (createNoti.Any())
                {
                    await _unitOfWork.NotificationRepository.InsertRangeAsync(createNoti);
                    var result = await _unitOfWork.SaveAsync();
                }
                return;
                //if (result > 0)
                //{
                //await transaction.CommitAsync();
                //return /*new BusinessResult(200, "Create notification success", newNotification)*/;
                //}
                //return /*new BusinessResult(400, "Create notification failed")*/;

                //}
            }
            catch (Exception ex)
            {
                throw ex; /*new BusinessResult(Const.ERROR_EXCEPTION, ex.Message)*/
            }
        }

        public Task<BusinessResult> GetAllNotificationPagination(PaginationParameter paginationParameter, int farmId)
        {
            throw new NotImplementedException();
        }

        public async Task<BusinessResult> GetNotificationByUserId(int UserId, bool? isRead)
        {
            try
            {
                var getListPlanNotificationOfUser = await _unitOfWork.PlanNotificationRepository.GetListPlanNotificationByUserId(UserId, isRead);
                var listNotificationResponse = new List<NotificationModel>();
                foreach (var notificationPlan in getListPlanNotificationOfUser)
                {
                    var notifcationPlanModel = new NotificationModel()
                    {
                        NotificationId = notificationPlan.Notification.NotificationId,
                        Title = notificationPlan.Notification.Title,
                        Content = notificationPlan.Notification.Content,
                        CreateDate = notificationPlan.Notification.CreateDate,
                        IsRead = notificationPlan.isRead,
                        Link = notificationPlan.Notification.Link,
                        Color = notificationPlan.Notification.MasterType?.BackgroundColor,
                        MasterType = new MasterTypeNotification()
                        {
                            MasterTypeId = notificationPlan.Notification.MasterTypeId,
                            MasterTypeName = notificationPlan.Notification.MasterType != null ? notificationPlan.Notification.MasterType.MasterTypeName : null
                        },
                        Sender = new SenderNotification()
                        {
                            SenderId = notificationPlan.Notification.SenderID,
                            SenderName = notificationPlan.Notification.Sender != null ? notificationPlan.Notification.Sender.FullName : null,
                            SenderAvatar = notificationPlan.Notification.Sender != null ? notificationPlan.Notification.Sender.AvatarURL : null
                        }
                    };
                    listNotificationResponse.Add(notifcationPlanModel);
                }
                if (listNotificationResponse.Count > 0)
                {
                    return new BusinessResult(200, "Get list notification success", listNotificationResponse);
                }
                return new BusinessResult(200, "Do not have any notification");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public Task<BusinessResult> GetNotificationByID(int NotificationId)
        {
            throw new NotImplementedException();
        }

        public async Task<BusinessResult> MarkisRead(MarkNotificationIsReadModel markNotificationIsReadModel, int? userId)
        {
            if (markNotificationIsReadModel.Status.ToLower().Equals("once") && markNotificationIsReadModel.NotificationId != null)
            {
                var getPlanNotificationById = await _unitOfWork.PlanNotificationRepository.GetListPlanNotificationByNotificationId(markNotificationIsReadModel.NotificationId.Value);


                if (getPlanNotificationById != null)
                {
                    foreach (var getPlanNoti in getPlanNotificationById)
                    {
                        if (getPlanNoti.PlanNotificationID < 0) // Kiểm tra ID hợp lệ
                        {
                            return new BusinessResult(400, "Invalid PlanNotificationID");
                        }

                        if (getPlanNoti.UserID == userId)
                        {
                            getPlanNoti.isRead = true;
                            _unitOfWork.PlanNotificationRepository.Update(getPlanNoti);
                        }

                    }
                }

            }
            else
            {
                if (userId != null)
                {
                    var getListNotificationByUserId = await _unitOfWork.NotificationRepository.GetListNotificationUnReadByUserId(userId.Value);
                    foreach (var noti in getListNotificationByUserId)
                    {
                        noti.isRead = true;
                        _unitOfWork.PlanNotificationRepository.Update(noti);
                    }
                }
            }


            var result = await _unitOfWork.SaveAsync();
            if (result > 0)
            {
                return new BusinessResult(200, "Mark notification is read success", result);
            }
            else if (result == 0)
            {
                return new BusinessResult(404, "Do not have any notification");
            }
            return new BusinessResult(400, "Mark notication is read failed");
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
