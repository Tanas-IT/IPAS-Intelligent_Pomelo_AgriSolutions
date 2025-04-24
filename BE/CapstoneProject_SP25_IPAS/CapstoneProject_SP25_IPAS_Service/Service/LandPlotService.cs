using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using ProjNet.CoordinateSystems.Transformations;
using ProjNet.CoordinateSystems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandPlotRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.LandRowRequest;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class LandPlotService : ILandPlotService, IValidateLandRowService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IResponseCacheService _responseCacheService;
        private string groupKey = $"{CacheKeyConst.GROUP_FARM_LANDPLOT}=";
        public LandPlotService(IUnitOfWork unitOfWork, IMapper mapper, IResponseCacheService responseCacheService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _responseCacheService = responseCacheService;
        }

        public async Task<BusinessResult> CreateLandPlot(LandPlotCreateRequest createRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var checkExistFarm = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == createRequest.FarmId && x.IsDeleted == false);
                    if (checkExistFarm == null)
                        return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    // Kiểm tra dữ liệu đầu vào
                    var validationResult = await ValidateLandPlotCreateAsync(createRequest);
                    if (validationResult.StatusCode != 200) return validationResult;
                    string LandPlotCode = CodeHelper.GenerateCode();
                    var landplotCreateEntity = new LandPlot()
                    {
                        LandPlotName = createRequest.LandPlotName,
                        TargetMarket = createRequest.TargetMarket,
                        Area = createRequest.Area,
                        SoilType = createRequest.SoilType,
                        Length = createRequest.PlotLength,
                        Width = createRequest.PlotWidth,
                        Description = createRequest.Description,
                        FarmId = createRequest.FarmId,
                        Status = FarmStatusEnum.Active.ToString(),
                        CreateDate = DateTime.Now,
                        //UpdateDate = DateTime.Now,
                        RowPerLine = createRequest.RowPerLine,
                        RowSpacing = createRequest.RowSpacing,
                        LineSpacing = createRequest.LineSpacing,
                        NumberOfRows = createRequest.NumberOfRows,
                        IsRowHorizontal = createRequest.IsRowHorizontal,
                        IsDeleted = false,
                        MinLength = createRequest.MinLength,
                        MaxLength = createRequest.MaxLength,
                        MinWidth = createRequest.MinWidth,
                        MaxWidth = createRequest.MaxLength,
                        LandPlotCode = $"{CodeAliasEntityConst.LANDPLOT}{LandPlotCode}-{DateTime.Now.ToString("ddMMyy")}-{checkExistFarm.FarmCode}",
                    };

                    // Xử lý danh sách hàng trong thửa
                    var landRowsResult = await ProcessLandRows(createRequest, landplotCreateEntity, LandPlotCode);
                    if (landRowsResult != null) return landRowsResult;

                    // Xử lý tọa độ
                    ProcessLandPlotCoordinations(createRequest, landplotCreateEntity);

                    // Lưu vào DB
                    await _unitOfWork.LandPlotRepository.Insert(landplotCreateEntity);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        //string groupKey = $"{CacheKeyConst.GROUP_FARM_LANDPLOT}={createRequest.FarmId}";
                        await _responseCacheService.RemoveCacheByGroupAsync(groupKey + createRequest.FarmId.ToString()); ;
                        var mappedResult = _mapper.Map<LandPlotModel>(landplotCreateEntity);
                        return new BusinessResult(Const.SUCCESS_CREATE_FARM_CODE, Const.SUCCESS_CREATE_FARM_MSG, mappedResult);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(400, "Create landplot fail");
                    }
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, "Create landplot have error", ex.Message);
            }
        }


        //public async Task<BusinessResult> CreateLandPlot(LandPlotCreateRequest createRequest)
        //{
        //    try
        //    {
        //        using (var transaction = await _unitOfWork.BeginTransactionAsync())
        //        {
        //            // Kiểm tra điều kiện hợp lệ
        //            //if (createRequest.RowLength > createRequest.PlotLength)
        //            //    return new BusinessResult(Const.WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG);
        //            if (createRequest.RowWidth > createRequest.PlotWidth)
        //                return new BusinessResult(Const.WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG);
        //            if (createRequest.LandPlotCoordinations.Count < 3)
        //                return new BusinessResult(Const.WARNING_INVALID_PLOT_COORDINATIONS_CODE, Const.WARNING_INVALID_PLOT_COORDINATIONS_MSG);

        //            // 1️⃣ Tính số hàng trong thửa
        //            int numberRowInPlot = CalculateRowsInPlot(createRequest.PlotLength, createRequest.RowWidth, 0);
        //            int lastId = await _unitOfWork.LandPlotRepository.GetLastID();
        //            // 2️⃣ Tạo đối tượng thửa đất
        //            var landplotCreateEntity = new LandPlot()
        //            {
        //                LandPlotCode = $"{CodeAliasEntityConst.LANDPLOT}-{createRequest.FarmId}-{DateTime.Now.ToString("ddmmyyy")}-{lastId:D6}",
        //                LandPlotName = createRequest.LandPlotName,
        //                TargetMarket = createRequest.TargetMarket,
        //                Area = createRequest.Area,
        //                SoilType = createRequest.SoilType,
        //                Length = createRequest.PlotLength,
        //                Width = createRequest.PlotWidth,
        //                Description = createRequest.Description,
        //                FarmId = createRequest.FarmId,
        //                Status = FarmStatus.Active.ToString(),
        //                CreateDate = DateTime.Now,
        //                UpdateDate = DateTime.Now
        //            };

        //            // 3️⃣ Thêm hàng vào thửa đất
        //            for (int i = 0; i < numberRowInPlot; i++)
        //            {
        //                double rowActualLength = CalculateRowLength_UTM(createRequest.LandPlotCoordinations.ToList(), i, numberRowInPlot);
        //                int treeAmount = CalculateTreeAmount(rowActualLength, createRequest.DistanceInRow);

        //                var landRow = new LandRow()
        //                {
        //                    LandRowCode = $"{CodeAliasEntityConst.LANDROW}-{DateTime.Now.ToString("ddmmyyyy")}-{CodeAliasEntityConst.LANDPLOT}{lastId}-R{(i+1)}",
        //                    RowIndex = i + 1, // Số thứ tự hàng (1, 2, 3,...)
        //                    Length = rowActualLength,
        //                    //Width = createRequest.RowLength,
        //                    Distance = createRequest.DistanceInRow,
        //                    Direction = createRequest.RowDirection,
        //                    TreeAmount = treeAmount,
        //                    Status = LandRowStatus.Active.ToString(),
        //                    CreateDate = DateTime.Now,
        //                };

        //                landplotCreateEntity.LandRows.Add(landRow);
        //            }

        //            // 4️⃣ Thêm tọa độ vào thửa đất
        //            if (createRequest.LandPlotCoordinations?.Any() == true)
        //            {
        //                foreach (var coordination in createRequest.LandPlotCoordinations)
        //                {
        //                    var landplotCoordination = new LandPlotCoordination()
        //                    {
        //                        Latitude = coordination.Latitude,
        //                        Longitude = coordination.Longitude,
        //                    };
        //                    landplotCreateEntity.LandPlotCoordinations.Add(landplotCoordination);
        //                }
        //            }

        //            // 5️⃣ Lưu vào DB
        //            await _unitOfWork.LandPlotRepository.Insert(landplotCreateEntity);
        //            int result = await _unitOfWork.SaveAsync();
        //            if (result > 0)
        //            {
        //                await transaction.CommitAsync();
        //                var mappedResult = _mapper.Map<LandPlotModel>(landplotCreateEntity);
        //                return new BusinessResult(Const.SUCCESS_CREATE_FARM_CODE, Const.SUCCESS_CREATE_FARM_MSG, mappedResult);
        //            }
        //            else return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, Const.FAIL_CREATE_FARM_MSG);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, Const.FAIL_CREATE_FARM_MSG, ex.Message);
        //    }
        //}


        public async Task<BusinessResult> deleteLandPlotOfFarm(int landplotId)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    //var farm = await _unitOfWork.FarmRepository.GetFarmById(farmId);
                    //if (farm == null)
                    //    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);
                    string includeProperties = "LandPlotCoordinations";
                    var landplotDelete = await _unitOfWork.LandPlotRepository.GetByCondition(x => x.LandPlotId == landplotId, includeProperties: includeProperties);
                    if (landplotDelete == null)
                        return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                    _unitOfWork.LandPlotRepository.Delete(landplotDelete);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PLANT_LOT_CODE, Const.SUCCESS_DELETE_PLANT_LOT_MESSAGE, new { success = true });
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_DELETE_FARM_LANDPLOT_CODE, Const.FAIL_DELETE_FARM_LANDPLOT_MSG, ex.Message);
            }
        }

        public async Task<BusinessResult> GetAllLandPlotNoPagin(int farmId, string? searchKey)
        {
            if (farmId <= 0)
                return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

            string key = $"{CacheKeyConst.LANDPLOT}:{CacheKeyConst.FARM}={farmId}&searchKey={searchKey}";

            //await _responseCacheService.RemoveCacheAsync(key);
            var cachedData = await _responseCacheService.GetCacheObjectAsync<BusinessResult<IEnumerable<FarmModel>>>(key);
            if (cachedData != null)
            {
                return new BusinessResult(cachedData.StatusCode, cachedData.Message, cachedData.Data);
            }

            Expression<Func<Farm, bool>> filter = x => x.FarmId == farmId && x.IsDeleted != true;
            //Func<IQueryable<Farm>, IOrderedQueryable<Farm>> orderBy = x => x.OrderBy(x => x.LandPlotId);
            //string includeProperties = "LandPlotCoordinations,Farm";
            var landplotInFarm = await _unitOfWork.FarmRepository.GetFarmById(farmId/*filter: filter , includeProperties: includeProperties, orderBy: orderBy*/);
            //if (!string.IsNullOrEmpty(searchKey))
            //{
            //    filter.And(x => x.LandPlots.Where(l => l.LandPlotName!.ToLower().Contains(searchKey.ToLower())));
            //}
            if (landplotInFarm != null)
            {
                landplotInFarm.UserFarms = null!;
                landplotInFarm.Orders = null!;
                var mappedResult = _mapper.Map<FarmModel>(landplotInFarm);
                var result = new BusinessResult(Const.SUCCESS_GET_FARM_ALL_PAGINATION_CODE, Const.SUCCESS_GET_FARM_ALL_PAGINATION_FARM_MSG, mappedResult);
                //string groupKey = $"{CacheKeyConst.GROUP_FARM_LANDPLOT}={farmId}";
                await _responseCacheService.AddCacheWithGroupAsync(groupKey + farmId.ToString(), key.Trim(), result, TimeSpan.FromMinutes(5));
                return result;
            }
            else
            {
                return new BusinessResult(200, Const.WARNING_GET_ALL_LANDPLOT_NOT_EXIST_MSG);
            }
        }

        public async Task<BusinessResult> GetLandPlotEmpty(int farmId)
        {
            // 1️ Kiểm tra farm 
            var checkFarmExist = await _unitOfWork.FarmRepository.GetByCondition(x => x.FarmId == farmId && x.IsDeleted == false);
            if (checkFarmExist == null)
                return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

            // 2️ Lấy danh sách thửa đất có chứa thông tin hàng & cây
            var landPlots = await _unitOfWork.LandPlotRepository.GetLandPlotIncludeByFarmId(farmId);

            if (!landPlots.Any())
                return new BusinessResult(200, Const.WARNING_GET_ALL_LANDPLOT_NOT_EXIST_MSG);
            var mappedResult = _mapper.Map<List<LandPlotModel>>(landPlots);
            // 3 Tính số slot trống cho mỗi thửa đất
            foreach (var lp in mappedResult)
            {
                lp.EmptySlot = lp.LandRows.Sum(row =>
                    row.TreeAmount - row.Plants.Count(p => p.IsDead == false)
                );
                lp.LandRows = null;
            }

            // 5️Lọc bỏ các thửa đất không còn slot trống
            mappedResult = mappedResult.Where(lp => lp.EmptySlot > 0).ToList();

            //// 4️ Nếu không còn thửa nào trống thì trả về thông báo
            //if (!landPlotData.Any())
            //    return new BusinessResult(200, "All land plots are full. No empty slots available.");

            // 5️⃣ Trả về kết quả
            return new BusinessResult(Const.SUCCESS_GET_FARM_ALL_PAGINATION_CODE, Const.SUCCESS_GET_FARM_ALL_PAGINATION_FARM_MSG, mappedResult);
        }

        public async Task<BusinessResult> GetLandPlotForSelected(int farmId)
        {
            if (farmId <= 0)
                return new BusinessResult(Const.WARNING_VALUE_INVALID_CODE, Const.WARNING_VALUE_INVALID_MSG);
            Expression<Func<LandPlot, bool>> filter = x => x.FarmId == farmId && x.IsDeleted != true;
            Func<IQueryable<LandPlot>, IOrderedQueryable<LandPlot>> orderBy = x => x.OrderBy(x => x.LandPlotId);

            var landplotInFarm = await _unitOfWork.LandPlotRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
            if (landplotInFarm.Any())
            {
                var mappedResult = _mapper.Map<IEnumerable<ForSelectedModels>>(landplotInFarm);
                return new BusinessResult(Const.SUCCESS_GET_ALL_LANDPLOT_IN_FARM_CODE, Const.SUCCESS_GET_ALL_LANDPLOT_IN_FARM_MSG, mappedResult);
            }
            else
            {
                return new BusinessResult(200, Const.WARNING_GET_ALL_LANDPLOT_NOT_EXIST_MSG);
            }
        }

        public async Task<BusinessResult> GetLandPlotById(int landPlotId)
        {
            string key = $"{CacheKeyConst.LANDPLOT}={landPlotId}";

            //await _responseCacheService.RemoveCacheAsync(key);
            var cachedData = await _responseCacheService.GetCacheObjectAsync<BusinessResult<LandPlotModel>>(key);
            if (cachedData != null)
            {
                return new BusinessResult(cachedData.StatusCode, cachedData.Message, cachedData.Data);
            }
            string includeProperties = "LandPlotCoordinations,Farm";
            Expression<Func<LandPlot, bool>> filter = x => x.LandPlotId == landPlotId && x.IsDeleted != true;

            var landplot = await _unitOfWork.LandPlotRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
            // kiem tra null
            if (landplot == null)
                return new BusinessResult(200, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
            // neu khong null return ve mapper
            var mappedResult = _mapper.Map<LandPlotModel>(landplot);
            var result = new BusinessResult(Const.SUCCESS_GET_FARM_CODE, "Get landplot in farm success", mappedResult);
            if (mappedResult != null)
            {
                string groupKey = CacheKeyConst.GROUP_LANDPLOT + $"{landplot.LandPlotId}";
                await _responseCacheService.AddCacheWithGroupAsync(groupKey.Trim(), key.Trim(), result, TimeSpan.FromMinutes(5));
            }
            //return new BusinessResult(Const.SUCCESS_GET_FARM_CODE, "Get landplot in farm success", mappedResult);
            return result;
        }

        public async Task<BusinessResult> GetForMapped(int landplotId)
        {
            //string key = $"{CacheKeyConst.LANDPLOT}{nameof(GetForMapped)}={landplotId}";

            ////await _responseCacheService.RemoveCacheAsync(key);
            //var cachedData = await _responseCacheService.GetCacheObjectAsync<BusinessResult<LandPlotModel>>(key);
            //if (cachedData != null)
            //{
            //    return new BusinessResult(cachedData.StatusCode, cachedData.Message, cachedData.Data);
            //}
            var landplot = await _unitOfWork.LandPlotRepository.GetForMapped(landplotId);
            // kiem tra null
            if (landplot == null)
                return new BusinessResult(200, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
            // neu khong null return ve mapper
            var mappedResult = _mapper.Map<LandPlotModel>(landplot);
            var result = new BusinessResult(Const.SUCCESS_GET_FARM_CODE, "Get landplot for mapped success", mappedResult);
            //if (mappedResult != null)
            //{
            //    string groupKey = CacheKeyConst.GROUP_LANDPLOT + $"{landplot.LandPlotId}";
            //    await _responseCacheService.AddCacheWithGroupAsync(groupKey.Trim(), key.Trim(), result, TimeSpan.FromMinutes(5));
            //}
            return result;
        }

        public async Task<BusinessResult> UpdateLandPlotCoordination(LandPlotUpdateCoordinationRequest updateRequest)
        {
            try
            {

                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var checkLandPlotExist = await _unitOfWork.LandPlotRepository.GetByCondition(x => x.LandPlotId == updateRequest.LandPlotId && x.IsDeleted != true);
                    if (checkLandPlotExist == null)
                        return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);

                    // Lấy các tọa độ hiện tại
                    Expression<Func<LandPlotCoordination, bool>> condition = x => x.LandPlotId == updateRequest.LandPlotId && x.LandPlot!.IsDeleted != true && x.LandPlot!.Farm!.IsDeleted != true;
                    var existingCoordinationList = await _unitOfWork.LandPlotCoordinationRepository.GetAllNoPaging(condition);

                    // Chuyển đổi danh sách thành HashSet để so sánh
                    var existingCoordinates = existingCoordinationList
                        .Select(x => new { Lat = x.Latitude ?? 0, Lng = x.Longitude ?? 0 }) // Ép kiểu tránh null
                        .ToHashSet();

                    var newCoordinates = updateRequest.CoordinationsUpdateModel
                        .Select(x => new { Lat = x.Latitude, Lng = x.Longitude }) // Đổi tên key tránh lỗi trùng
                        .ToHashSet();

                    // Tìm các điểm bị xóa (có trong danh sách cũ nhưng không có trong danh sách mới)
                    var coordinatesToDelete = existingCoordinationList
                        .Where(x => !newCoordinates.Contains(new { Lat = x.Latitude!.Value, Lng = x.Longitude!.Value }))
                        .ToList();

                    // Tìm các điểm cần thêm mới (có trong danh sách mới nhưng không có trong danh sách cũ)
                    var coordinatesToAdd = updateRequest.CoordinationsUpdateModel
                        .Where(x => !existingCoordinates.Contains(new { Lat = x.Latitude, Lng = x.Longitude }))
                        .Select(x => new LandPlotCoordination
                        {
                            LandPlotId = updateRequest.LandPlotId,
                            Latitude = x.Latitude,
                            Longitude = x.Longitude
                        })
                        .ToList();

                    // Xóa các điểm không còn tồn tại
                    if (coordinatesToDelete.Any())
                    {
                        _unitOfWork.LandPlotCoordinationRepository.RemoveRange(coordinatesToDelete); // Sửa DeleteRange
                    }

                    // Thêm các điểm mới
                    if (coordinatesToAdd.Any())
                    {
                        await _unitOfWork.LandPlotCoordinationRepository.InsertRangeAsync(coordinatesToAdd); // Sửa InsertRangeAsync
                    }

                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var resultSave = await _unitOfWork.LandPlotCoordinationRepository.GetAllNoPaging(x => x.LandPlotId == updateRequest.LandPlotId);
                        var mappedResult = _mapper.Map<IEnumerable<LandPlotCoordinationModel>>(resultSave);
                        await _responseCacheService.RemoveCacheByGroupAsync($"{groupKey}{checkLandPlotExist.FarmId}");
                        await _responseCacheService.RemoveCacheByGroupAsync(CacheKeyConst.GROUP_LANDPLOT + checkLandPlotExist.LandPlotId.ToString());

                        return new BusinessResult(Const.SUCCESS_UPDATE_LANDPLOT_COORDINATION_CODE, Const.SUCCESS_UPDATE_LANDPLOT_COORDINATION_MSG, mappedResult);
                    }
                    else
                    {
                        return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                    }
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }



        public async Task<BusinessResult> UpdateLandPlotInfo(LandPlotUpdateRequest landPlotUpdateRequest)
        {
            try
            {

                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<LandPlot, bool>> condition = x => x.LandPlotId == landPlotUpdateRequest.LandPlotId && x.Farm!.IsDeleted != true;
                    string includeProperties = "LandPlotCoordinations,Farm";
                    var landplotEntityUpdate = await _unitOfWork.LandPlotRepository.GetByCondition(condition, includeProperties: includeProperties);

                    if (landplotEntityUpdate == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                    }
                    // validation
                    var validationResult = await ValidateLandPlotUpdateAsync(landPlotUpdateRequest);
                    if (validationResult.StatusCode != 200)
                        return validationResult;

                    // Lấy danh sách thuộc tính từ model
                    foreach (var prop in typeof(LandPlotUpdateRequest).GetProperties())
                    {
                        var newValue = prop.GetValue(landPlotUpdateRequest);
                        if (newValue != null && !string.IsNullOrEmpty(newValue.ToString()) && !newValue.Equals("string") && !newValue.Equals("0"))
                        {
                            var farmProp = typeof(LandPlot).GetProperty(prop.Name);
                            if (farmProp != null && farmProp.CanWrite)
                            {
                                farmProp.SetValue(landplotEntityUpdate, newValue);
                            }
                        }
                    }

                    _unitOfWork.LandPlotRepository.Update(landplotEntityUpdate);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<LandPlotModel>(landplotEntityUpdate);
                        await _responseCacheService.RemoveCacheByGroupAsync(CacheKeyConst.GROUP_LANDPLOT + landplotEntityUpdate.LandPlotId.ToString());
                        await _responseCacheService.RemoveCacheByGroupAsync($"{groupKey}{landplotEntityUpdate.FarmId}");

                        return new BusinessResult(Const.SUCCESS_UPDATE_LANDPLOT_CODE, Const.SUCCESS_UPDATE_LANDPLOT_MSG, mappedResult);
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> SofteDelete(int landPlotId)
        {
            try
            {

                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    Expression<Func<LandPlot, bool>> condition = x => x.LandPlotId == landPlotId && x.Farm!.IsDeleted != true;
                    var landplotEntityUpdate = await _unitOfWork.LandPlotRepository.GetByCondition(condition);

                    if (landplotEntityUpdate == null)
                    {
                        return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
                    }
                    bool isBeingUsed =
                        //await _unitOfWork.LandPlotCoordinationRepository.AnyAsync(x => x.LandPlotId == landPlotId) ||
                        //await _unitOfWork.LandRowRepository.AnyAsync(x => x.LandPlotId == landPlotId) ||
                        await _unitOfWork.LandPlotCropRepository.AnyAsync(x => x.LandPlotId == landPlotId) ||
                        await _unitOfWork.PlanTargetRepository.AnyAsync(x => x.LandPlotID == landPlotId);

                    if (isBeingUsed)
                    {
                        return new BusinessResult(400, "Can not delete because LandPlot is used in other function.");
                    }
                    // Lấy tất cả LandRow chưa bị xóa
                    var landRows = await _unitOfWork.LandRowRepository.GetAllNoPaging(x => x.LandPlotId == landPlotId && x.IsDeleted == false);

                    if (landRows != null && landRows.Any())
                    {
                        var landRowIds = landRows.Select(r => r.LandRowId).ToList();

                        // Kiểm tra xem có cây sống nào trong các hàng không
                        var existPlants = await _unitOfWork.PlantRepository.AnyAsync(
                            p => landRowIds.Contains(p.LandRowId.Value) && !p.IsDeleted.Value && !p.IsDead.Value);

                        if (existPlants)
                        {
                            return new BusinessResult(400, "Can not delete because LandPlot contains LandRow with living plants.");
                        }
                        else
                        {
                            foreach (var row in landRows)
                            {
                                row.IsDeleted = true;
                            }
                            _unitOfWork.LandRowRepository.UpdateRange(landRows);
                        }
                    }
                    // Delete
                    landplotEntityUpdate.IsDeleted = true;
                    _unitOfWork.LandPlotRepository.Update(landplotEntityUpdate);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        await _responseCacheService.RemoveCacheByGroupAsync(CacheKeyConst.GROUP_LANDPLOT + landPlotId.ToString());
                        await _responseCacheService.RemoveCacheByGroupAsync($"{groupKey}{landplotEntityUpdate.FarmId}");

                        return new BusinessResult(Const.SUCCESS_UPDATE_LANDPLOT_CODE, "Delete softed successfully", new { success = true });
                    }
                    else return new BusinessResult(Const.ERROR_EXCEPTION, Const.FAIL_TO_SAVE_TO_DATABASE);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private async Task<BusinessResult> ProcessLandRows(LandPlotCreateRequest createRequest, LandPlot landplotCreateEntity, string? SplitLandPlotCode = null)
        {
            // Kiểm tra hàng có bị trùng index không
            var duplicateRowIndex = createRequest.LandRows.GroupBy(r => r.RowIndex)
                                                          .Where(g => g.Count() > 1)
                                                          .Select(g => g.Key)
                                                          .ToList();

            if (duplicateRowIndex.Any())
                return new BusinessResult(Const.WARNING_DUPLICATE_ROW_INDEX_CODE, $"{Const.WARNING_DUPLICATE_ROW_INDEX_MSG}: {string.Join(", ", duplicateRowIndex)}");

            // Kiểm tra kích thước hàng có hợp lệ không
            //foreach (var row in createRequest.LandRows)
            //{
            //    if (row.Length > createRequest.PlotWidth || row.Width > createRequest.PlotLength)
            //        return new BusinessResult(Const.WARNING_LENGHT_OR_WIDTH_OF_ROW_LARGER_THAN_PLOT_CODE, $"{Const.WARNING_LENGHT_OR_WIDTH_OF_ROW_LARGER_THAN_PLOT_MSG}: RowIndex {row.RowIndex}");
            //}

            // Tạo danh sách hàng
            foreach (var row in createRequest.LandRows)
            {

                var minPlant = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_PLANT_OF_LAND_ROW.Trim(), (int)1);
                if (row.TreeAmount < minPlant)
                    return new BusinessResult(400, $"Plant of Row must >= {minPlant}.");

                var minDistance = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_DISTANCE_OF_PLANT.Trim(), (double)2.0);
                if (row.Distance < minDistance)
                    return new BusinessResult(400, $"Distance between plants must >= {minDistance}.");

                var minLength = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_LENGTH.Trim(), (double)1);
                if (row.Length < minLength)
                    return new BusinessResult(400, $"Row length must >= {minLength}.");

                var minWidth = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_WIDTH.Trim(), (double)1);
                if (row.Width < minWidth)
                    return new BusinessResult(400, $"Row width must >= {minWidth}.");

                var landRow = new LandRow()
                {
                    LandRowCode = $"{CodeAliasEntityConst.LANDROW}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddMMyy")}-{CodeAliasEntityConst.LANDPLOT}{SplitLandPlotCode}",
                    RowIndex = row.RowIndex,
                    Length = row.Length,
                    Width = row.Width,
                    Distance = row.Distance,
                    Direction = row.Direction,
                    IsDeleted = false,
                    TreeAmount = row.TreeAmount,
                    Description = row.Description,
                    Status = LandRowStatus.Active.ToString(),
                    CreateDate = DateTime.Now
                };

                landplotCreateEntity.LandRows.Add(landRow);
            }

            return null;
        }

        private void ProcessLandPlotCoordinations(LandPlotCreateRequest createRequest, LandPlot landplotCreateEntity)
        {
            foreach (var coordination in createRequest.LandPlotCoordinations)
            {
                var landplotCoordination = new LandPlotCoordination()
                {
                    Latitude = coordination.Latitude,
                    Longitude = coordination.Longitude,
                };
                landplotCreateEntity.LandPlotCoordinations.Add(landplotCoordination);
            }
        }

        private async Task<BusinessResult> ValidateLandPlotCreateAsync(LandPlotCreateRequest createRequest)
        {
            if (createRequest.LandRows == null || !createRequest.LandRows.Any())
                return new BusinessResult(Const.WARNING_EMPTY_LAND_ROWS_CODE, Const.WARNING_EMPTY_LAND_ROWS_MSG);
            var pointRequired = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.COORDINATION_POINT_REQUIRED.Trim(), 3);
            if (createRequest.LandPlotCoordinations.Count < pointRequired)
                return new BusinessResult(Const.WARNING_INVALID_PLOT_COORDINATIONS_CODE, Const.WARNING_INVALID_PLOT_COORDINATIONS_MSG);
            var minLenght = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_LENGTH.Trim(), (double)1);
            if (createRequest.PlotLength < minLenght)
                return new BusinessResult(400, $"Lenght of plot must > {minLenght}.");
            var minWidth = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_WIDTH.Trim(), (double)1);
            if (createRequest.PlotLength < minWidth)
                return new BusinessResult(400, $"Width of plot must > {minWidth}.");
            var minArea = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_AREA.Trim(), (double)1);
            if (createRequest.Area < minArea)
                return new BusinessResult(400, $"Width of plot must > {minArea}.");
            //Validate tổng diện tích của các LandRow
            double totalRowArea = 0;
            foreach (var row in createRequest.LandRows)
            {
                if (row.Length <= 0 || row.Width <= 0)
                {
                    return new BusinessResult(400, "Each row must have positive Length and Width.");
                }
                totalRowArea += (row.Length * row.Width);
            }

            //  Tính thêm tổng diện tích của các khoảng cách giữa hàng (RowSpacing)
            if (createRequest.NumberOfRows > 1 && createRequest.RowSpacing > 0)
            {
                totalRowArea += createRequest.RowSpacing * (createRequest.NumberOfRows - 1) * createRequest.PlotWidth;
            }

            var allowDeviationPercent = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.ALLOW_AREA_DEVIATION_PERCENT.Trim(), (double)15.0);
            double allowDeviation = createRequest.Area * (allowDeviationPercent / 100.0);

            double minAcceptableArea = createRequest.Area - allowDeviation;
            double maxAcceptableArea = createRequest.Area + allowDeviation;

            if (totalRowArea < minAcceptableArea || totalRowArea > maxAcceptableArea)
            {
                return new BusinessResult(400, $"Total area of rows ({totalRowArea:F2} m²) must be between {minAcceptableArea:F2} m² and {maxAcceptableArea:F2} m² (allowing {allowDeviationPercent}% deviation).");
            }
            return new BusinessResult(200, "No error found");
        }

        private async Task<BusinessResult> ValidateLandPlotUpdateAsync(LandPlotUpdateRequest updateRequest)
        {
            try
            {
                // Validate Area
                if (updateRequest.Area.HasValue)
                {
                    var areaSystemConfig = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_AREA, (double)100);
                    if (updateRequest.Area < areaSystemConfig)
                        return new BusinessResult(400, $"Area must be greater than {areaSystemConfig}");
                }

                // Validate Length & Width
                if (updateRequest.Length.HasValue)
                {
                    var LeghtSystemConfig = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_LENGTH, (double)1);
                    if (updateRequest.Area < LeghtSystemConfig)
                        return new BusinessResult(400, $"Lenght must be greater than {LeghtSystemConfig}");
                }

                if (updateRequest.Width.HasValue && updateRequest.Width <= 0)
                {
                    var widthSystemConfig = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_AREA, (double)1);
                    if (updateRequest.Area < widthSystemConfig)
                        return new BusinessResult(400, $"Width must be greater than {widthSystemConfig}");
                }

                // Validate Min/Max Length
                //if (updateRequest.MinLength.HasValue && updateRequest.MaxLength.HasValue && updateRequest.MinLength > updateRequest.MaxLength)
                //{
                //    return new BusinessResult(400, "MinLength must be less than or equal to MaxLength.");
                //}

                // Validate Min/Max Width
                //if (updateRequest.MinWidth.HasValue && updateRequest.MaxWidth.HasValue && updateRequest.MinWidth > updateRequest.MaxWidth)
                //{
                //    return new BusinessResult(400, "MinWidth must be less than or equal to MaxWidth.");
                //}

                // Validate NumberOfRows
                if (updateRequest.NumberOfRows.HasValue)
                {
                    var currentRows = await _unitOfWork.LandRowRepository.GetAllNoPaging(x => x.LandPlotId == updateRequest.LandPlotId && x.IsDeleted == false);
                    if (updateRequest.NumberOfRows < currentRows.Count())
                    {
                        return new BusinessResult(400, $"Cannot set number of rows smaller than existing rows ({currentRows.Count()}).");
                    }
                }

                return new BusinessResult(200, "Validation passed.", true);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateLandPlotVisualMap(UpdatePlotVisualMapRequest request)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 0. Kiểm tra RowIndex liên tục và không bị trùng
                var allRowIndices = request.LandRows
                    .Where(r => r.RowIndex.HasValue)
                    .Select(r => r.RowIndex.Value)
                    .ToList();

                if (allRowIndices.Count != allRowIndices.Distinct().Count())
                {
                    return new BusinessResult(400, "RowIndex must be unique. There are duplicated values.");
                }

                allRowIndices.Sort();
                for (int i = 0; i < allRowIndices.Count; i++)
                {
                    if (allRowIndices[i] != i + 1)
                    {
                        return new BusinessResult(400, $"RowIndex must be continuous starting from 1. Missing or invalid index at position {i + 1}.");
                    }
                }

                // 1. Lấy LandPlot
                var landPlot = await _unitOfWork.LandPlotRepository.GetByCondition(
                    x => x.LandPlotId == request.LandPlotId && x.IsDeleted != true,
                    includeProperties: "LandRows,Farm");

                if (landPlot == null)
                    return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);

                // 2. Cập nhật các field Visual Map
                landPlot.IsRowHorizontal = request.IsRowHorizontal ?? landPlot.IsRowHorizontal;
                landPlot.LineSpacing = request.LineSpacing ?? landPlot.LineSpacing;
                landPlot.RowSpacing = request.RowSpacing ?? landPlot.RowSpacing;
                landPlot.RowPerLine = request.RowPerLine ?? landPlot.RowPerLine;

                if (request.NumberOfRows.HasValue)
                {
                    if (request.LandRows?.Count() > request.NumberOfRows)
                        return new BusinessResult(400, "Number of rows request cannot be less than existing rows.");

                    landPlot.NumberOfRows = request.NumberOfRows;
                }

                var currentLandRows = landPlot.LandRows.Where(r => !r.IsDeleted.Value).ToList();
                var requestRowIds = request.LandRows.Where(r => r.LandRowId.HasValue).Select(r => r.LandRowId.Value).ToHashSet();

                var rowsToUpdate = new List<LandRow>();
                var rowsToInsert = new List<LandRow>();
                var rowsToDelete = currentLandRows.Where(r => !requestRowIds.Contains(r.LandRowId)).ToList();
                var landPlotCode = Util.SplitByDash(landPlot.LandPlotCode!).First();
                // 3.1 Update hoặc Insert LandRow
                foreach (var rowReq in request.LandRows)
                {
                    if (rowReq.LandRowId.HasValue)
                    {
                        // Update
                        var existingRow = currentLandRows.FirstOrDefault(r => r.LandRowId == rowReq.LandRowId.Value);
                        if (existingRow == null)
                            continue;

                        // Validate
                        var validateResult = await ValidateLandRowUpdateAsync(existingRow, rowReq);
                        if (validateResult.StatusCode != 200)
                            return validateResult;

                        existingRow.RowIndex = rowReq.RowIndex ?? existingRow.RowIndex;
                        existingRow.TreeAmount = rowReq.TreeAmount ?? existingRow.TreeAmount;
                        existingRow.Distance = rowReq.Distance ?? existingRow.Distance;
                        existingRow.Length = rowReq.Length ?? existingRow.Length;
                        existingRow.Width = rowReq.Width ?? existingRow.Width;
                        existingRow.Direction = rowReq.Direction ?? existingRow.Direction;
                        existingRow.Status = rowReq.Status ?? existingRow.Status;
                        existingRow.Description = rowReq.Description ?? existingRow.Description;

                        rowsToUpdate.Add(existingRow);
                    }
                    else
                    {
                        // Insert mới
                        var newRow = new LandRow
                        {

                            LandRowCode = $"{CodeAliasEntityConst.LANDROW}{CodeHelper.GenerateCode()}-{DateTime.Now.ToString("ddmmyy")}-{landPlotCode}-R{(rowReq.RowIndex)}",
                            LandPlotId = landPlot.LandPlotId,
                            RowIndex = rowReq.RowIndex!.Value,
                            TreeAmount = rowReq.TreeAmount!.Value,
                            Distance = rowReq.Distance!.Value,
                            Length = rowReq.Length!.Value,
                            Width = rowReq.Width!.Value,
                            Direction = rowReq.Direction,
                            Status = nameof(LandRowStatus.Active),
                            Description = rowReq.Description,
                            IsDeleted = false
                        };

                        rowsToInsert.Add(newRow);
                    }
                }

                // 4. Validate tổng diện tích các row (gồm khoảng cách giữa hàng nếu có)
                var totalRowArea = rowsToUpdate
                    .Concat(rowsToInsert)
                    .Where(r => r.Length > 0 && r.Width > 0)
                    .Sum(r => r.Length * r.Width);
                // Diện tích tất cả các hàng

                // Diện tích khoảng cách giữa các hàng (nếu có nhiều hơn 1 hàng)
                if ((landPlot.NumberOfRows ?? 0) > 1 && (landPlot.RowSpacing ?? 0) > 0)
                {
                    totalRowArea += landPlot.RowSpacing.Value * (landPlot.NumberOfRows.Value - 1) * (landPlot.Width ?? 0); // CHỈNH Ở ĐÂY
                }
                //// Cộng thêm khoảng cách giữa các rows (RowSpacing * (n-1) * PlotWidth)
                //if ((landPlot.NumberOfRows ?? 0) > 1 && (landPlot.RowSpacing ?? 0) > 0)
                //{
                //    totalRowArea += (landPlot.RowSpacing.Value * (landPlot.NumberOfRows.Value - 1) * (landPlot.Width ?? 0));
                //}

                var allowDeviationPercent = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.ALLOW_AREA_DEVIATION_PERCENT.Trim(), 15.0);
                var allowDeviation = (landPlot.Area ?? 0) * (allowDeviationPercent / 100.0);
                var minAcceptableArea = (landPlot.Area ?? 0) - allowDeviation;
                var maxAcceptableArea = (landPlot.Area ?? 0) + allowDeviation;

                if (/*totalRowArea < minAcceptableArea ||*/ totalRowArea > maxAcceptableArea)
                {
                    return new BusinessResult(400, $"Total area of rows ({totalRowArea:F2} m²) must be between {minAcceptableArea:F2} m² and {maxAcceptableArea:F2} m² (allowing {allowDeviationPercent}% deviation).");
                }

                // 5. Xử lý Update/Insert/Delete
                if (rowsToUpdate.Any())
                    _unitOfWork.LandRowRepository.UpdateRange(rowsToUpdate);

                if (rowsToInsert.Any())
                    _unitOfWork.LandRowRepository.InsertRangeAsync(rowsToInsert);

                foreach (var row in rowsToDelete)
                {
                    var validation = await ValidateRowBeforeDeleteAsync(row);
                    if (validation.StatusCode != 200)
                    {
                        await transaction.RollbackAsync();
                        return validation;
                    }

                    row.IsDeleted = true;
                }
                if (rowsToDelete.Any())
                    _unitOfWork.LandRowRepository.UpdateRange(rowsToDelete);

                _unitOfWork.LandPlotRepository.Update(landPlot);

                // 6. Save
                int result = await _unitOfWork.SaveAsync();
                if (result > 0)
                {
                    await transaction.CommitAsync();
                    return new BusinessResult(200, "Update LandPlot VisualMap successfully");
                }
                else
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(400, "Fail to save to database");
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ValidateRowBeforeDeleteAsync(LandRow row)
        {
            var hasPlants = await _unitOfWork.PlantRepository
                .AnyAsync(p => p.LandRowId == row.LandRowId && !p.IsDeleted.Value && !p.IsDead.Value);

            if (hasPlants)
            {
                return new BusinessResult(400, $"Row '{row.LandRowCode}' cannot be deleted because it contains living plants.");
            }

            bool IsBeingUsed = await _unitOfWork.PlanTargetRepository.AnyAsync(x => x.LandRowID == row.LandPlotId && x.Plan.IsDeleted == false);
            if (IsBeingUsed)
                return new BusinessResult(400, $"Row '{row.LandRowCode}' cannot be deleted because it contains in plan.");
            return new BusinessResult(200, "Row is safe to delete");
        }


        private async Task<BusinessResult> ValidateLandRowUpdateAsync(LandRow landRow, UpdateLandRowRequest rowRequest)
        {
            if (rowRequest.TreeAmount.HasValue)
            {
                var curPlantInRow = await _unitOfWork.PlantRepository.GetAllNoPaging(
                    x => x.LandRowId == landRow.LandRowId && x.IsDead == false && x.IsDeleted == false);
                if (rowRequest.TreeAmount < curPlantInRow.Count())
                    return new BusinessResult(400, $"Tree amount in row index {landRow.RowIndex} cannot be smaller than current plant count.");

                var minPlant = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_PLANT_OF_LAND_ROW.Trim(), (int)1);
                if (rowRequest.TreeAmount < minPlant)
                    return new BusinessResult(400, $"Plant of Row must >= {minPlant}.");
            }
            if (rowRequest.Distance.HasValue)
            {
                var minDistance = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_DISTANCE_OF_PLANT.Trim(), (double)2.0);
                if (rowRequest.Distance < minDistance)
                    return new BusinessResult(400, $"Distance between plants must >= {minDistance}.");
            }
            if (rowRequest.Length.HasValue)
            {
                var minLength = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_LENGTH.Trim(), (double)1);
                if (rowRequest.Length < minLength)
                    return new BusinessResult(400, $"Row length must >= {minLength}.");
            }
            if (rowRequest.Width.HasValue)
            {
                var minWidth = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.MIN_WIDTH.Trim(), (double)1);
                if (rowRequest.Width < minWidth)
                    return new BusinessResult(400, $"Row width must >= {minWidth}.");
            }
            return new BusinessResult(200, "OK");
        }
    }
}
