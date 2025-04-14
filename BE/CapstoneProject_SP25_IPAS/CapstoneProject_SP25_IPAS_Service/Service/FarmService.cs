using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject.SoftDeleteInterceptors;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.UserFarmRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class FarmService : IFarmService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IConfiguration _configuration;
        private readonly ISoftDeleteCommon _softDeleteCommon;
        public FarmService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService, IConfiguration configuration, ISoftDeleteCommon softDeleteCommon)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _configuration = configuration;
            _softDeleteCommon = softDeleteCommon;
        }

        public async Task<BusinessResult> CreateFarm(FarmCreateRequest farmCreateRequest, int userid)
        {
            try
            {
                if (userid <= 0)
                {
                    return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                }
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {

                    var farmCreateEntity = new Farm()
                    {
                        FarmName = farmCreateRequest.FarmName,
                        Address = farmCreateRequest.Address,
                        Area = farmCreateRequest.Area,
                        SoilType = farmCreateRequest.SoilType,
                        ClimateZone = farmCreateRequest.ClimateZone,
                        Province = farmCreateRequest.Province,
                        Ward = farmCreateRequest.Ward,
                        District = farmCreateRequest.District,
                        Length = farmCreateRequest.Length,
                        Width = farmCreateRequest.Width,
                        Description = farmCreateRequest.Description,
                        Longitude = farmCreateRequest.Longitude,
                        Latitude = farmCreateRequest.Latitude,
                    };
                    //var index = await _unitOfWork.FarmRepository.GetLastFarmID();
                    string haftCode = GenerateFarmCode(farmCreateRequest);
                    farmCreateEntity.FarmCode = $"{CodeAliasEntityConst.FARM}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddmmyy")}-{haftCode}";
                    farmCreateEntity.Status = FarmStatusEnum.Active.ToString();
                    farmCreateEntity.IsDeleted = false;
                    farmCreateEntity.CreateDate = DateTime.Now;
                    farmCreateEntity.UpdateDate = DateTime.Now;
                    if (farmCreateRequest.LogoUrl != null)
                    {
                        // gan va push len cloudinary
                        var logoUrlCloudinary = await _cloudinaryService.UploadImageAsync(farmCreateRequest.LogoUrl, CloudinaryPath.FARM_LOGO);
                        farmCreateEntity.LogoUrl = logoUrlCloudinary;
                    }
                    else
                    {
                        farmCreateEntity.LogoUrl = _configuration["SystemDefault:ResourceDefault"];
                    }

                    // chua co add them UserFarm
                    farmCreateEntity.UserFarms.Add(new UserFarm
                    {
                        UserId = userid,
                        RoleId = (int)RoleEnum.OWNER,
                        IsActive = true,
                    });

                    await _unitOfWork.FarmRepository.Insert(farmCreateEntity);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapResult = _mapper.Map<FarmModel>(farmCreateEntity);
                        return new BusinessResult(Const.SUCCESS_CREATE_FARM_CODE, Const.SUCCESS_CREATE_FARM_MSG, mapResult);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, Const.FAIL_CREATE_FARM_MSG);
                    }
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, Const.FAIL_CREATE_FARM_MSG, ex.Message);
            }
        }

        public async Task<BusinessResult> GetFarmByID(int farmId)
        {
            //Expression<Func<UserFarm, bool>> filter = x => x.UserId == userId && x.User.IsDelete != true && x.Farm.IsDeleted != true;
            //string includeProperties = "Farm,Role,User";
            var farm = await _unitOfWork.FarmRepository.GetFarmById(farmId);
            // kiem tra null
            if (farm == null)
                return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
            // neu khong null return ve mapper
            var result = _mapper.Map<FarmModel>(farm);
            //if (farm.Orders.Any())
            //{
            //    result.FarmExpiredDate = farm.Orders.Where(x => x.FarmId == farmId && x.Status!.ToUpper().Equals("PAID"))
            //                                   .Max(x => x.ExpiredDate);
            //}
            return new BusinessResult(Const.SUCCESS_GET_FARM_CODE, Const.SUCCESS_FARM_GET_MSG, result);
        }

        public async Task<BusinessResult> GetAllFarmOfUser(int userId)
        {
            //Expression<Func<UserFarm, bool>> filter = x => x.UserId == userId && x.User.IsDelete != true && x.Farm.IsDeleted != true;
            //string includeProperties = "Farm,Role,User";
            var userFarm = await _unitOfWork.UserFarmRepository.GetFarmOfUser(userId);
            if (!userFarm.Any())
                return new BusinessResult(Const.SUCCESS_GET_ALL_FARM_OF_USER_CODE, Const.SUCCESS_GET_ALL_FARM_OF_USER_EMPTY_MSG);
            var result = _mapper.Map<List<UserFarmModel>>(userFarm);
            result.ForEach(uf =>
            {
                if (uf.Farm != null)
                {
                    uf.Farm.Owner = null;
                }
                userFarm = null;
            });
            return new BusinessResult(Const.SUCCESS_GET_ALL_FARM_OF_USER_CODE, Const.SUCCESS_GET_ALL_FARM_OF_USER_FOUND_MSG, result);
        }


        public async Task<BusinessResult> GetAllFarmPagination(GetFarmFilterRequest filterRequest, PaginationParameter paginationParameter)
        {
            try
            {
                Expression<Func<Farm, bool>> filter = x => x.IsDeleted == false;
                Func<IQueryable<Farm>, IOrderedQueryable<Farm>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {

                    filter = x => (x.FarmName!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Address!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Province!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Ward!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.District!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.FarmCode!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  && x.IsDeleted != true);
                }
                if (filterRequest.CreateDateTo.HasValue && filterRequest.CreateDateFrom.HasValue && filterRequest.CreateDateFrom <= filterRequest.CreateDateTo)
                {
                    filter = filter.And(x => x.CreateDate <= filterRequest.CreateDateTo && x.CreateDate >= filterRequest.CreateDateTo);
                }
                if (filterRequest.AreaFrom.HasValue && filterRequest.AreaTo.HasValue && filterRequest.AreaFrom <= filterRequest.AreaTo)
                {
                    filter = filter.And(x => x.Area >= filterRequest.AreaFrom && x.Area <= filterRequest.AreaTo);
                }
                if (!string.IsNullOrEmpty(filterRequest.Status))
                {
                    var filterList = Util.SplitByComma(filterRequest.Status);
                    filter = filter.And(x => filterList.Contains(x.Status!.ToLower()));
                }
                if (!string.IsNullOrEmpty(filterRequest.ClimateZone))
                {
                    var filterList = Util.SplitByComma(filterRequest.ClimateZone);
                    filter = filter.And(x => filterList.Contains(x.ClimateZone!.ToLower()));
                }
                if (!string.IsNullOrEmpty(filterRequest.SoilType))
                {
                    var filterList = Util.SplitByComma(filterRequest.SoilType);
                    filter = filter.And(x => filterList.Contains(x.SoilType!.ToLower()));
                }
                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    //case "farmId":
                    //    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                    //                ? (paginationParameter.Direction.ToLower().Equals("desc")
                    //               ? x => x.OrderByDescending(x => x.FarmId)
                    //               : x => x.OrderBy(x => x.FarmId)) : x => x.OrderBy(x => x.FarmId);
                    //break;
                    case "farmcode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.FarmCode)
                                   : x => x.OrderBy(x => x.FarmCode)) : x => x.OrderBy(x => x.FarmCode);
                        break;
                    case "area":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Area)
                                   : x => x.OrderBy(x => x.Area)) : x => x.OrderBy(x => x.Area);
                        break;
                    case "soiltype":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.SoilType)
                                   : x => x.OrderBy(x => x.SoilType)) : x => x.OrderBy(x => x.SoilType);
                        break;
                    case "climatezone":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.ClimateZone)
                                   : x => x.OrderBy(x => x.ClimateZone)) : x => x.OrderBy(x => x.ClimateZone);
                        break;
                    case "createdate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.CreateDate)
                                   : x => x.OrderBy(x => x.CreateDate)) : x => x.OrderBy(x => x.CreateDate);
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
                    case "address":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.Address)
                                   : x => x.OrderBy(x => x.Address)) : x => x.OrderBy(x => x.Address);
                        break;
                    case "createDate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.CreateDate)
                                   : x => x.OrderBy(x => x.CreateDate)) : x => x.OrderBy(x => x.CreateDate);
                        break;
                    case "updateDate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.UpdateDate)
                                   : x => x.OrderBy(x => x.UpdateDate)) : x => x.OrderBy(x => x.UpdateDate);
                        break;
                    case "status":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.Status)
                                   : x => x.OrderBy(x => x.Status)) : x => x.OrderBy(x => x.Status);
                        break;
                    case "expireddate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                            ? x => x.OrderByDescending(x => x.Orders.Any() ? x.Orders.Max(o => o.ExpiredDate) : DateTime.MinValue).ThenByDescending(x => x.FarmId)
                            : x => x.OrderBy(x => x.Orders.Any() ? x.Orders.Max(o => o.ExpiredDate) : DateTime.MinValue).ThenBy(x => x.FarmId);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.FarmId);
                        break;
                }
                var entities = await _unitOfWork.FarmRepository.Get(filter, orderBy, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<FarmModel>();
                pagin.List = _mapper.Map<IEnumerable<FarmModel>>(entities).ToList();
                //Expression<Func<Farm, bool>> filterCount = x => x.IsDeleted != true;
                pagin.TotalRecord = await _unitOfWork.FarmRepository.Count(filter: filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_FARM_ALL_PAGINATION_CODE, Const.SUCCESS_GET_FARM_ALL_PAGINATION_FARM_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(200, Const.WARNING_GET_ALL_FARM_DOES_NOT_EXIST_MSG, pagin);
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }

        }

        public async Task<BusinessResult> permanentlyDeleteFarm(int farmId)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<Farm, bool>> filter = x => x.FarmId == farmId;
                    string includeProperties = "UserFarms,LandPlots,Orders,Processes"; // chua co bang user farm nen chua xoa
                    // set up them trong context moi xoa dc tat ca 1 lan
                    var farm = await _unitOfWork.FarmRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                    // xoa anh tren cloudinary
                    if (farm == null) return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

                    if (!string.IsNullOrEmpty(farm.LogoUrl))
                    {
                        _cloudinaryService.DeleteImageByUrlAsync(farm.LogoUrl);
                    }
                    _unitOfWork.FarmRepository.Delete(farm);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PERMANENTLY_FARM_CODE, Const.SUCCESS_DELETE_PERMANENTLY_FARM_MSG, new { success = true });
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        public async Task<BusinessResult> SoftDeletedFarm(int farmId)
        {
            try
            {

                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<Farm, bool>> condition = x => x.FarmId == farmId && x.IsDeleted != true;
                    var farm = await _unitOfWork.FarmRepository.GetByCondition(condition);

                    if (farm == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    }
                    var result = await _softDeleteCommon.SoftDeleteFarm(farmId);
                    //farm.IsDeleted = true;
                    //_unitOfWork.FarmRepository.Update(farm);
                    //int result = await _unitOfWork.SaveAsync();
                    if (result)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_SOFTED_FARM_CODE, Const.SUCCESS_DELETE_SOFTED_FARM_MSG, new { success = true });
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE, new { success = false });
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateFarmInfo(FarmUpdateInfoRequest farmUpdateModel, int farmId)
        {
            try
            {

                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    //Expression<Func<Farm, bool>> condition = x => x.FarmId == farmId && x.IsDelete != true;
                    //string includeProperties = "FarmCoordinations";
                    var farmEntityUpdate = await _unitOfWork.FarmRepository.GetFarmById(farmId);

                    if (farmEntityUpdate == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    }
                    // Lấy danh sách thuộc tính từ model
                    foreach (var prop in typeof(FarmUpdateInfoRequest).GetProperties())
                    {
                        var newValue = prop.GetValue(farmUpdateModel);
                        if (newValue != null && !string.IsNullOrEmpty(newValue.ToString()) && !newValue.ToString().Equals("string") && !newValue.ToString()!.Equals("0"))
                        {
                            var farmProp = typeof(Farm).GetProperty(prop.Name);
                            if (farmProp != null && farmProp.CanWrite)
                            {
                                farmProp.SetValue(farmEntityUpdate, newValue);
                            }
                        }
                    }

                    _unitOfWork.FarmRepository.Update(farmEntityUpdate);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapResult = _mapper.Map<FarmModel>(farmEntityUpdate);
                        return new BusinessResult(Const.SUCCESS_UPDATE_FARM_CODE, Const.SUCCESS_UPDATE_FARM_MSG, mapResult);
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateFarmLogo(int farmId, IFormFile logoFile)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var farm = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == farmId);
                    if (farm == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    }
                    bool result = false;
                    if (string.IsNullOrEmpty(farm.LogoUrl) || farm.LogoUrl.Equals(_configuration["SystemDefault:ResourceDefault"]) || farm.LogoUrl.Equals(_configuration["SystemDefault:AvatarDefault"]))
                    {
                        farm.LogoUrl = await _cloudinaryService.UploadImageAsync(logoFile, CloudinaryPath.FARM_LOGO);
                        _unitOfWork.FarmRepository.Update(farm);
                        result = await _unitOfWork.SaveAsync() > 0 ? true : false;
                    }
                    else
                    {
                        result = await _cloudinaryService.UpdateImageAsync(file: logoFile, farm.LogoUrl!);
                    }

                    if (result)
                    {
                        await transaction.CommitAsync();
                        var mapResult = _mapper.Map<FarmModel>(farm);
                        return new BusinessResult(Const.SUCCESS_UPDATE_FARM_LOGO_CODE, Const.SUCCESS_UPDATE_FARM_LOGO_MSG, mapResult);
                    }
                    else return new BusinessResult(Const.FAIL_UPDATE_FARM_LOGO_CODE, Const.FAIL_UPDATE_FARM_LOGO_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }

        }


        //public async Task<BusinessResult> UpdateFarmCoordination(int farmId, List<CoordinationCreateRequest> updatedCoordinationsList)
        //{
        //    try
        //    {

        //        using (var transaction = await _unitOfWork.BeginTransactionAsync())
        //        {
        //            // Lấy các tọa độ hiện tại
        //            Expression<Func<FarmCoordination, bool>> condition = x => x.FarmId == farmId && x.Farm.IsDelete != true;
        //            var existingCoordinationList = await _unitOfWork.FarmCoordinationRepository.GetAllNoPaging(condition);

        //            // Chuyển đổi danh sách thành HashSet để so sánh
        //            var existingCoordinates = existingCoordinationList
        //                .Select(x => new { Lat = x.Lagtitude ?? 0, Lng = x.Longitude ?? 0 }) // Ép kiểu tránh null
        //                .ToHashSet();

        //            var newCoordinates = updatedCoordinationsList
        //                .Select(x => new { Lat = x.Lagtitude, Lng = x.Longitude }) // Đổi tên key tránh lỗi trùng
        //                .ToHashSet();

        //            // Tìm các điểm bị xóa (có trong danh sách cũ nhưng không có trong danh sách mới)
        //            var coordinatesToDelete = existingCoordinationList
        //                .Where(x => !newCoordinates.Contains(new { Lat = x.Lagtitude!.Value, Lng = x.Longitude!.Value }))
        //                .ToList();

        //            // Tìm các điểm cần thêm mới (có trong danh sách mới nhưng không có trong danh sách cũ)
        //            var coordinatesToAdd = updatedCoordinationsList
        //                .Where(x => !existingCoordinates.Contains(new { Lat = x.Lagtitude, Lng = x.Longitude }))
        //                .Select(x => new FarmCoordination
        //                {
        //                    FarmId = farmId,
        //                    Lagtitude = x.Lagtitude,
        //                    Longitude = x.Longitude
        //                })
        //                .ToList();

        //            // Xóa các điểm không còn tồn tại
        //            if (coordinatesToDelete.Any())
        //            {
        //                _unitOfWork.FarmCoordinationRepository.RemoveRange(coordinatesToDelete); // Sửa DeleteRange
        //            }

        //            // Thêm các điểm mới
        //            if (coordinatesToAdd.Any())
        //            {
        //                await _unitOfWork.FarmCoordinationRepository.InsertRangeAsync(coordinatesToAdd); // Sửa InsertRangeAsync
        //            }

        //            var result = await _unitOfWork.SaveAsync();
        //            if (result > 0)
        //            {
        //                await transaction.CommitAsync();
        //                var resultSave = await _unitOfWork.FarmRepository.GetFarmById(farmId);
        //                var mapResult = _mapper.Map<FarmModel>(resultSave);
        //                return new BusinessResult(Const.SUCCESS_UPDATE_FARM_COORDINATION_CODE, Const.SUCCESS_UPDATE_FARM_COORDINATION_MSG, mapResult);
        //            }
        //            else
        //            {
        //                return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //    }
        //}

        public async Task<UserFarmModel> GetUserFarmRole(int farmId, int userId)
        {
            try
            {
                Expression<Func<UserFarm, bool>> condition = x => x.FarmId == farmId && x.UserId == userId && x.Farm.IsDeleted != true;
                //Func<IQueryable<UserFarm>, IOrderedQueryable<UserFarm>> orderBy = x => x.OrderByDescending(x => farmId);
                string includeProperties = "Farm,User,Role";
                var userfarm = await _unitOfWork.UserFarmRepository.GetByCondition(filter: condition, includeProperties: includeProperties);
                var result = _mapper.Map<UserFarmModel>(userfarm);
                return result;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        private string GenerateFarmCode(FarmCreateRequest farmRequest)
        {
            string countryCode = CodeHelper.ConvertTextToCode("Viet Nam", 2);
            string provinceCode = CodeHelper.ConvertTextToCode(farmRequest.Province, 3);
            string districtCode = CodeHelper.ConvertTextToCode(farmRequest.District, 3);
            string geoHash = CodeHelper.GenerateGeoHash(farmRequest.Latitude!.Value, farmRequest.Longitude!.Value);

            return $"{countryCode}-{provinceCode}-{districtCode}-{geoHash}";
        }

        public async Task<BusinessResult> GetAllUserOfFarmByRoleAsync(int farmId, List<int> roleIds)
        {
            try
            {
                var farmexist = await _unitOfWork.FarmRepository.GetByID(farmId);
                if (farmexist == null)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                if (!roleIds.Any())
                    return new BusinessResult(Const.WARNING_GET_ROLE_NOTE_EXIST_CODE, Const.WARNING_GET_ROLE_NOTE_EXIST_MSG);
                var userFarm = await _unitOfWork.FarmRepository.GetEmployeeOfFarmByRole(farmId: farmId, roleIds: roleIds);
                if (!userFarm.Any())
                    return new BusinessResult(Const.SUCCESS_GET_ALL_USER_BY_ROLE_CODE, Const.WARNING_GET_ALL_USER_OF_FARM_EMPTY_MSG);
                var mappedResult = _mapper.Map<IEnumerable<UserFarmModel>>(userFarm);
                foreach (var item in mappedResult)
                {
                    item.Farm = null!;
                }
                return new BusinessResult(Const.SUCCESS_GET_ALL_USER_BY_ROLE_CODE, Const.SUCCESS_GET_ALL_USER_BY_ROLE_MESSAGE, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getUserOfFarm(GetUserFarmRequest getRequest, PaginationParameter paginationParameter)
        {
            try
            {
                var farmexist = await _unitOfWork.FarmRepository.GetByID(getRequest.farmId!.Value);
                if (farmexist == null)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                Expression<Func<UserFarm, bool>> filter = x => x.FarmId == getRequest.farmId.Value && !(x.Role!.RoleName!.ToUpper().Equals(RoleEnum.OWNER.ToString().ToUpper()));
                if (!string.IsNullOrEmpty(getRequest.RoleName))
                {
                    var listRoles = Util.SplitByComma(getRequest.RoleName);
                    filter = filter.And(x => listRoles.Contains(x.Role!.RoleName!));
                }
                Func<IQueryable<UserFarm>, IOrderedQueryable<UserFarm>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    filter = filter.And(x => (x.User.FullName!.ToLower().Contains(paginationParameter.Search.ToLower())
                                   || x.User.Email!.ToLower().Contains(paginationParameter.Search.ToLower()))
                                   && x.User.IsDeleted != true
                                   && x.Farm.IsDeleted != true);
                }

                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "email":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.User.Email).OrderByDescending(x => x.UserId)
                                   : x => x.OrderBy(x => x.User.Email).OrderByDescending(x => x.UserId)) : x => x.OrderBy(x => x.User.Email).OrderBy(x => x.UserId);
                        break;
                    case "fullname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.User.FullName).OrderByDescending(x => x.UserId)
                                   : x => x.OrderBy(x => x.User.FullName).OrderByDescending(x => x.UserId)) : x => x.OrderBy(x => x.User.FullName);
                        break;
                    case "gender":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.User.Gender).OrderByDescending(x => x.UserId)
                                   : x => x.OrderBy(x => x.User.Gender)) : x => x.OrderBy(x => x.User.Gender).OrderBy(x => x.UserId);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.User);
                        break;
                }
                string includeProperties = "Role,User,Farm";
                var entities = await _unitOfWork.UserFarmRepository.Get(filter: filter, orderBy: orderBy, includeProperties: includeProperties, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                var pagin = new PageEntity<UserFarmModel>();
                pagin.List = _mapper.Map<List<UserFarmModel>>(entities);
                pagin.List.ToList().ForEach(uf =>
                {
                    if (uf.Farm != null)
                    {
                        uf.Farm.Owner = null;
                    }
                    uf.Farm = null!;
                });
                pagin.TotalRecord = await _unitOfWork.UserFarmRepository.Count(filter: filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_FARM_ALL_PAGINATION_CODE, Const.SUCCESS_GET_FARM_ALL_PAGINATION_FARM_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_USER_OF_FARM_EXIST_CODE, Const.WARNING_GET_USER_OF_FARM_EXIST_MSG, pagin);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> updateUserInFarm(UserFarmRequest updateRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    Expression<Func<UserFarm, bool>> filter = x => x.UserId == updateRequest.UserId && x.FarmId == updateRequest.FarmId!.Value;
                    //string includeProperties = "Role,Farm,User";
                    var userInfarm = await _unitOfWork.UserFarmRepository.GetByCondition(filter);
                    if (userInfarm == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_USER_OF_FARM_EXIST_CODE, Const.WARNING_GET_USER_OF_FARM_EXIST_MSG);
                    }
                    if (!string.IsNullOrEmpty(updateRequest.RoleName))
                    {

                        //return new BusinessResult(Const.WARNING_GET_ROLE_NOTE_EXIST_CODE, Const.WARNING_GET_ROLE_NOTE_EXIST_MSG);
                        var checkRoleExist = await _unitOfWork.RoleRepository.GetByCondition(x => x.RoleName!.ToLower().Equals(updateRequest.RoleName!.ToLower()) && x.IsSystem == true);
                        if (checkRoleExist == null)
                        {
                            return new BusinessResult(Const.WARNING_ROLE_IS_NOT_EXISTED_CODE, Const.WARNING_ROLE_IS_NOT_EXISTED_MSG);
                        }

                        userInfarm.RoleId = checkRoleExist.RoleId;
                    }
                    if (updateRequest.IsActive.HasValue)
                    {
                        userInfarm.IsActive = updateRequest.IsActive;
                    }

                    _unitOfWork.UserFarmRepository.Update(userInfarm);

                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<UserFarmModel>(userInfarm);
                        mappedResult.Farm = null!;
                        mappedResult.User = null!;
                        return new BusinessResult(Const.SUCCESS_UPDATE_USER_IN_FARM_CODE, Const.SUCCESS_UPDATE_USER_IN_FARM_MSG, mappedResult);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(Const.FAIL_UPDATE_USER_IN_FARM_CODE, Const.FAIL_UPDATE_USER_IN_FARM_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> deleteUserInFarm(int farmId, int userId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    Expression<Func<UserFarm, bool>> filter = x => x.UserId == userId && x.FarmId == farmId;
                    //string includeProperties = "Role,Farm,User";
                    var userInfarm = await _unitOfWork.UserFarmRepository.GetByCondition(filter);
                    if (userInfarm == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_USER_OF_FARM_EXIST_CODE, Const.WARNING_GET_USER_OF_FARM_EXIST_MSG);
                    }
                    _unitOfWork.UserFarmRepository.Delete(userInfarm);

                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_USER_IN_FARM_CODE, Const.SUCCESS_DELETE_USER_IN_FARM_MSG, new { success = true });
                    }
                    else return new BusinessResult(Const.FAIL_UPDATE_USER_IN_FARM_CODE, Const.FAIL_UPDATE_USER_IN_FARM_MSG);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> addUserToFarm(UserFarmRequest createRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var checkFarmExist = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == createRequest.FarmId!.Value && x.IsDeleted == false);
                    var checkUserExist = await _unitOfWork.UserRepository.GetByCondition(x => x.UserId == createRequest.UserId && x.IsDeleted == false);
                    var checkRoleExist = await _unitOfWork.RoleRepository.GetByCondition(x => x.RoleName!.ToLower().Equals(RoleEnum.EMPLOYEE.ToString().ToLower()) && x.IsSystem == true);
                    if (checkFarmExist == null || checkUserExist == null || checkRoleExist == null)
                        return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
                    Expression<Func<UserFarm, bool>> filter = x => x.UserId == createRequest.UserId && x.FarmId == createRequest.FarmId;
                    var userInfarm = await _unitOfWork.UserFarmRepository.GetByCondition(filter);
                    if (userInfarm != null)
                    {
                        return new BusinessResult(Const.WARNING_USER_IN_FARM_EXIST_CODE, Const.WARNING_USER_IN_FARM_EXIST_MSG);
                    }
                    var newUserFarm = new UserFarm
                    {
                        UserId = createRequest.UserId,
                        FarmId = createRequest.FarmId!.Value,
                        RoleId = checkRoleExist.RoleId,
                        Status = UserFarmStatusEnum.Active.ToString(),
                        IsActive = true,
                    };
                    var newEmployeeSkill = new EmployeeSkill()
                    {
                        EmployeeID = checkUserExist.UserId,
                        WorkTypeID = createRequest.SkillID,
                        ScoreOfSkill = createRequest.ScoreOfSkill,
                        FarmID = createRequest.FarmId!.Value,
                    };
                    await _unitOfWork.UserFarmRepository.Insert(newUserFarm);
                    await _unitOfWork.EmployeeSkillRepository.Insert(newEmployeeSkill);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_ADD_USER_IN_FARM_CODE, Const.SUCCESS_ADD_USER_IN_FARM_MSG, new { success = true });
                    }
                    else return new BusinessResult(Const.FAIL_ADD_USER_IN_FARM_CODE, Const.FAIL_ADD_USER_IN_FARM_MSG);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getUserFarmById(int farmId, int userId)
        {
            try
            {
                Expression<Func<UserFarm, bool>> filter = x => x.UserId == userId && x.FarmId == farmId;
                string includeProperties = "Role,Farm,User";
                var userInfarm = await _unitOfWork.UserFarmRepository.GetByCondition(filter, includeProperties: includeProperties);
                if (userInfarm == null)
                {
                    return new BusinessResult(Const.WARNING_GET_USER_OF_FARM_EXIST_CODE, Const.WARNING_GET_USER_OF_FARM_EXIST_MSG);
                }

                var mappedResult = _mapper.Map<UserFarmModel>(userInfarm);
                mappedResult.Farm = null!;
                mappedResult.User = null!;
                return new BusinessResult(Const.SUCCESS_GET_USER_OF_FARM_CODE, Const.SUCCESS_GET_USER_OF_FARM_MSG, mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

        public async Task<FarmModel> CheckFarmExist(int farmId)
        {
            var farm = await _unitOfWork.FarmRepository.GetFarmById(farmId);
            // kiem tra null
            if (farm == null)
                return null!;
            // neu khong null return ve mapper
            var result = _mapper.Map<FarmModel>(farm);
            return result;
        }

        public async Task<BusinessResult> ActivateFarm(List<int> FarmIds)
        {
            try
            {
                if (!FarmIds.Any())
                    return new BusinessResult(500, Const.WARNING_OBJECT_REQUEST_EMPTY_MSG);
                var farmExist = await _unitOfWork.FarmRepository.GetAllNoPaging(x => FarmIds.Contains(x.FarmId) && x.IsDeleted == false);
                if (!farmExist.Any())
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                foreach (var farm in farmExist)
                {
                    if (farm.Status.Equals(FarmStatusEnum.Active.ToString(), StringComparison.OrdinalIgnoreCase))
                    {
                        farm.Status = FarmStatusEnum.Inactive.ToString();
                        continue;
                    }
                    if (farm.Status.Equals(FarmStatusEnum.Inactive.ToString(), StringComparison.OrdinalIgnoreCase))
                    {
                        farm.Status = FarmStatusEnum.Active.ToString();
                    }
                }
                _unitOfWork.FarmRepository.UpdateRange(farmExist);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                    return new BusinessResult(Const.SUCCESS_UPDATE_FARM_CODE, $"Activate {farmExist.Count()} farm success");
                return new BusinessResult(Const.FAIL_UPDATE_FARM_CODE, $"Activate {farmExist.Count()} farm fail");
            }
            catch
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);

            }
        }

    }
}
