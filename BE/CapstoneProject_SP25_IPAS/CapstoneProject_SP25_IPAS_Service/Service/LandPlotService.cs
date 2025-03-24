using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_Common;
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

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class LandPlotService : ILandPlotService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public LandPlotService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
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
                    var validationResult = await ValidateLandPlot(createRequest);
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
                    var landRowsResult = ProcessLandRows(createRequest, landplotCreateEntity, LandPlotCode);
                    if (landRowsResult != null) return landRowsResult;

                    // Xử lý tọa độ
                    ProcessLandPlotCoordinations(createRequest, landplotCreateEntity);

                    // Lưu vào DB
                    await _unitOfWork.LandPlotRepository.Insert(landplotCreateEntity);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
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
            Expression<Func<LandPlot, bool>> filter = x => x.FarmId == farmId && x.IsDeleted != true;
            if (!string.IsNullOrEmpty(searchKey))
            {
                filter.And(x => x.LandPlotName!.ToLower().Contains(searchKey.ToLower()));
            }
            Func<IQueryable<LandPlot>, IOrderedQueryable<LandPlot>> orderBy = x => x.OrderBy(x => x.LandPlotId);
            string includeProperties = "LandPlotCoordinations,Farm";
            var landplotInFarm = await _unitOfWork.LandPlotRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
            if (landplotInFarm.Any())
            {
                var mappedResult = _mapper.Map<IEnumerable<LandPlotModel>>(landplotInFarm);
                return new BusinessResult(Const.SUCCESS_GET_FARM_ALL_PAGINATION_CODE, Const.SUCCESS_GET_FARM_ALL_PAGINATION_FARM_MSG, mappedResult);
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
            string includeProperties = "LandPlotCoordinations,Farm";
            Expression<Func<LandPlot, bool>> filter = x => x.LandPlotId == landPlotId && x.IsDeleted != true;

            var landplot = await _unitOfWork.LandPlotRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
            // kiem tra null
            if (landplot == null)
                return new BusinessResult(200, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
            // neu khong null return ve mapper
            var mappedResult = _mapper.Map<LandPlotModel>(landplot);
            return new BusinessResult(Const.SUCCESS_GET_FARM_CODE, "Get landplot in farm success", mappedResult);

        }

        public async Task<BusinessResult> GetForMapped(int landplotId)
        {

            var landplot = await _unitOfWork.LandPlotRepository.GetForMapped(landplotId);
            // kiem tra null
            if (landplot == null)
                return new BusinessResult(200, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
            // neu khong null return ve mapper
            var mappedResult = _mapper.Map<LandPlotModel>(landplot);
            return new BusinessResult(Const.SUCCESS_GET_FARM_CODE, "Get landplot for mapped success", mappedResult);
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
                    // Lấy danh sách thuộc tính từ model
                    landplotEntityUpdate.IsDeleted = true;
                    _unitOfWork.LandPlotRepository.Update(landplotEntityUpdate);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
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

        private BusinessResult? ProcessLandRows(LandPlotCreateRequest createRequest, LandPlot landplotCreateEntity, string? SplitLandPlotCode = null)
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
                var landRow = new LandRow()
                {
                    LandRowCode = $"{CodeAliasEntityConst.LANDPLOT}-{DateTime.Now.ToString("ddMMyy")}-{CodeAliasEntityConst.LANDPLOT}{SplitLandPlotCode}-{CodeHelper.GenerateCode()}",
                    RowIndex = row.RowIndex,
                    Length = row.Length,
                    Width = row.Width,
                    Distance = row.Distance,
                    Direction = row.Direction,
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

        private async Task<BusinessResult> ValidateLandPlot(LandPlotCreateRequest createRequest)
        {
            if (createRequest.LandRows == null || !createRequest.LandRows.Any())
                return new BusinessResult(Const.WARNING_EMPTY_LAND_ROWS_CODE, Const.WARNING_EMPTY_LAND_ROWS_MSG);
            var pointRequired = await _unitOfWork.SystemConfigRepository.GetConfigValue(SystemConfigConst.COORDINATION_POINT_REQUIRED.Trim(), 3 );
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
            return new BusinessResult(200, "No error found");
        }

    }
}
