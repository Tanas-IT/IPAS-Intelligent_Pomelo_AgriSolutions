using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeDetail;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class MasterTypeDetailService : IMasterTypeDetailService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MasterTypeDetailService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CreateMasterTypeDetail(CreateMasterTypeDetailModel createMasterTypeDetailModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var newMasterTypeDetail = new MasterTypeDetail()
                    {
                        MasterTypeDetailCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.MASTER_TYPE_DETAIL),
                        MasterTypeDetailName = createMasterTypeDetailModel.MasterTypeDetailName,
                        Value = createMasterTypeDetailModel.Value,
                        TypeOfValue = createMasterTypeDetailModel.TypeOfValue,
                        ForeignKeyId = createMasterTypeDetailModel.ForeignKeyId,
                        ForeignKeyTable = createMasterTypeDetailModel.ForeignKeyTable,
                        MasterTypeId = createMasterTypeDetailModel.MasterTypeId
                    };
                    await _unitOfWork.MasterTypeDetailRepostiory.Insert(newMasterTypeDetail);

                    var checkInsertMasterTypeDetail = await _unitOfWork.SaveAsync();
                    await transaction.CommitAsync();
                    if (checkInsertMasterTypeDetail > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_MASTER_TYPE_DETAIL_CODE, Const.SUCCESS_CREATE_MASTER_TYPE_DETAIL_MESSAGE, true);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_MASTER_TYPE_DETAIL_CODE, Const.FAIL_CREATE_MASTER_TYPE_DETAIL_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }

            }
        }

        public async Task<BusinessResult> GetAllMasterTypeDetailPagination(PaginationParameter paginationParameter, MasterTypeDetailFilter masterTypeDetailFilter)
        {
            try
            {
                Expression<Func<MasterTypeDetail, bool>> filter = null!;
                Func<IQueryable<MasterTypeDetail>, IOrderedQueryable<MasterTypeDetail>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    if (checkInt)
                    {
                        filter = filter.And(x => x.MasterTypeDetailId == validInt || x.ForeignKeyId == validInt || x.MasterTypeId == validInt);
                    }
                    else
                    {
                        filter = x => x.MasterTypeDetailCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.MasterTypeDetailName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Value.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.TypeOfValue.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.ForeignKeyTable.ToLower().Contains(paginationParameter.Search.ToLower());
                    }
                }

                if (masterTypeDetailFilter.MasterTypeName != null)
                {
                    filter = filter.And(x => x.MasterType.MasterTypeName.Contains(masterTypeDetailFilter.MasterTypeName));
                }

                if (masterTypeDetailFilter.MasterTypeDetailName != null)
                {
                    filter = filter.And(x => x.MasterTypeDetailName.Contains(masterTypeDetailFilter.MasterTypeDetailName));
                }
                if (masterTypeDetailFilter.Value != null)
                {
                    filter = filter.And(x => x.Value.Contains(masterTypeDetailFilter.Value));
                }
                if (masterTypeDetailFilter.TypeOfValue != null)
                {
                    filter = filter.And(x => x.TypeOfValue.Contains(masterTypeDetailFilter.TypeOfValue));
                }
                if (masterTypeDetailFilter.ForeignKeyId != null)
                {
                    filter = filter.And(x => x.ForeignKeyId == masterTypeDetailFilter.ForeignKeyId);
                }
                if (masterTypeDetailFilter.ForeignTable != null)
                {
                    filter = filter.And(x => x.ForeignKeyTable.Contains(masterTypeDetailFilter.ForeignTable));
                }
                switch (paginationParameter.SortBy)
                {
                    case "mastertypedetailid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MasterTypeDetailId)
                                   : x => x.OrderBy(x => x.MasterTypeDetailId)) : x => x.OrderBy(x => x.MasterTypeDetailId);
                        break;
                    case "mastertypedetailcode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MasterTypeDetailCode)
                                   : x => x.OrderBy(x => x.MasterTypeDetailCode)) : x => x.OrderBy(x => x.MasterTypeDetailCode);
                        break;
                    case "mastertypedetailname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MasterTypeDetailName)
                                   : x => x.OrderBy(x => x.MasterTypeDetailName)) : x => x.OrderBy(x => x.MasterTypeDetailName);
                        break;
                    case "value":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Value)
                                   : x => x.OrderBy(x => x.Value)) : x => x.OrderBy(x => x.Value);
                        break;
                    case "typeofvalue":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.TypeOfValue)
                                   : x => x.OrderBy(x => x.TypeOfValue)) : x => x.OrderBy(x => x.TypeOfValue);
                        break;
                    case "foreignkeyid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ForeignKeyId)
                                   : x => x.OrderBy(x => x.ForeignKeyId)) : x => x.OrderBy(x => x.ForeignKeyId);
                        break;
                    case "foreignkeytable":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ForeignKeyTable)
                                   : x => x.OrderBy(x => x.ForeignKeyTable)) : x => x.OrderBy(x => x.ForeignKeyTable);
                        break;
                    case "mastertypeid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MasterTypeId)
                                   : x => x.OrderBy(x => x.MasterTypeId)) : x => x.OrderBy(x => x.MasterTypeId);
                        break;
                    case "mastertypename":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MasterType.MasterTypeName)
                                   : x => x.OrderBy(x => x.MasterType.MasterTypeName)) : x => x.OrderBy(x => x.MasterType.MasterTypeName);
                        break;
                    default:
                        orderBy = x => x.OrderBy(x => x.MasterTypeDetailId);
                        break;
                }
                string includeProperties = "MasterType";
                var entities = await _unitOfWork.MasterTypeDetailRepostiory.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<MasterTypeDetailModel>();
                pagin.List = _mapper.Map<IEnumerable<MasterTypeDetailModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.MasterTypeDetailRepostiory.Count();
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_MASTER_TYPE_DETAIL_CODE, Const.SUCCESS_GET_ALL_MASTER_TYPE_DETAIL_MESSAGE, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_MSG, new PageEntity<MasterTypeDetailModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetMasterTypeDetailByID(int MasterTypeDetailId)
        {
            try
            {
                var MasterTypeDetail = await _unitOfWork.MasterTypeDetailRepostiory.GetByCondition(x => x.MasterTypeDetailId == MasterTypeDetailId, "MasterType");
                if (MasterTypeDetail != null)
                {
                    var result = _mapper.Map<MasterTypeDetailModel>(MasterTypeDetail);
                    return new BusinessResult(Const.SUCCESS_GET_MASTER_TYPE_DETAIL_BY_ID_CODE, Const.SUCCESS_GET_MASTER_TYPE_DETAIL_BY_ID_MESSAGE, result);
                }
                return new BusinessResult(Const.FAIL_GET_MASTER_TYPE_DETAIL_CODE, Const.FAIL_GET_MASTER_TYPE_DETAIL_MESSAGE);

            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetMasterTypeDetailByName(string MasterTypeDetailName)
        {
            try
            {
                var MasterTypeDetail = await _unitOfWork.MasterTypeDetailRepostiory.GetByCondition(x => x.MasterTypeDetailName.Equals(MasterTypeDetailName), "MasterType");
                if (MasterTypeDetail != null)
                {
                    var result = _mapper.Map<MasterTypeDetailModel>(MasterTypeDetail);
                    return new BusinessResult(Const.SUCCESS_GET_MASTER_TYPE_DETAIL_BY_NAME_CODE, Const.SUCCESS_GET_MASTER_TYPE_DETAIL_BY_NAME_MESSAGE, result);
                }
                return new BusinessResult(Const.FAIL_GET_MASTER_TYPE_DETAIL_CODE, Const.FAIL_GET_MASTER_TYPE_DETAIL_MESSAGE);

            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PermanentlyDeleteMasterTypeDetail(int MasterTypeDetailId)
        {
            try
            {
                var checkExistMasterTypeDetail = await _unitOfWork.MasterTypeDetailRepostiory.GetByCondition(x => x.MasterTypeDetailId == MasterTypeDetailId, "MasterType");
                if (checkExistMasterTypeDetail != null)
                {
                    _unitOfWork.MasterTypeDetailRepostiory.Delete(checkExistMasterTypeDetail);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_DELETE_MASTER_TYPE_DETAIL_CODE, Const.SUCCESS_DELETE_MASTER_TYPE_DETAIL_MESSAGE, result > 0);
                    }
                    return new BusinessResult(Const.FAIL_DELETE_MASTER_TYPE_DETAIL_CODE, Const.FAIL_DELETE_MASTER_TYPE_DETAIL_MESSAGE, false);
                }
                return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_MSG);

            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateMasterTypeDetailInfo(UpdateMasterTypeDetailModel updateMasterTypeModel)
        {
            try
            {
                if (!updateMasterTypeModel.MasterTypeDetailId.HasValue)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG );
                }
                var checkExistMasterTypeDetail = await _unitOfWork.MasterTypeDetailRepostiory.GetByID(updateMasterTypeModel.MasterTypeDetailId!.Value);
                if (checkExistMasterTypeDetail != null)
                {
                    if (updateMasterTypeModel.MasterTypeDetailName != null)
                    {
                        checkExistMasterTypeDetail.MasterTypeDetailName = updateMasterTypeModel.MasterTypeDetailName;
                    }
                    if (updateMasterTypeModel.Value != null)
                    {
                        checkExistMasterTypeDetail.Value = updateMasterTypeModel.Value;
                    }
                    if (updateMasterTypeModel.TypeOfValue != null)
                    {
                        checkExistMasterTypeDetail.TypeOfValue = updateMasterTypeModel.TypeOfValue;
                    }
                    if (updateMasterTypeModel.ForeignKeyId != null)
                    {
                        checkExistMasterTypeDetail.ForeignKeyId = updateMasterTypeModel.ForeignKeyId;
                    }
                    if (updateMasterTypeModel.ForeignKeyTable != null)
                    {
                        checkExistMasterTypeDetail.ForeignKeyTable = updateMasterTypeModel.ForeignKeyTable;
                    }
                    //if (updateMasterTypeModel.MasterTypeId != null)
                    //{
                    //    checkExistMasterTypeDetail.MasterTypeId = updateMasterTypeModel.MasterTypeId;
                    //}

                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_UPDATE_MASTER_TYPE_DETAIL_CODE, Const.SUCCESS_UPDATE_MASTER_TYPE_DETAIL_MESSAGE, checkExistMasterTypeDetail);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_MASTER_TYPE_DETAIL_CODE, Const.FAIL_UPDATE_MASTER_TYPE_DETAIL_MESSAGE, false);
                    }

                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_MSG);
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
