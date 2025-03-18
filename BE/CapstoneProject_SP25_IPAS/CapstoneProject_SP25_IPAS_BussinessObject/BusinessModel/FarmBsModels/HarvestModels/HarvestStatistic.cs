using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.HarvestModels
{
    //public class HarvestStatistic
    //{
    //    //public int MasterTypeId { get; set; }   // ID loại sản phẩm (bưởi loại 1, bưởi loại 2, ...)
    //    //public string? MasterTypeCode { get; set; }
    //    //public string? MasterTypeName { get; set; } // Tên loại sản phẩm
    //    //public double TotalQuantity { get; set; } // Tổng sản lượng trong năm
    //}

    public class MonthlyStatistic
    {
        public int Month { get; set; } // Tháng
        public int Year { get; set; } // Năm
        public double TotalQuantity { get; set; } // Tổng sản lượng của tháng
        public int HarvestCount { get; set; } // Số lần thu hoạch trong tháng
    }

    public class YearlyStatistic
    {
        public int YearFrom { get; set; } // Năm bắt đầu
        public int YearTo { get; set; } // Năm kết thúc
        public int HarvestCount { get; set; }
        public int MasterTypeId { get; set; }   // ID loại sản phẩm (bưởi loại 1, bưởi loại 2, ...)
        public string? MasterTypeCode { get; set; }
        public string? MasterTypeName { get; set; } // Tên loại sản phẩm
        public double TotalYearlyQuantity { get; set; } // Tổng sản lượng của cả khoảng thời gian
        public int NumberHarvest { get; set; }
        //public HarvestStatistic HarvestDetail { get; set; } = new(); // Thông tin loại sản phẩm thu hoạch
        public List<MonthlyStatistic> MonthlyData { get; set; } = new(); // Thống kê theo tháng
    }
}
