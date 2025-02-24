using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest;
using CapstoneProject_SP25_IPAS_Common.Enum;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlantLotService : IPlantLotService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public PlantLotService(IUnitOfWork unitOfWork, IConfiguration configuration, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CreateManyPlant(List<CriteriaForPlantLotRequestModel> criterias, int quantity)
        {
            try
            {
                bool checkIsSystem = true;
                foreach (var criteria in criterias)
                {
                    var result = await _unitOfWork.CriteriaRepository.GetByCondition(x => x.CriteriaId == criteria.CriteriaId);
                    if (result == null)
                    {
                        checkIsSystem = false;
                        break;
                    }

                }
                if (!checkIsSystem)
                {
                    return new BusinessResult(Const.FAIL_CREATE_MANY_PLANT_BECAUSE_CRITERIA_INVALID_CODE, Const.FAIL_CREATE_MANY_PLANT_BECAUSE_CRITERIA_INVALID_MESSAGE, false);
                }
                var checkFullIsActiveCriteria = criterias.Where(x => x.IsChecked == true).ToList();
                if (checkFullIsActiveCriteria.Count() == criterias.Count())
                {
                    for (int i = 0; i < quantity; i++)
                    {
                        var newPlant = new Plant()
                        {
                            PlantCode = $"{CodeAliasEntityConst.PLANT}-{DateTime.Now.ToString("ddmmyyyy")}-",
                            CreateDate = DateTime.Now,
                            HealthStatus = "Good",
                            GrowthStageID = 2,
                            UpdateDate = DateTime.Now,
                            IsDeleted = false
                        };
                        await _unitOfWork.PlantRepository.Insert(newPlant);
                    }
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_MANY_PLANT_FROM_PLANT_LOT_CODE, Const.SUCCESS_CREATE_MANY_PLANT_FROM_PLANT_LOT_MESSAGE, result > 0);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_MANY_PLANT_FROM_PLANT_LOT_CODE, Const.FAIL_CREATE_MANY_PLANT_FROM_PLANT_LOT_MESSAGE, false);

                }
                else
                {
                    return new BusinessResult(Const.WARNING_CREATE_MANY_PLANT_FROM_PLANT_LOT_CODE, Const.WARNING_CREATE_MANY_PLANT_FROM_PLANT_LOT_MSG, false);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> CreatePlantLot(CreatePlantLotModel createPlantLotModel)
        {

            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var plantLot = new PlantLot()
                    {
                        PlantLotCode = $"{CodeAliasEntityConst.PLANT_LOT}-{DateTime.Now.ToString("ddmmyyyy")}-{CodeAliasEntityConst.PARTNER}{createPlantLotModel.PartnerId}-{CodeHelper.GenerateCode()}",
                        ImportedDate = DateTime.Now,
                        PreviousQuantity = createPlantLotModel.ImportedQuantity,
                        LastQuantity = createPlantLotModel.ImportedQuantity,
                        PartnerId = createPlantLotModel.PartnerId,
                        PlantLotName = createPlantLotModel.Name,
                        Unit = createPlantLotModel.Unit,
                        Note = createPlantLotModel.Note,
                        Status = "Active"
                    };

                    await _unitOfWork.PlantLotRepository.Insert(plantLot);
                    var checkInsertPlantLot = await _unitOfWork.SaveAsync();
                    await transaction.CommitAsync();
                    if (checkInsertPlantLot > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_CREATE_PLANT_LOT_CODE, Const.SUCCESS_CREATE_PLANT_LOT_MESSAGE, true);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_PLANT_LOT_CODE, Const.FAIL_CREATE_PLANT_LOT_MESSAGE, false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }

            }
        }

        public async Task<BusinessResult> DeletePlantLot(int plantLotId)
        {
            try
            {
                string includeProperties = "GraftedPlants";
                var entityPlantLotDelete = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == plantLotId, includeProperties);
                _unitOfWork.PlantLotRepository.Delete(entityPlantLotDelete);
                var result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    return new BusinessResult(Const.SUCCESS_DELETE_PLANT_LOT_CODE, Const.SUCCESS_DELETE_PLANT_LOT_MESSAGE, result > 0);
                }
                return new BusinessResult(Const.FAIL_DELETE_PLANT_LOT_CODE, Const.FAIL_DELETE_PLANT_LOT_MESSAGE, false);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetAllPlantLots(PaginationParameter paginationParameter)
        {
            try
            {
                Expression<Func<PlantLot, bool>> filter = null!;
                Func<IQueryable<PlantLot>, IOrderedQueryable<PlantLot>> orderBy = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    int validInt = 0;
                    var checkInt = int.TryParse(paginationParameter.Search, out validInt);
                    DateTime validDate = DateTime.Now;
                    if (checkInt)
                    {
                        filter = x => x.PlantLotId == validInt || x.PreviousQuantity == validInt || x.LastQuantity == validInt;
                    }
                    else if (DateTime.TryParse(paginationParameter.Search, out validDate))
                    {
                        filter = x => x.ImportedDate == validDate;
                    }
                    else
                    {
                        filter = x => x.PlantLotCode.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.PlantLotName.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Status.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Unit.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Note.ToLower().Contains(paginationParameter.Search.ToLower())
                                      || x.Partner.PartnerName.ToLower().Contains(paginationParameter.Search.ToLower());
                    }
                }
                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    case "plantlotid":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantLotId)
                                   : x => x.OrderBy(x => x.PlantLotId)) : x => x.OrderBy(x => x.PlantLotId);
                        break;
                    case "plantlotcode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantLotCode)
                                   : x => x.OrderBy(x => x.PlantLotCode)) : x => x.OrderBy(x => x.PlantLotCode);
                        break;
                    case "plantlotname":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.PlantLotName)
                                   : x => x.OrderBy(x => x.PlantLotName)) : x => x.OrderBy(x => x.PlantLotName);
                        break;
                    case "status":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Status)
                                   : x => x.OrderBy(x => x.Status)) : x => x.OrderBy(x => x.Status);
                        break;
                    case "unit":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Unit)
                                   : x => x.OrderBy(x => x.Unit)) : x => x.OrderBy(x => x.Unit);
                        break;
                    case "note":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Note)
                                   : x => x.OrderBy(x => x.Note)) : x => x.OrderBy(x => x.Note);
                        break;
                    case "partnername":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Partner.PartnerName)
                                   : x => x.OrderBy(x => x.Partner.PartnerName)) : x => x.OrderBy(x => x.Partner.PartnerName);
                        break;
                    case "previousquantity":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.PreviousQuantity)
                                   : x => x.OrderBy(x => x.PreviousQuantity)) : x => x.OrderBy(x => x.PreviousQuantity);
                        break;
                    case "lastquantity":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.LastQuantity)
                                   : x => x.OrderBy(x => x.LastQuantity)) : x => x.OrderBy(x => x.LastQuantity);
                        break;
                    case "importeddate":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.ImportedDate)
                                   : x => x.OrderBy(x => x.ImportedDate)) : x => x.OrderBy(x => x.ImportedDate);
                        break;
                    default:
                        orderBy = x => x.OrderBy(x => x.PlantLotId);
                        break;
                }
                string includeProperties = "Partner";
                var entities = await _unitOfWork.PlantLotRepository.Get(filter, orderBy, includeProperties, paginationParameter.PageIndex, paginationParameter.PageSize);
                var pagin = new PageEntity<PlantLotModel>();
                pagin.List = _mapper.Map<IEnumerable<PlantLotModel>>(entities).ToList();
                pagin.TotalRecord = await _unitOfWork.PlantLotRepository.Count();
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ALL_PLANT_LOT_CODE, Const.SUCCESS_GET_ALL_PLANT_LOT_MESSAGE, pagin);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG, new PageEntity<PlantLotModel>());
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetPlantLotById(int plantLotId)
        {
            try
            {
                var plantLot = await _unitOfWork.PlantLotRepository.GetByCondition(x => x.PlantLotId == plantLotId, "Partner");
                if (plantLot != null)
                {
                    var result = _mapper.Map<PlantLotModel>(plantLot);
                    return new BusinessResult(Const.SUCCESS_GET_PLANT_LOT_BY_ID_CODE, Const.SUCCESS_GET_PLANT_LOT_BY_ID_MESSAGE, result);
                }
                else
                {
                    return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdatePlantLot(UpdatePlantLotModel updatePlantLotRequestModel)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    var checkExistPlantLot = await _unitOfWork.PlantLotRepository.GetByID(updatePlantLotRequestModel.PlantLotID);
                    if (checkExistPlantLot != null)
                    {
                        if (updatePlantLotRequestModel.PartnerID > 0)
                        {
                            checkExistPlantLot.PartnerId = updatePlantLotRequestModel.PartnerID;
                        }
                        if (updatePlantLotRequestModel.Name != null)
                        {
                            checkExistPlantLot.PlantLotName = updatePlantLotRequestModel.Name;
                        }
                        if (updatePlantLotRequestModel.GoodPlant > 0)
                        {
                            checkExistPlantLot.LastQuantity = checkExistPlantLot.LastQuantity - updatePlantLotRequestModel.GoodPlant;
                        }
                        if (updatePlantLotRequestModel.Unit != null)
                        {
                            checkExistPlantLot.Unit = updatePlantLotRequestModel.Unit;
                        }
                        if (updatePlantLotRequestModel.Note != null)
                        {
                            checkExistPlantLot.Note = updatePlantLotRequestModel.Note;
                        }
                        if (updatePlantLotRequestModel.Status != null)
                        {
                            checkExistPlantLot.Status = updatePlantLotRequestModel.Status;
                        }
                        var result = await _unitOfWork.SaveAsync();
                        if (result > 0)
                        {
                            return new BusinessResult(Const.SUCCESS_UPDATE_PLANT_LOT_CODE, Const.SUCCESS_UPDATE_PLANT_LOT_MESSAGE, checkExistPlantLot);
                        }
                        else
                        {
                            await transaction.RollbackAsync();
                            return new BusinessResult(Const.FAIL_UPDATE_PLANT_LOT_CODE, Const.FAIL_UPDATE_PLANT_LOT_MESSAGE, false);
                        }
                    }
                    else
                    {
                        return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> FillPlantToPlot(FillPlanToPlotRequest fillRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    // Lấy thông tin lô cây
                    var plantLot = await _unitOfWork.PlantLotRepository.GetByID(fillRequest.plantLotId);
                    if (plantLot == null)
                        return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);

                    var masterTypeExist = await _unitOfWork.MasterTypeRepository.CheckTypeIdInTypeName(fillRequest.MasterTypeId, TypeNameInMasterEnum.Cultiva.ToString());
                    if (masterTypeExist == null)
                        return new BusinessResult(Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG);

                    var growthStageExist = await _unitOfWork.GrowthStageRepository.GetByCondition(x => x.GrowthStageID == fillRequest.growthStageId);
                    if (growthStageExist == null)
                        return new BusinessResult(Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE, Const.WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG);
                    // Kiểm tra số lượng cây có thể trồng
                    int quantityToPlant = plantLot.LastQuantity ?? 0;
                    if (quantityToPlant <= 0)
                    {
                        return new BusinessResult(Const.WARNING_PLANT_LOT_NOT_REMAIN_ANY_PLANT_CODE, Const.WARNING_PLANT_LOT_NOT_REMAIN_ANY_PLANT_MSG);
                    }

                    // Lấy thông tin thửa đất
                    var landPlot = await _unitOfWork.LandPlotRepository.GetByCondition(x => x.LandPlotId == fillRequest.landPlotId, "LandRows");
                    if (landPlot == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                    }

                    // Lấy danh sách hàng trên thửa đất
                    var landRows = landPlot.LandRows.ToList();
                    if (landRows == null || !landRows.Any())
                    {
                        return new BusinessResult(Const.WARNING_LANDPLOT_NOT_HAVE_ANY_ROW_CODE, Const.WARNING_LANDPLOT_NOT_HAVE_ANY_ROW_MSG, false);
                    }

                    int remainingPlants = quantityToPlant;
                    foreach (var row in landRows)
                    {
                        if (remainingPlants <= 0) break;

                        int maxTreeAmount = row.TreeAmount ?? 0;
                        if (maxTreeAmount <= 0) continue;

                        // Lấy danh sách cây hiện có trong hàng
                        var existingPlants = (await _unitOfWork.PlantRepository
                            .GetAllNoPaging(x => x.LandRowId == row.LandRowId))
                            .OrderBy(p => p.PlantIndex)
                            .ToList();

                        HashSet<int> occupiedIndexes = existingPlants
                            .Where(p => p.PlantIndex.HasValue)
                            .Select(p => p.PlantIndex.Value)
                            .ToHashSet();

                        // Tạo danh sách các vị trí trống trong hàng
                        List<int> availableIndexes = Enumerable.Range(1, maxTreeAmount)
                            .Where(index => !occupiedIndexes.Contains(index))
                            .ToList();

                        int plantsToAdd = Math.Min(remainingPlants, availableIndexes.Count);
                        for (int i = 0; i < plantsToAdd; i++)
                        {
                            var newPlant = new Plant
                            {
                                PlantName = plantLot.PlantLotName,
                                PlantCode = $"{CodeAliasEntityConst.PLANT_LOT}-{DateTime.Now:ddMMyyyy}-{CodeAliasEntityConst.LANDPLOT}{row.LandPlotId}{CodeAliasEntityConst.LANDROW}{row.RowIndex}-{CodeHelper.GenerateCode()}",
                                PlantingDate = DateTime.UtcNow,
                                HealthStatus = "Healthy",
                                LandRowId = row.LandRowId,
                                FarmId = landPlot.FarmId,
                                IsDeleted = false,
                                GrowthStageID = fillRequest.growthStageId,
                                MasterTypeId = fillRequest.MasterTypeId,
                                PlantIndex = availableIndexes[i] // Gán vị trí trống hợp lệ
                            };
                            await _unitOfWork.PlantRepository.Insert(newPlant);
                        }

                        remainingPlants -= plantsToAdd;
                    }

                    // Cập nhật số lượng cây còn lại trong PlantLot
                    plantLot.LastQuantity -= (quantityToPlant - remainingPlants);
                    _unitOfWork.PlantLotRepository.Update(plantLot);
                    // Lưu thay đổi
                    var result = await _unitOfWork.SaveAsync();
                    if(result > 0)
                    return new BusinessResult(Const.SUCCESS_UPDATE_PLANT_LOT_CODE, "Plant has fill in plot success", plantLot);
                    // nếu sai
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.FAIL_UPDATE_PLANT_LOT_CODE, Const.FAIL_UPDATE_PLANT_LOT_MESSAGE);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }


    }
}
