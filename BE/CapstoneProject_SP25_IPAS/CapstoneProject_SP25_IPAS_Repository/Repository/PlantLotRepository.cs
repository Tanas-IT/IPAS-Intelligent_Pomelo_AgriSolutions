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
    public class PlantLotRepository : GenericRepository<PlantLot>, IPlantLotRepository
    {
        private readonly IpasContext _context;
        public PlantLotRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        //public Task<int> NumberPlantCanPlant(int landPlotId);

        public async Task<PlantLot?> GetPlantLotWithAllReferences(int plantLotId)
        {
            var mainPlantLot = await _context.PlantLots
                .Include(x => x.Partner)
                .Include(x => x.MasterType)
                .Include(x => x.InversePlantLotReference) // Lấy danh sách lô nhập bù
                .FirstOrDefaultAsync(x => x.PlantLotId == plantLotId);

            if (mainPlantLot == null)
                return null;

            // Gọi đệ quy để lồng các lô nhập bù vào trong cây quan hệ
            await LoadAdditionalPlantLotsRecursive(mainPlantLot);

            return mainPlantLot;
        }

        private async Task LoadAdditionalPlantLotsRecursive(PlantLot plantLot)
        {
            var additionalLots = await _context.PlantLots
                .Where(x => x.PlantLotReferenceId == plantLot.PlantLotId)
                .Include(x => x.Partner)
                .Include(x => x.MasterType)
                .Include(x => x.InversePlantLotReference) // Tiếp tục lấy lô nhập bù của lô nhập bù
                .ToListAsync();

            plantLot.InversePlantLotReference = additionalLots;

            foreach (var lot in additionalLots)
            {
                await LoadAdditionalPlantLotsRecursive(lot);
            }
        }

    }
}
