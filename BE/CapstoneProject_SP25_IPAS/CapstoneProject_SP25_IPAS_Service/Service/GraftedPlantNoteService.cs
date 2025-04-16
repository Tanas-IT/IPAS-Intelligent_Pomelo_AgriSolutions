using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest.GraftedNoteRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.GraftedModel;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.AspNetCore.Mvc.Filters;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class GraftedPlantNoteService : IGraftedPlantNoteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;
        //private readonly IGraftedPlantService _graftedPlantService;
        private readonly IExcelReaderService _excelReaderService;
        public GraftedPlantNoteService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService/*, IGraftedPlantService graftedPlantService*/, IExcelReaderService excelReaderService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _excelReaderService = excelReaderService;
            //_graftedPlantService = graftedPlantService;
        }

        public async Task<BusinessResult> createGraftedNote(CreateGraftedNoteRequest historyCreateRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var checkGraftedExist = await _unitOfWork.GraftedPlantRepository.GetByID(historyCreateRequest.GraftedPlantId);
                    if (checkGraftedExist == null)
                        return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                    // Khởi tạo đối tượng GraftedPlantNote
                    var graftedPlantNoteEntity = new GraftedPlantNote()
                    {
                        GraftedPlantNoteCode = $"{CodeAliasEntityConst.PLANT_GROWTH_HISTORY}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}-{Util.SplitByDash(checkGraftedExist.GraftedPlantCode!).First().ToUpper()}",
                        Content = historyCreateRequest.Content,
                        //NoteTaker = historyCreateRequest.NoteTaker,
                        GraftedPlantId = historyCreateRequest.GraftedPlantId,
                        IssueName = historyCreateRequest.IssueName,
                        CreateDate = DateTime.Now,
                        UserId = historyCreateRequest.UserId,
                    };

                    // Xử lý tài nguyên (hình ảnh/video) nếu có
                    if (historyCreateRequest.PlantResources?.Any() == true)
                    {
                        foreach (var resource in historyCreateRequest.PlantResources)
                        {
                            if (resource.File != null)
                            {
                                var cloudinaryUrl = await _cloudinaryService.UploadResourceAsync(resource.File, CloudinaryPath.GRAFTED_PLANT_NOTE);
                                if (cloudinaryUrl.Data == null) continue;
                                if (Util.IsVideo(Path.GetExtension(resource.File.FileName)?.TrimStart('.').ToLower()))
                                    resource.FileFormat = FileFormatConst.VIDEO.ToLower();
                                else resource.FileFormat = FileFormatConst.IMAGE.ToLower();
                                var plantResource = new Resource()
                                {
                                    ResourceURL = (string)cloudinaryUrl.Data! ?? null,
                                    ResourceType = ResourceTypeConst.PLANT_GROWTH_HISTORY,
                                    FileFormat = resource.FileFormat,
                                    CreateDate = DateTime.Now,
                                    Description = resource.Description,
                                };
                                graftedPlantNoteEntity.Resources.Add(plantResource);
                            }
                        }
                    }

                    // Chèn vào DB
                    await _unitOfWork.GraftedPlantNoteRepository.Insert(graftedPlantNoteEntity);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<GraftedPlantNoteModel>(graftedPlantNoteEntity);
                        return new BusinessResult(Const.SUCCESS_CREATE_GRAFTED_PLANT_CODE, Const.SUCCESS_CREATE_GRAFTED_PLANT_MSG, mappedResult);
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

        public async Task<BusinessResult> updateGraftedNote(UpdateGraftedNoteRequest historyUpdateRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<GraftedPlantNote, bool>> filter = x => x.GraftedPlantNoteId == historyUpdateRequest.GraftedPlantNoteId;
                    string includeProperties = "Resources";
                    var plantGrowthHistory = await _unitOfWork.GraftedPlantNoteRepository
                        .GetByCondition(filter: filter, includeProperties: includeProperties);

                    if (plantGrowthHistory == null)
                    {
                        return new BusinessResult(Const.WARNING_PLANT_GROWTH_NOT_EXIST_CODE, Const.WARNING_PLANT_GROWTH_NOT_EXIST_MSG);
                    }

                    // Cập nhật thông tin
                    plantGrowthHistory.Content = historyUpdateRequest.Content ?? plantGrowthHistory.Content;
                    plantGrowthHistory.IssueName = historyUpdateRequest.IssueName ?? plantGrowthHistory.IssueName;
                    plantGrowthHistory.UpdateDate = DateTime.Now;

                    // Lấy danh sách ảnh cũ
                    var existingResources = plantGrowthHistory.Resources.ToList();
                    var newResources = historyUpdateRequest.Resource?.Select(r => new Resource
                    {
                        ResourceID = r.ResourceID!.Value,
                        ResourceURL = r.ResourceURL,
                        FileFormat = r.FileFormat
                    }).ToList() ?? new List<Resource>();


                    // Xóa ảnh cũ không có trong request
                    var resourcesToDelete = existingResources
                .Where(old => !newResources.Any(newImg => newImg.ResourceID == old.ResourceID))
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
                            var cloudinaryUrl = await _cloudinaryService.UploadResourceAsync(resource.File, CloudinaryPath.GRAFTED_PLANT_NOTE);
                            var newRes = new Resource
                            {
                                ResourceCode = "",
                                ResourceURL = (string)cloudinaryUrl.Data! ?? null,
                                ResourceType = ResourceTypeConst.PLANT_GROWTH_HISTORY,
                                FileFormat = FileFormatConst.IMAGE,
                                CreateDate = DateTime.UtcNow,
                                PlantGrowthHistoryID = plantGrowthHistory.GraftedPlantNoteId
                            };
                            plantGrowthHistory.Resources.Add(newRes);
                        }
                    }

                    // Cập nhật vào DB
                    _unitOfWork.GraftedPlantNoteRepository.Update(plantGrowthHistory);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<GraftedPlantNoteModel>(plantGrowthHistory);
                        return new BusinessResult(Const.SUCCESS_UPDATE_GRAFTED_NOTE_CODE, Const.SUCCESS_UPDATE_GRAFTED_NOTE_MSG, mappedResult);
                    }

                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_GRAFTED_PLANT_CODE, Const.FAIL_UPDATE_GRAFTED_PLANT_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        public async Task<BusinessResult> deleteGraftedNote(int graftedPlantNoteId)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<GraftedPlantNote, bool>> filter = x => x.GraftedPlantNoteId == graftedPlantNoteId;
                    string includeProperties = "Resources";
                    var GraftedPlantNote = await _unitOfWork.GraftedPlantNoteRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                    if (GraftedPlantNote == null)
                        return new BusinessResult(Const.WARNING_PLANT_GROWTH_NOT_EXIST_CODE, Const.WARNING_PLANT_GROWTH_NOT_EXIST_MSG);
                    // If the plant has an image associated, delete it from Cloudinary or another storage service
                    foreach (var resource in GraftedPlantNote.Resources)
                    {
                        if (!string.IsNullOrEmpty(resource.ResourceURL))
                        {
                            _ = await _cloudinaryService.DeleteResourceByUrlAsync(resource.ResourceURL);
                        }
                        _unitOfWork.ResourceRepository.Delete(resource);
                    }
                    _unitOfWork.GraftedPlantNoteRepository.Delete(GraftedPlantNote);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, Const.SUCCESS_DELETE_PLANT_GROWTH_MSG, new { success = true });
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, Const.FAIL_DELETE_PERMANETNLY_GRAFTED_PLANT_MSG);

                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getAllNoteOfGraftedById(int graftedPlantId)
        {
            try
            {
                if (graftedPlantId <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                }
                Expression<Func<GraftedPlantNote, bool>> filter = x => x.GraftedPlantId == graftedPlantId;
                Func<IQueryable<GraftedPlantNote>, IOrderedQueryable<GraftedPlantNote>> orderBy = x => x.OrderByDescending(x => x.CreateDate);
                string includeProperties = "Resources";
                var plantGrowthHistotys = await _unitOfWork.GraftedPlantNoteRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (!plantGrowthHistotys.Any())
                    return new BusinessResult(Const.WARNING_GET_GRAFTED_NOTE_BY_ID_EMPTY_CODE, Const.WARNING_GET_GRAFTED_NOTE_BY_ID_EMPTY_MSG, new List<GraftedPlantNoteModel>());
                var mapResult = _mapper.Map<List<GraftedPlantNoteModel>?>(plantGrowthHistotys);
                return new BusinessResult(Const.SUCCESS_GET_ALL_GRAFTED_NOTE_OF_GRAFTED_CODE, Const.SUCCESS_GET_ALL_GRAFTED_NOTE_OF_GRAFTED_MSG, mapResult!);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getGraftedNoteById(int GraftedPlantNoteId)
        {
            try
            {
                if (GraftedPlantNoteId <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                }
                Expression<Func<GraftedPlantNote, bool>> filter = x => x.GraftedPlantNoteId == GraftedPlantNoteId;
                string includeProperties = "Resources,User";
                var plantGrowthHistoty = await _unitOfWork.GraftedPlantNoteRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (plantGrowthHistoty == null)
                    return new BusinessResult(Const.WARNING_GET_GRAFTED_NOTE_BY_ID_EMPTY_CODE, Const.WARNING_GET_GRAFTED_NOTE_BY_ID_EMPTY_MSG);
                var mapResult = _mapper.Map<List<GraftedPlantNoteModel>?>(plantGrowthHistoty);
                return new BusinessResult(Const.SUCCESS_GET_GRAFTED_NOTE_BY_ID_CODE, Const.SUCCESS_GET_GRAFTED_NOTE_BY_ID_MSG, mapResult!);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getAllNoteOfGraftedPagin(GetGraftedNoteRequest filterRequest, PaginationParameter paginationParameter)
        {
            try
            {
                if (filterRequest.GraftedPlantId <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, "Grafted not exist");
                }
                Expression<Func<GraftedPlantNote, bool>> filter = x => x.GraftedPlantId == filterRequest.GraftedPlantId;
                Func<IQueryable<GraftedPlantNote>, IOrderedQueryable<GraftedPlantNote>> orderBy = x => x.OrderByDescending(x => x.CreateDate);
                if (filterRequest.CreateFrom.HasValue && filterRequest.CreateTo.HasValue)
                {
                    if (filterRequest.CreateFrom.Value > filterRequest.CreateTo.Value)
                    {
                        return new BusinessResult(400, "Create From must before create to");
                    }
                    filter = filter.And(x => x.CreateDate >= filterRequest.CreateFrom &&
                                            x.CreateDate <= filterRequest.CreateTo);
                }
                string includeProperties = "Resources,User";
                var plantGrowthHistotys = await _unitOfWork.GraftedPlantNoteRepository.Get(filter: filter, includeProperties: includeProperties, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                //var mapResult = _mapper.Map<List<PlantGrowthHistoryModel>?>(plantGrowthHistotys);
                var pagin = new PageEntity<GraftedPlantNoteModel>();
                pagin.List = _mapper.Map<IEnumerable<GraftedPlantNoteModel>>(plantGrowthHistotys).ToList();
                pagin.TotalRecord = await _unitOfWork.GraftedPlantNoteRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                return new BusinessResult(Const.SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_CODE, Const.SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_MSG, pagin!);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ExportNotesByGraftedPlantId(int graftedPlantId)
        {
            try
            {
                var checkGraftedExist = await _unitOfWork.GraftedPlantRepository
                    .GetByCondition(x => x.IsDeleted == false && x.GraftedPlantId == graftedPlantId);
                if (checkGraftedExist == null)
                {
                    return new BusinessResult(Const.EXPORT_CSV_FAIL_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                }

                var filter = await _unitOfWork.GraftedPlantNoteRepository
                    .GetAllNoPaging(x => x.GraftedPlantId == graftedPlantId, includeProperties: "Resources,User");

                if (filter == null || !filter.Any())
                {
                    return new BusinessResult(Const.EXPORT_CSV_FAIL_CODE, Const.WARNING_GET_GRAFTED_NOTE_BY_ID_EMPTY_MSG);
                }

                var mapped = _mapper.Map<List<GraftedPlantNoteModel>>(filter);

                var fileName = $"grafted_{checkGraftedExist.GraftedPlantCode}_notes_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                var csvExport = await _excelReaderService.ExportToCsvAsync(mapped, fileName);

                return new BusinessResult(Const.EXPORT_CSV_SUCCESS_CODE, Const.EXPORT_CSV_SUCCESS_MSG, new ExportFileResult
                {
                    FileBytes = csvExport.FileBytes,
                    FileName = csvExport.FileName,
                    ContentType = csvExport.ContentType
                });
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

    }
}
