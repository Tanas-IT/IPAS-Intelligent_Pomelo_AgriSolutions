using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject.SoftDeleteInterceptors
{
    public class SoftDeleteCommon : ISoftDeleteCommon
    {
        private readonly IpasContext _context;
        public SoftDeleteCommon(IpasContext context)
        {
            _context = context;
        }
        public async Task<bool> SoftDeleteFarm(int farmId)
        {
                var getFarm = await _context.Farms
                    .FirstOrDefaultAsync(x => x.FarmId == farmId);
                if (getFarm == null) return false; // Nếu không tìm thấy, trả về false

                // Đánh dấu Farm là đã xóa
                getFarm.IsDeleted = true;
               _context.Entry(getFarm).State = EntityState.Modified;

                // Soft delete tất cả các thực thể liên quan (cập nhật trực tiếp không cần load vào RAM)
                await _context.CarePlanSchedules.Where(x => x.FarmID == farmId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));
                await _context.Crops.Where(x => x.FarmId == farmId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));
                await _context.Plans.Where(x => x.FarmID == farmId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));
                await _context.PlantLots.Where(x => x.FarmID == farmId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));
                await _context.LandPlots.Where(x => x.FarmId == farmId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));
                await _context.Partners.Where(x => x.FarmId == farmId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));
                await _context.GrowthStages.Where(x => x.FarmID == farmId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));
                await _context.MasterTypes.Where(x => x.FarmID == farmId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));

                // Lưu thay đổi
                await _context.SaveChangesAsync();

                return true;
        }

        public async Task<bool> SoftDeletePlan(int planId)
        {
            var getPlan = await _context.Plans
                .FirstOrDefaultAsync(x => x.PlanId == planId);
            if (getPlan == null) return false; // Nếu không tìm thấy, trả về false

            // Đánh dấu Farm là đã xóa
            getPlan.IsDeleted = true;
            _context.Entry(getPlan).State = EntityState.Modified;

            // Soft delete tất cả các thực thể liên quan (cập nhật trực tiếp không cần load vào RAM)
            await _context.CarePlanSchedules.Where(x => x.CarePlanId == planId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));
            await _context.WorkLogs.Where(x => x.Schedule.CarePlanId == planId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));
            await _context.UserWorkLogs.Where(x => x.WorkLog.Schedule.CarePlanId == planId).ExecuteUpdateAsync(s => s.SetProperty(e => e.IsDeleted, true));

            // Lưu thay đổi
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
