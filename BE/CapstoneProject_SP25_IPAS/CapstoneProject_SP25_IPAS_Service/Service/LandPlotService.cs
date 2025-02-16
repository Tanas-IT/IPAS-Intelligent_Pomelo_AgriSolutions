using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandPlotRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.ObjectStatus;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
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

        //public async Task<BusinessResult> CreateLandPlot(LandPlotCreateRequest createRequest)
        //{
        //    try
        //    {
        //        using (var transaction = await _unitOfWork.BeginTransactionAsync())
        //        {
        //            if (createRequest.RowLength > createRequest.PlotLength)
        //                return new BusinessResult(Const.WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG);
        //            if (createRequest.RowWidth > createRequest.PlotWidth)
        //                return new BusinessResult(Const.WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG);
        //            if (createRequest.LandPlotCoordinations.Count < 3)
        //                return new BusinessResult(Const.WARNING_INVALID_PLOT_COORDINATIONS_CODE, Const.WARNING_INVALID_PLOT_COORDINATIONS_MSG);

        //            var landplotCreateEntity = new LandPlot()
        //            {
        //                LandPlotName = createRequest.LandPlotName,
        //                TargetMarket = createRequest.TargetMarket,
        //                Area = createRequest.Area,
        //                SoilType = createRequest.SoilType,
        //                Length = createRequest.PlotLength,
        //                Width = createRequest.PlotWidth,
        //                Description = createRequest.Description,
        //                FarmId = createRequest.FarmId,
        //            };
        //            landplotCreateEntity.LandPlotCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.LANDPLOT);
        //            landplotCreateEntity.Status = FarmStatus.Active.ToString();
        //            landplotCreateEntity.CreateDate = DateTime.Now;
        //            landplotCreateEntity.UpdateDate = DateTime.Now;
        //            var numberRowInPlot = CalculateRowsInPlot(createRequest.PlotLength, createRequest.RowLength, 0);
        //            for (int i = 0; i < numberRowInPlot; i++)
        //            {
        //                var landRow = new LandRow()
        //                {
        //                    LandRowCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.LANDROW),
        //                    RowIndex = i + 1, // Đánh số thứ tự hàng (1, 2, 3,...)
        //                    Length = createRequest.RowLength,
        //                    Width = createRequest.RowWidth,
        //                    Distance = createRequest.DistanceInRow,
        //                    Direction = createRequest.RowDirection,
        //                    TreeAmount = createRequest.TreeAmountInRow,
        //                    Status = LandRowStatus.Active.ToString(),
        //                    CreateDate = DateTime.Now,
        //                };

        //                landplotCreateEntity.LandRows.Add(landRow);
        //            }
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

        public async Task<BusinessResult> CreateLandPlot(LandPlotCreateRequest createRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    // Kiểm tra điều kiện hợp lệ
                    //if (createRequest.RowLength > createRequest.PlotLength)
                    //    return new BusinessResult(Const.WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG);
                    if (createRequest.RowWidth > createRequest.PlotWidth)
                        return new BusinessResult(Const.WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG);
                    if (createRequest.LandPlotCoordinations.Count < 3)
                        return new BusinessResult(Const.WARNING_INVALID_PLOT_COORDINATIONS_CODE, Const.WARNING_INVALID_PLOT_COORDINATIONS_MSG);

                    // 1️⃣ Tính số hàng trong thửa
                    int numberRowInPlot = CalculateRowsInPlot(createRequest.PlotLength, createRequest.RowWidth, 0);

                    // 2️⃣ Tạo đối tượng thửa đất
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
                        LandPlotCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.LANDPLOT),
                        Status = FarmStatus.Active.ToString(),
                        CreateDate = DateTime.Now,
                        UpdateDate = DateTime.Now
                    };

                    // 3️⃣ Thêm hàng vào thửa đất
                    for (int i = 0; i < numberRowInPlot; i++)
                    {
                        double rowActualLength = CalculateRowLength_UTM(createRequest.LandPlotCoordinations.ToList(), i, numberRowInPlot);
                        int treeAmount = CalculateTreeAmount(rowActualLength, createRequest.DistanceInRow);

                        var landRow = new LandRow()
                        {
                            LandRowCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.LANDROW),
                            RowIndex = i + 1, // Số thứ tự hàng (1, 2, 3,...)
                            Length = rowActualLength,
                            //Width = createRequest.RowLength,
                            Distance = createRequest.DistanceInRow,
                            Direction = createRequest.RowDirection,
                            TreeAmount = treeAmount,
                            Status = LandRowStatus.Active.ToString(),
                            CreateDate = DateTime.Now,
                        };

                        landplotCreateEntity.LandRows.Add(landRow);
                    }

                    // 4️⃣ Thêm tọa độ vào thửa đất
                    if (createRequest.LandPlotCoordinations?.Any() == true)
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

                    // 5️⃣ Lưu vào DB
                    await _unitOfWork.LandPlotRepository.Insert(landplotCreateEntity);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<LandPlotModel>(landplotCreateEntity);
                        return new BusinessResult(Const.SUCCESS_CREATE_FARM_CODE, Const.SUCCESS_CREATE_FARM_MSG, mappedResult);
                    }
                    else return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, Const.FAIL_CREATE_FARM_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_CREATE_FARM_CODE, Const.FAIL_CREATE_FARM_MSG, ex.Message);
            }
        }


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
            Expression<Func<LandPlot, bool>> filter = x => x.FarmId == farmId;
            if (!string.IsNullOrEmpty(searchKey))
            {
                filter.And(x => x.LandPlotName!.ToLower().Contains(searchKey.ToLower()));
            }
            Func<IQueryable<LandPlot>, IOrderedQueryable<LandPlot>> orderBy = x => x.OrderBy(x => x.FarmId);
            string includeProperties = "LandPlotCoordinations,Farm";
            var landplotInFarm = await _unitOfWork.LandPlotRepository.GetAllNoPaging(filter: filter, includeProperties: includeProperties, orderBy: orderBy);
            if (landplotInFarm.Any())
            {
                var mappedResult = _mapper.Map<IEnumerable<LandPlotModel>>(landplotInFarm);
                return new BusinessResult(Const.SUCCESS_GET_FARM_ALL_PAGINATION_CODE, Const.SUCCESS_GET_FARM_ALL_PAGINATION_FARM_MSG, mappedResult);
            }
            else
            {
                return new BusinessResult(Const.WARNING_GET_ALL_FARM_DOES_NOT_EXIST_CODE, Const.WARNING_GET_ALL_LANDPLOT_NOT_EXIST_MSG);
            }
        }

        public async Task<BusinessResult> GetLandPlotById(int landPlotId)
        {
            string includeProperties = "LandPlotCoordinations,Farm";
            var landplot = await _unitOfWork.LandPlotRepository.GetByCondition(x => x.LandPlotId == landPlotId, includeProperties: includeProperties);
            // kiem tra null
            if (landplot == null)
                return new BusinessResult(Const.WARNING_GET_LANDPLOT_NOT_EXIST_CODE, Const.WARNING_GET_LANDPLOT_NOT_EXIST_MSG);
            // neu khong null return ve mapper
            var mappedResult = _mapper.Map<LandPlotModel>(landplot);
            return new BusinessResult(Const.SUCCESS_GET_FARM_CODE, Const.SUCCESS_FARM_GET_MSG, mappedResult);

        }


        public async Task<BusinessResult> UpdateLandPlotCoordination(LandPlotUpdateCoordinationRequest updateRequest)
        {
            try
            {

                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    // Lấy các tọa độ hiện tại
                    Expression<Func<LandPlotCoordination, bool>> condition = x => x.LandPlotId == updateRequest.LandPlotId && x.LandPlot!.Farm!.IsDeleted != true;
                    string includeProperties = "LandPlotCoordinations,Farm";
                    var existingCoordinationList = await _unitOfWork.LandPlotCoordinationRepository.GetAllNoPaging(condition, includeProperties: includeProperties);

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
                        var mappedResult = _mapper.Map<LandPlotModel>(resultSave);
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
                        if (newValue != null && !string.IsNullOrEmpty(newValue.ToString()))
                        {
                            var farmProp = typeof(Farm).GetProperty(prop.Name);
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

        private int CalculateRowsInPlot(double landPlotLength, double rowWidth, double? distanceRow)
        {

            double spacing = distanceRow ?? 0;
            int numRows = (int)((landPlotLength + spacing) / (rowWidth + spacing));

            return numRows;
        }

        //private double CalculateRowLength(List<CoordinationCreateRequest> plotPoints, int rowIndex, int totalRows)
        //{
        //    if (plotPoints == null || plotPoints.Count < 3)
        //        return 0; // Không đủ điểm để xác định chiều dài

        //    double minLat = plotPoints.Min(p => p.Latitude);
        //    double maxLat = plotPoints.Max(p => p.Latitude);
        //    double rowLat = minLat + (maxLat - minLat) * ((double)rowIndex / (totalRows - 1));

        //    List<CoordinationCreateRequest> rowIntersections = new List<CoordinationCreateRequest>();

        //    //var plotPoints = plotPoints.ToList();
        //    for (int i = 0; i < plotPoints.Count; i++)
        //    {
        //        var p1 = plotPoints[i];
        //        var p2 = plotPoints[(i + 1) % plotPoints.Count];

        //        if ((p1.Latitude <= rowLat && p2.Latitude >= rowLat) || (p1.Latitude >= rowLat && p2.Latitude <= rowLat))
        //        {
        //            double t = (rowLat - p1.Latitude) / (p2.Latitude - p1.Latitude);
        //            double intersectLng = p1.Longitude + t * (p2.Longitude - p1.Longitude);

        //            rowIntersections.Add(new CoordinationCreateRequest { Latitude = rowLat, Longitude = intersectLng });
        //        }
        //    }

        //    if (rowIntersections.Count < 2)
        //        return 0;

        //    rowIntersections = rowIntersections.OrderBy(p => p.Longitude).ToList();
        //    var distance = HaversineDistance(rowIntersections.First(), rowIntersections.Last());
        //    return distance;
        //}
        private double CalculateRowLength_UTM(List<CoordinationCreateRequest> plotPoints, int rowIndex, int totalRows)
        {
            if (plotPoints == null || plotPoints.Count < 2)
                return 0; // Ít hơn 2 điểm thì không thể tính chiều dài

            double minLat = plotPoints.Min(p => p.Latitude);
            double maxLat = plotPoints.Max(p => p.Latitude);

            if (totalRows <= 1) return 0;

            // Điều chỉnh rowLat để tránh trùng hoàn toàn với minLat/maxLat
            double rowLat = minLat + (maxLat - minLat) * ((double)rowIndex / (totalRows - 1)) + double.Epsilon;

            List<(double X, double Y)> rowIntersections = new List<(double X, double Y)>();

            for (int i = 0; i < plotPoints.Count; i++)
            {
                var p1 = plotPoints[i];
                var p2 = plotPoints[(i + 1) % plotPoints.Count];

                if ((p1.Latitude <= rowLat && p2.Latitude >= rowLat) || (p1.Latitude >= rowLat && p2.Latitude <= rowLat))
                {
                    double latDiff = p2.Latitude - p1.Latitude;
                    if (Math.Abs(latDiff) < double.Epsilon) continue; // Tránh chia cho 0

                    double t = (rowLat - p1.Latitude) / latDiff;
                    double intersectLng = p1.Longitude + t * (p2.Longitude - p1.Longitude);

                    var utmPoint = ConvertToUTM(rowLat, intersectLng);
                    rowIntersections.Add(utmPoint);
                }
            }

            if (rowIntersections.Count < 2)
            {
                // Nếu chỉ có một điểm giao, dùng khoảng cách tối đa theo trục Y làm độ dài
                if (rowIntersections.Count == 1)
                {
                    double minY = plotPoints.Min(p => ConvertToUTM(p.Latitude, p.Longitude).Y);
                    double maxY = plotPoints.Max(p => ConvertToUTM(p.Latitude, p.Longitude).Y);
                    double verticalLength = maxY - minY;
                    Console.WriteLine($"Row {rowIndex}: Single intersection, using vertical length = {verticalLength}");
                    return verticalLength;
                }

                Console.WriteLine($"Row {rowIndex}: No valid intersections found, returning 0.");
                return 0;
            }

            // Sắp xếp giao điểm theo X để tính khoảng cách
            rowIntersections = rowIntersections.OrderBy(p => p.X).ToList();

            double rowLength = Math.Sqrt(Math.Pow(rowIntersections.Last().X - rowIntersections.First().X, 2) +
                                         Math.Pow(rowIntersections.Last().Y - rowIntersections.First().Y, 2));

            Console.WriteLine($"Row {rowIndex}: Length = {rowLength}");
            return rowLength;
        }

        private double GetDistance(CoordinationCreateRequest p1, CoordinationCreateRequest p2)
        {
            double latDiff = p2.Latitude - p1.Latitude;
            double lngDiff = p2.Longitude - p1.Longitude;
            return Math.Sqrt(Math.Pow(latDiff, 2) + Math.Pow(lngDiff, 2));
        }

        private int CalculateTreeAmount(double rowLength, double treeDistance)
        {
            return (int)(rowLength / treeDistance);
        }

        private double HaversineDistance(CoordinationCreateRequest p1, CoordinationCreateRequest p2)
        {
            const double R = 6371000; // Bán kính Trái Đất (m)

            double lat1 = Math.Round(p1.Latitude * Math.PI / 180, 10);
            double lon1 = Math.Round(p1.Longitude * Math.PI / 180, 10);
            double lat2 = Math.Round(p2.Latitude * Math.PI / 180, 10);
            double lon2 = Math.Round(p2.Longitude * Math.PI / 180, 10);

            double dLat = lat2 - lat1;
            double dLon = lon2 - lon1;

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(lat1) * Math.Cos(lat2) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            var result = Math.Round(R * c, 5); // Giữ chính xác 5 chữ số sau dấu phẩy
            return result;
        }

        private (double X, double Y) ConvertToUTM(double latitude, double longitude)
        {
            // Lấy hệ tọa độ WGS84
            var csWGS84 = GeographicCoordinateSystem.WGS84;

            // Xác định UTM Zone
            int utmZone = (int)Math.Floor((longitude + 180) / 6) + 1;
            bool isNorthernHemisphere = latitude >= 0;

            // Hệ tọa độ UTM phù hợp
            var csUTM = ProjectedCoordinateSystem.WGS84_UTM(utmZone, isNorthernHemisphere);

            // Tạo bộ chuyển đổi tọa độ
            var transform = new CoordinateTransformationFactory().CreateFromCoordinateSystems(csWGS84, csUTM);

            // Chuyển đổi tọa độ gốc mà không làm tròn trước
            double[] utmCoords = transform.MathTransform.Transform(new double[] { longitude, latitude });

            // Làm tròn kết quả sau khi chuyển đổi
            return (Math.Round(utmCoords[0], 10), Math.Round(utmCoords[1], 10));
        }
    }
}
