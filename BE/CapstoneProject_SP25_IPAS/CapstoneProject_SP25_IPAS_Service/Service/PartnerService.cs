using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel;
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

        public PartnerService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CreatePartner(CreatePartnerModel createPartnerModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    string haflCode = GenerateFarmCode(createPartnerModel);
                    var partner = new Partner()
                    {
                       PartnerCode = $"{CodeAliasEntityConst.PARTNER}-{DateTime.Now.ToString("ddmmyyyy")}-{haflCode}-{CodeHelper.GenerateCode()}",
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
                       UpdateDate = DateTime.Now,
                       Email = createPartnerModel.Email,
                       National = createPartnerModel.National,
                       PhoneNumber = createPartnerModel.National,
                       RoleId = createPartnerModel.RoleId
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

        public async Task<BusinessResult> GetAllPartnerPagination(PaginationParameter paginationParameter)
        {
            try
            {
                Expression<Func<Partner, bool>> filter = null!;
                Func<IQueryable<Partner>, IOrderedQueryable<Partner>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    if (checkInt)
                    {
                        filter = x => x.PartnerId == validInt;
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = x => x.CreateDate == validDate || x.UpdateDate == validDate;
                    }
                    else
                    {
                        filter = x => x.PartnerCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.PartnerName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.PhoneNumber.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Ward.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.District.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Description.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Note.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.BusinessField.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.ContactName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Major.ToLower().Contains(paginationParameter.Search.ToLower())
                                      //|| x.Avatar.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Status.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Role.RoleName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Province.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.National.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Email.ToLower().Contains(paginationParameter.Search.ToLower());
                    }
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
                    case "rolename":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Role.RoleName)
                                   : x => x.OrderBy(x => x.Role.RoleName)) : x => x.OrderBy(x => x.Role.RoleName);
                        break;
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
                    case "note":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Note)
                                   : x => x.OrderBy(x => x.Note)) : x => x.OrderBy(x => x.Note);
                        break;  
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
                    case "description":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Description)
                                   : x => x.OrderBy(x => x.Description)) : x => x.OrderBy(x => x.Description);
                        break;
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
                        orderBy = x => x.OrderBy(x => x.PartnerId);
                        break;
                }
                string includeProperties = "Role";
                var entities = await _unitOfWork.PartnerRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<PartnerModel>();
                pagin.List = _mapper.Map<IEnumerable<PartnerModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.PartnerRepository.Count();
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
                var getPartner = await _unitOfWork.PartnerRepository.GetByCondition(x => x.PartnerId == partnerId, "Role");
                if(getPartner != null)
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

        public async Task<BusinessResult> GetPartnerByRoleName(string roleName)
        {
            try
            {
                var getPartnerByRoleNames = await _unitOfWork.PartnerRepository.GetPartnerByRoleName(roleName);
                if(getPartnerByRoleNames.Count() > 0)
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

        public async  Task<BusinessResult> PermanentlyDeletePartner(int partnerId)
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
                var checkExistPartner = await _unitOfWork.PartnerRepository.GetByID(updatePartnerModel.PartnerId);
                if (checkExistPartner != null)
                {
                    if (updatePartnerModel.PartnerName != null)
                    {
                        checkExistPartner.PartnerName = updatePartnerModel.PartnerName;
                    }
                    if (updatePartnerModel.National != null)
                    {
                        checkExistPartner.National = updatePartnerModel.National;
                    }
                    if (updatePartnerModel.Province != null)
                    {
                        checkExistPartner.Province = updatePartnerModel.Province;
                    }
                    if (updatePartnerModel.District != null)
                    {
                        checkExistPartner.District = updatePartnerModel.District;
                    }
                    if (updatePartnerModel.Ward != null)
                    {
                        checkExistPartner.Ward = updatePartnerModel.Ward;
                    }
                    if (updatePartnerModel.ContactName != null)
                    {
                        checkExistPartner.ContactName = updatePartnerModel.ContactName;
                    }
                    if (updatePartnerModel.Note != null)
                    {
                        checkExistPartner.Note = updatePartnerModel.Note;
                    }
                    if (updatePartnerModel.Avatar != null)
                    {
                        //checkExistPartner.Avatar = updatePartnerModel.Avatar;
                    }
                    if (updatePartnerModel.BusinessField != null)
                    {
                        checkExistPartner.BusinessField = updatePartnerModel.BusinessField;
                    }
                    if (updatePartnerModel.Description != null)
                    {
                        checkExistPartner.Description = updatePartnerModel.Description;
                    }
                    if (updatePartnerModel.Major != null)
                    {
                        checkExistPartner.Major = updatePartnerModel.Major;
                    }
                    if (updatePartnerModel.Status != null)
                    {
                        checkExistPartner.Status = updatePartnerModel.Status;
                    }
                    if (updatePartnerModel.PhoneNumber != null)
                    {
                        checkExistPartner.PhoneNumber = updatePartnerModel.PhoneNumber;
                    }
                    if (updatePartnerModel.Email != null)
                    {
                        checkExistPartner.Email = updatePartnerModel.Email;
                    }
                    if (updatePartnerModel.RoleId != null)
                    {
                        checkExistPartner.RoleId = updatePartnerModel.RoleId;
                    }
                    checkExistPartner.UpdateDate = DateTime.Now;

                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_UPDATE_PARTNER_CODE , Const.SUCCESS_UPDATE_PARTNER_MESSAGE, checkExistPartner);
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

        public async Task<BusinessResult> GetPartnerForSelected(int farmId)
        {
            try
            {
                Expression<Func<Partner, bool>> filter = x => x.FarmId == farmId;
                Func<IQueryable<Partner>, IOrderedQueryable<Partner>> orderBy = x => x.OrderByDescending(x => x.PartnerId);
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
    }
}
