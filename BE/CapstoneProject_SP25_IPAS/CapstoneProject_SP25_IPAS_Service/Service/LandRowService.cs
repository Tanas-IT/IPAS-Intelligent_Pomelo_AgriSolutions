using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.LandRowRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.ObjectStatus;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.IService;
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
        public LandRowService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<BusinessResult> CreateLandRow(LandRowCreateRequest createRequest)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {

                    var landplot = await _unitOfWork.LandPlotRepository.GetByCondition(x => x.LandPlotId == createRequest.LandPlotId, "LandRows");
                    // kiem tra dien tich cua thua xem neu them hang nay vao co duoc khong - hoac do dai or rong cua hang lon hon do dai thua
                    if (landplot == null)
                        return new BusinessResult(Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);
                    if (landplot.Length < createRequest.Length || landplot.Width < landplot.Width)
                        return new BusinessResult(Const.WARNING_LENGHT_OR_WIDTH_OF_ROW_LARGER_THAN_PLOT_CODE, Const.WARNING_LENGHT_OR_WIDTH_OF_ROW_LARGER_THAN_PLOT_MSG);
                    double areaUsed = 0;
                    foreach (var row in landplot.LandRows)
                    {
                        if (row.Length!.Value > 0 && row.Width!.Value > 0)
                            areaUsed += row.Length.Value * row.Width.Value;
                    }
                    if (areaUsed + (createRequest.Length * createRequest.Width) > (landplot.Length!.Value * landplot.Width!.Value))
                        return new BusinessResult(Const.WARNING_AREA_WAS_USED_LARGER_THAN_LANDPLOT_CODE, Const.WARNING_AREA_WAS_USED_LARGER_THAN_LANDPLOT_MSG);
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
                        LandRowCode = ""
                    };
                    await _unitOfWork.LandRowRepository.Insert(newRow);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mapReturn = _mapper.Map<LandRowModel>(newRow);
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
                Func<IQueryable<LandRow>, IOrderedQueryable<LandRow>> orderBy = x => x.OrderByDescending(x => x.RowIndex);
                var rowsOfFarm = await _unitOfWork.LandRowRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
                if (!rowsOfFarm.Any())
                    return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_EMPTY_MSG, rowsOfFarm);
                var mapReturn = _mapper.Map<IEnumerable<LandRowModel>>(rowsOfFarm);
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
                string includeProperties = "Plants";
                // set up them trong context moi xoa dc tat ca 1 lan
                var row = await _unitOfWork.LandRowRepository.GetByCondition(filter: filter, includeProperties: includeProperties);
                if (row == null)
                    return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);
                return new BusinessResult(Const.SUCCESS_GET_ROW_BY_ID_CODE, Const.SUCCESS_GET_ROW_BY_ID_MSG, row);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateLandRowInfo(LandRowUpdateRequest updateLandRowRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var landRow = await _unitOfWork.LandRowRepository.GetByCondition(x => x.LandRowId == updateLandRowRequest.LandRowId);
                    if (landRow == null)
                        return new BusinessResult(Const.WARNING_ROW_NOT_EXIST_CODE, Const.WARNING_ROW_NOT_EXIST_MSG);
                    if (updateLandRowRequest.TreeAmount.HasValue)
                        landRow.TreeAmount = updateLandRowRequest.TreeAmount!.Value;
                    if (updateLandRowRequest.TreeAmount.HasValue)
                        landRow.TreeAmount = updateLandRowRequest.TreeAmount.Value;
                    if (updateLandRowRequest.Distance.HasValue)
                        landRow.Distance = updateLandRowRequest.Distance.Value;
                    if (updateLandRowRequest.Length.HasValue)
                        landRow.Length = updateLandRowRequest.Length.Value;
                    if (updateLandRowRequest.Width.HasValue)
                        landRow.Width = updateLandRowRequest.Width.Value;
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
    }
}
