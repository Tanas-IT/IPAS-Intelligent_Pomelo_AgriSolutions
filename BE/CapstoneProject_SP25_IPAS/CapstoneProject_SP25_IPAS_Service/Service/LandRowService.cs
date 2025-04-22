using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandRowRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class LandRowService : ILandRowService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IResponseCacheService _responseCacheService;
        private readonly IExcelReaderService _excelReaderService;
        public LandRowService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration, IResponseCacheService responseCacheService, IExcelReaderService excelReaderService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _configuration = configuration;
            _responseCacheService = responseCacheService;
            _excelReaderService = excelReaderService;
        }

        public async Task<BusinessResult> CreateLandRow(CreateLandRowRequest createRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {

                    var landplot = await _unitOfWork.LandPlotRepository.GetByCondition(x => x.LandPlotId == createRequest.LandPlotId, "LandRows");
                    // kiem tra dien tich cua thua xem neu them hang nay vao co duoc khong - hoac do dai or rong cua hang lon hon do dai thua
                    if (landplot == null)
                        return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                    if (landplot.NumberOfRows <= landplot.LandRows.Count())
                        return new BusinessResult(400, "This plot is full of row");
                    if (landplot.Length < createRequest.Length || landplot.Width < landplot.Width)
                        return new BusinessResult(Const.WARNING_LENGHT_OR_WIDTH_OF_ROW_LARGER_THAN_PLOT_CODE, Const.WARNING_LENGHT_OR_WIDTH_OF_ROW_LARGER_THAN_PLOT_MSG);
                    var minLenght = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_WIDTH.Trim(), (double)1);
                    if (createRequest.Length < minLenght)
                        return new BusinessResult(400, $"Lenght of Row must > {minLenght}.");
                    var minWidth = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_WIDTH.Trim(), (double)1);
                    if (createRequest.Width < minLenght)
                        return new BusinessResult(400, $"Width of Row must > {minWidth}.");
                    var minPlant = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_PLANT_OF_LAND_ROW.Trim(), (int)1);
                    if (createRequest.TreeAmount < minPlant)
                        return new BusinessResult(400, $"Plant of Row must > {minPlant}.");
                    //double areaUsed = 0;
                    //foreach (var row in landplot.LandRows)
                    //{
                    //    if (row.Length!.Value > 0 && row.Width!.Value > 0)
                    //        areaUsed += row.Length.Value * row.Width.Value;
                    //}
                    //if (areaUsed + (createRequest.Length * createRequest.Width) > (landplot.Length!.Value * landplot.Width!.Value))
                    //    return new BusinessResult(Const.WARNING_AREA_WAS_USED_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_AREA_WAS_USED_LARGER_THAN_LANDPLOT_MSG);
                    var landPlotCode = Util.SplitByDash(landplot.LandPlotCode!).First();
                    var newRow = new LandRow
                    {
                        LandPlotId = createRequest.LandPlotId,
                        Description = createRequest.Description,
                        Distance = createRequest.Distance,
                        RowIndex = createRequest.RowIndex,
                        TreeAmount = createRequest.TreeAmount,
                        Length = createRequest.Length,
                        Width = createRequest.Width,
                        CreateDate = DateTime.Now,
                        Status = nameof(LandRowStatus.Active),
                        Direction = createRequest.Direction,
                        IsDeleted = false,
                        LandRowCode = $"{CodeAliasEntityConst.LANDROW}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddmmyy")}-{landPlotCode}-R{(createRequest.RowIndex)}",
                    };
                    await _unitOfWork.LandRowRepository.Insert(newRow);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapReturn = _mapper.Map<LandRowModel>(newRow);
                        string groupKey = CacheKeyConst.GROUP_LANDPLOT + $"{landplot.LandPlotId}";
                        await _responseCacheService.RemoveCacheByGroupAsync(groupKey);
                        return new BusinessResult(Const.SUCCESS_CREATE_ONE_LANDROW_OF_FARM_CODE, Const.SUCCESS_CREATE_ONE_LANDROW_OF_FARM_MSG, mapReturn);
                    }
                    else return new BusinessResult(Const.FAIL_CREATE_ONE_LANDROW_OF_FARM_CODE, Const.FAIL_CREATE_ONE_LANDROW_OF_FARM_MSG);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }

        }

        public Task<int> CreateMultipleRow(List<CreateLandRowRequest> createRequest)
        {
            throw new NotImplementedException();
        }

        public async Task<BusinessResult> DeleteLandRowOfFarm(int rowId)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<LandRow, bool>> filter = x => x.LandRowId == rowId;
                    string includeProperties = "Plants";
                    // set up them trong context moi xoa dc tat ca 1 lan
                    var row = await _unitOfWork.LandRowRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                    if (row == null)
                        return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);

                    _unitOfWork.LandRowRepository.Delete(row);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        string groupKey = CacheKeyConst.GROUP_LANDPLOT + $"{row.LandPlotId}";
                        await _responseCacheService.RemoveCacheByGroupAsync(groupKey);
                        return new BusinessResult(Const.SUCCESS_DELETE_ONE_ROW_CODE, Const.SUCCESS_DELETE_ONE_ROW_MSG, new { success = true });
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetAllLandRowOfLandPlotNoPagin(int landplotId)
        {
            try
            {
                Expression<Func<LandRow, bool>> filter = x => x.LandPlotId == landplotId;
                string includeProperties = "LandPlot,Plants";
                Func<IQueryable<LandRow>, IOrderedQueryable<LandRow>> orderBy = x => x.OrderByDescending(x => x.RowIndex);
                var rowsOfFarm = await _unitOfWork.LandRowRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (!rowsOfFarm.Any())
                    return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_EMPTY_MSG, rowsOfFarm);
                var mapReturn = _mapper.Map<IEnumerable<LandRowModel>>(rowsOfFarm);
                foreach (var item in mapReturn)
                {
                    item.Plants = null!;
                }
                return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_SUCCESS_MSG, mapReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetLandRowForSelectedByPlotId(int landplotId)
        {
            try
            {
                Expression<Func<LandRow, bool>> filter = x => x.LandPlotId == landplotId;
                Func<IQueryable<LandRow>, IOrderedQueryable<LandRow>> orderBy = x => x.OrderByDescending(x => x.RowIndex);
                string includeProperties = "LandPlot";
                var rowsOfFarm = await _unitOfWork.LandRowRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
                if (!rowsOfFarm.Any())
                    return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_EMPTY_MSG, rowsOfFarm);
                var mapReturn = _mapper.Map<IEnumerable<ForSelectedModels>>(rowsOfFarm);
                return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_SUCCESS_MSG, mapReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetLandRowById(int landRowId)
        {
            try
            {
                Expression<Func<LandRow, bool>> filter = x => x.LandRowId == landRowId;
                string includeProperties = "Plants,LandPlot";
                // set up them trong context moi xoa dc tat ca 1 lan
                var row = await _unitOfWork.LandRowRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (row == null)
                    return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);
                if (row.Plants.Any())
                {
                    row.Plants = row.Plants.Where(x => x.IsDeleted == false).ToList();
                }
                var mappedReturn = _mapper.Map<LandRowModel>(row);
                return new BusinessResult(Const.SUCCESS_GET_ROW_BY_ID_CODE, Const.SUCCESS_GET_ROW_BY_ID_MSG, mappedReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateLandRowInfo(UpdateLandRowRequest updateLandRowRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    string includeProperties = "LandPlot";
                    var landRow = await _unitOfWork.LandRowRepository.GetByCondition(x => x.LandRowId == updateLandRowRequest.LandRowId, includeProperties);
                    if (landRow == null)
                        return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);
                    if (updateLandRowRequest.TreeAmount.HasValue)
                    {
                        var curPlantInRow = await _unitOfWork.PlantRepository.GetAllNoPaging(x => x.LandRowId == updateLandRowRequest.LandRowId && x.IsDead == false && x.IsDeleted == false);
                        if (updateLandRowRequest.TreeAmount < curPlantInRow.Count())
                            return new BusinessResult(400, $"Tree amount in row can not smaller than curent plant has exist.");
                        var minPlant = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_PLANT_OF_LAND_ROW.Trim(), (int)1);
                        if (updateLandRowRequest.TreeAmount < minPlant)
                            return new BusinessResult(400, $"Plant of Row must >= {minPlant}.");
                        landRow.TreeAmount = updateLandRowRequest.TreeAmount!.Value;
                    }
                    if (updateLandRowRequest.Distance.HasValue)
                    {
                        var minDistance = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_DISTANCE_OF_PLANT.Trim(), (double)2.0);
                        if (updateLandRowRequest.Distance < minDistance)
                            return new BusinessResult(400, $"Distance beetween must >= {minDistance}.");
                        landRow.Distance = updateLandRowRequest.Distance.Value;
                    }
                    if (updateLandRowRequest.Length.HasValue)
                    {
                        var minLenght = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_LENGTH.Trim(), (double)1);
                        if (updateLandRowRequest.Length < minLenght)
                            return new BusinessResult(400, $"Leght must be >={minLenght}.");
                        landRow.Length = updateLandRowRequest.Length.Value;
                    }
                    if (updateLandRowRequest.Width.HasValue)
                    {
                        var minWidth = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_WIDTH.Trim(), (double)1);
                        if (updateLandRowRequest.Width < minWidth)
                            return new BusinessResult(400, $"Width must be >={minWidth}.");
                        landRow.Width = updateLandRowRequest.Width.Value;
                    }
                    if (!string.IsNullOrEmpty(updateLandRowRequest.Direction))
                        landRow.Direction = updateLandRowRequest.Direction;
                    if (!string.IsNullOrEmpty(updateLandRowRequest.Status))
                        landRow.Status = updateLandRowRequest.Status;
                    if (!string.IsNullOrEmpty(updateLandRowRequest.Description))
                        landRow.Description = updateLandRowRequest.Description;
                    _unitOfWork.LandRowRepository.Update(landRow);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        string groupKey = CacheKeyConst.GROUP_LANDPLOT + $"{landRow.LandPlotId}";
                        await _responseCacheService.RemoveCacheByGroupAsync(groupKey);
                        return new BusinessResult(Const.SUCCESS_UPDATE_ONE_ROW_CODE, Const.SUCCESS_UPDATE_ONE_ROW_MSG, landRow);
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
        public async Task<BusinessResult> GetRowPaginByPlot(GetPlantRowPaginRequest request, PaginationParameter paginationParameter)
        {
            try
            {
                Expression<Func<LandRow, bool>> filter = x => x.LandPlotId == request.LandPlotId;
                Func<IQueryable<LandRow>, IOrderedQueryable<LandRow>> orderBy = x => x.OrderByDescending(od => od.RowIndex).OrderByDescending(x => x.LandRowId);
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    filter = x => (x.LandRowCode!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  || x.Description!.ToLower().Contains(paginationParameter.Search.ToLower())
                                  && x.IsDeleted != true);
                }
                if (!string.IsNullOrEmpty(request.Direction))
                {
                    List<string> filterList = Util.SplitByComma(request.Direction!);
                    filter = filter.And(x => filterList.Contains(request.Direction.ToLower()));
                }

                if (!string.IsNullOrEmpty(request.Status))
                {
                    List<string> filterList = Util.SplitByComma(request.Status);
                    filter = filter.And(x => filterList.Contains(x.Status!.ToLower()));
                }

                if (request.RowIndexFrom.HasValue && request.RowIndexTo.HasValue)
                {
                    if (request.RowIndexFrom > request.RowIndexTo)
                        return new BusinessResult(Const.WARNING_INVALID_FILTER_VALUE_CODE, Const.WARNING_INVALID_ROW_INDEX_FILTER_MSG);

                    filter = filter.And(x => x.RowIndex >= request.RowIndexFrom && x.RowIndex <= request.RowIndexTo);
                }

                if (request.TreeAmountFrom.HasValue && request.TreeAmountTo.HasValue)
                {
                    if (request.TreeAmountFrom > request.TreeAmountTo)
                        return new BusinessResult(Const.WARNING_INVALID_FILTER_VALUE_CODE, Const.WARNING_INVALID_TREE_AMOUNT_FILTER_MSG);

                    filter = filter.And(x => x.TreeAmount >= request.TreeAmountFrom && x.TreeAmount <= request.TreeAmountTo);
                }
                switch (paginationParameter.SortBy != null ? paginationParameter.SortBy.ToLower() : "defaultSortBy")
                {
                    //case "farmId":
                    //    orderBy = !string.IsNullOrEmpty(request.paginationParameter.Direction)
                    //                ? (request.paginationParameter.Direction.ToLower().Equals("desc")
                    //               ? x => x.OrderByDescending(x => x.FarmId)
                    //               : x => x.OrderBy(x => x.FarmId)) : x => x.OrderBy(x => x.FarmId);
                    //    break;
                    case "landrowcode":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.LandRowCode)
                                   : x => x.OrderBy(x => x.LandRowCode)) : x => x.OrderBy(x => x.LandRowCode);
                        break;
                    case "rowindex":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.RowIndex)
                                   : x => x.OrderBy(x => x.RowIndex)) : x => x.OrderBy(x => x.RowIndex);
                        break;
                    case "treeamount":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.TreeAmount).ThenByDescending(x => x.LandRowId)
                                   : x => x.OrderBy(x => x.TreeAmount).OrderBy(x => x.LandRowId)) : x => x.OrderBy(x => x.TreeAmount).ThenBy(x => x.LandRowId);
                        break;
                    case "distance":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Distance).ThenByDescending(x => x.LandRowId)
                                   : x => x.OrderBy(x => x.Distance).ThenBy(x => x.LandRowId)) : x => x.OrderBy(x => x.Distance).ThenBy(x => x.LandRowId);
                        break;
                    case "length":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Length).ThenByDescending(x => x.LandRowId)
                                   : x => x.OrderBy(x => x.Length).ThenBy(x => x.LandRowId)) : x => x.OrderBy(x => x.Length).ThenBy(x => x.LandRowId);
                        break;
                    case "width":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                   ? x => x.OrderByDescending(x => x.Width).ThenByDescending(x => x.LandRowId)
                                   : x => x.OrderBy(x => x.Width).ThenBy(x => x.LandRowId)) : x => x.OrderBy(x => x.Width).ThenBy(x => x.LandRowId);
                        break;
                    case "direction":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.Direction).ThenByDescending(x => x.LandRowId)
                                   : x => x.OrderBy(x => x.Direction).ThenBy(x => x.LandRowId)) : x => x.OrderBy(x => x.Direction).ThenBy(x => x.LandRowId);
                        break;
                    case "status":
                        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction)
                                    ? (paginationParameter.Direction.ToLower().Equals("desc")
                                     ? x => x.OrderByDescending(x => x.Status).ThenByDescending(x => x.LandRowId)
                                   : x => x.OrderBy(x => x.Status).ThenBy(x => x.LandRowId)) : x => x.OrderBy(x => x.Status).ThenBy(x => x.LandRowId);
                        break;
                    default:
                        orderBy = x => x.OrderByDescending(x => x.LandRowId);
                        break;
                }
                //string includeProperties = "LandPlot,Plants";
                var entities = await _unitOfWork.LandRowRepository.Get(filter: filter, orderBy: orderBy, pageIndex: paginationParameter.PageIndex, pageSize: paginationParameter.PageSize);

                var pagin = new PageEntity<LandRowModel>();
                pagin.List = _mapper.Map<IEnumerable<LandRowModel>>(entities).ToList();
                foreach (var item in pagin.List)
                {
                    item.Plants = null!;
                }
                //Expression<Func<Farm, bool>> filterCount = x => x.IsDeleted != true;
                pagin.TotalRecord = await _unitOfWork.LandRowRepository.Count(filter: filter);
                pagin.TotalPage = PaginHelper.PageCount(pagin.TotalRecord, paginationParameter.PageSize);
                if (pagin.List.Any())
                {
                    return new BusinessResult(Const.SUCCESS_GET_ROW_OF_PLOT_PAGINATION_CODE, Const.SUCCESS_GET_ROW_OF_PLOT_PAGINATION_MSG, pagin);
                }
                else
                {
                    return new BusinessResult(200, Const.WARNING_GET_ALL_ROW_EMPTY_MSG, pagin);
                }
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> SoftedMultipleDelete(List<int> rowList)
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
                    Expression<Func<LandRow, bool>> filter = x => rowList.Contains(x.LandRowId) && x.IsDeleted == false;
                    var rowsExistGet = await _unitOfWork.LandRowRepository.GetAllNoPaging(filter: filter);
                    foreach (var item in rowsExistGet)
                    {

                        item.IsDeleted = true;
                        _unitOfWork.LandRowRepository.Update(item);
                    }
                    //}
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_ONE_ROW_CODE, $"Delete {result.ToString()} row success", result > 0);
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(400, "Delete row fail", new { success = false });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }
        public async Task<BusinessResult> GetForSelectedIndexEmptyInRow(int rowId)
        {
            try
            {
                Expression<Func<LandRow, bool>> filter = x => x.LandRowId == rowId;
                //Func<IQueryable<LandRow>, IOrderedQueryable<LandRow>> orderBy = x => x.OrderByDescending(x => x.RowIndex);
                string includeProperties = "Plants";
                var landRow = await _unitOfWork.LandRowRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (landRow == null)
                    return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);
                if (!landRow.TreeAmount.HasValue || landRow.TreeAmount.Value == landRow.Plants.Count())
                    return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, "This row has no index to plant");

                // Danh sách index có thể trồng từ 1 đến TreeAmount
                var allIndexes = Enumerable.Range(1, landRow.TreeAmount.Value).ToList();

                // Lấy danh sách các index đã có cây trồng - trừ những cây chết - cây bị xoá
                var usedIndexes = landRow.Plants.Where(p => p.PlantIndex.HasValue && (p.IsDead != true && p.IsDeleted != true)).Select(p => p.PlantIndex!.Value).ToList();

                // Lọc ra các index còn trống
                var emptyIndexes = allIndexes.Except(usedIndexes).ToList();
                //var mapReturn = _mapper.Map<IEnumerable<ForSelectedModels>>(landRow);
                return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_SUCCESS_MSG, emptyIndexes);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ExportExcelByPlot(GetPlantRowPaginRequest request)
        {
            try
            {
                Expression<Func<LandRow, bool>> filter = x => x.LandPlotId == request.LandPlotId;

                if (!string.IsNullOrEmpty(request.Direction))
                {
                    List<string> filterList = Util.SplitByComma(request.Direction!);
                    filter = filter.And(x => filterList.Contains(x.Direction!.ToLower()));
                }

                if (!string.IsNullOrEmpty(request.Status))
                {
                    List<string> filterList = Util.SplitByComma(request.Status);
                    filter = filter.And(x => filterList.Contains(x.Status!.ToLower()));
                }

                if (request.RowIndexFrom.HasValue && request.RowIndexTo.HasValue)
                {
                    if (request.RowIndexFrom > request.RowIndexTo)
                    {
                        return new BusinessResult(Const.WARNING_INVALID_FILTER_VALUE_CODE, Const.WARNING_INVALID_ROW_INDEX_FILTER_MSG);
                    }

                    filter = filter.And(x => x.RowIndex >= request.RowIndexFrom && x.RowIndex <= request.RowIndexTo);
                }

                if (request.TreeAmountFrom.HasValue && request.TreeAmountTo.HasValue)
                {
                    if (request.TreeAmountFrom > request.TreeAmountTo)
                    {
                        return new BusinessResult(Const.WARNING_INVALID_FILTER_VALUE_CODE, Const.WARNING_INVALID_TREE_AMOUNT_FILTER_MSG);
                    }

                    filter = filter.And(x => x.TreeAmount >= request.TreeAmountFrom && x.TreeAmount <= request.TreeAmountTo);
                }

                var entities = await _unitOfWork.LandRowRepository.GetAllNoPaging(filter: filter);
                var mappedResult = _mapper.Map<IEnumerable<LandRowModel>>(entities).ToList();

                foreach (var item in mappedResult)
                {
                    item.Plants = null!;
                }

                if (mappedResult.Any())
                {
                    var fileName = $"landrow_{DateTime.Now:yyyyMMdd}{FileFormatConst.CSV_EXPAND}";
                    var exportLandRow = await _excelReaderService.ExportToCsvAsync(mappedResult, fileName);

                    return new BusinessResult(Const.EXPORT_CSV_SUCCESS_CODE, Const.EXPORT_CSV_SUCCESS_MSG, new ExportFileResult
                    {
                        FileBytes = exportLandRow.FileBytes,
                        FileName = fileName,
                        ContentType = exportLandRow.ContentType,
                    });
                }
                else
                {
                    return new BusinessResult(Const.EXPORT_CSV_FAIL_CODE, Const.WARNING_EMPTY_LAND_ROWS_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

    }

}
