using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CropRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class CropRepository : GenericRepository<Crop>, ICropRepository
    {
        private readonly IpasContext _context;

        public CropRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Crop> getCropToDelete(int cropId)
        {
            var crop = await _context.Crops
                .Include(x => x.LandPlotCrops)
                .Include(x => x.Plans)
                .ThenInclude(x => x.CarePlanSchedule)
                .ThenInclude(x => x.WorkLogs)
                .ThenInclude(x => x.UserWorkLogs)
                .Include(x => x.HarvestHistories)
                .ThenInclude(x => x.CarePlanSchedules)
                .Include(x => x.HarvestHistories)
                .ThenInclude(x => x.ProductHarvestHistories)
                .FirstOrDefaultAsync(x => x.CropId == cropId);
            return crop!;
        }
        public async Task<Crop> getCropInExpired(int cropId)
        {
            var crop = await _context.Crops
                .Where(x => x.CropId == cropId
                && x.EndDate >= DateTime.Now)
                .Include(x => x.HarvestHistories)
                .FirstOrDefaultAsync();
            return crop!;
        }
        public override async Task<Crop> GetByID(int id)
        {
            var crop = await _context
                .Crops
                .Include(x => x.HarvestHistories)
                .ThenInclude(x => x.ProductHarvestHistories)
                .Include(x => x.LandPlotCrops)
                .ThenInclude(x => x.LandPlot)
                .FirstOrDefaultAsync(x => x.CropId == id && x.IsDeleted == false);
            return crop;
        }

        public async Task<IEnumerable<Crop>> GetAllCropsOfLandPlot(int landPlotId, PaginationParameter paginationParameter, CropFilter cropFilter)
        {
            var query = _context.Set<LandPlotCrop>().AsQueryable();

            // Lọc theo LandPlotId
            query = query
                .Include(x => x.Crop)
                .Include(x => x.LandPlot)
                .Where(c => c.LandPlotId == landPlotId && c.Crop.IsDeleted == false);

            // Lọc theo SearchText
            if (!string.IsNullOrWhiteSpace(paginationParameter.Search))
            {
                query = query.Where(c => c.Crop.CropName!.Contains(paginationParameter.Search));
            }

            // Lọc theo PlantDate
            if (cropFilter.DateFrom.HasValue && cropFilter.DateTo.HasValue)
            {
                query = query.Where(c => c.Crop.StartDate >= cropFilter.DateFrom && c.Crop.EndDate <= cropFilter.DateTo);
            }

            if (!string.IsNullOrEmpty(cropFilter.HarvestSeason))
            {
                query = query.Where(c => c.Crop.HarvestSeason!.Equals(cropFilter.HarvestSeason));
            }
            // Lọc theo Actual yiel from
            if (cropFilter.ActualYieldFrom.HasValue && cropFilter.ActualYieldTo.HasValue)
            {
                query = query.Where(c => c.Crop.ActualYield >= cropFilter.ActualYieldFrom.Value && c.Crop.ActualYield <= cropFilter.ActualYieldTo.Value);
            }
            // Lọc theo Actual yiel from
            if (cropFilter.MarketPriceFrom.HasValue && cropFilter.MarketPriceTo.HasValue)
            {
                query = query.Where(c => c.Crop.MarketPrice >= cropFilter.MarketPriceFrom.Value && c.Crop.MarketPrice <= cropFilter.MarketPriceTo.Value);
            }
            // Lọc theo Status
            if (!string.IsNullOrEmpty(cropFilter.Status))
            {
                query = query.Where(c => c.Crop.Status == cropFilter.Status);
            }

            // Xác định kiểu sắp xếp
            Func<IQueryable<LandPlotCrop>, IOrderedQueryable<LandPlotCrop>> orderBy;
            switch (paginationParameter.SortBy?.ToLower())
            {
                case nameof(Crop.CropName):
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.CropName)
                        : x => x.OrderBy(c => c.Crop.CropName);
                    break;
                case nameof(Crop.StartDate):
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.StartDate)
                        : x => x.OrderBy(c => c.Crop.StartDate);
                    break;
                case nameof(Crop.CropActualTime):
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.CropActualTime)
                        : x => x.OrderBy(c => c.Crop.CropActualTime);
                    break;
                case nameof(Crop.Status):
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.Status)
                        : x => x.OrderBy(c => c.Crop.Status);
                    break;
                case nameof(Crop.ActualYield):
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.ActualYield)
                        : x => x.OrderBy(c => c.Crop.ActualYield);
                    break;
                case nameof(Crop.MarketPrice):
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.MarketPrice)
                        : x => x.OrderBy(c => c.Crop.MarketPrice);
                    break;
                default:
                    orderBy = x => x.OrderByDescending(c => c.CropID);
                    break;
            }

            // Áp dụng sắp xếp
            query = orderBy(query);

            // Đếm tổng số bản ghi
            int totalCount = await query.CountAsync();

            // Phân trang
            var landPlotCrops = await query
                //.Include(x => x.Crop)
                //.Include(x => x.LandPlot)
                .Skip((paginationParameter.PageIndex - 1) * paginationParameter.PageSize)
                                   .Take(paginationParameter.PageSize)
                                   .Select(c => c.Crop)
                                   .ToListAsync();

            return landPlotCrops;
        }

        public async Task<IEnumerable<Crop>> GetAllCropsOfFarm(int FarmId, PaginationParameter paginationParameter, CropFilter cropFilter)
        {
            var query = _context.Set<LandPlotCrop>().AsQueryable();

            // Lọc theo LandPlotId
            query = query
                .Include(x => x.Crop)
                .Include(x => x.LandPlot)
                .Where(c => c.LandPlot.FarmId == FarmId && c.Crop.IsDeleted == false);

            // Lọc theo SearchText
            if (!string.IsNullOrWhiteSpace(paginationParameter.Search))
            {
                query = query.Where(c => c.Crop.CropName!.Contains(paginationParameter.Search));
            }

            // Lọc theo PlantDate
            if (cropFilter.DateFrom.HasValue && cropFilter.DateTo.HasValue)
            {
                query = query.Where(c => c.Crop.StartDate >= cropFilter.DateFrom.Value && c.Crop.EndDate <= cropFilter.DateTo.Value);
            }

            if (!string.IsNullOrEmpty(cropFilter.HarvestSeason))
            {
                query = query.Where(c => c.Crop.HarvestSeason!.Equals(cropFilter.HarvestSeason));
            }
            // Lọc theo Actual yiel from
            if (cropFilter.ActualYieldFrom.HasValue && cropFilter.ActualYieldTo.HasValue)
            {
                query = query.Where(c => c.Crop.ActualYield >= cropFilter.ActualYieldFrom.Value && c.Crop.ActualYield <= cropFilter.ActualYieldTo.Value);
            }
            // Lọc theo Actual yiel from
            if (cropFilter.MarketPriceFrom.HasValue && cropFilter.MarketPriceTo.HasValue)
            {
                query = query.Where(c => c.Crop.MarketPrice >= cropFilter.MarketPriceFrom.Value && c.Crop.MarketPrice <= cropFilter.MarketPriceTo.Value);
            }
            // Lọc theo Status
            if (!string.IsNullOrEmpty(cropFilter.Status))
            {
                var listStatus = Util.SplitByComma(cropFilter.Status);
                foreach (var item in listStatus)
                {
                    query = query.Where(c => c.Crop.Status.ToLower().Equals(cropFilter.Status.ToLower()));
                }
            }

            // Xác định kiểu sắp xếp
            Func<IQueryable<LandPlotCrop>, IOrderedQueryable<LandPlotCrop>> orderBy;
            switch (paginationParameter.SortBy?.ToLower())
            {
                case "cropname":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.CropName)
                        : x => x.OrderBy(c => c.Crop.CropName);
                    break;
                case "startdate":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.StartDate)
                        : x => x.OrderBy(c => c.Crop.StartDate);
                    break;
                case "cropactualtime":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.CropActualTime)
                        : x => x.OrderBy(c => c.Crop.CropActualTime);
                    break;
                case "status":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.Status)
                        : x => x.OrderBy(c => c.Crop.Status);
                    break;
                case "actualyield":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.ActualYield)
                        : x => x.OrderBy(c => c.Crop.ActualYield);
                    break;
                case "marketprice":
                    orderBy = !string.IsNullOrEmpty(paginationParameter.Direction) && paginationParameter.Direction.ToLower().Equals("desc")
                        ? x => x.OrderByDescending(c => c.Crop.MarketPrice)
                        : x => x.OrderBy(c => c.Crop.MarketPrice);
                    break;
                default:
                    orderBy = x => x.OrderByDescending(c => c.CropID);
                    break;
            }

            // Áp dụng sắp xếp
            query = orderBy(query);

            // Đếm tổng số bản ghi
            int totalCount = await query.CountAsync();

            // Phân trang
            var landPlotCrops = await query
                //.Include(x => x.Crop)
                //.Include(x => x.LandPlot)
                .Skip((paginationParameter.PageIndex - 1) * paginationParameter.PageSize)
                                   .Take(paginationParameter.PageSize)
                                   .Select(x => x.Crop)
                                   .ToListAsync();

            return landPlotCrops;
        }

        public async Task<int> GetLastID()
        {
            var lastId = await _context.Crops.MaxAsync(x => x.CropId);
            if (lastId <= 0)
                return 1;
            return lastId + 1;
        }

        public async Task<List<Crop>> GetCropsInCurrentTime(int? farmId)
        {
            var currentDate = DateTime.Now;
            var result = await _context.Crops
                        .Where(x => x.StartDate.HasValue && x.EndDate.HasValue &&
                                    x.StartDate.Value <= currentDate && x.EndDate.Value >= currentDate)
                        .ToListAsync();
            return result;
        }

        public async Task<List<LandPlot>> GetLandPlotOfCrops(int cropId)
        {
            var result = await _context.LandPlotCrops
                             .Include(x => x.LandPlot)
                             .Where(x => x.CropID == cropId)
                             .Select(x => x.LandPlot)
                             .ToListAsync();

            return result;
        }
    }
}
