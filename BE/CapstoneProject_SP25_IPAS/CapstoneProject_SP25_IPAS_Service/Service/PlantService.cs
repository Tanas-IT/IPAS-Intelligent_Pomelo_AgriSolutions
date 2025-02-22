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
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlantService : IPlantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IExcelReaderService _excelReaderService;
        public PlantService(IUnitOfWork unitOfWork, IMapper mapper, ICloudinaryService cloudinaryService, IExcelReaderService excelReaderService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _excelReaderService = excelReaderService;
        }

        public async Task<BusinessResult> createPlant(PlantCreateRequest plantCreateRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var landrowExist = await _unitOfWork.LandRowRepository.GetByCondition(x => x.LandRowId == plantCreateRequest.LandRowId, "Plants");
                    if (landrowExist == null)
                        return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);
                    if (landrowExist.Plants.Count >= landrowExist.TreeAmount)
                        return new BusinessResult(Const.WARNING_PLANT_IN_LANDROW_FULL_CODE, Const.WARNING_PLANT_IN_LANDROW_FULL_MSG);
                    // Create the new Plant entity from the request
                    var plantCreateEntity = new Plant()
                    {
                        PlantCode = $"{CodeAliasEntityConst.PLANT_LOT}-{DateTime.Now.ToString("ddmmyyyy")}-{CodeAliasEntityConst.LANDPLOT}{landrowExist.LandPlotId}{CodeAliasEntityConst.LANDROW}{landrowExist.RowIndex}-{CodeHelper.GenerateCode()}",
                        PlantName = plantCreateRequest.PlantName,
                        PlantIndex = plantCreateRequest.PlantIndex,
                        GrowthStageID = plantCreateRequest.GrowthStageId,
                        HealthStatus = plantCreateRequest.HealthStatus,
                        PlantingDate = plantCreateRequest.PlantingDate!.Value,
                        PlantReferenceId = plantCreateRequest.MotherPlantId,
                        Description = plantCreateRequest.Description,
                        MasterTypeId = plantCreateRequest.MasterTypeId,
                        LandRowId = plantCreateRequest.LandRowId,
                    };

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

        public async Task<BusinessResult> getAllPlantOfFarm(int farmId, PaginationParameter paginationParameter)
        {
            try
            {
                var entities = await _unitOfWork.PlantRepository.GetPlantsInFarmPagin(farmId: farmId, search: paginationParameter.Search, sortBy: paginationParameter.SortBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize, direction: paginationParameter.Direction);
                var pagin = new PageEntity<PlantModel>
                {
                    List = _mapper.Map<IEnumerable<PlantModel>>(entities).ToList(),
                    TotalRecord = await _unitOfWork.PlantRepository.Count(x => x.LandRow != null && x.LandRow.LandPlot!.FarmId == farmId),
                };
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);

                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_FARM_PAGINATION_CODE, Const.SUCCESS_GET_PLANT_IN_FARM_PAGINATION_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_CODE, Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_MSG, pagin);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        public async Task<BusinessResult> getAllPlantOfPlot(int landplotId, PaginationParameter paginationParameter)
        {
            try
            {
                var entities = await _unitOfWork.PlantRepository.GetPlantsInPlotPagin(landPlotId: landplotId, search: paginationParameter.Search, sortBy: paginationParameter.SortBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize, direction: paginationParameter.Direction);
                var pagin = new PageEntity<PlantModel>
                {
                    List = _mapper.Map<IEnumerable<PlantModel>>(entities).ToList(),
                    TotalRecord = await _unitOfWork.PlantRepository.Count(x => x.LandRow != null && x.LandRow.LandPlotId == landplotId),
                };
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);

                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_CODE, Const.SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_CODE, Const.WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_MSG, pagin);
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
                    Expression<Func<Plant, bool>> condition = x => x.PlantId == plantUpdateRequest.PlantId /*&& x.IsDelete != true*/ ;
                    var plantEntityUpdate = await _unitOfWork.PlantRepository.GetByCondition(condition);

                    if (plantEntityUpdate == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                    }

                    // Update the plant properties based on the request model
                    foreach (var prop in typeof(PlantUpdateRequest).GetProperties())
                    {
                        var newValue = prop.GetValue(plantUpdateRequest);
                        if (newValue != null && !string.IsNullOrEmpty(newValue.ToString()))
                        {
                            var plantProp = typeof(Plant).GetProperty(prop.Name);
                            if (plantProp != null && plantProp.CanWrite)
                            {
                                plantProp.SetValue(plantEntityUpdate, newValue);
                            }
                        }
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
                    List<PlantCSVImportRequest> plantCsvList = await _excelReaderService.ReadCsvFileAsync<PlantCSVImportRequest>(request.fileExcel);
                    if(!plantCsvList.Any())
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
                        if (referencePlant == null && !string.IsNullOrEmpty(plant.PlantReferenceCode) )
                        {
                            fileHasError = true;
                            errorList = errorList + "\n" + $"Row {plant.NumberOrder}: Mother plant code not exist.";
                        }
                        if (landRow != null && growthStage != null && masterType != null )
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

    }
}
