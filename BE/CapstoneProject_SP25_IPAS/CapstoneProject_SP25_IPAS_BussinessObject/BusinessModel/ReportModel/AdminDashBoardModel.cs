using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.OrderModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel
{
    public class AdminDashBoardModel
    {
        public int? TotalUser { get; set; }
        public int? TotalFarm { get; set;}
        public double? TotalRevenue { get; set;}
        public StatisticRevenueYear StatisticRevenueYear { get; set; }
        public StatisticFarmYear StatisticFarmYear { get; set; }

        public List<UserModel>? NewestUserModels { get; set; } = new List<UserModel>();
        public List<OrderModel>? NewestOrdersModels { get; set; } = new List<OrderModel>();
        public List<FarmModel>? NewestFarmsModels { get; set; } = new List<FarmModel>();
    }

    public class StatisticRevenueYear
    {
        public double? TotalRevenueYear { get; set; }
        public int? Year { get; set; }
        public List<RevenueMonth>? revenueMonths { get; set; } = new();
    }

    public class RevenueMonth
    {
        public int? Year { get; set; }
        public int? Month { get; set; }
        public double? TotalRevenue { get; set; }

    }

    public class StatisticFarmYear
    {
        public double? TotalRevenueYear { get; set; }
        public int? Year { get; set; }

        public List<RevenueMonth>? revenueMonths { get; set; } = new();
    }

    public class FarmMonth
    {
        public int? Year { get; set; }
        public int? Month { get; set; }
        public double? TotalRevenue { get; set; }

    }
}
