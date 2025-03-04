using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.HarvestModels
{
    public class HarvestStatistic
    {
        public int MasterTypeId { get; set; }   // Loại bưởi
        public string? MasterTypeCode { get; set; }  
        public string? MasterTypeName { get; set; } // Tên loại bưởi
        public double TotalQuantity { get; set; } // Tổng sản lượng (kg)
    }
    public class MonthlyStatistic
    {
        public int Month { get; set; } // Thángs
        public double? TotalQuatity { get; set; }
        public List<HarvestStatistic> HarvestDetails { get; set; } = new(); // Chi tiết sản lượng theo loại
    }
    public class YearlyStatistic
    {
        public int Year { get; set; } // Năm
        public double TotalYearlyQuantity { get; set; } // Tổng sản lượng của năm
        public List<MonthlyStatistic> MonthlyData { get; set; } = new(); // Thống kê theo từng tháng
    }
}
