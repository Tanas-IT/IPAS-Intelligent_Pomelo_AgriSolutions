using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.SystemModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.SystemConfigRequest;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.ConditionBuilder;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Pagination;
using CloudinaryDotNet.Actions;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class SystemConfigService : ISystemConfigService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SystemConfigService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> createSystemConfig(CreateSystemConfigRequest request)
        {
            try
            {
                // Kiểm tra ConfigKey có nằm trong danh sách được phép thêm không
                if (!SystemConfigConst.ADDABLE_CONFIG_GROUP.Contains(request.ConfigGroup, StringComparer.OrdinalIgnoreCase))
                {
                    return new BusinessResult(400, "This ConfigKey is not allowed to be added.");
                }
                if (string.IsNullOrEmpty(request.ConfigValue) && !request.ReferenceKeyId.HasValue)
                    return new BusinessResult(400, "You must fill reference key or input value for this config");
                string finalConfigValue = ""; // Mặc định là ConfigValue từ request
                string finalConfigKey = ""; // Mặc định là ConfigValue từ request

                // Nếu ReferenceKeyId được truyền, lấy ConfigValue từ cấu hình tham chiếu
                if (request.ReferenceKeyId.HasValue)
                {
                    var referenceConfig = await _unitOfWork.SystemConfigRepository.GetByID(request.ReferenceKeyId.Value);
                    if (referenceConfig == null)
                    {
                        return new BusinessResult(400, "Reference Config not found.");
                    }
                    finalConfigValue = referenceConfig.ConfigValue; // Lấy giá trị ConfigValue từ cấu hình tham chiếu
                    finalConfigKey = referenceConfig.ConfigKey; // Lấy giá trị ConfigValue từ cấu hình tham chiếu
                }
                else
                {
                    if (string.IsNullOrEmpty(request.ConfigValue))
                        return new BusinessResult(400, "Config Value is empty");
                    finalConfigValue = request.ConfigValue;
                    finalConfigKey = request.ConfigKey;
                }

                // Kiểm tra ConfigKey đã tồn tại chưa (tránh trùng lặp)
                var existingConfig = await _unitOfWork.SystemConfigRepository
                    .GetByCondition(x => x.ConfigKey == request.ConfigKey && x.ConfigValue.ToLower().Equals(finalConfigValue.ToLower()));
                if (existingConfig != null)
                {
                    return new BusinessResult(400, "This configuration already exists.");
                }

                var newConfig = new SystemConfiguration
                {
                    ConfigGroup = request.ConfigGroup,
                    ConfigKey = finalConfigKey,
                    ConfigValue = finalConfigValue,
                    ValueType = "string", // cac gia tri them duoc deu la kieu string 
                    EffectedDateFrom = request.EffectedDateFrom,
                    EffectedDateTo = request.EffectedDateTo,
                    Description = request.Description,
                    IsActive = true,
                    IsDeleteable = true, // Các Config có thể xóa
                    CreateDate = DateTime.Now,
                    ReferenceConfigID = request.ReferenceKeyId ?? null!,
                };

                await _unitOfWork.SystemConfigRepository.Insert(newConfig);
                int result = await _unitOfWork.SaveAsync();

                if (result > 0)
                {
                    var mappedReslt = _mapper.Map<SystemConfigModel>(newConfig);
                    return new BusinessResult(200, "Successfully created system configuration.", mappedReslt);
                }
                else
                {
                    return new BusinessResult(400, "Failed to save configuration.", false);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(500, ex.Message);
            }
        }

        public async Task<BusinessResult> deleteSystemConfig(int configId)
        {
            try
            {
                var config = await _unitOfWork.SystemConfigRepository.GetByID(configId);
                if (config == null)
                {
                    return new BusinessResult(404, "Configuration not found.");
                }

                //  Kiểm tra xem có được phép xóa không
                if (config.IsDeleteable == false)
                {
                    return new BusinessResult(400, "This configuration is not allowed to be deleted.");
                }
                bool isUsed = await _unitOfWork.SystemConfigRepository.AnyAsync(x => x.ReferenceConfigID == configId);
                if (isUsed == true)
                {
                    return new BusinessResult(400, "This configuration is currently being used.");
                }
                _unitOfWork.SystemConfigRepository.Delete(config);
                int result = await _unitOfWork.SaveAsync();

                if (result > 0)
                {
                    return new BusinessResult(200, "Successfully deleted configuration.", true);
                }
                else
                {
                    return new BusinessResult(400, "Failed to delete configuration.", false);
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

        public async Task<BusinessResult> getSystemConfigPagin(GetSystemConfigRequest filterRequest, PaginationParameter paginationParameter)
        {
            try
            {
                Expression<Func<SystemConfiguration, bool>> filter = null!;
                if (!string.IsNullOrEmpty(paginationParameter.Search))
                {
                    filter = filter.And(x => x.ConfigKey.ToLower().Contains(paginationParameter.Search.ToLower()) ||
                                            x.ValueType.ToLower().Contains(paginationParameter.Search.ToLower()) ||
                                            x.Description!.ToLower().Contains(paginationParameter.Search.ToLower()));
                }
                // Áp dụng các bộ lọc nếu có
                if (!string.IsNullOrEmpty(filterRequest.ConfigGroups))
                {
                    List<string> filterList = Util.SplitByComma(filterRequest.ConfigGroups);
                    filter = filter.And(x => filterList.Contains(x.ConfigGroup!.ToLower()));
                }

                if (!string.IsNullOrEmpty(filterRequest.ConfigKeys))
                {
                    List<string> filterList = Util.SplitByComma(filterRequest.ConfigKeys);
                    filter = filter.And(x => filterList.Contains(x.ConfigKey.ToLower()));
                }

                if (!string.IsNullOrEmpty(filterRequest.ConfigValue))
                    filter = filter.And(x => x.ConfigValue.Contains(filterRequest.ConfigValue));

                if (filterRequest.IsActive.HasValue)
                    filter = filter.And(x => x.IsActive == filterRequest.IsActive);

                if (filterRequest.EffectedDateFrom.HasValue || filterRequest.EffectedDateTo.HasValue)
                {
                    if (!filterRequest.EffectedDateFrom.HasValue || !filterRequest.EffectedDateTo.HasValue)
                        return new BusinessResult(400, "Both EffectedDateFrom and EffectedDateTo must be provided.");

                    if (filterRequest.EffectedDateFrom > filterRequest.EffectedDateTo)
                        return new BusinessResult(400, "EffectedDateFrom cannot be greater than EffectedDateTo.");

                    filter = filter.And(x => x.EffectedDateFrom >= filterRequest.EffectedDateFrom &&
                                             x.EffectedDateTo <= filterRequest.EffectedDateTo);
                }

                if (!string.IsNullOrEmpty(filterRequest.Description))
                    filter = filter.And(x => x.Description!.Contains(filterRequest.Description));

                Func<IQueryable<SystemConfiguration>, IOrderedQueryable<SystemConfiguration>> orderBy =
                    x => x.OrderBy(c => c.ConfigKey).ThenByDescending(c => c.ConfigId);

                var configList = await _unitOfWork.SystemConfigRepository.Get(filter, orderBy,
                    pageIndex: paginationParameter.PageIndex,
                    pageSize: paginationParameter.PageSize);

                if (!configList.Any())
                    return new BusinessResult(200, "No system configurations found.");
                var mappedResult = _mapper.Map<IEnumerable<SystemConfigModel>>(configList);

                //  Nhóm theo `ConfigKey` và map vào Model
                //var groupedConfig = configList
                //    .GroupBy(c => c.ConfigKey)
                //    .Select(group => new SystemConfigGroupedModel
                //    {
                //        ConfigKey = group.Select(x => new SystemConfigItemModel
                //        {
                //            ConfigId = x.ConfigId,
                //            ConfigKey = x.ConfigKey,
                //            ConfigValue = x.ConfigValue,
                //            ValueType = x.ValueType,
                //            IsActive = x.IsActive,
                //            EffectedDateFrom = x.EffectedDateFrom,
                //            EffectedDateTo = x.EffectedDateTo,
                //            Description = x.Description,
                //            CreateDate = x.CreateDate,
                //            IsDeleteable = x.IsDeleteable,
                //            ReferenceConfigGroup = x.ReferenceConfig != null ? x.ReferenceConfig.ConfigGroup : null, 
                //            ReferenceConfigKey = x.ReferenceConfig != null ? x.ReferenceConfig.ConfigKey : null, 
                //            ReferenceConfigValue = x.ReferenceConfig != null ? x.ReferenceConfig.ConfigValue : null,
                //            ReferenceConfig = x.ReferenceConfig != null ?
                //            new SystemConfigModel
                //            {
                //                ConfigId = x.ReferenceConfigID,
                //                ConfigGroup = x.ReferenceConfig!.ConfigGroup,
                //                ConfigKey = x.ReferenceConfig.ConfigKey,
                //                ConfigValue = x.ReferenceConfig.ConfigValue,
                //                ValueType = x.ReferenceConfig.ValueType,
                //                IsActive = x.ReferenceConfig.IsActive,
                //                IsDeleteable = x.ReferenceConfig.IsDeleteable,
                //                EffectedDateFrom = x.ReferenceConfig.EffectedDateFrom,
                //                EffectedDateTo = x.ReferenceConfig.EffectedDateTo,
                //                Description = x.ReferenceConfig.Description
                //            } : null,
                //        }).ToList()
                //    }).ToList();

                //  Tổng số bản ghi và tổng số trang
                var totalRecords = await _unitOfWork.SystemConfigRepository.Count(filter);
                var totalPages = PaginHelper.PageCount(totalRecords, paginationParameter.PageSize);

                var paginatedResult = new PageEntity<SystemConfigModel>
                {
                    List = mappedResult,
                    TotalRecord = totalRecords,
                    TotalPage = totalPages
                };

                return new BusinessResult(200, "Successfully retrieved system configurations.", paginatedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

        public async Task<BusinessResult> getSystemConfig(int configId)
        {
            try
            {
                //  Lấy cấu hình theo ID
                var config = await _unitOfWork.SystemConfigRepository.GetByCondition(x => x.ConfigId == configId);
                if (config == null)
                {
                    return new BusinessResult(404, "Configuration not found.");
                }
                var mappedResult = _mapper.Map<SystemConfigModel>(config);
                return new BusinessResult(200, "Successfully retrieved configuration.", mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

        public async Task<BusinessResult> updateSystemConfig(UpdateSystemConfigRequest updateRequest)
        {
            try
            {
                //  Kiểm tra ConfigId có hợp lệ không
                if (!updateRequest.ConfigId.HasValue)
                {
                    return new BusinessResult(500, "Config ID is required.");
                }

                // Tìm config trong DB
                var config = await _unitOfWork.SystemConfigRepository.GetByID(updateRequest.ConfigId.Value);
                if (config == null)
                {
                    return new BusinessResult(400, "Configuration not found.");
                }
                if (config.ReferenceConfigID != null)
                    return new BusinessResult(400, "This config is reference from another one, can not update this value");
                //  Cập nhật giá trị nếu có
                // Kiểm tra kiểu dữ liệu của ConfigValue (nếu có cập nhật)
                if (!string.IsNullOrEmpty(updateRequest.ConfigValue))
                {
                    if (!IsValidConfigValue(updateRequest.ConfigValue, config.ValueType))
                    {
                        return new BusinessResult(400, $"Invalid value format for type '{config.ValueType}'.");
                    }
                    config.ConfigValue = updateRequest.ConfigValue;
                }

                if (updateRequest.IsActive.HasValue)
                {
                    config.IsActive = updateRequest.IsActive.Value;
                }

                if (updateRequest.EffectedDateFrom.HasValue)
                {
                    config.EffectedDateFrom = updateRequest.EffectedDateFrom;
                }

                if (updateRequest.EffectedDateTo.HasValue)
                {
                    config.EffectedDateTo = updateRequest.EffectedDateTo;
                }

                if (!string.IsNullOrEmpty(updateRequest.Description))
                {
                    config.Description = updateRequest.Description;
                }

                var dependentConfigs = (await _unitOfWork.SystemConfigRepository.GetAllNoPaging(x => x.ReferenceConfigID == config.ConfigId)).ToList();

                // Cập nhật tất cả các cấu hình phụ thuộc
                foreach (var dependentConfig in dependentConfigs)
                {
                    // Nếu cấu hình phụ thuộc thay đổi giá trị, thì cũng cập nhật nó
                    if (!string.IsNullOrEmpty(updateRequest.ConfigValue))
                    {
                        dependentConfig.ConfigValue = updateRequest.ConfigValue;
                    }
                }
                //  Cập nhật config vào DB
                dependentConfigs.Add(config);
                _unitOfWork.SystemConfigRepository.UpdateRange(dependentConfigs);
                int result = await _unitOfWork.SaveAsync();

                if (result > 0)
                {
                    return new BusinessResult(200, "Successfully updated configuration.", config);
                }
                else
                {
                    return new BusinessResult(500, "Failed to update configuration.");
                }
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

        public async Task<BusinessResult> GetSystemConfigsForSelected(string configGroup)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(configGroup))
                {
                    return new BusinessResult(500, "ConfigKey cannot be empty.");
                }

                // Truy vấn danh sách config theo ConfigKey
                var configs = await _unitOfWork.SystemConfigRepository
                    .GetAllNoPaging(x => x.ConfigKey.ToLower().Equals(configGroup.ToLower()) && x.IsActive == true, orderBy: q => q.OrderBy(c => c.ConfigKey));

                if (configs == null || !configs.Any())
                {
                    return new BusinessResult(200, $"No configurations found to addibale .");
                }
                var mappedResult = _mapper.Map<IEnumerable<ForSelectedModels>>(configs);
                // Trả về danh sách config
                return new BusinessResult(200, "Successfully retrieved configurations.", mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

        public async Task<BusinessResult> GetSystemConfigGroupsForSelected()
        {
            try
            {

                // Truy vấn danh sách config theo ConfigKey
                var configs = await _unitOfWork.SystemConfigRepository
                    .GetAllNoPaging();

                if (configs == null || !configs.Any())
                {
                    return new BusinessResult(200, $"No configurations group found .");
                }
                var uniqueConfigGroups = configs
          .Where(x => !string.IsNullOrEmpty(x.ConfigGroup))
          .Select(x => x.ConfigGroup)
          .Distinct()
          .ToList();
                var mappedResult = uniqueConfigGroups.Select(g => new ForSelectedModels
                {
                    //Id = index + 1, 
                    //Code = group,     
                    Name = g
                }).ToList();
                //var mappedResult = _mapper.Map<IEnumerable<ForSelectedModels>>(configs);
                // Trả về danh sách config
                return new BusinessResult(200, "Successfully Get group configurations.", mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }

        public async Task<BusinessResult> GetSystemConfigsAddable()
        {
            try
            {

                // Truy vấn danh sách config theo ConfigKey
                //var configs = await _unitOfWork.SystemConfigRepository
                //    .GetAllNoPaging(x => SystemConfigConst.ADDABLE_CONFIG_KEYS.Contains(x.ConfigKey) && x.IsActive == true, orderBy: q => q.OrderBy(c => c.ConfigKey));

                //if (configs == null || !configs.Any())
                //{
                //    return new BusinessResult(200, $"No configurations found to addibale .");
                //}
                //var mappedResult = _mapper.Map<IEnumerable<ForSelectedModels>>(configs);
                // Trả về danh sách config
                return new BusinessResult(200, "Successfully retrieved configurations.", SystemConfigConst.ADDABLE_CONFIG_GROUP);
            }
            catch (Exception ex)
            {
                return new BusinessResult(500, ex.Message);
            }
        }

        public async Task<BusinessResult> getAllSystemConfigNoPagin(GetConfigNoPaginRequest filterRequest)
        {
            try
            {
                Expression<Func<SystemConfiguration, bool>> filter = null!;
                //if (!string.IsNullOrEmpty(paginationParameter.Search))
                //{
                //    filter = filter.And(x => x.ConfigKey.Contains(paginationParameter.Search) ||
                //                            x.ValueType.Contains(paginationParameter.Search) ||
                //                            x.Description!.Contains(paginationParameter.Search));
                //}
                // Áp dụng các bộ lọc nếu có
                if (!string.IsNullOrEmpty(filterRequest.ConfigGroups))
                {
                    List<string> filterList = Util.SplitByComma(filterRequest.ConfigGroups);
                    filter = filter.And(x => filterList.Contains(x.ConfigGroup!.ToLower()));
                }

                if (!string.IsNullOrEmpty(filterRequest.ConfigKeys))
                {
                    List<string> filterList = Util.SplitByComma(filterRequest.ConfigKeys);
                    filter = filter.And(x => filterList.Contains(x.ConfigKey.ToLower()));
                }

                if (!string.IsNullOrEmpty(filterRequest.ConfigValue))
                    filter = filter.And(x => x.ConfigValue.Contains(filterRequest.ConfigValue));

                if (filterRequest.IsActive.HasValue)
                    filter = filter.And(x => x.IsActive == filterRequest.IsActive);

                if (filterRequest.EffectedDateFrom.HasValue || filterRequest.EffectedDateTo.HasValue)
                {
                    if (!filterRequest.EffectedDateFrom.HasValue || !filterRequest.EffectedDateTo.HasValue)
                        return new BusinessResult(400, "Both EffectedDateFrom and EffectedDateTo must be provided.");

                    if (filterRequest.EffectedDateFrom > filterRequest.EffectedDateTo)
                        return new BusinessResult(400, "EffectedDateFrom cannot be greater than EffectedDateTo.");

                    filter = filter.And(x => x.EffectedDateFrom >= filterRequest.EffectedDateFrom &&
                                             x.EffectedDateTo <= filterRequest.EffectedDateTo);
                }

                if (!string.IsNullOrEmpty(filterRequest.Description))
                    filter = filter.And(x => x.Description!.Contains(filterRequest.Description));

                Func<IQueryable<SystemConfiguration>, IOrderedQueryable<SystemConfiguration>> orderBy =
                    x => x.OrderBy(c => c.ConfigKey).ThenByDescending(c => c.ConfigId);
                // Gọi hàm ApplySorting để cập nhật orderBy
                ApplySorting(ref orderBy, filterRequest.SortBy, filterRequest.Direction);

                var configList = await _unitOfWork.SystemConfigRepository.getAllSystemConfigNoPagin(filter, orderBy);

                if (!configList.Any())
                    return new BusinessResult(200, "No system configurations found.");
                var mappedResult = _mapper.Map<IEnumerable<SystemConfigModel>>(configList);
                //  Nhóm theo `ConfigKey` và map vào Model
                //var groupedConfig = configList
                //    .GroupBy(c => c.ConfigKey)
                //    .Select(group => new SystemConfigGroupedModel
                //    {
                //        //ConfigKey = group.Key,
                //        ConfigGroup = group.First().ConfigGroup,
                //        ConfigKey = group.Select(x => new SystemConfigItemModel
                //        {
                //            ConfigId = x.ConfigId,
                //            ConfigGroup = x.ConfigGroup,
                //            ConfigKey = x.ConfigKey,
                //            ConfigValue = x.ConfigValue,
                //            ValueType = x.ValueType,
                //            IsActive = x.IsActive,
                //            EffectedDateFrom = x.EffectedDateFrom,
                //            EffectedDateTo = x.EffectedDateTo,
                //            Description = x.Description,
                //            CreateDate = x.CreateDate,
                //            ReferenceConfigGroup = x.ReferenceConfig != null ? x.ReferenceConfig.ConfigGroup : null,
                //            ReferenceConfigKey = x.ReferenceConfig != null ? x.ReferenceConfig.ConfigKey : null,
                //            ReferenceConfigValue = x.ReferenceConfig != null ? x.ReferenceConfig.ConfigValue : null,
                //            ReferenceConfig = x.ReferenceConfig != null ?
                //            new SystemConfigModel
                //            {
                //                ConfigId = x.ReferenceConfigID,
                //                ConfigGroup = x.ReferenceConfig!.ConfigGroup,
                //                ConfigKey = x.ReferenceConfig.ConfigKey,
                //                ConfigValue = x.ReferenceConfig.ConfigValue,
                //                ValueType = x.ReferenceConfig.ValueType,
                //                IsActive = x.ReferenceConfig.IsActive,
                //                IsDeleteable = x.ReferenceConfig.IsDeleteable,
                //                EffectedDateFrom = x.ReferenceConfig.EffectedDateFrom,
                //                EffectedDateTo = x.ReferenceConfig.EffectedDateTo,
                //                Description = x.ReferenceConfig.Description
                //            } : null,
                //        }).ToList()
                //    }).ToList();

                //  Tổng số bản ghi và tổng số trang
                //var totalRecords = await _unitOfWork.SystemConfigRepository.Count(filter);
                //var totalPages = PaginHelper.PageCount(totalRecords, paginationParameter.PageSize);

                //var paginatedResult = new PageEntity<object>
                //{
                //    List = groupedConfig,
                //    TotalRecord = totalRecords,
                //    TotalPage = totalPages
                //};

                return new BusinessResult(200, "Successfully retrieved system configurations.", configList);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }
        private bool IsValidConfigValue(string value, string valueType)
        {
            try
            {
                switch (valueType.ToLower())
                {
                    case "int":
                        return int.TryParse(value, out _);
                    case "double":
                    case "float":
                        return double.TryParse(value, out _);
                    case "bool":
                        return bool.TryParse(value, out _);
                    case "datetime":
                        return DateTime.TryParse(value, out _);
                    case "string":
                        return true;
                    default:
                        return false;
                }
            }
            catch
            {
                return false;
            }
        }
        private void ApplySorting(ref Func<IQueryable<SystemConfiguration>, IOrderedQueryable<SystemConfiguration>> orderBy, string? sortBy, string? direction)
        {
            bool isDescending = !string.IsNullOrEmpty(direction) && direction.ToLower().Equals("desc");
            sortBy = sortBy?.ToLower() ?? "configid"; // Mặc định sắp xếp theo ConfigId

            switch (sortBy)
            {
                case "configgroup":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.ConfigGroup).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.ConfigGroup).ThenByDescending(c => c.ConfigId));
                    break;
                case "configkey":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.ConfigKey).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.ConfigKey).ThenByDescending(c => c.ConfigId));
                    break;
                case "configvalue":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.ConfigValue).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.ConfigValue).ThenByDescending(c => c.ConfigId));
                    break;
                case "valuetype":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.ValueType).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.ValueType).ThenByDescending(c => c.ConfigId));
                    break;
                case "isactive":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.IsActive).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.IsActive).ThenByDescending(c => c.ConfigId));
                    break;
                case "isdeleteable":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.IsDeleteable).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.IsDeleteable).ThenByDescending(c => c.ConfigId));
                    break;
                case "effecteddatefrom":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.EffectedDateFrom).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.EffectedDateFrom).ThenByDescending(c => c.ConfigId));
                    break;
                case "effecteddateto":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.EffectedDateTo).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.EffectedDateTo).ThenByDescending(c => c.ConfigId));
                    break;
                case "description":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.Description).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.Description).ThenByDescending(c => c.ConfigId));
                    break;
                case "createdate":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.CreateDate).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.CreateDate).ThenByDescending(c => c.ConfigId));
                    break;
                case "updatedate":
                    orderBy = isDescending ? (x => x.OrderBy(o => o.UpdateDate).ThenByDescending(c => c.ConfigId)) : (x => x.OrderByDescending(o => o.UpdateDate).ThenByDescending(c => c.ConfigId));
                    break;
                default:
                    orderBy = isDescending ? (x => x.OrderBy(o => o.ConfigId)) : (x => x.OrderByDescending(o => o.ConfigId));
                    break;
            }
        }

        public async Task<BusinessResult> getAllSystemConfigForSelected(string configGroup, string? configKey)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(configGroup))
                {
                    return new BusinessResult(500, "ConfigKey cannot be empty.");
                }

                Expression<Func<SystemConfiguration, bool>> filter = x => x.ConfigGroup!.ToLower().Equals(configGroup.ToLower()) && x.IsActive == true;
                // Truy vấn danh sách config theo ConfigKey
                if (!string.IsNullOrWhiteSpace(configKey))
                {
                    List<string> filterList = Util.SplitByComma(configKey);
                    filter = filter.And(x => filterList.Contains(x.ConfigKey.ToLower()));
                }
                var configs = await _unitOfWork.SystemConfigRepository
                    .GetAllNoPaging(filter, orderBy: q => q.OrderBy(c => c.ConfigKey).ThenByDescending(x => x.ConfigId));

                if (configs == null || !configs.Any())
                {
                    return new BusinessResult(200, $"No configurations found .");
                }
                var mappedResult = _mapper.Map<IEnumerable<ForSelectedModels>>(configs);
                // Trả về danh sách config
                return new BusinessResult(200, "Successfully retrieved configurations.", mappedResult);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, Const.ERROR_MESSAGE);
            }
        }
    }
}
