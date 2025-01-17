﻿using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.ObjectStatus;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class FarmService : IFarmService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;
        public FarmService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<BusinessResult> CreateFarm(FarmCreateModel farmCreateModel)
        {
            try
            {

                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {

                    var farmCreateEntity = new Farm()
                    {
                        FarmName = farmCreateModel.FarmName,
                        Address = farmCreateModel.Address,
                        Area = farmCreateModel.Area,
                        SoilType = farmCreateModel.SoilType,
                        ClimateZone = farmCreateModel.ClimateZone,
                        Province = farmCreateModel.Province,
                        Ward = farmCreateModel.Ward,
                        District = farmCreateModel.District,
                        Length = farmCreateModel.Length,
                        Width = farmCreateModel.Width,
                        Description = farmCreateModel.Description
                    };
                    farmCreateEntity.FarmCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.FARM);
                    farmCreateEntity.Status = FarmStatus.Active.ToString();
                    farmCreateEntity.IsDelete = false;
                    farmCreateEntity.CreateDate = DateTime.Now;
                    farmCreateEntity.UpdateDate = DateTime.Now;
                    if (farmCreateModel.LogoUrl != null)
                    {
                        // gan va push len cloudinary
                        var logoUrlCloudinary = await _cloudinaryService.UploadImageAsync(farmCreateModel.LogoUrl, CloudinaryPath.FARM_LOGO);
                        farmCreateEntity.LogoUrl = logoUrlCloudinary;
                    }

                    if (farmCreateModel.FarmCoordinations?.Any() == true)
                    {
                        foreach (var coordination in farmCreateModel.FarmCoordinations)
                        {
                            var farmCoordination = new FarmCoordination()
                            {
                                Lagtitude = coordination.Lagtitude,
                                Longitude = coordination.Longitude,
                            };
                            farmCreateEntity.FarmCoordinations.Add(farmCoordination);
                        }
                    }
                    // chua co add them UserFarm

                    await _unitOfWork.FarmRepository.Insert(farmCreateEntity);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_CREATE_FARM_CODE, Const.SUCCESS_CREATE_FARM_MSG, farmCreateEntity);
                    }
                    else return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, Const.FAIL_CREATE_FARM_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, Const.FAIL_CREATE_FARM_MSG, ex.Message);
            }
        }

        public async Task<BusinessResult> GetFarmByID(int farmId)
        {
            var farm = await _unitOfWork.FarmRepository.GetFarmById(farmId);
            // kiem tra null
            if (farm == null)
                return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
            // neu khong null return ve mapper
            var result = _mapper.Map<FarmModel>(farm);
            return new BusinessResult(Const.SUCCESS_GET_FARM_CODE, Const.SUCCESS_FARM_GET_MSG, result);
        }

        public async Task<BusinessResult> GetAllFarmOfUser(int userId)
        {
            Expression<Func<UserFarm, bool>> filter = x => x.UserId == userId && x.User.IsDelete != true && x.Farm.IsDelete != true;
            string includeProperties = "Farm";
            var userFarm = await _unitOfWork.UserFarmRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties);
            if (!userFarm.Any())
                return new BusinessResult(Const.SUCCESS_GET_ALL_FARM_OF_USER_CODE, Const.SUCCESS_GET_ALL_FARM_OF_USER_EMPTY_MSG);
            var result = _mapper.Map<List<UserFarmModel>>(userFarm);
            return new BusinessResult(Const.SUCCESS_GET_ALL_FARM_OF_USER_CODE, Const.SUCCESS_GET_ALL_FARM_OF_USER_FOUND_MSG, result);
        }


        public async Task<BusinessResult> GetAllFarmPagination(PaginationParameter paginationParameter)
        {
            try
            {
                Expression<Func<Farm, bool>> filter = null!;
                Func<IQueryable<Farm>, IOrderedQueryable<Farm>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {


                    filter = x => (x.FarmName.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Address.ToLower().Contains(paginationParameter.Search.ToLower()) && x.IsDelete != true);
                }

                switch (paginationParameter.SortBy)
                {
                    case "farmId":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.FarmId)
                                   : x => x.OrderBy(x => x.FarmId)) : x => x.OrderBy(x => x.FarmId);
                        break;
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
                    case "CreateDate":
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
                    case "Status":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.Status)
                                   : x => x.OrderBy(x => x.Status)) : x => x.OrderBy(x => x.Status);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.FarmId);
                        break;
                }
                var entities = await _unitOfWork.FarmRepository.Get(filter, orderBy, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<FarmModel>();
                pagin.List = _mapper.Map<IEnumerable<FarmModel>>(entities).ToList();
                Expression<Func<Farm, bool>> filterCount = x => x.IsDelete != true;
                pagin.TotalRecord = await _unitOfWork.FarmRepository.Count(filter: filterCount);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_FARM_ALL_PAGINATION_CODE, Const.SUCCESS_GET_FARM_ALL_PAGINATION_FARM_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_ALL_FARM_DOES_NOT_EXIST_CODE, Const.WARNING_GET_ALL_FARM_DOES_NOT_EXIST_MSG, pagin);
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
                    string includeProperties = "FarmCoordinations,UserFarms,LandPlots,Orders,Processes"; // chua co bang user farm nen chua xoa
                    // set up them trong context moi xoa dc tat ca 1 lan
                    var farm = await _unitOfWork.FarmRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                    // xoa anh tren cloudinary
                    if (!string.IsNullOrEmpty(farm.LogoUrl))
                    {
                        _cloudinaryService.DeleteImageByUrlAsync(farm.LogoUrl);
                    }
                    if (farm == null) return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

                    _unitOfWork.FarmRepository.Delete(farm);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_UPDATE_FARM_CODE, Const.SUCCESS_UPDATE_FARM_MSG, new { success = true });
                    }
                    else return new BusinessResult(Const.FAIL_UPDATE_FARM_CODE, Const.FAIL_UPDATE_FARM_MSG);
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
                    Expression<Func<Farm, bool>> condition = x => x.FarmId == farmId && x.IsDelete != true;
                    var farm = await _unitOfWork.FarmRepository.GetByCondition(condition);

                    if (farm == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    }
                    farm.IsDelete = true;
                    _unitOfWork.FarmRepository.Update(farm);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_SOFTED_FARM_CODE, Const.SUCCESS_DELETE_SOFTED_FARM_MSG, farm);
                    }
                    else return new BusinessResult(Const.SUCCESS_DELETE_SOFTED_FARM_CODE, Const.SUCCESS_DELETE_SOFTED_FARM_MSG, new { success = false });
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateFarmInfo(FarmUpdateModel farmUpdateModel)
        {
            try
            {

                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<Farm, bool>> condition = x => x.FarmId == farmUpdateModel.FarmId && x.IsDelete != true;
                    var farmEntityUpdate = await _unitOfWork.FarmRepository.GetByCondition(condition);

                    if (farmEntityUpdate == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    }
                    // Lấy danh sách thuộc tính từ model
                    foreach (var prop in typeof(FarmUpdateModel).GetProperties())
                    {
                        var newValue = prop.GetValue(farmUpdateModel);
                        if (newValue != null && !string.IsNullOrEmpty(newValue.ToString()))
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
                        return new BusinessResult(Const.SUCCESS_UPDATE_FARM_CODE, Const.SUCCESS_UPDATE_FARM_MSG, farmEntityUpdate);
                    }
                    else return new BusinessResult(Const.FAIL_UPDATE_FARM_CODE, Const.FAIL_UPDATE_FARM_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateFarmLogo(int farmId, IFormFile logoFile)
        {
            var farm = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == farmId);
            if (farm == null)
            {
                return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
            }
            var result = await _cloudinaryService.UpdateImageAsync(file: logoFile, farm.LogoUrl);
            if (result)
            {
                return new BusinessResult(Const.SUCCESS_UPDATE_FARM_LOGO_CODE, Const.SUCCESS_UPDATE_FARM_LOGO_MSG, farm);
            }
            else return new BusinessResult(Const.FAIL_UPDATE_FARM_LOGO_CODE, Const.FAIL_UPDATE_FARM_LOGO_MSG);

        }


        public async Task<BusinessResult> UpdateFarmCoordination(int farmId, List<FarmCoordinationCreateModel> updatedCoordinationsList)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                // Lấy các tọa độ hiện tại
                Expression<Func<FarmCoordination, bool>> condition = x => x.FarmId == farmId && x.Farm.IsDelete != true;
                var existingCoordinationList = await _unitOfWork.FarmCoordinationRepository.GetAllNoPaging(condition);

                // Chuyển đổi danh sách thành HashSet để so sánh
                var existingCoordinates = existingCoordinationList
                    .Select(x => new { Lat = x.Lagtitude ?? 0, Lng = x.Longitude ?? 0 }) // Ép kiểu tránh null
                    .ToHashSet();

                var newCoordinates = updatedCoordinationsList
                    .Select(x => new { Lat = x.Lagtitude, Lng = x.Longitude }) // Đổi tên key tránh lỗi trùng
                    .ToHashSet();

                // Tìm các điểm bị xóa (có trong danh sách cũ nhưng không có trong danh sách mới)
                var coordinatesToDelete = existingCoordinationList
                    .Where(x => !newCoordinates.Contains(new { Lat = x.Lagtitude!.Value, Lng = x.Longitude!.Value }))
                    .ToList();

                // Tìm các điểm cần thêm mới (có trong danh sách mới nhưng không có trong danh sách cũ)
                var coordinatesToAdd = updatedCoordinationsList
                    .Where(x => !existingCoordinates.Contains(new { Lat = x.Lagtitude, Lng = x.Longitude }))
                    .Select(x => new FarmCoordination
                    {
                        FarmId = farmId,
                        Lagtitude = x.Lagtitude,
                        Longitude = x.Longitude
                    })
                    .ToList();

                // Xóa các điểm không còn tồn tại
                if (coordinatesToDelete.Any())
                {
                    _unitOfWork.FarmCoordinationRepository.RemoveRange(coordinatesToDelete); // Sửa DeleteRange
                }

                // Thêm các điểm mới
                if (coordinatesToAdd.Any())
                {
                    await _unitOfWork.FarmCoordinationRepository.InsertRangeAsync(coordinatesToAdd); // Sửa InsertRangeAsync
                }

                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    await transaction.CommitAsync();
                    var resultSave = await _unitOfWork.FarmCoordinationRepository.GetAllNoPaging(x => x.FarmId == farmId);
                    return new BusinessResult(Const.SUCCESS_UPDATE_FARM_COORDINATION_CODE, Const.SUCCESS_UPDATE_FARM_COORDINATION_MSG, resultSave);
                }
                else
                {
                    return new BusinessResult(Const.FAIL_UPDATE_FARM_COORDINATION_CODE, Const.FAIL_UPDATE_FARM_COORDINATION_MSG);
                }
            }
        }
    }
}
