using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Org.BouncyCastle.Utilities.Collections;
using System.Reflection.Metadata;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantGrowthHistoryRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using Org.BouncyCastle.Ocsp;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.GraftedModel;
using System.Net.WebSockets;
using CapstoneProject_SP25_IPAS_Common.Enum;
using System.Runtime.Versioning;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlantGrowthHistoryService : IPlantGrowthHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IExcelReaderService _excelReaderService;
        public PlantGrowthHistoryService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService, IExcelReaderService excelReaderService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _excelReaderService = excelReaderService;
        }

        public async Task<BusinessResult> createPlantGrowthHistory(CreatePlantGrowthHistoryRequest historyCreateRequest)
        {
            try
            {
                var checkPlantExist = await _unitOfWork.PlantRepository.GetByCondition(x => x.PlantId == historyCreateRequest.PlantId && x.IsDead == false && x.IsDeleted == false);
                if (checkPlantExist == null)
                    return new BusinessResult(400, "Plant not exist");
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    // Khởi tạo đối tượng PlantGrowthHistory
                    var plantGrowthHistoryEntity = new PlantGrowthHistory()
                    {
                        PlantGrowthHistoryCode = $"{CodeAliasEntityConst.PLANT_GROWTH_HISTORY}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}-{Util.SplitByDash(checkPlantExist.PlantCode!).First().ToUpper()}",
                        Content = historyCreateRequest.Content,
                        //NoteTaker = historyCreateRequest.NoteTaker,
                        PlantId = historyCreateRequest.PlantId,
                        IssueName = historyCreateRequest.IssueName,
                        CreateDate = DateTime.Now,
                        UserId = historyCreateRequest.UserId!.Value,
                    };

                    // Xử lý tài nguyên (hình ảnh/video) nếu có
                    if (historyCreateRequest.PlantResources?.Any() == true)
                    {
                        foreach (var resource in historyCreateRequest.PlantResources)
                        {
                            if (resource.File != null)
                            {
                                var cloudinaryUrl = await _cloudinaryService.UploadResourceAsync(resource.File, CloudinaryPath.PLANT_GROWTH_HISTORY);
                                if (cloudinaryUrl.Data == null) continue;
                                if (Util.IsVideo(Path.GetExtension(resource.File.FileName)?.TrimStart('.').ToLower()))
                                    resource.FileFormat = FileFormatConst.VIDEO.ToLower();
                                else resource.FileFormat = FileFormatConst.IMAGE.ToLower();
                                var plantResource = new Resource()
                                {
                                    ResourceCode = CodeAliasEntityConst.RESOURCE + CodeHelper.GenerateCode(),
                                    ResourceURL = (string)cloudinaryUrl.Data,
                                    ResourceType = ResourceTypeConst.PLANT_GROWTH_HISTORY,
                                    FileFormat = resource.FileFormat,
                                    CreateDate = DateTime.Now,
                                    Description = resource.Description,
                                };
                                plantGrowthHistoryEntity.Resources.Add(plantResource);
                            }
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
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_CREATE_PLANT_GROWTH_HISTORY_CODE, Const.FAIL_CREATE_PLANT_GROWTH_HISTORY_MSG);
                    }
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> updatePlantGrowthHistory(UpdatePlantGrowthHistoryRequest historyUpdateRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<PlantGrowthHistory, bool>> filter = x => x.PlantGrowthHistoryId == historyUpdateRequest.PlantGrowthHistoryId;
                    string includeProperties = "Resources";
                    var plantGrowthHistory = await _unitOfWork.PlantGrowthHistoryRepository
                        .GetByCondition(filter: filter, includeProperties: includeProperties);

                    if (plantGrowthHistory == null)
                    {
                        return new BusinessResult(Const.WARNING_PLANT_GROWTH_NOT_EXIST_CODE, Const.WARNING_PLANT_GROWTH_NOT_EXIST_MSG);
                    }
                    var roleInFarm = await _unitOfWork.UserFarmRepository.GetByCondition(x => x.UserId == historyUpdateRequest.UserId);
                    if (roleInFarm.RoleId == (int)RoleEnum.EMPLOYEE)
                    {
                        var systemDateEditDays = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.EDIT_RECORD_IN_DAYS, (int)3);
                        if (plantGrowthHistory!.CreateDate.Value.AddDays(systemDateEditDays) < DateTime.Now)
                            return new BusinessResult(Const.WARNING_OVER_TIME_TO_EDIT_CODE, Const.WARNING_OVER_TIME_TO_EDIT_MSG);
                        if (plantGrowthHistory.UserId != historyUpdateRequest.UserId)
                            return new BusinessResult(Const.WARNING_CAN_NOT_EDIT_RECORD_OF_ORTHER_CODE, Const.WARNING_CAN_NOT_EDIT_RECORD_OF_ORTHER_MSG);
                    }
                    // Cập nhật thông tin
                    plantGrowthHistory.Content = historyUpdateRequest.Content ?? plantGrowthHistory.Content;
                    plantGrowthHistory.IssueName = historyUpdateRequest.IssueName ?? plantGrowthHistory.IssueName;
                    plantGrowthHistory.UpdateDate = DateTime.Now;

                    // Lấy danh sách ảnh cũ
                    var existingResources = plantGrowthHistory.Resources.ToList();
                    //var newResources = historyUpdateRequest.Resource?.Select(r => new Resource
                    //{
                    //    ResourceID = r.ResourceID!.Value,
                    //    ResourceURL = r.ResourceURL,
                    //    FileFormat = r.FileFormat
                    //}).ToList() ?? new List<Resource>();


                    // Xóa ảnh cũ không có trong request
                    var resourcesToDelete = existingResources
                .Where(old => !historyUpdateRequest.Resource.Any(newImg => newImg.ResourceID == old.ResourceID))
                .ToList();
      
                    foreach (var resource in resourcesToDelete)
                    {
                        if (!string.IsNullOrEmpty(resource.ResourceURL))
                        {
                            _ = await _cloudinaryService.DeleteResourceByUrlAsync(resource.ResourceURL);
                        }
                        _unitOfWork.ResourceRepository.Delete(resource);
                    }

                    // Thêm ảnh mới từ request
                    foreach (var resource in historyUpdateRequest.Resource?.Where(newImg => !newImg.ResourceID.HasValue)!)
                    {
                        if (resource.File != null)
                        {
                            var cloudinaryUrl = await _cloudinaryService.UploadResourceAsync(resource.File, CloudinaryPath.PLANT_GROWTH_HISTORY);
                            if (cloudinaryUrl.Data == null) continue;
                            if (Util.IsVideo(Path.GetExtension(resource.File.FileName)?.TrimStart('.').ToLower()))
                                resource.FileFormat = FileFormatConst.VIDEO.ToLower();
                            else resource.FileFormat = FileFormatConst.IMAGE.ToLower();
                            var newRes = new Resource
                            {
                                ResourceCode = CodeAliasEntityConst.RESOURCE + CodeHelper.GenerateCode(),
                                ResourceURL = (string)cloudinaryUrl.Data! ?? null,
                                ResourceType = ResourceTypeConst.PLANT_GROWTH_HISTORY,
                                FileFormat = resource.FileFormat,
                                CreateDate = DateTime.UtcNow,
                                PlantGrowthHistoryID = plantGrowthHistory.PlantGrowthHistoryId
                            };
                            plantGrowthHistory.Resources.Add(newRes);
                        }
                    }

                    // Cập nhật vào DB
                    _unitOfWork.PlantGrowthHistoryRepository.Update(plantGrowthHistory);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<PlantGrowthHistoryModel>(plantGrowthHistory);
                        return new BusinessResult(Const.SUCCESS_UPDATE_PLANT_GROWTH_CODE, Const.SUCCESS_GET_ROWS_SUCCESS_MSG, mappedResult);
                    }

                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_PLANT_GROWTH_HISTORY_CODE, Const.FAIL_UPDATE_PLANT_GROWTH_HISTORY_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        public async Task<BusinessResult> deleteGrowthHistory(int plantGrowthHistoryId, int userId)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<PlantGrowthHistory, bool>> filter = x => x.PlantGrowthHistoryId == plantGrowthHistoryId;
                    string includeProperties = "Resources";
                    var plantGrowthHistory = await _unitOfWork.PlantGrowthHistoryRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                    if (plantGrowthHistory == null)
                        return new BusinessResult(Const.WARNING_PLANT_GROWTH_NOT_EXIST_CODE, Const.WARNING_PLANT_GROWTH_NOT_EXIST_MSG);
                    var roleInFarm = await _unitOfWork.UserFarmRepository.GetByCondition(x => x.UserId == userId);
                    if (roleInFarm.RoleId == (int)RoleEnum.EMPLOYEE)
                    {
                        var systemDateEditDays = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.EDIT_RECORD_IN_DAYS, (int)3);
                        if (plantGrowthHistory!.CreateDate.Value.AddDays(systemDateEditDays) < DateTime.Now)
                            return new BusinessResult(Const.WARNING_OVER_TIME_TO_EDIT_CODE, Const.WARNING_OVER_TIME_TO_EDIT_MSG);
                        if (plantGrowthHistory.UserId != userId)
                            return new BusinessResult(Const.WARNING_CAN_NOT_EDIT_RECORD_OF_ORTHER_CODE, Const.WARNING_CAN_NOT_EDIT_RECORD_OF_ORTHER_MSG);
                    }   
                    // If the plant has an image associated, delete it from Cloudinary or another storage service
                    foreach (var resource in plantGrowthHistory.Resources)
                    {
                        if (!string.IsNullOrEmpty(resource.ResourceURL))
                        {
                            _ = await _cloudinaryService.DeleteResourceByUrlAsync(resource.ResourceURL);
                        }
                        _unitOfWork.ResourceRepository.Delete(resource);
                    }
                    _unitOfWork.PlantGrowthHistoryRepository.Delete(plantGrowthHistory);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PLANT_GROWTH_CODE, Const.SUCCESS_DELETE_PLANT_GROWTH_MSG, new { success = true });
                    }
                    await transaction.RollbackAsync();
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
                string includeProperties = "User,Resources";
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
                string includeProperties = "User,Resources";
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

        public async Task<BusinessResult> getAllHistoryOfPlantPagin(GetPlantGrowtRequest getRequest, PaginationParameter paginationParameter)
        {
            try
            {
                if (getRequest.PlantId <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, "Plant not exist");
                }
                Expression<Func<PlantGrowthHistory, bool>> filter = x => x.PlantId == getRequest.PlantId;
                Func<IQueryable<PlantGrowthHistory>, IOrderedQueryable<PlantGrowthHistory>> orderBy = x => x.OrderByDescending(x => x.CreateDate);
                string includeProperties = "User,Resources";
                if (getRequest.CreateFrom.HasValue && getRequest.CreateTo.HasValue)
                {
                    if (getRequest.CreateFrom.Value > getRequest.CreateTo.Value)
                    {
                        return new BusinessResult(400, "Create From must before create to");
                    }
                    filter = filter.And(x => x.CreateDate >= getRequest.CreateFrom &&
                                            x.CreateDate <= getRequest.CreateTo);
                }
                var plantGrowthHistotys = await _unitOfWork.PlantGrowthHistoryRepository.Get(filter: filter, includeProperties: includeProperties, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                var pagin = new PageEntity<PlantGrowthHistoryModel>();
                pagin.List = _mapper.Map<IEnumerable<PlantGrowthHistoryModel>>(plantGrowthHistotys).ToList();
                pagin.TotalRecord = await _unitOfWork.PlantGrowthHistoryRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                return new BusinessResult(Const.SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_CODE, Const.SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_MSG, pagin!);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ExportNotesByPlantId(int plantId)
        {
            try
            {
                var checkPlantExist = await _unitOfWork.PlantRepository
                    .GetByCondition(x => x.PlantId == plantId && x.IsDeleted == false);

                if (checkPlantExist == null)
                {
                    return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                }

                var filter = await _unitOfWork.PlantGrowthHistoryRepository
                    .GetAllNoPaging(x => x.PlantId == plantId, includeProperties: "Resources,User");

                if (filter == null || !filter.Any())
                {
                    return new BusinessResult(Const.EXPORT_CSV_FAIL_CODE, Const.WARNING_PLANT_GROWTH_NOT_EXIST_MSG);
                }

                var mapped = _mapper.Map<List<PlantGrowthHistoryModel>>(filter);
                var fileName = $"plant_{checkPlantExist.PlantCode}_notes_{DateTime.Now:yyyyMMdd}.csv";

                var export = await _excelReaderService.ExportToCsvAsync(mapped, fileName);

                return new BusinessResult(Const.EXPORT_CSV_SUCCESS_CODE, Const.EXPORT_CSV_SUCCESS_MSG, new ExportFileResult
                {
                    FileBytes = export.FileBytes,
                    FileName = export.FileName,
                    ContentType = export.ContentType
                });
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

    }
}
