using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.GrowthStageMasterTypeModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class GrowthStageMasterTypeService : IGrowthStageMasterTypeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GrowthStageMasterTypeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CreateGrowthStageMasterType(List<CreateGrowthStageMasterTypeModel> createGrowthStageMasterTypeModels, int farmId)
        {
            try
            {
                using(var transaction = await _unitOfWork.BeginTransactionAsync())
                {
                    foreach(var createGrowthStageMasterTypeModel in createGrowthStageMasterTypeModels)
                    {
                        var createGrowthStageMasterType = new GrowthStageMasterType()
                        {
                            GrowthStageID = createGrowthStageMasterTypeModel.GrowthStageID,
                            MasterTypeID = createGrowthStageMasterTypeModel.MasterTypeID,
                            FarmID = farmId
                        };
                        await _unitOfWork.GrowthStageMasterTypeRepository.Insert(createGrowthStageMasterType);
                    }
                    var result = await _unitOfWork.SaveAsync();
                    if(result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(200, "Create GrowthStage MasterType success", result);
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return new BusinessResult(400, "Create GrowthStage MasterType failed");
                    }

                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> DeleteGrowthStageMasterType(List<int> growthStageMasterTpeIds)
        {
            try
            {
                foreach(var growthStageMasterTypeId in  growthStageMasterTpeIds)
                {
                    var growthStageMaster = await _unitOfWork.GrowthStageMasterTypeRepository.GetByID(growthStageMasterTypeId);
                    if(growthStageMaster != null)
                    {
                        _unitOfWork.GrowthStageMasterTypeRepository.Delete(growthStageMaster);
                    }
                }
                var result = await _unitOfWork.SaveAsync();
                if(result > 0)
                {
                    return new BusinessResult(200, "Delete GrowthStage MasterType success", true);
                }
                return new BusinessResult(200, "Delete GrowthStage MasterType failed", false);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> GetGrowthStageMasterTypeByFarmId(int farmId)
        {
            try
            {
                var getGrowthStageMasterType = await _unitOfWork.GrowthStageMasterTypeRepository.GetGrowthStageMasterTypeByFarmId(farmId);
                if(getGrowthStageMasterType != null && getGrowthStageMasterType.Any())
                {
                    var result = _mapper.Map<List<GrowthStageMasterTypeModel>>(getGrowthStageMasterType);
                    if(result != null)
                    {
                        return new BusinessResult(200, "Get GrowthStage MasterType success", result);
                    }
                    return new BusinessResult(400, "Get GrowthStageMasterType failed");
                }
                return new BusinessResult(404, "Do not have any GrowthStage MasterType");
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> UpdateGrowthStageMasterType(UpdateGrowthStageMasterTypeModel updateGrowthStageMasterTypeModel, int farmId)
        {
            try
            {
                var checkExistGrowthStageMasterType = await _unitOfWork.GrowthStageMasterTypeRepository.GetByID(updateGrowthStageMasterTypeModel.GrowthStageMasterTypeID);
                if(checkExistGrowthStageMasterType != null)
                {
                    if(updateGrowthStageMasterTypeModel.GrowthStageID != null)
                    {
                        checkExistGrowthStageMasterType.GrowthStageID = updateGrowthStageMasterTypeModel.GrowthStageID;
                    }
                    if (updateGrowthStageMasterTypeModel.MasterTypeID != null)
                    {
                        checkExistGrowthStageMasterType.MasterTypeID = updateGrowthStageMasterTypeModel.MasterTypeID;
                    }
                     _unitOfWork.GrowthStageMasterTypeRepository.Update(checkExistGrowthStageMasterType);
                    var result = await _unitOfWork.SaveAsync();
                    if(result > 0)
                    {
                        return new BusinessResult(200, "Update GrowthStage MasterType success", result);
                    }
                    else
                    {
                        return new BusinessResult(400, "Update GrowthStage MasterType failed");
                    }
                }
                return new BusinessResult(404, "Do not have any GrowthStage MasterType to update");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
