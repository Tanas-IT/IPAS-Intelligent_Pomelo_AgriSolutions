using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeDetail;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class TypeTypeService : ITypeTypeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TypeTypeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> GetCriteriaSetOfProduct(int productId)
        {
            try
            {
                var checkProductExist = await _unitOfWork.MasterTypeRepository.GetByCondition(x => productId.Equals(x.MasterTypeId)
                                                                    && x.TypeName!.ToLower().Equals(TypeNameInMasterEnum.Product.ToString().ToLower())
                                                                    && x.IsActive == true
                                                                    && x.IsDeleted == false);
                if (checkProductExist == null)
                    return new BusinessResult(400, "No Product was found");
                // Lấy danh sách bộ tiêu chí áp dụng cho sản phẩm
                Expression<Func<Type_Type, bool>> filter = x => productId.Equals(x.ProductId) && x.IsActive == true;
                //string includeProperties = "CriteriaSet,Product";
                var criteriaSets = await _unitOfWork.Type_TypeRepository.GetAllNoPaging(filter: filter, null!);

                if (!criteriaSets.Any())
                    return new BusinessResult(200, "No criteria set found for this product.");

                var result = _mapper.Map<List<TypeTypeModel>>(criteriaSets);
                return new BusinessResult(200, "Successfully retrieved criteria sets.", result);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> ApplyCriteriaSetToProduct(int productId, List<int> criteriaSetIds)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {

                try
                {
                    var listCriteriaSetAdd = new List<Type_Type>();
                    foreach (var criteriaSetId in criteriaSetIds)
                    {
                        var checkCriteriaSet = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.TypeName!.ToLower().Equals(TypeNameInMasterEnum.Criteria.ToString().ToLower())
                                                                                                && x.IsDeleted == false, "Criterias");
                        if (checkCriteriaSet == null)
                            return new BusinessResult(400, "Criteria set not exist");
                        if (!checkCriteriaSet.Criterias.Any())
                            return new BusinessResult(400, "Criteria Set not have any criteria");
                        var exists = await _unitOfWork.Type_TypeRepository.GetByCondition(x => x.ProductId == productId && x.CriteriaSetId == criteriaSetId);
                        if (exists == null)
                        {
                            var newProductCriteriaSet = new Type_Type
                            {
                                ProductId = productId,
                                CriteriaSetId = criteriaSetId,
                                IsActive = true
                            };
                            listCriteriaSetAdd.Add(newProductCriteriaSet);
                        }
                    }
                    // co cai nao dc tao thi add vao list --> insert DB
                    if (listCriteriaSetAdd.Any())
                        await _unitOfWork.Type_TypeRepository.InsertRangeAsync(listCriteriaSetAdd);

                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        var getCriteriaOfProdut = await _unitOfWork.Type_TypeRepository.GetAllNoPaging(
                            filter: x => x.ProductId == productId,
                            includeProperties: "CriteriaSet");
                        var mappedResult = _mapper.Map<IEnumerable<TypeTypeModel>>(getCriteriaOfProdut);
                        return new BusinessResult(200, "Criteria set applied successfully.", mappedResult);
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(400, "Criteria set applied fail");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }
        public async Task<BusinessResult> DeleteCriteriaSetFromProduct(int productId, int criteriaSetId)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var existingRelation = await _unitOfWork.Type_TypeRepository
                        .GetByCondition(x => x.ProductId == productId && x.CriteriaSetId == criteriaSetId);

                    if (existingRelation == null)
                        return new BusinessResult(400, "Criteria set not found for this product.");

                    _unitOfWork.Type_TypeRepository.Delete(existingRelation);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(200, "Criteria set removed successfully.");
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(400, "Delete Criteria set for this product fail");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> UpdateCriteriaSetStatus(int productId, int criteriaSetId, bool isActive)
        {
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var existingRelation = await _unitOfWork.Type_TypeRepository
                        .GetByCondition(x => x.ProductId == productId && x.CriteriaSetId == criteriaSetId);

                    if (existingRelation == null)
                        return new BusinessResult(400, "Criteria set not found for this product.");

                    existingRelation.IsActive = isActive;
                    _unitOfWork.Type_TypeRepository.Update(existingRelation);
                    var result = await _unitOfWork.SaveAsync();
                    if (result > 0)
                    {
                        await transaction.CommitAsync();
                        return new BusinessResult(200,
                            $"Criteria set status updated to {(isActive ? "Active" : "Inactive")}.");
                    }
                    await transaction.RollbackAsync();
                    return new BusinessResult(400, $"Criteria set updated to {isActive} fail");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
                }
            }
        }

        public async Task<BusinessResult> getCriteriaSetForSelectedProduct(int productId, int farmId, string target)
        {
            try
            {
                if (farmId <= 0)
                    return new BusinessResult(Const.WARNING_GET_FARM_NOT_EXIST_CODE, Const.WARNING_GET_FARM_NOT_EXIST_MSG);

                // 1. Kiểm tra PlantLot tồn tại
                var productExist = await _unitOfWork.MasterTypeRepository.GetByCondition(x => x.MasterTypeId == productId 
                                                                                && x.IsDeleted == false
                                                                                && x.IsActive == true 
                                                                                && x.TypeName!.ToLower().Equals(TypeNameInMasterEnum.Product.ToString().ToLower()));
                if (productExist == null)
                    return new BusinessResult(400, Const.WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG);

                // 2. Lấy tất cả bộ tiêu chí của Farm theo target
                var allCriteriaSets = await _unitOfWork.MasterTypeRepository
                    .GetMasterTypeByName(TypeNameInMasterEnum.Criteria.ToString(), farmId, target);

                if (allCriteriaSets == null || !allCriteriaSets.Any())
                {
                    return new BusinessResult(400, $"Farm has no criteria set in type: {target}");
                }

                // 3. Lấy danh sách tiêu chí đã áp dụng cho PlantLot
                var appliedCriteriaTargets = await _unitOfWork.Type_TypeRepository.GetAllNoPaging(x => x.ProductId == productId);
                if (!appliedCriteriaTargets.Any())
                {
                    return new BusinessResult(200, "All criteria sets are not applied yet.", _mapper.Map<List<ForSelectedModels>>(allCriteriaSets));
                }
                // group criteriatarget lai theo mastertypeId (sau khi include criteria với masterType trong hàm GetAllCriteriaOfTargetNoPaging )
                var appliedMasterTypeIds = appliedCriteriaTargets
                    .Where(x => x.CriteriaSet != null )
                    .Select(x => x.CriteriaSet!.MasterTypeId)
                    .Distinct() //  Tránh trùng lặp
                    .ToList();


                //  5. Lọc ra danh sách bộ tiêu chí chưa được áp dụng
                var notAppliedCriteriaSets = allCriteriaSets
                    .Where(x => !appliedMasterTypeIds.Contains(x.MasterTypeId))
                    .ToList();

                if (!notAppliedCriteriaSets.Any())
                    return new BusinessResult(200, "All criteria sets have been applied.", new List<object>());

                // 6. Map dữ liệu & trả về danh sách bộ tiêu chí chưa được áp dụng
                var listMasterTypeModel = _mapper.Map<List<ForSelectedModels>>(notAppliedCriteriaSets);
                return new BusinessResult(200, "Criteria sets not applied retrieved successfully.", listMasterTypeModel);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
        
    }
}
