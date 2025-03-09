using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.GrowthStageModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Management;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlantService : IPlantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IExcelReaderService _excelReaderService;
        private readonly IFarmService _farmService;
        private readonly IGrowthStageService _growthStageService;
        public PlantService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService, IExcelReaderService excelReaderService, IFarmService farmService, IGrowthStageService growthStageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _excelReaderService = excelReaderService;
            _farmService = farmService;
            this._growthStageService = growthStageService;
        }

        public async Task<BusinessResult> createPlant(PlantCreateRequest plantCreateRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {

                    // kiem tra cac request
                    var growthStage = await _growthStageService
                           .GetGrowthStageIdByPlantingDate(farmId: plantCreateRequest.FarmId.Value, plantingDate: plantCreateRequest.PlantingDate);
                    if (growthStage == null)
                    {
                        return new BusinessResult(Const.WARNING_PLANT_GROWTH_NOT_EXIST_CODE, "Can not find any growth stage suitable with plant");
                    }
                    var masterType = await _unitOfWork.MasterTypeRepository
                        .GetByCondition(x => x.MasterTypeId == plantCreateRequest.MasterTypeId && x.IsDelete == false && x.IsActive == true);
                    if (masterType == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);
                    }


                    // Create the new Plant entity from the request
                    string code = CodeHelper.GenerateCode();
                    var plantCreateEntity = new Plant()
                    {
                        PlantCode = $"{CodeAliasEntityConst.PLANT}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}-PL{plantCreateRequest.PlantingDate.ToString("ddMMyy")}",
                        PlantName = $"Plant {code}",
                        PlantIndex = plantCreateRequest.PlantIndex,
                        GrowthStageID = growthStage.GrowthStageId,
                        HealthStatus = plantCreateRequest.HealthStatus,
                        PlantingDate = plantCreateRequest.PlantingDate,
                        PlantReferenceId = plantCreateRequest.MotherPlantId,
                        Description = plantCreateRequest.Description,
                        MasterTypeId = plantCreateRequest.MasterTypeId,
                        LandRowId = plantCreateRequest.LandRowId,
                        FarmId = plantCreateRequest.FarmId,
                        IsDeleted = false,
                    };

                    if (plantCreateRequest.MotherPlantId.HasValue)
                    {
                        var plantReference = await getById(plantCreateRequest.MotherPlantId.Value);
                        if (plantReference.StatusCode != 200 || plantReference.Data == null)
                            return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, "Mother plant not exist in data");
                        var jsonData = plantReference.Data as PlantModel;

                        plantCreateEntity.PlantReferenceId = jsonData!.PlantId;
                        //plantCreateEntity.PlantCode += $"-{Util.SplitByDash(jsonData.PlantCode!).First()}";
                    }
                    if (plantCreateRequest.LandRowId.HasValue && plantCreateRequest.PlantIndex.HasValue)
                    {
                        var landrowExist = await _unitOfWork.LandRowRepository.GetByCondition(x => x.LandRowId == plantCreateRequest.LandRowId, "Plants,LandPlot");
                        if (landrowExist == null)
                            return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);
                        if (landrowExist.Plants.Count >= landrowExist.TreeAmount)
                            return new BusinessResult(Const.WARNING_PLANT_IN_LANDROW_FULL_CODE, Const.WARNING_PLANT_IN_LANDROW_FULL_MSG);
                        if (landrowExist.Plants.Any(x => x.PlantIndex == plantCreateRequest.PlantIndex && x.IsDead == false && x.IsDeleted == false))
                            return new BusinessResult(400, $"Index {plantCreateRequest.PlantIndex} in row has exist plant");
                        //plantCreateEntity.PlantCode += $"{Util.SplitByDash(landrowExist.LandRowCode!).First()}{CodeAliasEntityConst.LANDROW}{landrowExist.RowIndex}-";
                        plantCreateEntity.PlantName = $"Plant {plantCreateRequest.PlantIndex} - {landrowExist.RowIndex} - {landrowExist.LandPlot!.LandPlotName}";
                    }
                    else
                    {
                        plantCreateEntity.PlantName = $"Plant {code}";
                    }

                    // Upload image to Cloudinary if needed
                    if (plantCreateRequest.ImageUrl != null)
                    {
                        var imageUrlCloudinary = await _cloudinaryService.UploadImageAsync(plantCreateRequest.ImageUrl!, CloudinaryPath.PLANT_IMAGE);
                        plantCreateEntity.ImageUrl = imageUrlCloudinary;
                    }

                    // Insert the new plant entity into the repository
                    await _unitOfWork.PlantRepository.Insert(plantCreateEntity);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapResult = _mapper.Map<PlantModel>(plantCreateEntity);
                        return new BusinessResult(Const.SUCCESS_CREATE_PLANT_CODE, Const.SUCCESS_CREATE_PLANT_MSG, mapResult);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_PLANT_CODE, Const.FAIL_CREATE_PLANT_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_CREATE_PLANT_CODE, Const.FAIL_CREATE_PLANT_MSG, ex.Message);
            }
        }

        public async Task<BusinessResult> deleteMultiplePlant(List<int> ids)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<Plant, bool>> filter = x => ids.Contains(x.PlantId);
                    //string includeProperties = "Plans"
                    var plants = await _unitOfWork.PlantRepository.GetAllNoPaging(filter);

                    if (plants == null || !plants.Any())
                    {
                        return new BusinessResult(Const.WARNING_GET_PLANTS_NOT_EXIST_CODE, Const.WARNING_GET_PLANTS_NOT_EXIST_MSG);
                    }

                    // Delete images associated with each plant
                    foreach (var plant in plants)
                    {
                        if (!string.IsNullOrEmpty(plant.ImageUrl))
                        {
                            await _cloudinaryService.DeleteImageByUrlAsync(plant.ImageUrl);
                        }
                    }

                    // Delete the plant entities
                    foreach (var plant in plants)
                    {
                        _unitOfWork.PlantRepository.Delete(plant);
                    }

                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_MULTIPLE_PLANT_CODE, Const.SUCCESS_DELETE_MULTIPLE_PLANTS_MSG, new { success = true });
                    }
                    return new BusinessResult(Const.FAIL_DELETE_PLANT_CODE, Const.FAIL_DELETE_PLANT_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> deletePlant(int plantId)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    // Filter to find the plant by its ID
                    Expression<Func<Plant, bool>> filter = x => x.PlantId == plantId;
                    var plant = await _unitOfWork.PlantRepository.GetByCondition(filter);

                    if (plant == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                    }

                    // If the plant has an image associated, delete it from Cloudinary or another storage service
                    if (!string.IsNullOrEmpty(plant.ImageUrl))
                    {
                        await _cloudinaryService.DeleteImageByUrlAsync(plant.ImageUrl);
                    }

                    // Delete the plant entity
                    _unitOfWork.PlantRepository.Delete(plant);
                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PLANT_CODE, Const.SUCCESS_DELETE_PLANT_MSG, new { success = true });
                    }
                    return new BusinessResult(Const.FAIL_DELETE_PLANT_CODE, Const.FAIL_DELETE_PLANT_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //public async Task<BusinessResult> getAllPlantOfFarm(int farmId, PaginationParameter paginationParameter)
        //{
        //    try
        //    {
        //        var entities = await _unitOfWork.PlantRepository.GetPlantsInFarmPagin(farmId: farmId, search: paginationParameter.Search, sortBy: paginationParameter.SortBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize, direction: paginationParameter.Direction);
        //        var pagin = new PageEntity<PlantModel>
        //        {
        //            List = _mapper.Map<IEnumerable<PlantModel>>(entities).ToList(),
        //            TotalRecord = await _unitOfWork.PlantRepository.Count(x => x.LandRow != null && x.LandRow.LandPlot!.FarmId == farmId),
        //        };
        //        pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);

        //        if (pagin.List.Any())
        //        {
        //            return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_FARM_PAGINATION_CODE, Const.SUCCESS_GET_PLANT_IN_FARM_PAGINATION_MSG, pagin);
        //        }
        //        else
        //        {
        //            return new BusinessResult(Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_CODE, Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_MSG, pagin);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //    }
        //}


        //public async Task<BusinessResult> getAllPlantOfPlot(int landplotId, PaginationParameter paginationParameter)
        //{
        //    try
        //    {
        //        var entities = await _unitOfWork.PlantRepository.GetPlantsInPlotPagin(landPlotId: landplotId, search: paginationParameter.Search, sortBy: paginationParameter.SortBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize, direction: paginationParameter.Direction);
        //        var pagin = new PageEntity<PlantModel>
        //        {
        //            List = _mapper.Map<IEnumerable<PlantModel>>(entities).ToList(),
        //            TotalRecord = await _unitOfWork.PlantRepository.Count(x => x.LandRow != null && x.LandRow.LandPlotId == landplotId),
        //        };
        //        pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);

        //        if (pagin.List.Any())
        //        {
        //            return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_CODE, Const.SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_MSG, pagin);
        //        }
        //        else
        //        {
        //            return new BusinessResult(Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_CODE, Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_MSG, pagin);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
        //    }
        //}

        public async Task<BusinessResult> getPlantPagin(GetPlantPaginRequest request, PaginationParameter paginationParameter)
        {
            try
            {
                var checkParam = checkParamGetRequest(request);
                if (checkParam.Success == false)
                    return new BusinessResult(400, checkParam.ErorrMessage);
                Expression<Func<Plant, bool>> filter = x => x.IsDeleted == false && x.FarmId == request.farmId;
                Func<IQueryable<Plant>, IOrderedQueryable<Plant>> orderBy = x => x.OrderByDescending(od => od.LandRowId).ThenByDescending(x => x.PlantId);
                if (request.IsDead.HasValue)
                {
                    filter = filter.And(x => x.IsDead == request.IsDead);
                }
                if (!string.IsNullOrEmpty(request.LandPlotIds))
                {
                    List<string> filterList = Util.SplitByComma(request.LandPlotIds!);
                    filter = filter.And(x => filterList.Contains(x.LandRow!.LandPlotId.ToString()!));
                }
                if (!string.IsNullOrEmpty(request.LandRowIds))
                {
                    List<string> filterList = Util.SplitByComma(request.LandRowIds);
                    filter = filter.And(x => filterList.Contains(x.LandRowId.ToString()!));
                    //filter = filter.And(x => request.LandRowIds!.Contains(x.LandRowId!.Value));
                }
                if (string.IsNullOrEmpty(request.LandPlotIds) && string.IsNullOrEmpty(request.LandRowIds) && request.IsLocated.HasValue && request.IsLocated == false)
                    filter = filter.And(x => !x.LandRowId.HasValue);
                //if (!string.IsNullOrEmpty(request.LandPlotIds) || !string.IsNullOrEmpty(request.LandRowIds!) && request.IsLocated.HasValue && request.IsLocated == true)
                    if ( request.IsLocated.HasValue && request.IsLocated == true)
                        filter = filter.And(x => x.LandRowId.HasValue);

                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    filter = filter.And(x => x.PlantCode!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Description!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.PlantName!.ToLower().Contains(paginationParameter.Search.ToLower()));
                }
                if (!string.IsNullOrEmpty(request.HealthStatus))
                {
                    List<string> filterList = Util.SplitByComma(request.HealthStatus);
                    filter = filter.And(x => filterList.Contains(x.HealthStatus!.ToLower()));
                }

                if (!string.IsNullOrEmpty(request.CultivarIds))
                {
                    List<string> filterList = Util.SplitByComma(request.CultivarIds);
                    filter = filter.And(x => filterList.Contains(x.MasterTypeId.ToString()!));
                    //filter = filter.And(x => request.CultivarIds.Contains(x.MasterTypeId!.Value));
                }
                if (!string.IsNullOrEmpty(request.GrowthStageIds))
                {
                    List<string> filterList = Util.SplitByComma(request.GrowthStageIds!);
                    filter = filter.And(x => filterList.Contains(x.GrowthStageID!.ToString()!));
                    //filter = filter.And(x => request.GrowthStageIds.Contains(x.GrowthStageID!.Value));
                }
                if (request.RowIndexFrom.HasValue && request.RowIndexTo.HasValue)
                {
                    filter = filter.And(x => x.LandRow!.RowIndex >= request.RowIndexFrom && x.LandRow.RowIndex <= request.RowIndexTo);
                }

                if (request.PlantIndexFrom.HasValue && request.PlantIndexTo.HasValue)
                {
                    filter = filter.And(x => x.PlantIndex >= request.PlantIndexFrom && x.PlantIndex <= request.PlantIndexTo);
                }
                if (request.PlantingDateFrom.HasValue && request.PlantingDateTo.HasValue)
                {
                    filter = filter.And(x => x.PlantingDate >= request.PlantingDateFrom && x.PlantingDate <= request.PlantingDateTo);
                }

                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "plantcode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantCode)
                                   : x => x.OrderBy(x => x.PlantCode)) : x => x.OrderBy(x => x.PlantCode);
                        break;
                    case "plantname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.HealthStatus!).ThenByDescending(x => x.PlantId)
                                   : x => x.OrderBy(x => x.PlantName).ThenBy(x => x.PlantId)) : x => x.OrderBy(x => x.PlantName).ThenBy(x => x.PlantId);
                        break;
                    case "plantindex":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantIndex).ThenByDescending(x => x.LandRowId)
                                   : x => x.OrderBy(x => x.PlantIndex).ThenBy(x => x.LandRowId)) : x => x.OrderBy(x => x.PlantIndex).ThenBy(x => x.LandRowId);
                        break;
                    case "plantingdate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantingDate).ThenByDescending(x => x.PlantId)
                                   : x => x.OrderBy(x => x.PlantingDate).ThenBy(x => x.PlantId)) : x => x.OrderBy(x => x.PlantingDate).ThenBy(x => x.PlantId);
                        break;
                    case "plantreferenceid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantReferenceId).ThenByDescending(x => x.PlantId)
                                   : x => x.OrderBy(x => x.PlantReferenceId).ThenBy(x => x.PlantId)) : x => x.OrderBy(x => x.PlantReferenceId).ThenBy(x => x.PlantId);
                        break;
                    case "mastertypeid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.MasterTypeId).ThenByDescending(x => x.PlantId)
                                   : x => x.OrderBy(x => x.MasterTypeId).ThenBy(x => x.PlantId)) : x => x.OrderBy(x => x.MasterTypeId).ThenBy(x => x.PlantId);
                        break;
                    case "landrowid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.LandRowId).ThenByDescending(x => x.PlantId)
                                   : x => x.OrderBy(x => x.LandRowId).ThenBy(x => x.PlantId)) : x => x.OrderBy(x => x.LandRowId).ThenBy(x => x.PlantId);
                        break;
                    case "growthstageid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.GrowthStageID).ThenByDescending(x => x.PlantId)
                                   : x => x.OrderBy(x => x.GrowthStageID).ThenBy(x => x.PlantId)) : x => x.OrderBy(x => x.GrowthStageID).ThenBy(x => x.PlantId);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.PlantId);
                        break;
                }
                string includeProperties = "LandRow,PlantReference";
                var entities = await _unitOfWork.PlantRepository.Get(filter: filter, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);
                var pagin = new PageEntity<PlantModel>();
                pagin.List = _mapper.Map<IEnumerable<PlantModel>>(entities).ToList();
                //Expression<Func<Farm, bool>> filterCount = x => x.IsDeleted != true;
                pagin.TotalRecord = await _unitOfWork.PlantRepository.Count(filter: filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(200, "Get plant pagin success", pagin);
                }
                else
                {
                    return new BusinessResult(200, "No record was found", pagin);
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getById(int plantId)
        {
            try
            {
                //Expression<Func<Plant, bool>> filter = x => x.PlantId == plantId!;
                //string includeProperties = "Plans,MasterType,LandRow";
                var plant = await _unitOfWork.PlantRepository.getById(plantId);
                if (plant == null)
                    return new BusinessResult(Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_CODE, Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_MSG);
                var mapResult = _mapper.Map<PlantModel>(plant);
                return new BusinessResult(Const.SUCCESS_GET_PLANT_BY_ID_PAGINATION_CODE, Const.SUCCESS_GET_PLANT_BY_ID_PAGINATION_MSG, mapResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> updatePlant(PlantUpdateRequest plantUpdateRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    // Find the plant entity by the PlantId (or an appropriate unique identifier)
                    Expression<Func<Plant, bool>> condition = x => x.PlantId == plantUpdateRequest.PlantId && x.IsDeleted != true;
                    var plantEntityUpdate = await _unitOfWork.PlantRepository.GetByCondition(condition);

                    if (plantEntityUpdate == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                    }
                    if (plantUpdateRequest.PlantReferenceId.HasValue && plantUpdateRequest.PlantReferenceId != 0)
                    {
                        // check plantReferceId la chinh no
                        if (plantEntityUpdate.PlantId == plantUpdateRequest.PlantReferenceId)
                            return new BusinessResult(400, "Can not choose Mother plant by it seft");
                        // check plantRefernce Exist;
                        var checkPlantReferce = await _unitOfWork.PlantRepository.GetByCondition(x => x.PlantId == plantUpdateRequest.PlantReferenceId);
                        if (plantEntityUpdate == null)
                            return new BusinessResult(400, "Mother Plant not exist");
                        plantEntityUpdate.PlantReferenceId = plantUpdateRequest.PlantReferenceId;
                    }

                    // check hang da du cho chưa
                    if (plantUpdateRequest.LandRowId.HasValue && plantUpdateRequest.LandRowId.Value != 0)
                    {
                        var landrowExist = await _unitOfWork.LandRowRepository.GetByCondition(x => x.LandRowId == plantUpdateRequest.LandRowId, "Plants,LandPlot");
                        if (landrowExist == null)
                            return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);
                        if (landrowExist.Plants.Count >= landrowExist.TreeAmount)
                            return new BusinessResult(Const.WARNING_PLANT_IN_LANDROW_FULL_CODE, Const.WARNING_PLANT_IN_LANDROW_FULL_MSG);
                        // check trung index trong row
                        if (landrowExist.Plants.Any(x => x.PlantIndex == plantUpdateRequest.PlantIndex && x.IsDeleted != true))
                            return new BusinessResult(400, "Index has have a plant");
                        // cap nhat lai code cua 
                        plantEntityUpdate.PlantName = $"Plant {plantUpdateRequest.PlantIndex} - {landrowExist.RowIndex} - {landrowExist.LandPlot!.LandPlotName}";
                        plantEntityUpdate.LandRowId = plantUpdateRequest.LandRowId;
                        plantEntityUpdate.PlantIndex = plantUpdateRequest.PlantIndex;
                    }

                    // check Growstage eixst
                    if (plantUpdateRequest.GrowthStageId.HasValue && plantUpdateRequest.GrowthStageId != 0)
                    {
                        var checkGrowStageExist = await _unitOfWork.GrowthStageRepository.GetByCondition(x => x.GrowthStageID == plantUpdateRequest.GrowthStageId && x.isDeleted != true);
                        if (checkGrowStageExist == null)
                            return new BusinessResult(Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG);
                        plantEntityUpdate.GrowthStageID = checkGrowStageExist.GrowthStageID;
                    }
                    // mapping 
                    // Kiểm tra và cập nhật các giá trị khác
                    if (!string.IsNullOrEmpty(plantUpdateRequest.PlantName) && plantEntityUpdate.PlantName != plantUpdateRequest.PlantName)
                        plantEntityUpdate.PlantName = plantUpdateRequest.PlantName;

                    if (!string.IsNullOrEmpty(plantUpdateRequest.HealthStatus) && plantEntityUpdate.HealthStatus != plantUpdateRequest.HealthStatus)
                        plantEntityUpdate.HealthStatus = plantUpdateRequest.HealthStatus;

                    if (plantUpdateRequest.PlantingDate.HasValue && plantEntityUpdate.PlantingDate != plantUpdateRequest.PlantingDate)
                        plantEntityUpdate.PlantingDate = plantUpdateRequest.PlantingDate;

                    if (!string.IsNullOrEmpty(plantUpdateRequest.Description) && plantEntityUpdate.Description != plantUpdateRequest.Description)
                        plantEntityUpdate.Description = plantUpdateRequest.Description;

                    if (plantUpdateRequest.MasterTypeId.HasValue && plantUpdateRequest.MasterTypeId != 0)
                    {
                        var checkMasterTypeExist = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.MasterTypeId == plantUpdateRequest.MasterTypeId && x.IsDelete != true);
                        if (checkMasterTypeExist == null)
                            return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);
                        plantEntityUpdate.MasterTypeId = plantUpdateRequest.MasterTypeId;
                    }

                    // Update the plant entity in the repository
                    _unitOfWork.PlantRepository.Update(plantEntityUpdate);

                    // Save the changes
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapResult = _mapper.Map<PlantModel>(plantEntityUpdate);
                        return new BusinessResult(Const.SUCCESS_UPDATE_PLANT_CODE, Const.SUCCESS_UPDATE_PLANT_MSG, mapResult);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_PLANT_CODE, Const.FAIL_UPDATE_PLANT_MSG);
                    }
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ImportPlantAsync(ImportExcelRequest request)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var checkFarmExist = await _farmService.GetFarmByID(request.FarmId!.Value);
                    if (checkFarmExist.Data == null)
                        return checkFarmExist;
                    List<PlantCSVImportRequest> plantCsvList = await _excelReaderService.ReadCsvFileAsync<PlantCSVImportRequest>(request.fileExcel);
                    if (!plantCsvList.Any())
                        return new BusinessResult(400, "File excel is empty. Please try again!");
                    bool fileHasError = false;
                    // 1. Kiểm tra trùng lặp trong file
                    var (duplicateErrors, validPlants) = await _excelReaderService.FindDuplicatesInFileAsync(plantCsvList);
                    string errorList = "";
                    if (duplicateErrors.Any())
                    {
                        if (!request.skipDuplicate)
                        {
                            // Nếu không bỏ qua trùng lặp, báo lỗi luôn
                            errorList = string.Join("\n", duplicateErrors.Select(error =>
                                $"Row {string.Join(" and ", error.RowIndexes)} is duplicate."
                            ));
                            return new BusinessResult(Const.WARNING_IMPORT_PLANT_DUPLICATE_CODE, errorList, duplicateErrors);
                        }
                        else
                        {
                            // Nếu bỏ qua trùng lặp, chỉ lấy các hàng hợp lệ
                            validPlants = validPlants.Where(p => !duplicateErrors.Any(e => e.DuplicateItems.Contains(p))).ToList();
                        }
                    }


                    var plantList = new List<Plant>();
                    // 3. Lấy thông tin ID từ database
                    foreach (var plant in validPlants)
                    {
                        var landRow = await _unitOfWork.LandRowRepository
                            .GetByCondition(x => x.LandRowCode == plant.LandRowCode, "Plants");
                        if (landRow == null)
                        {
                            fileHasError = true;
                            errorList = errorList + "\n" + $"Row {plant.NumberOrder}: LandRowCode not exist.";
                        }
                        else
                        {
                            if (landRow.TreeAmount <= landRow.Plants.Count())
                            {
                                fileHasError = true;
                                errorList = errorList + "\n" + $"Row {plant.NumberOrder}: Row is full of plants.";
                            }
                            if (landRow.Plants.Any(x => x.PlantIndex == plant.PlantIndex))
                            {
                                fileHasError = true;
                                errorList = errorList + "\n" + $"Row {plant.NumberOrder}: Index {plant.PlantIndex} of row {plant.LandRowCode} has exist";
                            }
                        }

                        var growthStage = await _unitOfWork.GrowthStageRepository
                            .GetByCondition(x => x.GrowthStageCode == plant.GrowthStageCode);
                        if (growthStage == null)
                        {
                            fileHasError = true;
                            errorList = errorList + "\n" + $"Row {plant.NumberOrder}: GrowthStageCode not exist.";
                        }

                        var masterType = await _unitOfWork.MasterTypeRepository
                            .GetByCondition(x => x.MasterTypeCode == plant.MasterTypeCode);
                        if (masterType == null)
                        {
                            fileHasError = true;
                            errorList = errorList + "\n" + $"Row {plant.NumberOrder}: MasterTypeCode not exist.";
                        }

                        var referencePlant = await _unitOfWork.PlantRepository
                            .GetByCondition(x => x.PlantCode == plant.PlantReferenceCode) ?? null;
                        if (referencePlant == null && !string.IsNullOrEmpty(plant.PlantReferenceCode))
                        {
                            fileHasError = true;
                            errorList = errorList + "\n" + $"Row {plant.NumberOrder}: Mother plant code not exist.";
                        }
                        if (landRow != null && growthStage != null && masterType != null)
                        {
                            var newPlant = new Plant
                            {
                                PlantName = plant.PlantName,
                                PlantIndex = plant.PlantIndex,
                                HealthStatus = plant.HealthStatus,
                                PlantingDate = plant.PlantingDate,
                                Description = plant.Description,
                                CreateDate = DateTime.Now,
                                GrowthStageID = growthStage!.GrowthStageID,
                                PlantReferenceId = referencePlant != null ? referencePlant.PlantId : null,
                                LandRowId = landRow!.LandRowId,
                                MasterTypeId = masterType!.MasterTypeId,
                                IsDeleted = false,
                                FarmId = 1,
                            };
                            //newPlant.GrowthStageID = growthStage?.GrowthStageID;
                            //newPlant.MasterTypeId = masterType?.MasterTypeId;
                            //newPlant.LandRowId = landRow?.LandRowId;
                            //newPlant.PlantReferenceId = referencePlant?.PlantReferenceId;
                            plantList.Add(newPlant);
                        }
                    }

                    if (fileHasError)
                    {
                        return new BusinessResult(Const.FAIL_IMPORT_PLANT_CODE, errorList);
                    }
                    // 4. Thêm vào database
                    //foreach (var plant in validPlants)
                    //{
                    await _unitOfWork.PlantRepository.InsertRangeAsync(plantList);
                    //}

                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_IMPORT_PLANT_CODE, $"Import {result} plant from excel succes");
                    }

                    return new BusinessResult(Const.FAIL_IMPORT_PLANT_CODE, "Save to data fail");
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_IMPORT_PLANT_CODE, "Error when inport", ex.Message);
            }
        }


        public async Task<BusinessResult> getPlantInPlotForSelected(int landPlotId)
        {
            try
            {
                Expression<Func<Plant, bool>> filter = x => x.LandRow!.LandPlotId == landPlotId && x.IsDead == false && x.IsDeleted == false;
                Func<IQueryable<Plant>, IOrderedQueryable<Plant>> orderBy = x => x.OrderByDescending(x => x.PlantId);
                var plantInPlot = await _unitOfWork.PlantRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
                if (!plantInPlot.Any())
                    return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_CODE, Const.WARNING_GET_PLANTS_NOT_EXIST_MSG);
                var mapReturn = _mapper.Map<IEnumerable<ForSelectedModels>>(plantInPlot);
                return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_SUCCESS_MSG, mapReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getPlantInRowForSelected(int rowId)
        {
            try
            {
                Expression<Func<Plant, bool>> filter = x => x.LandRowId == rowId && x.IsDead == false && x.IsDeleted == false;
                Func<IQueryable<Plant>, IOrderedQueryable<Plant>> orderBy = x => x.OrderByDescending(x => x.PlantId);
                var plantInPlot = await _unitOfWork.PlantRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
                if (!plantInPlot.Any())
                    return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_CODE, Const.WARNING_GET_PLANTS_NOT_EXIST_MSG);
                var mapReturn = _mapper.Map<IEnumerable<ForSelectedModels>>(plantInPlot);
                return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_SUCCESS_MSG, mapReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private (bool Success, string ErorrMessage) checkParamGetRequest(GetPlantPaginRequest request)
        {
            //if (!request.farmId.HasValue && !request.LandPlotId.HasValue && !request.LandRowId.HasValue)
            //    return (false, "No destination to get plant");
            if (request.RowIndexFrom.HasValue && request.RowIndexTo.HasValue && request.RowIndexFrom.Value > request.RowIndexTo)
                return (false, "Row index 'From' must smaller or equal than Row index 'To' ");
            if (request.PlantIndexFrom.HasValue && request.PlantIndexTo.HasValue && request.PlantIndexFrom.Value > request.PlantIndexTo.Value)
                return (false, "Plant index 'From' in row must smaller or equal than plant index 'To' ");
            if (request.PlantingDateFrom.HasValue && request.PlantingDateTo.HasValue && request.PlantingDateFrom.Value > request.PlantingDateTo.Value)
                return (false, "Planting date 'From' must smaller or equal than planting date 'To' ");
            return (true, null!);
        }

        public async Task<BusinessResult> SoftedMultipleDelete(List<int> plantIdList)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    //if (string.IsNullOrEmpty(plantIds))
                    //    return new BusinessResult(400, "No plant Id to delete");
                    //List<string> plantIdList = Util.SplitByComma(plantIds);
                    //foreach (var MasterTypeId in plantIdList)
                    //{
                    Expression<Func<Plant, bool>> filter = x => plantIdList.Contains(x.PlantId) && x.IsDeleted == false;
                    var plantsExistGet = await _unitOfWork.PlantRepository.GetAllForDelete(filter: filter);
                    foreach (var item in plantsExistGet)
                    {
                        item.IsDeleted = true;
                        _unitOfWork.PlantRepository.Update(item);
                        //_unitOfWork.PlantRepository.Update(item);
                    }
                    //}
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_MASTER_TYPE_CODE, $"Delete {result.ToString()} plant success", result > 0);
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_DELETE_PLANT_CODE, Const.FAIL_DELETE_PLANT_MSG, new { success = false });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getPlantNotYetPlanting(int farmId)
        {
            try
            {
                var checkFarmExixt = await _farmService.CheckFarmExist(farmId);
                if (checkFarmExixt == null)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                Expression<Func<Plant, bool>> filter = x => x.FarmId == farmId && !x.LandRowId.HasValue && x.IsDeleted == false;
                Func<IQueryable<Plant>, IOrderedQueryable<Plant>> orderBy = x => x.OrderByDescending(x => x.PlantId);
                var plantInPlot = await _unitOfWork.PlantRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
                if (!plantInPlot.Any())
                    return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_CODE, Const.WARNING_GET_PLANTS_NOT_EXIST_MSG);
                var mapReturn = _mapper.Map<IEnumerable<PlantModel>>(plantInPlot);
                return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_FARM_PAGINATION_CODE, "Get plant not yet planting success", mapReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
        public async Task<BusinessResult> getPlantByGrowthActiveFunc(int farmId, string activeFunction)
        {
            try
            {
                var checkFarmExixt = await _farmService.CheckFarmExist(farmId);
                if (checkFarmExixt == null)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                var invalidFunctions = _growthStageService.ValidateActiveFunction(activeFunction);
                if (invalidFunctions.Any())
                {
                    //var invalidFunctions = ValidateActiveFunction(createGrowthStageModel.ActiveFunction);
                    if (invalidFunctions.Any())
                    {
                        return new BusinessResult(400, $"Some ActiveFunction not available: {string.Join(", ", invalidFunctions)}");
                    }
                }
                var listFuncRequest = Util.SplitByComma(activeFunction);
                Expression<Func<Plant, bool>> filter = x => x.FarmId == farmId
                    && !x.LandRowId.HasValue
                    && x.IsDeleted == false
                    && x.GrowthStage != null
                    && listFuncRequest.Any(validFunc => x.GrowthStage.ActiveFunction!.Contains(validFunc));

                string includeProperties = "GrowthStage";
                Func<IQueryable<Plant>, IOrderedQueryable<Plant>> orderBy = x => x.OrderByDescending(x => x.PlantId);
                var plantInPlot = await _unitOfWork.PlantRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (!plantInPlot.Any())
                    return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_CODE, Const.WARNING_GET_PLANTS_NOT_EXIST_MSG);
                var mapReturn = _mapper.Map<IEnumerable<ForSelectedModels>>(plantInPlot);
                return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_FARM_PAGINATION_CODE, "Get plant not yet planting success", mapReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        public async Task<BusinessResult> DeadPlantMark(int plantId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var plantUpdate = await _unitOfWork.PlantRepository.GetByCondition(x => x.IsDead!.Value == false && x.IsDeleted == false && x.PlantId == plantId);
                    if (plantUpdate == null)
                        return new BusinessResult(400, Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_MSG);
                    plantUpdate.UpdateDate = DateTime.Now;
                    plantUpdate.IsDead = true;
                    plantUpdate.HealthStatus = HealthStatusConst.DEAD;
                    // Update the plant entity in the repository
                    _unitOfWork.PlantRepository.Update(plantUpdate);

                    // Save the changes
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapResult = _mapper.Map<PlantModel>(plantUpdate);
                        return new BusinessResult(Const.SUCCESS_UPDATE_PLANT_CODE, Const.SUCCESS_UPDATE_PLANT_MSG, mapResult);
                    }
                    else
                    {
                        return new BusinessResult(Const.FAIL_UPDATE_PLANT_CODE, Const.FAIL_UPDATE_PLANT_MSG);
                    }

                }
                catch (Exception ex)
                {
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }
    }
}
