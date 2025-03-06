using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Linq;
using System.Linq.Expressions;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class MasterTypeService : IMasterTypeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ProgramDefaultConfig _masterTypeConfig;
        public MasterTypeService(IUnitOfWork unitOfWork, IMapper mapper, ProgramDefaultConfig masterTypeConfig)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _masterTypeConfig = masterTypeConfig;
        }

        public async Task<BusinessResult> CreateMasterType(CreateMasterTypeRequestModel createMasterTypeModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var lastedId = await _unitOfWork.MasterTypeRepository.GetLastID();
                    string typename = createMasterTypeModel.TypeName!.ToString().ToUpper();
                    string code = CodeHelper.GenerateCode();
                    var newMasterType = new MasterType()
                    {
                        MasterTypeCode = $"{CodeAliasEntityConst.MASTER_TYPE}-{DateTime.Now.ToString("ddMMyy")}-{typename}-{code}",
                        MasterTypeName = createMasterTypeModel.MasterTypeName,
                        MasterTypeDescription = createMasterTypeModel.MasterTypeDescription,
                        IsActive = createMasterTypeModel.IsActive,
                        IsDelete = false,
                        IsDefault = false,
                        CreateBy = createMasterTypeModel.CreateBy,
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now,
                        TypeName = createMasterTypeModel.TypeName,
                        FarmID = createMasterTypeModel.FarmId,
                        BackgroundColor = createMasterTypeModel.BackgroundColor,
                        TextColor = createMasterTypeModel.TextColor,
                        Characteristic = createMasterTypeModel.Characteristic,
                        IsConflict = createMasterTypeModel.IsConflict,
                        Target = createMasterTypeModel.Target,
                    };
                    //if (createMasterTypeModel.createMasterTypeDetail?.Any() == true)
                    //{
                    //    foreach (var item in createMasterTypeModel.createMasterTypeDetail)
                    //    {
                    //        var MTDetail = new MasterTypeDetail()
                    //        {
                    //            MasterTypeDetailName = item.MasterTypeDetailName,
                    //            ForeignKeyId = item.ForeignKeyId,
                    //            ForeignKeyTable = item.ForeignKeyTable,
                    //            TypeOfValue = item.TypeOfValue,
                    //            Value = item.TypeOfValue,
                    //            MasterTypeDetailCode = $"{CodeAliasEntityConst.MASTER_TYPE_DETAIL}-{DateTime.Now.ToString("ddMMyy")}-{CodeAliasEntityConst.MASTER_TYPE}{lastedId}-{CodeHelper.GenerateCode}",
                    //            MasterType = newMasterType,
                    //        };
                    //        newMasterType.MasterTypeDetails.Add(MTDetail);
                    //    }
                    //}
                    //await _unitOfWork.MasterTypeRepository.Insert(newMasterType);


                    // Bước 1: Lưu MasterType trước
                    var checkInsertMasterType = await _unitOfWork.MasterTypeRepository.AddMasterType(newMasterType);

                    //if (checkInsertMasterType > 0 && createMasterTypeModel.ListMasterTypeDetail != null && createMasterTypeModel.ListMasterTypeDetail.Count > 0)
                    //{
                    //    foreach (var masterDetailModel in createMasterTypeModel.ListMasterTypeDetail)
                    //    {
                    //        var newMasterTypeDetailModel = new MasterTypeDetail()
                    //        {
                    //            MasterTypeDetailCode = await GetNextSequenceNumberOfMasterTypeDetail(),
                    //            MasterTypeDetailName = masterDetailModel.MasterTypeDetailName,
                    //            TypeOfValue = masterDetailModel.TypeOfValue,
                    //            Value = masterDetailModel.TypeOfValue,

                    //        };
                    //         newMasterType.MasterTypeDetails.Add(newMasterTypeDetailModel);
                    //    }
                    //}
                    await _unitOfWork.SaveAsync();

                    await transaction.CommitAsync();

                    if (checkInsertMasterType > 0)
                    {
                        var mappedResult = _mapper.Map<MasterTypeModel>(newMasterType);
                        return new BusinessResult(Const.SUCCESS_CREATE_MASTER_TYPE_CODE, Const.SUCCESS_CREATE_MASTER_TYPE_MESSAGE, mappedResult);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_MASTER_TYPE_CODE, Const.FAIL_CREATE_MASTER_TYPE_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }

            }
        }


        public async Task<BusinessResult> GetMasterTypeByName(string typeName, int farmId)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                var listMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypeByName(typeName, farmId);
                if (listMasterType != null)
                {
                    var listMasterTypeModel = _mapper.Map<List<MasterTypeModel>>(listMasterType);
                    return new BusinessResult(Const.SUCCESS_GET_MASTER_TYPE_BY_NAME_CODE, Const.SUCCESS_GET_MASTER_TYPE_BY_NAME_MESSAGE, listMasterTypeModel);
                }
                return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetAllMasterTypePagination(PaginationParameter paginationParameter, MasterTypeFilter masterTypeFilter, int farmId)
        {
            try
            {
                Expression<Func<MasterType, bool>> filter = x => x.IsDelete == false;
                if (farmId > 0)
                    filter = filter.And(x => (x.FarmID == farmId && x.IsDelete == false) || (x.IsDefault == true && x.FarmID == null));
                else
                    filter = filter.And(x => x.IsDefault == true && x.FarmID == null);
                //return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                Func<IQueryable<MasterType>, IOrderedQueryable<MasterType>> orderBy = x => x.OrderByDescending(x => x.MasterTypeId);
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    bool validBool = false;
                    if (checkInt)
                    {
                        filter = filter.And(x => x.MasterTypeId == validInt);
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = filter.And(x => x.CreateDate == validDate
                                      || x.UpdateDate == validDate);
                    }
                    else if (Boolean.TryParse(paginationParameter.Search, out validBool))
                    {
                        filter = filter.And(x => x.IsActive == validBool);
                    }
                    else
                    {
                        filter = x => x.MasterTypeCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MasterTypeName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MasterTypeCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MasterTypeDescription.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.CreateBy.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.TypeName.ToLower().Contains(paginationParameter.Search.ToLower());
                    }
                }

                if (masterTypeFilter.createDateFrom.HasValue || masterTypeFilter.createDateTo.HasValue)
                {
                    if (!masterTypeFilter.createDateFrom.HasValue || !masterTypeFilter.createDateTo.HasValue)
                    {
                        return new BusinessResult(Const.WARNING_MISSING_DATE_FILTER_CODE, Const.WARNING_MISSING_DATE_FILTER_MSG);
                    }

                    if (masterTypeFilter.createDateFrom.Value > masterTypeFilter.createDateTo.Value)
                    {
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);
                    }
                    filter = filter.And(x => x.CreateDate >= masterTypeFilter.createDateFrom &&
                                             x.CreateDate <= masterTypeFilter.createDateTo);
                }
                if (masterTypeFilter.isActive != null)
                    filter = filter.And(x => x.IsActive == masterTypeFilter.isActive);
                //if (masterTypeFilter.isDelete != null)
                //    filter = filter.And(x => x.IsDelete == masterTypeFilter.isDelete);
                if (masterTypeFilter.MasterTypeName != null)
                {
                    //List<string> filterList = Util.SplitByComma(masterTypeFilter.TypeName!);

                    // Kiểm tra nếu filterList có phần tử để tránh lỗi
                    List<string> filterList = masterTypeFilter.TypeName.Split(',', StringSplitOptions.TrimEntries)
                              .Select(f => f.ToLower()) // Chuyển về chữ thường
                              .ToList();
                    if (filterList.Any())
                        //foreach (var item in filterList)
                        //{
                        filter = filter.And(x => x.MasterTypeName!.ToLower().Contains(masterTypeFilter.MasterTypeName.ToLower()));
                    //}
                }

                if (masterTypeFilter.TypeName != null)
                {
                    List<string> filterList = Util.SplitByComma(masterTypeFilter.TypeName);
                    //foreach (var item in filterList)
                    //{
                    filter = filter.And(x => filterList.Contains(x.TypeName.ToLower()));
                    //}
                }
                //if (masterTypeFilter.CreateBy != null)
                //{
                //    List<string> filterList = masterTypeFilter.CreateBy.Split(',', StringSplitOptions.TrimEntries)
                //              .Select(f => f.ToLower()) // Chuyển về chữ thường
                //              .ToList();

                //    foreach (var item in filterList)
                //    {
                //        filter = filter.And(x => x.CreateBy.ToLower().Contains(item));
                //    }
                //}
                if (!string.IsNullOrEmpty(paginationParameter.SortBy))
                {
                    switch (paginationParameter.SortBy.ToLower())
                    {
                        case "mastertypeid":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeId);
                            break;
                        case "mastertypecode":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MasterTypeCode).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.MasterTypeCode).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeCode).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "mastertypename":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MasterTypeName).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.MasterTypeName).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeName).OrderBy(x => x.MasterTypeId);
                            break;
                        case "mastertypedescription":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.MasterTypeDescription).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.MasterTypeDescription).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeDescription).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "isactive":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.IsActive).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.IsActive).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.IsActive).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "isdelete":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.IsDelete).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.IsDelete).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.IsDelete).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "createdate":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.CreateDate).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.CreateDate).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.CreateDate).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "updatedate":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.UpdateDate).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.UpdateDate).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.UpdateDate).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "createby":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.CreateBy).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.CreateBy).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.CreateBy).OrderByDescending(x => x.MasterTypeId);
                            break;
                        case "typename":
                            orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                        ? (paginationParameter.Direction.ToLower().Equals("desc")
                                       ? x => x.OrderByDescending(x => x.TypeName).OrderByDescending(x => x.MasterTypeId)
                                       : x => x.OrderBy(x => x.TypeName).OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.TypeName).OrderByDescending(x => x.MasterTypeId);
                            break;
                        default:
                            orderBy = x => x.OrderBy(x => x.MasterTypeId);
                            break;
                    }
                }
                string includeProperties = "";
                var entities = await _unitOfWork.MasterTypeRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<MasterTypeModel>();
                pagin.List = _mapper.Map<IEnumerable<MasterTypeModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.MasterTypeRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    pagin.List.GroupBy(x => x.TypeName);
                    return new BusinessResult(Const.SUCCESS_GET_ALL_MASTER_TYPE_CODE, Const.SUCCESS_GET_ALL_MASTER_TYPE_MESSAGE, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG, new PageEntity<MasterTypeModel>());
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetMasterTypeByID(int MasterTypeId)
        {
            try
            {
                Expression<Func<MasterType, bool>> filter = x => x.MasterTypeId == MasterTypeId && x.IsDelete == false;
                var MasterType = await _unitOfWork.MasterTypeRepository.GetByCondition(filter);
                if (MasterType != null)
                {
                    var result = _mapper.Map<MasterTypeModel>(MasterType);
                    return new BusinessResult(Const.SUCCESS_GET_MASTER_TYPE_BY_ID_CODE, Const.SUCCESS_GET_MASTER_TYPE_BY_ID_MESSAGE, result);
                }
                return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PermanentlyDeleteMasterType(int MasterTypeId)
        {
            try
            {
                Expression<Func<MasterType, bool>> filter = x => x.MasterTypeId == MasterTypeId;
                string includeProperties = "Criterias,CriteriaHarvestTypes,HarvestTypeHistories,Notifications,Plans,Plants,Processes,SubProcesses";
                var checkExistMasterType = await _unitOfWork.MasterTypeRepository.GetByCondition(filter, includeProperties);
                if (checkExistMasterType != null)
                {
                    foreach (var criteria in checkExistMasterType.Criterias.ToList())
                    {
                        checkExistMasterType.Criterias.Remove(criteria);
                    }

                    var listHarvestTypeHistories = checkExistMasterType.HarvestTypeHistories.ToList();
                    foreach (var harvestTypeHistories in listHarvestTypeHistories)
                    {
                        checkExistMasterType.HarvestTypeHistories.Remove(harvestTypeHistories);
                    }
                    //foreach (var masterTypeDetails in checkExistMasterType.MasterTypeDetails.ToList())
                    //{
                    //    masterTypeDetails.MasterTypeId = null;
                    //}
                    foreach (var notifications in checkExistMasterType.Notifications.ToList())
                    {
                        notifications.MasterTypeId = null;
                    }
                    foreach (var plan in checkExistMasterType.Plans.ToList())
                    {
                        plan.MasterTypeId = null;
                    }
                    foreach (var plant in checkExistMasterType.Plants.ToList())
                    {
                        plant.MasterTypeId = null;
                    }
                    foreach (var process in checkExistMasterType.Processes.ToList())
                    {
                        process.MasterTypeId = null;
                    }
                    foreach (var subProcess in checkExistMasterType.SubProcesses.ToList())
                    {
                        subProcess.MasterTypeId = null;
                    }
                    await _unitOfWork.SaveAsync();

                    _unitOfWork.MasterTypeRepository.Delete(checkExistMasterType);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_DELETE_MASTER_TYPE_CODE, Const.SUCCESS_DELETE_MASTER_TYPE_MESSAGE, result > 0);
                    }
                    return new BusinessResult(Const.FAIL_DELETE_MASTER_TYPE_CODE, Const.FAIL_DELETE_MASTER_TYPE_MESSAGE, false);
                }
                return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);

            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateMasterTypeInfo(UpdateMasterTypeModel updateMasterTypeModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    Expression<Func<MasterType, bool>> filter = x => x.MasterTypeId == updateMasterTypeModel.MasterTypeId && x.IsDefault == false && x.IsDelete == false;
                    var checkExistMasterType = await _unitOfWork.MasterTypeRepository.GetByCondition(filter);
                    if (checkExistMasterType != null)
                    {
                        if (!string.IsNullOrEmpty(updateMasterTypeModel.MasterTypeName))
                        {
                            checkExistMasterType.MasterTypeName = updateMasterTypeModel.MasterTypeName;
                        }
                        if (!string.IsNullOrEmpty(updateMasterTypeModel.TypeName))
                        {
                            if (!_masterTypeConfig.TypeNames.Any(type => type.Equals(updateMasterTypeModel.TypeName, StringComparison.OrdinalIgnoreCase)
))
                                return new BusinessResult(400, "Type name not suitable with system");
                            checkExistMasterType.TypeName = updateMasterTypeModel.TypeName;
                        }
                        if (!string.IsNullOrEmpty(updateMasterTypeModel.Target))
                        {
                            if (!_masterTypeConfig.CriteriaTargets.Any(target => target.Equals(updateMasterTypeModel.Target, StringComparison.OrdinalIgnoreCase)) && checkExistMasterType.TypeName!.ToLower().Equals("criteria"))
                                return new BusinessResult(400, "Type name not suitable with system");
                            checkExistMasterType.TypeName = updateMasterTypeModel.TypeName;
                        }
                        if (updateMasterTypeModel.IsActive != null)
                        {
                            checkExistMasterType.IsActive = updateMasterTypeModel.IsActive;
                        }
                        //if (updateMasterTypeModel.IsDelete != null)
                        //{
                        //    checkExistMasterType.IsDelete = updateMasterTypeModel.IsDelete;
                        //}
                        if (!string.IsNullOrEmpty(updateMasterTypeModel.MasterTypeDescription))
                        {
                            checkExistMasterType.MasterTypeDescription = updateMasterTypeModel.MasterTypeDescription;
                        }
                        //if (updateMasterTypeModel.CreateBy != null)
                        //{
                        //    checkExistMasterType.CreateBy = updateMasterTypeModel.CreateBy;
                        //}
                        //if(updateMasterTypeModel.ListMasterTypeDetail != null)
                        //{
                        //    foreach(var updateMasterTypeDetail in  updateMasterTypeModel.ListMasterTypeDetail)
                        //    {
                        //        var getMasterTypeDetail = await _unitOfWork.MasterTypeDetailRepostiory.GetByID(updateMasterTypeDetail.MasterTypeDetailId);
                        //        if (updateMasterTypeDetail.MasterTypeDetailName != null)
                        //        {
                        //            getMasterTypeDetail.MasterTypeDetailName = updateMasterTypeDetail.MasterTypeDetailName;
                        //        }
                        //        if (updateMasterTypeDetail.Value != null)
                        //        {
                        //            getMasterTypeDetail.Value = updateMasterTypeDetail.Value;
                        //        }
                        //        if (updateMasterTypeDetail.TypeOfValue != null)
                        //        {
                        //            getMasterTypeDetail.TypeOfValue = updateMasterTypeDetail.TypeOfValue;
                        //        }

                        //        if (updateMasterTypeDetail.MasterTypeId != null)
                        //        {
                        //            getMasterTypeDetail.MasterTypeId = updateMasterTypeDetail.MasterTypeId;
                        //        }
                        //        await _unitOfWork.SaveAsync();
                        //    }
                        //}
                        checkExistMasterType.UpdateDate = DateTime.Now;
                        if (!string.IsNullOrEmpty(updateMasterTypeModel.BackgroundColor))
                        {
                            checkExistMasterType.BackgroundColor = updateMasterTypeModel.BackgroundColor;
                        }
                        if (!string.IsNullOrEmpty(updateMasterTypeModel.TextColor))
                        {
                            checkExistMasterType.TextColor = updateMasterTypeModel.TextColor;
                        }
                        if (!string.IsNullOrEmpty(updateMasterTypeModel.Characteristic))
                        {
                            checkExistMasterType.Characteristic = updateMasterTypeModel.Characteristic;
                        }
                        if (updateMasterTypeModel.IsConflict.HasValue)
                        {
                            checkExistMasterType.IsConflict = updateMasterTypeModel.IsConflict.Value;
                        }
                        //var existingResources = update.Resources.ToList();
                        // Xóa tài nguyên cũ không có trong request
                        //var detailToDelete = checkExistMasterType.MasterTypeDetails
                        //    .Where(old => !updateMasterTypeModel.MasterTypeDetails.Any(newDetail => newDetail.MasterTypeDetailId == old.MasterTypeDetailId))
                        //    .ToList();

                        //foreach (var detail in detailToDelete)
                        //{
                        //    _unitOfWork.MasterTypeDetailRepostiory.Delete(detail);
                        //    checkExistMasterType.MasterTypeDetails.Remove(detail);
                        //}
                        //foreach (var detail in updateMasterTypeModel.MasterTypeDetails)
                        //{
                        //    var detailRequestUpdate = checkExistMasterType.MasterTypeDetails.FirstOrDefault(old => old.MasterTypeDetailId == detail.MasterTypeDetailId);
                        //    if (detailRequestUpdate == null)
                        //        continue;
                        //    detail.TypeOfValue = detailRequestUpdate.TypeOfValue;
                        //    detail.Value = detailRequestUpdate.Value;
                        //    detail.ForeignKeyTable = detailRequestUpdate.ForeignKeyTable;
                        //    detail.ForeignKeyId = detailRequestUpdate.ForeignKeyId;
                        //    detail.MasterTypeDetailName = detailRequestUpdate.MasterTypeDetailName;
                        //}
                        // Thêm tài nguyên mới từ request
                        //foreach (var resource in updateMasterTypeModel.MasterTypeDetails?.Where(newImg => !newImg.MasterTypeDetailId.HasValue)!)
                        //{
                        //    //var cloudinaryUrl = await _cloudinaryService.UploadResourceAsync(resource.File, CloudinaryPath.FARM_LEGAL_DOCUMENT);
                        //    var newRes = new MasterTypeDetail
                        //    {
                        //        ForeignKeyId = resource.ForeignKeyId,
                        //        ForeignKeyTable = resource.ForeignKeyTable,
                        //        MasterTypeDetailName = resource.MasterTypeDetailName,
                        //        Value = resource.Value,
                        //        TypeOfValue = resource.ToString(),
                        //        MasterTypeDetailCode = $"{CodeAliasEntityConst.MASTER_TYPE_DETAIL}-{CodeHelper.GenerateCode()}"
                        //    };
                        //    checkExistMasterType.MasterTypeDetails.Add(newRes);
                        //}
                        _unitOfWork.MasterTypeRepository.Update(checkExistMasterType);
                        var result = await _unitOfWork.SaveAsync();
                        if (result > 0)
                        {
                            await transaction.CommitAsync();
                            var mappedResult = _mapper.Map<MasterTypeModel>(checkExistMasterType);
                            return new BusinessResult(Const.SUCCESS_UPDATE_MASTER_TYPE_CODE, Const.SUCCESS_UPDATE_MASTER_TYPE_MESSAGE, mappedResult);
                        }
                        else
                        {
                            await transaction.RollbackAsync();
                            return new BusinessResult(Const.FAIL_UPDATE_MASTER_TYPE_CODE, Const.FAIL_UPDATE_MASTER_TYPE_MESSAGE, false);
                        }

                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> PermanentlyDeleteManyMasterType(List<int> MasterTypeId)
        {
            try
            {
                var count = 0;
                foreach (var deleteMasterType in MasterTypeId)
                {
                    var result = await PermanentlyDeleteMasterType(deleteMasterType);
                    if (result.StatusCode == 200)
                    {
                        count++;
                    }
                }
                if (count == MasterTypeId.Count)
                {
                    return new BusinessResult(Const.SUCCESS_DELETE_MASTER_TYPE_CODE, $"Delete {count} master type success", true);
                }
                return new BusinessResult(Const.FAIL_DELETE_MASTER_TYPE_CODE, Const.FAIL_DELETE_MASTER_TYPE_MESSAGE, false);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> SoftedMultipleDelete(List<int> MasterTypeIds)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    foreach (var MasterTypeId in MasterTypeIds)
                    {
                        Expression<Func<MasterType, bool>> filter = x => x.MasterTypeId == MasterTypeId && x.IsDefault == false && x.IsDelete == false;
                        var checkExistMasterType = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.MasterTypeId == MasterTypeId);
                        if (checkExistMasterType != null)
                        {
                            checkExistMasterType.IsDelete = true;
                            _unitOfWork.MasterTypeRepository.Update(checkExistMasterType);
                        }
                    }
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_MASTER_TYPE_CODE, $"Delete {result.ToString()} master type success", result > 0);
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_DELETE_MASTER_TYPE_CODE, Const.FAIL_DELETE_MASTER_TYPE_MESSAGE, false);
                    //return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> GetMasterTypeForSelected(string typeName, string target, int farmId)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

                var listMasterType = await _unitOfWork.MasterTypeRepository.GetMasterTypeByName(typeName, farmId, target: target);
                if (listMasterType != null)
                {
                    var listMasterTypeModel = _mapper.Map<List<ForSelectedModels>>(listMasterType);
                    return new BusinessResult(Const.SUCCESS_GET_MASTER_TYPE_BY_NAME_CODE, Const.SUCCESS_GET_MASTER_TYPE_BY_NAME_MESSAGE, listMasterTypeModel);
                }
                return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

    }
}
