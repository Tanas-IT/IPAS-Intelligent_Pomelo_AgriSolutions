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

        public async Task<BusinessResult> CreateLandPlot(LandPlotCreateRequest createRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    if (createRequest.RowLength > createRequest.PlotLength)
                        return new BusinessResult(Const.WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG);
                    if (createRequest.RowWidth > createRequest.PlotWidth)
                        return new BusinessResult(Const.WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG);

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
                    };
                    landplotCreateEntity.LandPlotCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.LANDPLOT);
                    landplotCreateEntity.Status = FarmStatus.Active.ToString();
                    landplotCreateEntity.CreateDate = DateTime.Now;
                    landplotCreateEntity.UpdateDate = DateTime.Now;
                    var numberRowInPlot = CalculateRowsInPlot(createRequest.PlotLength, createRequest.RowLength, 0);
                    for (int i = 0; i < numberRowInPlot; i++)
                    {
                        var landRow = new LandRow()
                        {
                            LandRowCode = NumberHelper.GenerateRandomCode(CodeAliasEntityConst.LANDROW),
                            RowIndex = i + 1, // Đánh số thứ tự hàng (1, 2, 3,...)
                            Length = createRequest.RowLength,
                            Width = createRequest.RowWidth,
                            Distance = createRequest.DistanceInRow,
                            Direction = createRequest.RowDirection,
                            TreeAmount = createRequest.TreeAmountInRow,
                            Status = LandRowStatus.Active.ToString(),
                            CreateDate = DateTime.Now,
                        };

                        landplotCreateEntity.LandRows.Add(landRow);
                    }
                    if (createRequest.LandPlotCoordinations?.Any() == true)
                    {
                        foreach (var coordination in createRequest.LandPlotCoordinations)
                        {
                            var landplotCoordination = new LandPlotCoordination()
                            {
                                Lagtitude = coordination.Lagtitude,
                                Longitude = coordination.Longitude,
                            };
                            landplotCreateEntity.LandPlotCoordinations.Add(landplotCoordination);
                        }
                    }

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
                    var landplotDelete = await _unitOfWork.LandPlotRepository.GetByCondition(x => x.LandPlotId == landplotId , includeProperties: includeProperties);
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
            Expression<Func<LandPlot, bool>> filter = x => x.FarmId == farmId;
            if (!string.IsNullOrEmpty(searchKey))
            {
                filter.And(x => x.LandPlotName!.ToLower().Contains(searchKey.ToLower()));
            }
            Func<IQueryable<LandPlot>, IOrderedQueryable<LandPlot>> orderBy = x => x.OrderBy(x => x.FarmId);
            string includeProperties = "LandPlotCoordinations";
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
            string includeProperties = "LandPlotCoordinations";
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
                    Expression<Func<LandPlotCoordination, bool>> condition = x => x.LandPlotId == updateRequest.LandPlotId && x.LandPlot.Farm.IsDeleted != true;
                    var existingCoordinationList = await _unitOfWork.LandPlotCoordinationRepository.GetAllNoPaging(condition);

                    // Chuyển đổi danh sách thành HashSet để so sánh
                    var existingCoordinates = existingCoordinationList
                        .Select(x => new { Lat = x.Lagtitude ?? 0, Lng = x.Longitude ?? 0 }) // Ép kiểu tránh null
                        .ToHashSet();

                    var newCoordinates = updateRequest.CoordinationsUpdateModel
                        .Select(x => new { Lat = x.Lagtitude, Lng = x.Longitude }) // Đổi tên key tránh lỗi trùng
                        .ToHashSet();

                    // Tìm các điểm bị xóa (có trong danh sách cũ nhưng không có trong danh sách mới)
                    var coordinatesToDelete = existingCoordinationList
                        .Where(x => !newCoordinates.Contains(new { Lat = x.Lagtitude!.Value, Lng = x.Longitude!.Value }))
                        .ToList();

                    // Tìm các điểm cần thêm mới (có trong danh sách mới nhưng không có trong danh sách cũ)
                    var coordinatesToAdd = updateRequest.CoordinationsUpdateModel
                        .Where(x => !existingCoordinates.Contains(new { Lat = x.Lagtitude, Lng = x.Longitude }))
                        .Select(x => new LandPlotCoordination
                        {
                            LandPlotId = updateRequest.LandPlotId,
                            Lagtitude = x.Lagtitude,
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
                    Expression<Func<LandPlot, bool>> condition = x => x.LandPlotId == landPlotUpdateRequest.LandPlotId && x.Farm.IsDeleted != true;
                    var landplotEntityUpdate = await _unitOfWork.LandPlotRepository.GetByCondition(condition);

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

    }
}
