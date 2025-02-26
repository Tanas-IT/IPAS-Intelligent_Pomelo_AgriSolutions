using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.GraftedRequest;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Upload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.GraftedModel;
using System.Linq.Expressions;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CapstoneProject_SP25_IPAS_Service.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class GraftedPlantService : IGraftedPlantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPlantService _plantService;
        private readonly ICriteriaTargetService _criteriaTargetService;
        private readonly MasterTypeConfig _masterTypeConfig;
        public GraftedPlantService(IUnitOfWork unitOfWork, IMapper mapper, IPlantService plantService, ICriteriaTargetService criteriaTargetService, MasterTypeConfig masterTypeConfig)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _plantService = plantService;
            _criteriaTargetService = criteriaTargetService;
            _masterTypeConfig = masterTypeConfig;
        }

        public async Task<BusinessResult> createGraftedPlantAsync(CreateGraftedPlantRequest createRequest)
        {
            try
            {
                using (var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    var plantExist = await _plantService.getById(createRequest.PlantId);
                    if (plantExist.StatusCode != 200)
                        return plantExist;

                    // kiem tra xem co apply va check criteria chua
                    if (_masterTypeConfig.GraftedTargetApply.Any())
                    {
                        var criteriaResult = await _criteriaTargetService.CheckCriteriaComplete(PlantId: createRequest.PlantId, GraftedId: null, PlantLotId: null, TargetsList: _masterTypeConfig.GraftedTargetApply);
                        if (criteriaResult.enable == false)
                            return new BusinessResult(Const.FAIL_CREATE_GRAFTED_PLANT_CODE, criteriaResult.ErrorMessage);
                    }
                    // Create the new Plant entity from the request
                    var jsonData = JsonConvert.DeserializeObject<PlantModel>(plantExist.Data!.ToString()!);

                    var graftedCreateEntity = new GraftedPlant()
                    {
                        GraftedPlantCode = $"{CodeAliasEntityConst.PLANT}-{DateTime.Now.ToString("ddMMyy")}-{CodeAliasEntityConst.PLANT}{jsonData!.PlantId}-{CodeHelper.GenerateCode()}",
                        GraftedPlantName = createRequest.GraftedPlantName,
                        GrowthStage = createRequest.GrowthStage,
                        Status = /*createRequest.Status*/ "",
                        GraftedDate = createRequest.GraftedDate,
                        Note = createRequest.Note,
                        PlantId = jsonData.PlantId,
                        IsDeleted = false,
                    };

                    //// Insert the new grafted entity into the repository
                    await _unitOfWork.GraftedPlantRepository.Insert(graftedCreateEntity);
                    int result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var mappedResult = _mapper.Map<GraftedPlantModels>(graftedCreateEntity);
                        return new BusinessResult(Const.SUCCESS_CREATE_GRAFTED_PLANT_CODE, Const.SUCCESS_CREATE_GRAFTED_PLANT_MSG, mappedResult);
                    }
                    return new BusinessResult(Const.FAIL_CREATE_PLANT_CODE, Const.FAIL_CREATE_PLANT_MSG);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.FAIL_CREATE_PLANT_CODE, Const.FAIL_CREATE_PLANT_MSG, ex.Message);
            }
        }

        public async Task<BusinessResult> deletePermanentlyGrafteAsync(List<int> graftedPlantIds)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if (graftedPlantIds == null || !graftedPlantIds.Any())
                    {
                        return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, "No valid GraftedPlantIds provided.");
                    }

                    // Filter to find all plants with matching IDs
                    Expression<Func<GraftedPlant, bool>> filter = x => graftedPlantIds.Contains(x.GraftedPlantId);
                    //string includeProperties = "GraftedPlantNotes,Resources,CriteriaTargets";
                    var grafteds = await _unitOfWork.GraftedPlantRepository.GetAllNoPaging(filter);

                    if (grafteds == null || !grafteds.Any())
                    {
                        return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                    }

                    // Delete each plant entity
                    //foreach (var plant in plants)
                    //{
                    _unitOfWork.GraftedPlantRepository.RemoveRange(grafteds);
                    //}

                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, $"Delete {grafteds.Count()} record success", new { success = true });
                    }
                    return new BusinessResult(Const.FAIL_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, Const.FAIL_DELETE_SOFTED_GRAFTED_PLANT_MSG);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> deteSoftedGraftedAsync(List<int> graftedPlantIdsDelete)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    if (graftedPlantIdsDelete == null || !graftedPlantIdsDelete.Any())
                    {
                        return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, "No valid GraftedPlantIds provided.");
                    }

                    // Filter to find all plants with matching IDs
                    Expression<Func<GraftedPlant, bool>> filter = x => graftedPlantIdsDelete.Contains(x.GraftedPlantId);
                    //string includeProperties = "GraftedPlantNotes,Resources,CriteriaTargets";
                    var grafteds = await _unitOfWork.GraftedPlantRepository.GetAllNoPaging(filter);

                    if (grafteds == null || !grafteds.Any())
                    {
                        return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                    }
                    grafteds.ToList().ForEach(gr =>
                    {
                        gr.IsDeleted = true;
                    });
                    _unitOfWork.GraftedPlantRepository.UpdateRange(grafteds);

                    int result = await _unitOfWork.SaveAsync();

                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(Const.SUCCESS_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, $"Delete {grafteds.Count()} record success", new { success = true });
                    }
                    return new BusinessResult(Const.FAIL_DELETE_PERMANENTLY_GRAFTED_PLANT_CODE, Const.FAIL_DELETE_SOFTED_GRAFTED_PLANT_MSG);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getGraftedByIdAsync(int graftedPlantId)
        {
            try
            {
                Expression<Func<GraftedPlant, bool>> filter = x => x.GraftedPlantId == graftedPlantId && x.IsDeleted != true;
                string includeProperties = "PlantLot,Plant";
                var graftedPlant = await _unitOfWork.GraftedPlantRepository.GetByCondition(filter, includeProperties);
                // kiem tra null
                if (graftedPlant == null)
                    return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                // neu khong null return ve mapper
                var result = _mapper.Map<GraftedPlantModels>(graftedPlant);
                return new BusinessResult(Const.SUCCESS_GET_GRAFTED_PLANT_CODE, Const.SUCCESS_GET_GRAFTED_OF_PLANT_MSG, result);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getGraftedOfPlantPaginAsync(GetGraftedPaginRequest getRequest)
        {
            try
            {
                Expression<Func<GraftedPlant, bool>> filter = x => !x.IsDeleted!.Value && x.PlantId == getRequest.PlantId;

                if (!string.IsNullOrEmpty(getRequest.GrowthStage))
                    filter = filter.And(x => x.GrowthStage!.ToLower().Contains(getRequest.GrowthStage.ToLower()));

                if (!string.IsNullOrEmpty(getRequest.Status))
                    filter = filter.And(x => x.Status!.ToLower().Contains(getRequest.Status.ToLower()));

                if (getRequest.SeparatedDateFrom.HasValue && getRequest.SeparatedDateTo.HasValue)
                {
                    if (getRequest.SeparatedDateFrom > getRequest.SeparatedDateTo)
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);

                    filter = filter.And(x => x.SeparatedDate >= getRequest.SeparatedDateFrom && x.SeparatedDate <= getRequest.SeparatedDateTo);
                }

                if (getRequest.GraftedDateFrom.HasValue && getRequest.GraftedDateTo.HasValue)
                {
                    if (getRequest.GraftedDateFrom > getRequest.GraftedDateTo)
                        return new BusinessResult(Const.WARNING_INVALID_DATE_FILTER_CODE, Const.WARNING_INVALID_DATE_FILTER_MSG);

                    filter = filter.And(x => x.GraftedDate >= getRequest.GraftedDateFrom && x.GraftedDate <= getRequest.GraftedDateTo);
                }

                if (getRequest.PlantLotId.HasValue)
                    filter = filter.And(x => x.PlantLotId == getRequest.PlantLotId);

                Func<IQueryable<GraftedPlant>, IOrderedQueryable<GraftedPlant>> orderBy = x => x.OrderByDescending(x => x.GraftedPlantId);

                if (!string.IsNullOrEmpty(getRequest.paginationParameter.SortBy))
                {
                    switch (getRequest.paginationParameter.SortBy.ToLower())
                    {
                        case "graftedplantid":
                            orderBy = getRequest.paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.GraftedPlantId)
                                : x => x.OrderBy(x => x.GraftedPlantId);
                            break;
                        case "grafteddate":
                            orderBy = getRequest.paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.GraftedDate)
                                : x => x.OrderBy(x => x.GraftedDate);
                            break;
                        case "growthstage":
                            orderBy = getRequest.paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.GrowthStage)
                                : x => x.OrderBy(x => x.GrowthStage);
                            break;
                        case "status":
                            orderBy = getRequest.paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.Status)
                                : x => x.OrderBy(x => x.Status);
                            break;
                        case "plantlotid":
                            orderBy = getRequest.paginationParameter.Direction!.ToLower() == "desc"
                                ? x => x.OrderByDescending(x => x.PlantLotId)
                                : x => x.OrderBy(x => x.PlantLotId);
                            break;
                        default:
                            orderBy = x => x.OrderBy(x => x.GraftedPlantId);
                            break;
                    }
                }
                string includeProperties = "PlantLot,Plant";
                var entities = await _unitOfWork.GraftedPlantRepository.Get(
                    filter, orderBy, includeProperties, getRequest.paginationParameter.PageIndex, getRequest.paginationParameter.PageSize);

                var pagin = new PageEntity<GraftedPlantModels>
                {
                    List = _mapper.Map<IEnumerable<GraftedPlantModels>>(entities).ToList(),
                    TotalRecord = await _unitOfWork.GraftedPlantRepository.Count(filter),
                    TotalPage = PaginHelper.PageCount(await _unitOfWork.GraftedPlantRepository.Count(filter), getRequest.paginationParameter.PageSize)
                };

                if (pagin.List.Any())
                    return new BusinessResult(Const.SUCCESS_GET_GRAFTED_PLANT_CODE, Const.SUCCESS_GET_GRAFTED_OF_PLANT_MSG, pagin);
                else
                    return new BusinessResult(Const.WARNING_GET_GRAFTED_EMPTY_CODE, Const.WARNING_GET_GRAFTED_EMPTY_MSG, new PageEntity<GraftedPlantModels>());
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> updateGraftedPlantAsync(UpdateGraftedPlantRequest updateRequest)
        {
            try
            {
                // Kiểm tra cây ghép có tồn tại không
                Expression<Func<GraftedPlant, bool>> filter = x => x.GraftedPlantId == updateRequest.GraftedPlantId && x.IsDeleted != true;
                string includeProperties = "PlantLot,Plant";
                var existingGraftedPlant = await _unitOfWork.GraftedPlantRepository.GetByCondition(filter, includeProperties);
                if (existingGraftedPlant == null)
                {
                    return new BusinessResult(Const.WARNING_GET_PLANT_NOT_EXIST_CODE, Const.WARNING_GET_PLANT_NOT_EXIST_MSG);
                }

                // Cập nhật thông tin nếu có giá trị mới
                if (!string.IsNullOrEmpty(updateRequest.GraftedPlantName))
                    existingGraftedPlant.GraftedPlantName = updateRequest.GraftedPlantName;

                if (!string.IsNullOrEmpty(updateRequest.GrowthStage))
                    existingGraftedPlant.GrowthStage = updateRequest.GrowthStage;

                if (updateRequest.SeparatedDate.HasValue)
                    existingGraftedPlant.SeparatedDate = updateRequest.SeparatedDate.Value;

                if (!string.IsNullOrEmpty(updateRequest.Status))
                    existingGraftedPlant.Status = updateRequest.Status;

                if (updateRequest.GraftedDate.HasValue)
                    existingGraftedPlant.GraftedDate = updateRequest.GraftedDate.Value;

                if (!string.IsNullOrEmpty(updateRequest.Note))
                    existingGraftedPlant.Note = updateRequest.Note;

                if (updateRequest.PlantLotId.HasValue && updateRequest.PlantLotId.Value >= 0)
                    existingGraftedPlant.PlantLotId = updateRequest.PlantLotId.Value;

                // Cập nhật thời gian chỉnh sửa
                //existingPlant.UpdateDate = DateTime.UtcNow;

                // Lưu vào database
                _unitOfWork.GraftedPlantRepository.Update(existingGraftedPlant);
                int result = await _unitOfWork.SaveAsync();

                if (result > 0)
                {
                    return new BusinessResult(Const.SUCCESS_UPDATE_GRAFTED_PLANT_CODE, Const.SUCCESS_UPDATE_GRAFTED_PLANT_MSG, existingGraftedPlant);
                }

                return new BusinessResult(Const.FAIL_UPDATE_PLANT_CODE, Const.FAIL_UPDATE_PLANT_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> getGraftedForSelected(int farmId)
        {
            try
            {
                Expression<Func<GraftedPlant, bool>> filter = x => x.FarmId == farmId;
                Func<IQueryable<GraftedPlant>, IOrderedQueryable<GraftedPlant>> orderBy = x => x.OrderByDescending(x => x.GraftedPlantId);
                var plantInPlot = await _unitOfWork.GraftedPlantRepository.GetAllNoPaging(filter: filter, orderBy: orderBy);
                if (!plantInPlot.Any())
                    return new BusinessResult(200, Const.WARNING_GET_GRAFTED_EMPTY_MSG);
                var mapReturn = _mapper.Map<IEnumerable<ForSelectedModels>>(plantInPlot);
                return new BusinessResult(Const.SUCCESS_GET_ROWS_SUCCESS_CODE, Const.SUCCESS_GET_ROWS_SUCCESS_MSG, mapReturn);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

    }
}
