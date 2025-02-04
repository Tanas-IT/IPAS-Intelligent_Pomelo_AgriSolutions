using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlantGrowthHistoryService : IPlantGrowthHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;
        public PlantGrowthHistoryService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<BusinessResult> createPlantGrowthHistory(PlantGrowthHistoryCreateRequest historyCreateRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    // Khởi tạo đối tượng PlantGrowthHistory
                    var plantGrowthHistoryEntity = new PlantGrowthHistory()
                    {
                        Content = historyCreateRequest.Content,
                        NoteTaker = historyCreateRequest.NoteTaker,
                        PlantId = historyCreateRequest.PlantId,
                        IssueName = historyCreateRequest.IssueName,
                        PlantGrowthHistoryCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.PLANT_GROWTH_HISTORY),
                        CreateDate = DateTime.Now,
                    };

                    // Xử lý tài nguyên (hình ảnh/video) nếu có
                    if (historyCreateRequest.PlantResources?.Any() == true)
                    {
                        foreach (var resource in historyCreateRequest.PlantResources)
                        {
                            var cloudinaryUrl = await _cloudinaryService.UploadImageAsync(resource.ResourceUrl, CloudinaryPath.PLANT_GROWTH_HISTORY);
                            var plantResource = new PlantResource()
                            {
                                ResourceUrl = cloudinaryUrl,
                                ResourceType = resource.ResourceType,
                                PlantGrowthHistory = plantGrowthHistoryEntity
                            };
                            plantGrowthHistoryEntity.PlantResources.Add(plantResource);
                        }
                    }

                    // Chèn vào DB
                    await _unitOfWork.PlantGrowthHistoryRepository.Insert(plantGrowthHistoryEntity);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<PlantGrowthHistoryModel>(plantGrowthHistoryEntity);
                        return new BusinessResult(Const.SUCCESS_CREATE_PLANT_GROWTH_CODE, Const.SUCCESS_CREATE_PLANT_GROWTH_MSG, mappedResult);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_CREATE_PLANT_GROWTH_HISTORY_CODE, Const.FAIL_CREATE_PLANT_GROWTH_HISTORY_MSG);
                    }
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> updatePlantGrowthHistory(PlantGrowthHistoryUpdateRequest historyUpdateRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    // Tìm lịch sử phát triển cây trồng theo ID
                    var plantGrowthHistory = await _unitOfWork.PlantGrowthHistoryRepository.GetByID(historyUpdateRequest.PlantGrowthHistoryId);

                    if (plantGrowthHistory == null)
                    {
                        return new BusinessResult(Const.WARNING_PLANT_GROWTH_NOT_EXIST_CODE, Const.WARNING_PLANT_GROWTH_NOT_EXIST_MSG);
                    }

                    // Cập nhật thông tin
                    plantGrowthHistory.Content = historyUpdateRequest.Content ?? plantGrowthHistory.Content;
                    plantGrowthHistory.IssueName = historyUpdateRequest.IssueName ?? plantGrowthHistory.IssueName;
                    plantGrowthHistory.UpdateDate = DateTime.Now;

                    // Cập nhật vào DB
                    _unitOfWork.PlantGrowthHistoryRepository.Update(plantGrowthHistory);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<PlantGrowthHistoryModel>(plantGrowthHistory);
                        return new BusinessResult(Const.FAIL_UPDATE_PLANT_GROWTH_HISTORY_CODE, Const.FAIL_UPDATE_PLANT_GROWTH_HISTORY_MSG, mappedResult);
                    }
                    return new BusinessResult(Const.FAIL_UPDATE_PLANT_GROWTH_HISTORY_CODE, Const.FAIL_UPDATE_PLANT_GROWTH_HISTORY_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> deleteGrowthHistory(int plantGrowthHistoryId)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var plantGrowthHistory = await _unitOfWork.PlantGrowthHistoryRepository.GetByCondition(x => x.PlantGrowthHistoryId == plantGrowthHistoryId);
                    if (plantGrowthHistory == null)
                        return new BusinessResult(Const.WARNING_PLANT_GROWTH_NOT_EXIST_CODE, Const.WARNING_PLANT_GROWTH_NOT_EXIST_MSG);
                    // If the plant has an image associated, delete it from Cloudinary or another storage service
                    foreach (var resource in plantGrowthHistory.PlantResources)
                    {
                        if (!string.IsNullOrEmpty(resource.ResourceUrl))
                        {
                            if (resource.ResourceType!.Equals("image"))
                                await _cloudinaryService.DeleteImageByUrlAsync(resource.ResourceUrl);

                            await _cloudinaryService.DeleteImageByUrlAsync(resource.ResourceUrl);
                        }
                    }

                    // Delete the plant entity
                    _unitOfWork.PlantGrowthHistoryRepository.Delete(plantGrowthHistory);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PLANT_GROWTH_CODE, Const.SUCCESS_DELETE_PLANT_GROWTH_MSG, new { success = true });
                    }
                    return new BusinessResult(Const.FAIL_DELETE_PLANT_CODE, Const.FAIL_DELETE_PLANT_MSG);

                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getAllHistoryOfPlantById(int plantId)
        {
            try
            {
                if (plantId <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                }
                Expression<Func<PlantGrowthHistory, bool>> filter = x => x.PlantId == plantId;
                Func<IQueryable<PlantGrowthHistory>, IOrderedQueryable<PlantGrowthHistory>> orderBy = x => x.OrderByDescending(x => x.CreateDate);
                string includeProperties = "PlantResources";
                var plantGrowthHistotys = await _unitOfWork.PlantGrowthHistoryRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (!plantGrowthHistotys.Any())
                    return new BusinessResult(Const.WARNING_GET_PLANT_HISTORY_BY_ID_EMPTY_CODE, Const.WARNING_GET_PLANT_HISTORY_BY_ID_EMPTY_MSG);
                var mapResult = _mapper.Map<List<PlantGrowthHistoryModel>?>(plantGrowthHistotys);
                return new BusinessResult(Const.SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_CODE, Const.SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_MSG, mapResult!);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getPlantGrowthById(int plantGrowthHistoryId)
        {
            try
            {
                if (plantGrowthHistoryId <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                }
                Expression<Func<PlantGrowthHistory, bool>> filter = x => x.PlantGrowthHistoryId == plantGrowthHistoryId;
                string includeProperties = "PlantResources";
                var plantGrowthHistoty = await _unitOfWork.PlantGrowthHistoryRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (plantGrowthHistoty == null)
                    return new BusinessResult(Const.WARNING_GET_PLANT_HISTORY_BY_ID_EMPTY_CODE, Const.WARNING_PLANT_GROWTH_NOT_EXIST_MSG);
                var mapResult = _mapper.Map<List<PlantGrowthHistoryModel>?>(plantGrowthHistoty);
                return new BusinessResult(Const.SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_CODE, Const.SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_MSG, mapResult!);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
