using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.GraftedModel
{
    public class GraftedPlantSummaryModel
    {
        public DateTime GraftedDate { get; set; } // Ngày chiết
        public int TotalBranches { get; set; } // Tổng số cành
        public List<GraftedName> ListGrafted { get; set; } = new(); // Danh sách tên cành
        public int CompletedCount { get; set; } // Số cành đã hoàn thành
        public string CompletionRate { get; set; } = "0/0"; // Tỷ lệ hoàn thành (Completed/Total)
    }
    public class GraftedName
    {
        public string? Name { get; set; }
        public bool? IsCompleted { get; set; }
        public string? Status { get; set; }
    }
}
