using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PartnerRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PartnerService : IPartnerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IExcelReaderService _excelReaderService;
        public PartnerService(IUnitOfWork unitOfWork, IMapper mapper, IExcelReaderService excelReaderService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _excelReaderService = excelReaderService;
        }

        public async Task<BusinessResult> CreatePartner(CreatePartnerModel createPartnerModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkFarmExist = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == createPartnerModel.FarmId && x.IsDeleted == false);
                    if (checkFarmExist == null)
                        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    string haflCode = GenerateFarmCode(createPartnerModel);
                    var partner = new Partner()
                    {
                        PartnerCode = $"{CodeAliasEntityConst.PARTNER}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddmmyy")}-{haflCode}",
                        Province = createPartnerModel.Province,
                        District = createPartnerModel.District,
                        Ward = createPartnerModel.Ward,
                        //Avatar = createPartnerModel.Avatar,
                        Note = createPartnerModel.Note,
                        Description = createPartnerModel.Description,
                        Major = createPartnerModel.Major,
                        ContactName = createPartnerModel.ContactName,
                        BusinessField = createPartnerModel.BusinessField,
                        PartnerName = createPartnerModel.PartnerName,
                        Status = createPartnerModel.Status,
                        CreateDate = DateTime.Now,
                        Email = createPartnerModel.Email,
                        National = createPartnerModel.National,
                        PhoneNumber = createPartnerModel.PhoneNumber,
                        FarmId = createPartnerModel.FarmId,
                        IsDeleted = false,
                    };

                    await _unitOfWork.PartnerRepository.Insert(partner);
                    var checkInsertPartner = await _unitOfWork.SaveAsync();
                    await transaction.CommitAsync();
                    if (checkInsertPartner > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_PARTNER_CODE, Const.SUCCESS_CREATE_PARTNER_MESSAGE, true);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_PARTNER_CODE, Const.FAIL_CREATE_PARTNER_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }

            }
        }

        public async Task<BusinessResult> GetAllPartnerPagination(GetPartnerFilterRequest filterRequest, PaginationParameter paginationParameter)
        {
            try
            {
                var checkFarmExist = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == filterRequest.FarmId && x.IsDeleted == false);
                if (checkFarmExist == null)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

                Expression<Func<Partner, bool>> filter = x => x.FarmId == filterRequest.FarmId && x.IsDeleted == false;
                Func<IQueryable<Partner>, IOrderedQueryable<Partner>> orderBy = x => x.OrderByDescending(x => x.PartnerId);
                if (!string.IsNullOrEmpty(filterRequest.Major))
                {
                    var filterList = Util.SplitByComma(filterRequest.Major);
                    filter = filter.And(x => filterList.Contains(x.Major!.ToLower()));
                }
                if (!string.IsNullOrEmpty(filterRequest.Status))
                {
                    var filterList = Util.SplitByComma(filterRequest.Status);
                    filter = filter.And(x => filterList.Contains(x.Status!.ToLower()));
                }
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    //int validInt = 0;
                    //var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    //DateTime validDate = DateTime.Now;
                    //if (checkInt)
                    //{
                    //    filter = x => x.PartnerId == validInt;
                    //}
                    //else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    //{
                    //    filter = x => x.CreateDate == validDate || x.UpdateDate == validDate;
                    //}
                    //else
                    //{


                    filter = x => x.PartnerCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.PartnerName.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.PhoneNumber.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Ward.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.District.ToLower().Contains(paginationParameter.Search.ToLower())
                                  //|| x.Description.ToLower().Contains(paginationParameter.Search.ToLower())
                                  //|| x.Note.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.BusinessField.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.ContactName.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Major.ToLower().Contains(paginationParameter.Search.ToLower())
                                  //|| x.Avatar.ToLower().Contains(paginationParameter.Search.ToLower())
                                  //|| x.Status.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Province.ToLower().Contains(paginationParameter.Search.ToLower())
                                  //|| x.National.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Email.ToLower().Contains(paginationParameter.Search.ToLower());
                    //}
                }
                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "partnerid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PartnerId)
                                   : x => x.OrderBy(x => x.PartnerId)) : x => x.OrderBy(x => x.PartnerId);
                        break;
                    case "partnercode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PartnerCode)
                                   : x => x.OrderBy(x => x.PartnerCode)) : x => x.OrderBy(x => x.PartnerCode);
                        break;
                    case "partnername":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PartnerName)
                                   : x => x.OrderBy(x => x.PartnerName)) : x => x.OrderBy(x => x.PartnerName);
                        break;
                    case "phonenumber":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PhoneNumber)
                                   : x => x.OrderBy(x => x.PhoneNumber)) : x => x.OrderBy(x => x.PhoneNumber);
                        break;
                    //case "rolename":
                    //    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                    //                ? (paginationParameter.Direction.ToLower().Equals("desc")
                    //               ? x => x.OrderByDescending(x => x.Role.RoleName)
                    //               : x => x.OrderBy(x => x.Role.RoleName)) : x => x.OrderBy(x => x.Role.RoleName);
                    //break;
                    case "province":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Province)
                                   : x => x.OrderBy(x => x.Province)) : x => x.OrderBy(x => x.Province);
                        break;
                    case "district":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.District)
                                   : x => x.OrderBy(x => x.District)) : x => x.OrderBy(x => x.District);
                        break;
                    case "ward":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Ward)
                                   : x => x.OrderBy(x => x.Ward)) : x => x.OrderBy(x => x.Ward);
                        break;
                    //case "note":
                    //    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                    //                ? (paginationParameter.Direction.ToLower().Equals("desc")
                    //               ? x => x.OrderByDescending(x => x.Note)
                    //               : x => x.OrderBy(x => x.Note)) : x => x.OrderBy(x => x.Note);
                    //    break;
                    case "businessfield":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.BusinessField)
                                   : x => x.OrderBy(x => x.BusinessField)) : x => x.OrderBy(x => x.BusinessField);
                        break;
                    case "status":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Status)
                                   : x => x.OrderBy(x => x.Status)) : x => x.OrderBy(x => x.Status);
                        break;
                    case "major":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Major)
                                   : x => x.OrderBy(x => x.Major)) : x => x.OrderBy(x => x.Major);
                        break;
                    case "contactname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ContactName)
                                   : x => x.OrderBy(x => x.ContactName)) : x => x.OrderBy(x => x.ContactName);
                        break;
                    //case "description":
                    //    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                    //                ? (paginationParameter.Direction.ToLower().Equals("desc")
                    //               ? x => x.OrderByDescending(x => x.Description)
                    //               : x => x.OrderBy(x => x.Description)) : x => x.OrderBy(x => x.Description);
                    //    break;
                    case "national":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.National)
                                   : x => x.OrderBy(x => x.National)) : x => x.OrderBy(x => x.National);
                        break;
                    case "email":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.Email)
                                   : x => x.OrderBy(x => x.Email)) : x => x.OrderBy(x => x.Email);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.PartnerId);
                        break;
                }
                var entities = await _unitOfWork.PartnerRepository.Get(filter: filter, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                var pagin = new PageEntity<PartnerModel>();
                pagin.List = _mapper.Map<IEnumerable<PartnerModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.PartnerRepository.Count(filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_PARTNER_CODE, Const.SUCCESS_GET_ALL_PARTNER_MESSAGE, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_MSG, new PageEntity<PartnerModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPartnerByID(int partnerId)
        {
            try
            {
                var getPartner = await _unitOfWork.PartnerRepository.GetByCondition(x => x.PartnerId == partnerId && x.IsDeleted == false);
                if (getPartner != null)
                {
                    var result = _mapper.Map<PartnerModel>(getPartner);
                    return new BusinessResult(Const.SUCCESS_GET_PARTNER_BY_ID_CODE, Const.SUCCESS_GET_PARTNER_BY_ID_MESSAGE, result);
                }
                return new BusinessResult(Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPartnerByRoleName(string Major)
        {
            try
            {
                var getPartnerByRoleNames = await _unitOfWork.PartnerRepository.GetPartnerByRoleName(Major);
                if (getPartnerByRoleNames.Count() > 0)
                {
                    var result = _mapper.Map<List<PartnerModel>>(getPartnerByRoleNames);
                    return new BusinessResult(Const.SUCCESS_GET_PARTNER_BY_ROLE_NAME_CODE, Const.SUCCESS_GET_PARTNER_BY_ROLE_NAME_MESSAGE, result);
                }
                return new BusinessResult(Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_MSG, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PermanentlyDeletePartner(int partnerId)
        {
            try
            {
                var checkExistPartnerRepo = await _unitOfWork.PartnerRepository.GetByCondition(x => x.PartnerId == partnerId, "PlantLots");
                if (checkExistPartnerRepo != null)
                {
                    foreach (var criteria in checkExistPartnerRepo.PlantLots.ToList())
                    {
                        criteria.PartnerId = null;
                    }
                    await _unitOfWork.SaveAsync();

                    _unitOfWork.PartnerRepository.Delete(checkExistPartnerRepo);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_DELETE_PARTNER_CODE, Const.SUCCESS_DELETE_PARTNER_MESSAGE, result > 0);
                    }
                    return new BusinessResult(Const.FAIL_DELETE_PARTNER_CODE, Const.FAIL_DELETE_PARTNER_MESSAGE, false);
                }
                return new BusinessResult(Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_CODE, Const.FAIL_DELETE_PARTNER_MESSAGE);

            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdatePartnerInfo(UpdatePartnerModel updatePartnerModel)
        {
            try
            {
                var checkExistPartner = await _unitOfWork.PartnerRepository.GetByCondition(x => x.PartnerId == updatePartnerModel.PartnerId && x.IsDeleted == false);
                if (checkExistPartner != null)
                {
                    if (!string.IsNullOrEmpty(updatePartnerModel.PartnerName))
                    {
                        checkExistPartner.PartnerName = updatePartnerModel.PartnerName;
                    }
                    if (!string.IsNullOrEmpty(updatePartnerModel.National))
                    {
                        checkExistPartner.National = updatePartnerModel.National;
                    }
                    if (!string.IsNullOrEmpty(updatePartnerModel.Province))
                    {
                        checkExistPartner.Province = updatePartnerModel.Province;
                    }
                    if (!string.IsNullOrEmpty(updatePartnerModel.District))
                    {
                        checkExistPartner.District = updatePartnerModel.District;
                    }
                    if (!string.IsNullOrEmpty(updatePartnerModel.Ward))
                    {
                        checkExistPartner.Ward = updatePartnerModel.Ward;
                    }
                    if (updatePartnerModel.ContactName != null)
                    {
                        checkExistPartner.ContactName = updatePartnerModel.ContactName;
                    }
                    if (!string.IsNullOrEmpty(updatePartnerModel.Note))
                    {
                        checkExistPartner.Note = updatePartnerModel.Note;
                    }
                    //if (updatePartnerModel.Avatar != null)
                    //{
                    //    //checkExistPartner.Avatar = updatePartnerModel.Avatar;
                    //}
                    if (!string.IsNullOrEmpty(updatePartnerModel.BusinessField))
                    {
                        checkExistPartner.BusinessField = updatePartnerModel.BusinessField;
                    }
                    if (!string.IsNullOrEmpty(updatePartnerModel.Description))
                    {
                        checkExistPartner.Description = updatePartnerModel.Description;
                    }
                    if (!string.IsNullOrEmpty(updatePartnerModel.Major))
                    {
                        checkExistPartner.Major = updatePartnerModel.Major;
                    }
                    if (!string.IsNullOrEmpty(updatePartnerModel.Status))
                    {
                        checkExistPartner.Status = updatePartnerModel.Status;
                    }
                    if (updatePartnerModel.PhoneNumber != null)
                    {
                        checkExistPartner.PhoneNumber = updatePartnerModel.PhoneNumber;
                    }
                    if (!string.IsNullOrEmpty(updatePartnerModel.Email))
                    {
                        checkExistPartner.Email = updatePartnerModel.Email;
                    }
                    //if (updatePartnerModel.RoleId != null)
                    //{
                    //    checkExistPartner.RoleName = updatePartnerModel.RoleId;
                    //}
                    checkExistPartner.UpdateDate = DateTime.Now;
                    _unitOfWork.PartnerRepository.Update(checkExistPartner);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_UPDATE_PARTNER_CODE, Const.SUCCESS_UPDATE_PARTNER_MESSAGE, checkExistPartner);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_PARTNER_CODE, Const.FAIL_UPDATE_PARTNER_MESSAGE, false);
                    }
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_MSG);
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
        private string GenerateFarmCode(CreatePartnerModel partnerRequest)
        {
            string countryCode = CodeHelper.ConvertTextToCode(partnerRequest.National!, 2);
            string provinceCode = CodeHelper.ConvertTextToCode(partnerRequest.Province!, 3);
            string districtCode = CodeHelper.ConvertTextToCode(partnerRequest.District!, 3);

            return $"{countryCode}-{provinceCode}-{districtCode}";
        }

        public async Task<BusinessResult> GetPartnerForSelected(int farmId, string? Major)
        {
            try
            {
                Expression<Func<Partner, bool>> filter = x => x.FarmId == farmId && x.IsDeleted == false;
                Func<IQueryable<Partner>, IOrderedQueryable<Partner>> orderBy = x => x.OrderByDescending(x => x.PartnerId);
                if (!string.IsNullOrEmpty(Major))
                {
                    var filterList = Util.SplitByComma(Major);
                    filter = filter.And(x => filterList.Contains(x.Major!.ToLower()));
                }
                var rowsOfFarm = await _unitOfWork.PartnerRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
                if (!rowsOfFarm.Any())
                    return new BusinessResult(Const.SUCCESS_GET_ALL_PARTNER_CODE, Const.WARNING_GET_PARTNER_DOES_NOT_EXIST_MSG);
                var mapReturn = _mapper.Map<IEnumerable<ForSelectedModels>>(rowsOfFarm);
                return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_SUCCESS_MSG, mapReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> SoftedMultipleDelete(List<int> partnerList)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    //if (string.IsNullOrEmpty(rowIds))
                    //    return new BusinessResult(500, "No row Id to delete");
                    //List<string> rowList = Util.SplitByComma(rowIds);
                    //foreach (var MasterTypeId in plantIdList)
                    //{
                    Expression<Func<Partner, bool>> filter = x => partnerList.Contains(x.PartnerId) && x.IsDeleted == false;
                    var rowsExistGet = await _unitOfWork.PartnerRepository.GetAllNoPaging(filter: filter);
                    foreach (var item in rowsExistGet)
                    {

                        item.IsDeleted = true;
                        _unitOfWork.PartnerRepository.Update(item);
                    }
                    //}
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_ONE_ROW_CODE, $"Delete {result.ToString()} partner success", result > 0);
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(400, "Delete partner fail", new { success = false });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<(byte[] FileBytes, string FileName, string ContentType)> ExportExcel(int FarmId)
        {
            try
            {
                var checkFarmExist = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == FarmId && x.IsDeleted == false);
                if (checkFarmExist == null)
                    return (Array.Empty<byte>(), "empty.csv", "text/csv");
                Expression<Func<Partner, bool>> filter = x => x.FarmId == FarmId && x.IsDeleted == false;
                Func<IQueryable<Partner>, IOrderedQueryable<Partner>> orderBy = x => x.OrderByDescending(x => x.PartnerId);

                var entities = await _unitOfWork.PartnerRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
                var mappedResult = _mapper.Map<IEnumerable<PartnerModel>>(entities).ToList();

                if (mappedResult.Any())
                {
                    var fileName = $"plant_{checkFarmExist.FarmName}_notes_{DateTime.Now:yyyyMMdd}.csv";
                    return await _excelReaderService.ExportToCsvAsync(mappedResult, fileName);
                }
                else
                {
                    return (Array.Empty<byte>(), "empty.csv", "text/csv");
                }
            }
            catch (Exception ex)
            {

                return (Array.Empty<byte>(), "empty.csv", "text/csv");
            }
        }
    }
}
