using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_Common.ObjectStatus;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LegalDocumentRequest;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class LegalDocumentService : ILegalDocumentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;

        public LegalDocumentService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<BusinessResult> createDocument(LegalDocumentCreateRequest documentCreateRequest, int farmId)
        {
            try
            {
                if (farmId <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                }
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    // Khởi tạo đối tượng LegalDocument
                    var legalDocumentEntity = new LegalDocument()
                    {
                        LegalDocumentCode = $"{CodeAliasEntityConst.LEGAL_DOCUMENT}-{DateTime.Now.ToString("ddmmyyyy")}-{CodeAliasEntityConst.FARM}{farmId.ToString()}-{CodeHelper.GenerateCode()}",
                        LegalDocumentType = documentCreateRequest.LegalDocumentType,
                        LegalDocumentName = documentCreateRequest.LegalDocumentName,
                        LegalDocumentURL = documentCreateRequest.LegalDocumentURL,
                        IssueDate = documentCreateRequest.IssueDate,
                        ExpiredDate = documentCreateRequest.ExpiredDate,
                        CreateAt = DateTime.Now,
                        Status = nameof(FarmStatus.Active),
                        FarmId = farmId
                    };

                    // Xử lý tài nguyên (hình ảnh/tài liệu) nếu có
                    if (documentCreateRequest.Resources?.Any() == true)
                    {
                        foreach (var resource in documentCreateRequest.Resources)
                        {
                            if (resource.File != null)
                            {
                                var cloudinaryUrl = await _cloudinaryService.UploadResourceAsync(resource.File, CloudinaryPath.FARM_LEGAL_DOCUMENT);
                                var documentResource = new Resource()
                                {
                                    ResourceCode = "",
                                    ResourceURL = (string)cloudinaryUrl.Data! ?? null,
                                    ResourceType = ResourceTypeConst.LEGAL_DOCUMENT,
                                    FileFormat = FileFormatConst.IMAGE,
                                    CreateDate = DateTime.Now,
                                    Description = resource.Description,
                                };
                                legalDocumentEntity.Resources.Add(documentResource);
                            }
                        }
                    }

                    // Chèn vào DB
                    await _unitOfWork.LegalDocumentRepository.Insert(legalDocumentEntity);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<LegalDocumentModel>(legalDocumentEntity);
                        return new BusinessResult(Const.SUCCESS_CREATE_LEGAL_DOCUMENT_CODE, Const.SUCCESS_CREATE_LEGAL_DOCUMENT_MSG, mappedResult);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_CREATE_LEGAL_DOCUMENT_CODE, Const.FAIL_CREATE_LEGAL_DOCUMENT_MSG);
                    }
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> deleteDocument(int documentId)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    string includeProperties = "Resources";
                    var legalDocument = await _unitOfWork.LegalDocumentRepository.GetByCondition(x => x.LegalDocumentId == documentId, includeProperties: includeProperties);
                    if (legalDocument == null)
                        return new BusinessResult(Const.WARNING_LEGAL_DOCUMENT_NOT_EXIST_CODE, Const.WARNING_LEGAL_DOCUMENT_NOT_EXIST_MSG);

                    // Xóa tài nguyên (hình ảnh/tài liệu) nếu có
                    foreach (var resource in legalDocument.Resources)
                    {
                        if (!string.IsNullOrEmpty(resource.ResourceURL))
                        {
                            _ = await _cloudinaryService.DeleteResourceByUrlAsync(resource.ResourceURL);
                        }
                        _unitOfWork.ResourceRepository.Delete(resource);
                    }

                    // Xóa tài liệu khỏi database
                    _unitOfWork.LegalDocumentRepository.Delete(legalDocument);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_LEGAL_DOCUMENT_CODE, Const.SUCCESS_DELETE_LEGAL_DOCUMENT_MSG, new { success = true });
                    }

                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_DELETE_LEGAL_DOCUMENT_CODE, Const.FAIL_DELETE_LEGAL_DOCUMENT_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getAllDocumentOfFarm(int farmId, string? searchValue)
        {
            try
            {
                if (farmId <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                }
                Expression<Func<LegalDocument, bool>> filter = x => x.FarmId == farmId ;
                if (!string.IsNullOrEmpty(searchValue))
                {

                    filter = x => x.LegalDocumentName!.ToLower().Contains(searchValue.ToLower()) && x.FarmId == farmId;
                                  
                }
                Func<IQueryable<LegalDocument>, IOrderedQueryable<LegalDocument>> orderBy = x => x.OrderByDescending(x => x.LegalDocumentId);
                string includeProperties = "Resources";
                var legalDocument = await _unitOfWork.LegalDocumentRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (!legalDocument.Any())
                    return new BusinessResult(Const.WARNING_GET_DOCUMENT_EMPTY_CODE, Const.WARNING_GET_DOCUMENT_EMPTY_MSG);
                var mapResult = _mapper.Map<List<LegalDocumentModel>?>(legalDocument);
                return new BusinessResult(Const.SUCCESS_GET_LEGAL_DOCUMENT_OF_FARM_CODE, Const.SUCCESS_GET_LEGAL_DOCUMENT_OF_FARM_MSG, mapResult!);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getDocument(int documentId)
        {
            try
            {
                if (documentId <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                }
                Expression<Func<LegalDocument, bool>> filter = x => x.LegalDocumentId == documentId;
                string includeProperties = "Resources";
                var legalDocument = await _unitOfWork.LegalDocumentRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (legalDocument == null)
                    return new BusinessResult(Const.WARNING_LEGAL_DOCUMENT_NOT_EXIST_CODE, Const.WARNING_LEGAL_DOCUMENT_NOT_EXIST_MSG);
                var mapResult = _mapper.Map<LegalDocumentModel>(legalDocument);
                return new BusinessResult(Const.SUCCESS_GET_LEGAL_DOCUMENT_BY_ID_CODE, Const.SUCCESS_GET_LEGAL_DOCUMENT_BY_ID_MSG, mapResult!);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> updateDocument(LegalDocumentUpdateRequest historyUpdateRequest)
        {
            try
            {
                if (historyUpdateRequest.LegalDocumentId <= 0)
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<LegalDocument, bool>> filter = x => x.LegalDocumentId == historyUpdateRequest.LegalDocumentId;
                    string includeProperties = "Resources";
                    var legalDocument = await _unitOfWork.LegalDocumentRepository.GetByCondition(filter: filter, includeProperties: includeProperties);

                    if (legalDocument == null)
                    {
                        return new BusinessResult(Const.WARNING_LEGAL_DOCUMENT_NOT_EXIST_CODE, Const.WARNING_LEGAL_DOCUMENT_NOT_EXIST_MSG);
                    }

                    // Cập nhật thông tin tài liệu
                    legalDocument.LegalDocumentType = historyUpdateRequest.LegalDocumentType ?? legalDocument.LegalDocumentType;
                    legalDocument.LegalDocumentName = historyUpdateRequest.LegalDocumentName ?? legalDocument.LegalDocumentName;
                    legalDocument.LegalDocumentURL = historyUpdateRequest.LegalDocumentURL ?? legalDocument.LegalDocumentURL;
                    legalDocument.IssueDate = historyUpdateRequest.IssueDate ?? legalDocument.IssueDate;
                    legalDocument.ExpiredDate = historyUpdateRequest.ExpiredDate ?? legalDocument.ExpiredDate;
                    legalDocument.UpdateAt = DateTime.Now;

                    // Lấy danh sách tài nguyên hiện tại
                    var existingResources = legalDocument.Resources.ToList();
                    //var newResources = historyUpdateRequest.Resources?.Select(r => new Resource
                    //{
                    //    ResourceCode = "",
                    //    //ResourceID = r.ResourceID!.Value,
                    //    //ResourceURL = r.ResourceURL,
                    //    ResourceType = ResourceTypeConst.LEGAL_DOCUMENT,
                    //    FileFormat = FileFormatConst.IMAGE
                    //}).ToList() ?? new List<Resource>();

                    // Xóa tài nguyên cũ không có trong request
                    var resourcesToDelete = existingResources
                        .Where(old => !historyUpdateRequest.Resources.Any(newImg => newImg.ResourceID == old.ResourceID))
                        .ToList();

                    foreach (var resource in resourcesToDelete)
                    {
                        if (!string.IsNullOrEmpty(resource.ResourceURL))
                        {
                            _ = await _cloudinaryService.DeleteResourceByUrlAsync(resource.ResourceURL);
                        }
                        _unitOfWork.ResourceRepository.Delete(resource);
                    }

                    // Thêm tài nguyên mới từ request
                    foreach (var resource in historyUpdateRequest.Resources?.Where(newImg => !newImg.ResourceID.HasValue)!)
                    {
                        if (resource.File != null)
                        {
                            var cloudinaryUrl = await _cloudinaryService.UploadResourceAsync(resource.File, CloudinaryPath.FARM_LEGAL_DOCUMENT);
                            var newRes = new Resource
                            {
                                ResourceCode = "",
                                ResourceURL = (string)cloudinaryUrl.Data! ?? null,
                                ResourceType = ResourceTypeConst.LEGAL_DOCUMENT,
                                FileFormat = FileFormatConst.IMAGE,
                                CreateDate = DateTime.UtcNow,
                                LegalDocumentID = legalDocument.LegalDocumentId
                            };
                            legalDocument.Resources.Add(newRes);
                        }
                    }

                    // Cập nhật vào DB
                    _unitOfWork.LegalDocumentRepository.Update(legalDocument);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<LegalDocumentModel>(legalDocument);
                        return new BusinessResult(Const.SUCCESS_UPDATE_LEGAL_DOCUMENT_CODE, Const.SUCCESS_UPDATE_LEGAL_DOCUMENT_MSG, mappedResult);
                    }

                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_LEGAL_DOCUMENT_CODE, Const.FAIL_UPDATE_LEGAL_DOCUMENT_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
