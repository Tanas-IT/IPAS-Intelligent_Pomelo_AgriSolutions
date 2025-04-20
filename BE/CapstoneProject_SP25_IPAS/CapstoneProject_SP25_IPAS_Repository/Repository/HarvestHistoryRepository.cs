using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
//using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class HarvestHistoryRepository : GenericRepository<HarvestHistory>, IHarvestHistoryRepository
    {
        private readonly IpasContext _context;
        public HarvestHistoryRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<HarvestHistory> GetByCondition(Expression<Func<HarvestHistory, bool>> filter)
        {
            //var historys = await _context.HarvestHistories
            //    .Include(x => x.Crop)
            //    .Include(x => x.ProductHarvestHistories/*.Where(x => x.PlantId == null)*/)
            //    .ThenInclude(x => x.Product)
            //    .Include(x => x.CarePlanSchedules)
            //    .ThenInclude(x => x.WorkLogs)
            //    .ThenInclude(x => x.UserWorkLogs)
            //    .ThenInclude(x => x.User)
            //    .Where(x => x.HarvestHistoryId == harvestId && x.IsDeleted == false)
            //    .FirstOrDefaultAsync();
            IQueryable<HarvestHistory> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }
            query = query.Include(x => x.Crop)
                .Include(x => x.ProductHarvestHistories)
                .ThenInclude(x => x.Product)
                 .Include(x => x.ProductHarvestHistories)
                .ThenInclude(x => x.User)
                .Include(x => x.ProductHarvestHistories)
                .ThenInclude(x => x.Plant)
                .ThenInclude(x => x.LandRow)
                .Include(x => x.CarePlanSchedules)
                .ThenInclude(x => x.WorkLogs)
                .ThenInclude(x => x.UserWorkLogs)
                .ThenInclude(x => x.User);

            return await query.AsNoTracking().FirstOrDefaultAsync();
            //return historys;
        }

        public async Task<IEnumerable<HarvestHistory>> GetHarvestPaginFilterAsync(Expression<Func<HarvestHistory, bool>> filter = null!,
            Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = null!,
            int? pageIndex = null, // Optional parameter for pagination (page number)
            int? pageSize = null)
        {
            var query = _context.Set<HarvestHistory>().AsQueryable();

            // Lọc theo LandPlotId
            query = query
                .Include(x => x.CarePlanSchedules)
                .Include(x => x.ProductHarvestHistories/*.Where(x => x.PlantId != null)*/)
                .ThenInclude(x => x.Product)
                .Include(x => x.Crop);
            //.Where(c => c.CropId == cropId && c.Crop!.IsDeleted == false);
            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (orderBy != null)
            {
                query = orderBy(query);
            }
            //// Lọc theo SearchText
            //if (!string.IsNullOrWhiteSpace(paginationParameter.Search))
            //{
            //    query = query.Where(c => c.HarvestHistoryCode!.ToLower()!.Contains(paginationParameter.Search.ToLower()) ||
            //                            c.HarvestHistoryNote!.ToLower()!.Contains(paginationParameter.Search.ToLower()));
            //}

            //// Lọc theo PlantDate
            //if (filter.DateHarvestFrom.HasValue && filter.DateHarvestTo.HasValue)
            //{
            //    query = query.Where(c => c.DateHarvest >= filter.DateHarvestTo.Value && c.DateHarvest <= filter.DateHarvestTo.Value);
            //}

            //if (!string.IsNullOrEmpty(filter.Status))
            //{
            //    var listStatus = Util.SplitByComma(filter.Status);

            //    foreach (var item in listStatus)
            //    {
            //        query = query.Where(c => c.HarvestStatus!.ToLower().Equals(item.ToLower()));
            //    }
            //}
            //// Lọc theo Actual yiel from
            //if (filter.TotalPriceFrom.HasValue && filter.TotalPriceTo.HasValue)
            //{
            //    query = query.Where(c => c.TotalPrice >= filter.TotalPriceFrom.Value && c.TotalPrice <= filter.TotalPriceTo.Value);
            //}
            // Xác định kiểu sắp xếp
            //Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy;
            //switch (paginationParameter.SortBy?.ToLower())
            //{
            //    case "harvesthistoryid":
            //        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
            //            ? x => x.OrderByDescending(c => c.CropId)
            //            : x => x.OrderBy(c => c.CropId);
            //        break;
            //    case "harvesthistorycode":
            //        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
            //            ? x => x.OrderByDescending(c => c.HarvestHistoryCode)
            //            : x => x.OrderBy(c => c.HarvestHistoryCode);
            //        break;
            //    case "dateharvest":
            //        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
            //            ? x => x.OrderByDescending(c => c.DateHarvest)
            //            : x => x.OrderBy(c => c.DateHarvest);
            //        break;
            //    case "totalprice":
            //        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
            //            ? x => x.OrderByDescending(c => c.TotalPrice)
            //            : x => x.OrderBy(c => c.TotalPrice);
            //        break;
            //    case "status":
            //        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
            //            ? x => x.OrderByDescending(c => c.HarvestStatus).ThenByDescending(c => c.HarvestHistoryId)
            //            : x => x.OrderBy(c => c.HarvestStatus).ThenByDescending(c => c.HarvestHistoryId);
            //        break;
            //    case "yieldhasrecord":
            //        orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
            //            ? x => x.OrderByDescending(c => c.ProductHarvestHistories.Where(x => x.PlantId != null).Sum(x => x.ActualQuantity)).ThenByDescending(c => c.HarvestHistoryId)
            //            : x => x.OrderBy(c => c.ProductHarvestHistories.Where(x => x.PlantId != null).Sum(x => x.ActualQuantity)).ThenByDescending(c => c.HarvestHistoryId);
            //        break;

            //    default:
            //        orderBy = x => x.OrderByDescending(c => c.HarvestHistoryId);
            //        break;
            //}

            // Áp dụng sắp xếp
            //query = orderBy(query);

            // Phân trang
            int validPageIndex = pageIndex.Value > 0 ? pageIndex.Value - 1 : 0;
            int validPageSize = pageSize.Value > 0 ? pageSize.Value : 5; // Assuming a default pageSize of 10 if an invalid value is passed

            query = query.Skip(validPageIndex * validPageSize).Take(validPageSize);

            return query;
        }

        public async Task<IEnumerable<ProductHarvestHistory>> GetAllPlantOfHarvesType(int harvestId, int masterTypeId)
        {
            var historys = await _context.ProductHarvestHistories
                .Include(x => x.HarvestHistory)
                .Include(x => x.Product)
                .Include(x => x.Plant)
                .ThenInclude(x => x.LandRow)
                .ThenInclude(x => x.LandPlot)
                .Where(x => x.HarvestHistoryId == harvestId && x.MasterTypeId == masterTypeId /*&& x.PlantId != null*/)
                .ToListAsync();
            return historys;
        }

        public async Task<List<HarvestHistory>> GetHarvestHistoryInclude(int? farmId)
        {
            var historys = await _context.HarvestHistories
                                .Include(x => x.Crop)
                                .Include(h => h.ProductHarvestHistories)
                                    .ThenInclude(ht => ht.Plant)
                                        .ThenInclude(p => p.LandRow)
                                            .ThenInclude(lr => lr.LandPlot)
                                                .ThenInclude(lp => lp.Farm)
                                .Include(h => h.ProductHarvestHistories)
                                    .ThenInclude(ht => ht.Product)
                                .Where(x => x.Crop.FarmId == farmId)
                                .ToListAsync();
            return historys;
        }
        public async Task<IEnumerable<HarvestHistory>> GetAllHarvest(Expression<Func<HarvestHistory, bool>> filter = null!,
            Func<IQueryable<HarvestHistory>, IOrderedQueryable<HarvestHistory>> orderBy = null!)
        {
            var query = _context.Set<HarvestHistory>().AsQueryable();

            // Lọc theo LandPlotId
            query = query
                .Include(x => x.CarePlanSchedules)
                .Include(x => x.ProductHarvestHistories/*.Where(x => x.PlantId != null)*/)
                .ThenInclude(x => x.Product)
                .Include(x => x.Crop)
                .ThenInclude(x => x.LandPlotCrops);
            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (orderBy != null)
            {
                query = orderBy(query);
            }
            // Phân trang
            return query;
        }

        public async Task<HarvestHistory?> GetHarvestAndProduct(Expression<Func<HarvestHistory, bool>> filter = null!)
        {
            IQueryable<HarvestHistory> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }
            query = query.Include(x => x.Crop)
                .Include(x => x.ProductHarvestHistories.Where(x => x.PlantId == null!))
                .ThenInclude(x => x.Product);
            return await query.AsNoTracking().FirstOrDefaultAsync()!;
        }
    }
}
