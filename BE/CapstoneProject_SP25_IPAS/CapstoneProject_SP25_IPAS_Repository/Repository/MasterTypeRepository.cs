using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.X509;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class MasterTypeRepository : GenericRepository<MasterType>, IMasterTypeRepository
    {
        private readonly IpasContext _context;

        public MasterTypeRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<MasterType>> GetMasterTypeByName(string name, int farmId, string target = null)
        {
            var getMasterTypeByName = _context.MasterTypes
                .Where(x => x.TypeName!.ToLower().Equals(name.ToLower())
                && (x.FarmID == farmId || x.IsDefault == true)
                && x.IsActive == true)
                .OrderBy(x => x.MasterTypeId)
                .AsQueryable();
            if (!string.IsNullOrEmpty(target))
            {
                var filterList = Util.SplitByComma(target);
                getMasterTypeByName = getMasterTypeByName.Where(x => filterList!.Contains(x.Target!.ToLower()));
            }
            var listMasterType = await getMasterTypeByName.OrderByDescending(x => x.MasterTypeId).ToListAsync();
            if (listMasterType.Any())
            {
                return listMasterType;
            }
            return null!;
        }

        public async Task<List<MasterType>> GetMasterTypesByTypeName(string name)
        {
            var getMasterTypeByName = await _context.MasterTypes
                .Where(x => x.TypeName!.ToLower().Contains(name.ToLower())
                && (x.IsDefault == true))
                .ToListAsync();
            if (getMasterTypeByName.Any())
            {
                return getMasterTypeByName;
            }
            return null!;
        }

        public async Task<MasterType> CheckTypeIdInTypeName(int masterId, string typeName)
        {
            var getMasterTypeByName = await _context.MasterTypes
                .Where(x => x.MasterTypeId == masterId && x.TypeName!.ToLower().Contains(typeName.ToLower()))
                .FirstOrDefaultAsync();
            return getMasterTypeByName!;
        }

        public async Task<int> GetLastMasterType()
        {
            var lastMasterType = await _context.MasterTypes
                 .OrderByDescending(p => p.MasterTypeId) // Lấy mã lớn nhất
                 .Select(p => p.MasterTypeId)
                 .FirstOrDefaultAsync();
            return lastMasterType;
        }

        public async Task<int> AddMasterType(MasterType newMasterType)
        {
            await _context.MasterTypes.AddAsync(newMasterType);
            var result = await _context.SaveChangesAsync();
            return result;
        }
        public async Task<int> GetLastID()
        {
            var lastId = await _context.MasterTypes.AsNoTracking().MaxAsync(x => x.MasterTypeId);
            if (lastId <= 0)
                return 1;
            return lastId + 1;
        }

        public async Task<List<MasterType>> GetCriteriaSetOfFarm(string name, int farmId, List<string> target)
        {
            // Chuyển target sang chữ thường trước khi query
            var targetLower = target.Select(t => t.ToLower()).ToList();
            var nameLower = name.ToLower();

            var getMasterTypeByName = _context.MasterTypes
                .Where(x => x.IsActive == true
                    && x.TypeName!.ToLower() == TypeNameInMasterEnum.Criteria.ToString().ToLower()
                    && x.TypeName.ToLower() == nameLower
                    && (x.FarmID == farmId || x.IsDefault == true)
                    && x.IsActive == true)
                .Include(x => x.Criterias)
                .OrderBy(x => x.MasterTypeId)
                .AsQueryable();

            if (targetLower.Any())
            {
                getMasterTypeByName = getMasterTypeByName.Where(x => targetLower.Contains(x.Target!.ToLower()));
            }

            var listMasterType = await getMasterTypeByName.ToListAsync();
            return listMasterType.Any() ? listMasterType : new List<MasterType>();
        }

        public async Task<List<MasterType>> GetMasterTypesByGrowthStages(List<int?> growthStageIds)
        {
            if (growthStageIds == null || growthStageIds.Count == 0)
                return new List<MasterType>();

            var masterTypeIds = await _context.GrowthStageMasterTypes
                .Where(gmt => gmt.GrowthStageID.HasValue
                              && growthStageIds.Contains(gmt.GrowthStageID.Value)
                              && gmt.MasterType != null
                              && gmt.MasterType.TypeName != null
                              && gmt.MasterType.TypeName.ToLower() == "work")
                .GroupBy(gmt => gmt.MasterTypeID)  // Nhóm theo MasterTypeID
                .Where(group => group.Count() == growthStageIds.Count)  // Chỉ lấy các nhóm có số lần xuất hiện đúng bằng số GrowthStageID
                .Select(group => group.Key)  // Lấy MasterTypeID
                .ToListAsync();

            var result = await _context.MasterTypes
                .Where(mt => masterTypeIds.Contains(mt.MasterTypeId))
                .ToListAsync();

            return result;
        }

        public async Task<List<MasterType>> GetMasterTypesWithTypeNameByGrowthStages(List<int?> growthStageIds, string typeName)
        {
            if (growthStageIds == null || growthStageIds.Count == 0)
                return new List<MasterType>();

            var masterTypeIds = await _context.GrowthStageMasterTypes
                .Where(gmt => gmt.GrowthStageID.HasValue
                              && growthStageIds.Contains(gmt.GrowthStageID.Value)
                              && gmt.MasterType != null
                              && gmt.MasterType.TypeName != null
                              && gmt.MasterType.TypeName.ToLower() == typeName.ToLower())
                .GroupBy(gmt => gmt.MasterTypeID)  // Nhóm theo MasterTypeID
                .Where(group => group.Count() == growthStageIds.Count)  // Chỉ lấy các nhóm có số lần xuất hiện đúng bằng số GrowthStageID
                .Select(group => group.Key)  // Lấy MasterTypeID
                .ToListAsync();

            var result = await _context.MasterTypes
                .Where(mt => masterTypeIds.Contains(mt.MasterTypeId))
                .ToListAsync();

            return result;
        }

        public async Task<MasterType> GetByIdIncludeMasterType(int masterTypeId)
        {
            //var masterType = await _context.MasterTypes.Where(x => x.MasterTypeId == masterTypeId
            //                                            && x.IsDelete == false)
            //      .Include(x => x.CriteriaSet
            //        .Where(tt => tt.CriteriaSet!.TypeName == "Criteria")) // 🔹 Chỉ Include khi TypeName là "Criteria"
            //            .ThenInclude(tt => tt.CriteriaSet)
            //                .ThenInclude(cs => cs.Criterias)
            //     .FirstOrDefaultAsync();
            var masterType = await _context.MasterTypes
                .Where(x => x.MasterTypeId == masterTypeId && x.IsDelete == false)
                .Select(x => new MasterType
                {
                    MasterTypeId = x.MasterTypeId,
                    MasterTypeName = x.MasterTypeName,
                    CriteriaSet = x.CriteriaSet.Select(tt => new Type_Type
                    {
                        CriteriaSet = new MasterType
                        {
                            MasterTypeId = tt.CriteriaSet!.MasterTypeId,
                            MasterTypeName = tt.CriteriaSet!.MasterTypeName,
                            Criterias = tt.CriteriaSet.Criterias.ToList() // Lấy danh sách tiêu chí
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();
            return masterType;
        }
    }
}
