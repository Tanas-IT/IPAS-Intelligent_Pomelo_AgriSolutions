using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class LandPlotRepository : GenericRepository<LandPlot>, ILandPlotRepository
    {
        private readonly IpasContext _context;

        public LandPlotRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public override async Task<LandPlot> GetByID(int landplotId)
        {
            if (landplotId > 0)
            {
                var landPlot = await _context.LandPlots
                    .Where(x => x.LandPlotId == landplotId)
                    .Include(x => x.LandRows)
                    .ThenInclude(x => x.Plants)
                    .FirstOrDefaultAsync();
                return landPlot!;
            }
            return null!;
        }

        public async Task<LandPlot> GetForMapped(int landplotId)
        {
            if (landplotId > 0)
            {
                //var landPlot = await _context.LandPlots
                //    .Where(x => x.LandPlotId == landplotId && x.isDeleted == false)
                //    .Include( x => x.Farm)
                //    .Include(x => x.LandRows)
                //    .ThenInclude(x => x.Plants)

                //    .FirstOrDefaultAsync();
                var landPlot = await _context.LandPlots
            .Where(lp => lp.LandPlotId == landplotId && lp.IsDeleted == false)
            .Include (lp => lp.LandRows)
            .ThenInclude(x => x.Plants)
            .Select(lp => new LandPlot
            {
                LandPlotId = lp.LandPlotId,
                LandPlotCode = lp.LandPlotCode,
                LandPlotName = lp.LandPlotName,
                Area = lp.Area,
                Length = lp.Length,
                Width = lp.Width,
                SoilType = lp.SoilType,
                CreateDate = lp.CreateDate,
                UpdateDate = lp.UpdateDate,
                Status = lp.Status,
                Description = lp.Description,
                FarmId = lp.FarmId,
                IsDeleted = lp.IsDeleted,
                IsRowHorizontal = lp.IsRowHorizontal,
                TargetMarket = lp.TargetMarket,
                RowPerLine = lp.RowPerLine,
                RowSpacing = lp.RowSpacing,
                LineSpacing = lp.LineSpacing,
                NumberOfRows = lp.NumberOfRows,
                Farm = lp.Farm, // Lấy toàn bộ Farm
                LandRows = lp.LandRows.Select(lr => new LandRow
                {
                    LandRowId = lr.LandRowId,
                    LandRowCode = lr.LandRowCode,
                    RowIndex = lr.RowIndex,
                    TreeAmount = lr.TreeAmount,
                    Distance = lr.Distance,
                    Length = lr.Length,
                    Width = lr.Width,
                    Direction = lr.Direction,
                    CreateDate = lr.CreateDate,
                    UpdateDate = lr.UpdateDate,
                    Status = lr.Status,
                    Description = lr.Description,
                    IsDeleted = lr.IsDeleted,
                    LandPlotId = lr.LandPlotId,
                    FarmId = lr.FarmId,
                    Plants = lr.Plants.Where(x => x.IsDeleted == false ).Select(p => new Plant
                    {
                        PlantId = p.PlantId,
                        PlantCode = p.PlantCode,
                        PlantIndex = p.PlantIndex,
                        HealthStatus = p.HealthStatus,
                        IsDead = p.IsDead,
                    }).ToList()
                }).ToList()
            })
            .FirstOrDefaultAsync();
                return landPlot!;
            }
            return null!;
        }

        public async Task<List<LandPlot>> GetLandPlotInclude()
        {
           var result = await _context.LandPlots
                                .Include(x => x.Farm)
                                .Include(x => x.LandRows)
                                .ThenInclude(x => x.Plants)
                                .Include(x => x.LandPlotCrops)
                                .ThenInclude(x => x.Crop)
                                .ThenInclude(x => x.HarvestHistories)
                                .ThenInclude(x => x.ProductHarvestHistories)
                                .ToListAsync();
            return result;
        }

        public async Task<List<LandPlot>> GetLandPlotIncludeByFarmId(int farmId)
        {
            var landPlots = await _context.LandPlots
                   .Where(lp => lp.FarmId == farmId && lp.IsDeleted == false)
                   .Include(lp => lp.LandRows)  // Bao gồm các Rows của LandPlot
                       .ThenInclude(r => r.Plants) // Bao gồm cả cây trồng trong Rows
                   .ToListAsync();
            return landPlots;
        }

        public async Task<int> GetLastID()
        {
            var lastID = await _context.LandPlots.MaxAsync(x => x.LandPlotId);
            if (lastID <= 0)
                return 1;
            return lastID + 1;
        }
    }
}
